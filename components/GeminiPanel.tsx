import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { XIcon, SparkleIcon, SendIcon, LoaderIcon, AccountCircleIcon } from './icons';
import type { ChatMessage, Question, QuestionType, Choice, Survey, DisplayLogic, DisplayLogicCondition, SkipLogic, SkipLogicRule, Block, LogicIssue } from '../types';
import { QuestionType as QTEnum } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES } from '../utils';
import { validateSurveyLogic } from '../logicValidator';

interface GeminiPanelProps {
  onClose: () => void;
  onAddQuestion: (questionType: QuestionType, title: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
  onUpdateQuestion: (args: any) => void;
  onRepositionQuestion: (args: { qid: string, after_qid?: string, before_qid?: string }) => void;
  onDeleteQuestion: (qid: string) => void;
  helpTopic: string | null;
  selectedQuestion: Question | null;
  survey: Survey;
  logicIssues: LogicIssue[];
}

// Lazy initialization of GoogleGenAI - only create when needed and API key is available
let aiInstance: GoogleGenAI | null = null;

const hasAPIKey = (): boolean => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  return !!apiKey && apiKey !== 'undefined' && apiKey !== '';
};

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      throw new Error('API Key não configurada');
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return aiInstance;
};

type PendingLogicChange = {
    name: string;
    args: any;
};

// Helper to deep compare function calls, ignoring the 'force' parameter
const isSameLogicChange = (a: PendingLogicChange | null, b: PendingLogicChange) => {
    if (!a) return false;
    
    const aArgs = { ...a.args };
    delete aArgs.force;
    const bArgs = { ...b.args };
    delete bArgs.force;

    return a.name === b.name && JSON.stringify(aArgs) === JSON.stringify(bArgs);
};

const findPreviousQuestion = (startIndex: number, allQs: Question[]): Question | undefined => {
    for (let i = startIndex - 1; i >= 0; i--) {
        if (allQs[i].type !== QTEnum.PageBreak) {
            return allQs[i];
        }
    }
    return undefined;
};


// Helper function to find conditions required to reach a question (one level back)
const findDirectEntryConditions = (questionId: string, survey: Survey): DisplayLogicCondition[] => {
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    const targetQuestion = allQuestions.find(q => q.id === questionId);
    const targetQuestionIndex = allQuestions.findIndex(q => q.id === questionId);

    if (!targetQuestion || targetQuestionIndex === -1) return [];

    // Start with the question's own display logic
    const conditions: DisplayLogicCondition[] = targetQuestion.displayLogic?.conditions.filter(c => c.isConfirmed) || [];

    // Path 1: Explicit skips TO this question from any other question
    for (const sourceQuestion of allQuestions) {
        if (sourceQuestion.id === questionId) continue;
        const skipLogic = sourceQuestion.skipLogic;
        if (skipLogic?.type === 'per_choice' && skipLogic.rules) {
            for (const rule of skipLogic.rules) {
                if (rule.skipTo === questionId && rule.isConfirmed) {
                    const choice = sourceQuestion.choices?.find(c => c.id === rule.choiceId);
                    if (choice) {
                        conditions.push({
                            id: generateId('inferred'),
                            questionId: sourceQuestion.qid,
                            operator: 'equals',
                            value: choice.text,
                            isConfirmed: true,
                        });
                    }
                }
            }
        }
    }

    // Path 2: Implicit fall-through from the preceding question
    const prevQuestion = findPreviousQuestion(targetQuestionIndex, allQuestions);
    if (prevQuestion) {
        const prevLogic = prevQuestion.skipLogic;

        if (!prevLogic) {
             // If there's no logic, the only path is fall-through. This path doesn't add specific conditions from prevQuestion.
        } else {
            if (prevLogic.type === 'simple' && prevLogic.skipTo === 'next' && prevLogic.isConfirmed) {
                // Unconditional fall-through. No specific conditions are added from prevQuestion.
            } else if (prevLogic.type === 'per_choice') {
                // Add conditions for each choice that explicitly falls through to 'next'
                const fallThroughRules = prevLogic.rules.filter(r => r.skipTo === 'next' && r.isConfirmed);
                for (const rule of fallThroughRules) {
                    const choice = prevQuestion.choices?.find(c => c.id === rule.choiceId);
                    if (choice) {
                        conditions.push({
                            id: generateId('inferred'),
                            questionId: prevQuestion.qid,
                            operator: 'equals',
                            value: choice.text,
                            isConfirmed: true,
                        });
                    }
                }
            }
            // If prevLogic is simple and doesn't skip to 'next', there's no fall-through path, so we do nothing.
        }
    }
    
    // De-duplicate conditions
    const uniqueConditions = Array.from(new Map(conditions.map(c => [`${c.questionId}-${c.operator}-${c.value}`, c])).values());
    return uniqueConditions;
};

/**
 * Creates a structured, readable text summary of the entire survey for the Gemini model.
 * @param survey The survey object.
 * @returns A string representing the survey structure.
 */
const generateSurveyContext = (survey: Survey, logicIssues: LogicIssue[]): string => {
    let context = "";
    const allQuestions = survey.blocks.flatMap(b => b.questions);

    const formatDestination = (destinationId: string): string => {
        if (destinationId === 'next' || destinationId === 'end') {
            return destinationId;
        }
        const q = allQuestions.find(q => q.id === destinationId);
        return q ? q.qid : 'an unknown question';
    };

    survey.blocks.forEach(block => {
        context += `## Block ${block.bid}: ${block.title}\n`;
        block.questions.forEach(q => {
            if (q.type === QTEnum.PageBreak) {
                context += `- (Page Break)\n`;
                return;
            }
            context += `- **${q.qid}**: ${q.text} (*${q.type}*)\n`;

            if (q.choices && q.choices.length > 0) {
                context += `    - **Choices**: ${q.choices.map(c => `'${c.text}'`).join(', ')}\n`;
            }
            if (q.scalePoints && q.scalePoints.length > 0) {
                context += `    - **Columns**: ${q.scalePoints.map(c => `'${c.text}'`).join(', ')}\n`;
            }

            const displayLogic = q.draftDisplayLogic ?? q.displayLogic;
            if (displayLogic && displayLogic.conditions.length > 0) {
                const logicStr = displayLogic.conditions
                    .filter(c => c.isConfirmed)
                    .map(c => `${c.questionId} ${c.operator} '${c.value}'`)
                    .join(` ${displayLogic.operator} `);
                if (logicStr) {
                    context += `    - **Display Logic**: SHOW IF ${logicStr}\n`;
                }
            }

            const skipLogic = q.draftSkipLogic ?? q.skipLogic;
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    const dest = formatDestination(skipLogic.skipTo);
                    context += `    - **Skip Logic**: IF answered -> ${dest}\n`;
                } else if (skipLogic.type === 'per_choice') {
                    const rulesStr = skipLogic.rules
                        .filter(r => r.isConfirmed)
                        .map(rule => {
                            const choice = q.choices?.find(c => c.id === rule.choiceId);
                            const choiceLabel = choice ? parseChoice(choice.text).label : 'Unknown Choice';
                            const dest = formatDestination(rule.skipTo);
                            return `IF '${choiceLabel}' -> ${dest}`;
                        })
                        .join('; ');
                    if (rulesStr) {
                         context += `    - **Skip Logic**: ${rulesStr}\n`;
                    }
                }
            }
        });
        context += "\n";
    });

    if (logicIssues && logicIssues.length > 0) {
        context += `## Current Logic Issues\n`;
        context += "The following logic problems have been detected in the survey:\n";
        logicIssues.forEach(issue => {
            const q = allQuestions.find(q => q.id === issue.questionId);
            if (q) {
                context += `- On Question ${q.qid}: ${issue.message}\n`;
            }
        });
        context += "\n";
    }


    return context;
};

const addQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'add_question',
    description: 'Adds a question to the survey. Can optionally specify its position relative to another question.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'The main text or question being asked.',
        },
        type: {
          type: Type.STRING,
          description: 'The type of question.',
          enum: [QTEnum.Radio, QTEnum.Checkbox, QTEnum.Description, QTEnum.TextEntry],
        },
        choices: {
          type: Type.ARRAY,
          description: 'An array of strings for the choices. Only applicable for Radio Button and Checkbox types.',
          items: {
            type: Type.STRING,
          },
        },
        after_qid: {
            type: Type.STRING,
            description: "The variable name (e.g., 'Q1', 'Q2') of the question AFTER which this new question should be inserted. Use for requests like 'add a question after Q2'."
        },
        before_qid: {
            type: Type.STRING,
            description: "The variable name (e.g., 'Q1', 'Q2') of the question BEFORE which this new question should be inserted. Use for requests like 'add before Q2' or to make the new question become a specific number, e.g., 'make this the new Q1'."
        }
      },
      required: ['title', 'type'],
    },
};

const updateQuestionFunctionDeclaration: FunctionDeclaration = {
  name: 'update_question',
  description: 'Updates properties of an existing question. Use this to change text, choices, type, or other settings like making it required or randomizing choices.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      qid: {
        type: Type.STRING,
        description: "The variable name of the question to update (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
      },
      text: {
        type: Type.STRING,
        description: 'The new main text for the question.',
      },
      type: {
        type: Type.STRING,
        description: 'The new type for the question (e.g., "Checkbox", "Text Entry").',
        enum: Object.values(QTEnum),
      },
      choices: {
        type: Type.ARRAY,
        description: 'A new array of strings for the choices. This will replace all existing choices.',
        items: {
          type: Type.STRING,
        },
      },
      forceResponse: {
        type: Type.BOOLEAN,
        description: 'Set to true to make the question required, false to make it optional.',
      },
      randomizeChoices: {
          type: Type.BOOLEAN,
          description: "Set to true to randomize the order of choices, false to disable randomization."
      },
      answerFormat: {
          type: Type.STRING,
          description: "For choice-based questions, sets the display format.",
          enum: ['list', 'grid']
      },
      multipleSelection: {
        type: Type.BOOLEAN,
        description: "For Radio Button or Checkbox questions, set to true to allow multiple answers (Checkbox), or false for a single answer (Radio Button). This will change the question's type.",
      }
    },
    required: ['qid'],
  },
};

const getQuestionDetailsFunctionDeclaration: FunctionDeclaration = {
    name: 'get_question_details',
    description: 'Retrieves the current configuration and details of a specific question in the survey.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        qid: {
          type: Type.STRING,
          description: "The variable name of the question to get details for (e.g., 'Q1'). When the user asks about 'this question', use the qid from the provided context.",
        },
      },
      required: ['qid'],
    },
};

const setDisplayLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'set_display_logic',
    description: 'Sets or updates the display logic for a question. This determines whether the question is shown to the respondent. Calling this will overwrite any existing display logic.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to apply the logic to (e.g., 'Q2'). When the user says 'this question', use the qid from the provided context.",
            },
            logicalOperator: {
                type: Type.STRING,
                description: "How to evaluate multiple conditions. Defaults to 'AND'.",
                enum: ['AND', 'OR'],
            },
            conditions: {
                type: Type.ARRAY,
                description: 'A list of conditions that must be met for the question to be displayed.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sourceQid: {
                            type: Type.STRING,
                            description: "The QID of the question the condition is based on (e.g., 'Q1').",
                        },
                        operator: {
                            type: Type.STRING,
                            description: 'The comparison operator.',
                            enum: ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'contains', 'greater_than', 'less_than'],
                        },
                        value: {
                            type: Type.STRING,
                            description: "The value to check against. For choice-based questions, find the full choice text (e.g., 'Q1_1 Yes') from the user's prompt or survey context. Not required for 'is_empty' or 'is_not_empty'.",
                        },
                    },
                    required: ['sourceQid', 'operator'],
                },
            },
        },
        required: ['qid', 'conditions'],
    },
};

const removeDisplayLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'remove_display_logic',
    description: 'Removes all display logic from a question, making it always visible.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to remove logic from (e.g., 'Q2'). When the user says 'this question', use the qid from the provided context.",
            },
        },
        required: ['qid'],
    },
};

const setSkipLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'set_skip_logic',
    description: 'Sets or updates the skip logic for a question. This determines where the respondent goes after answering. Calling this will overwrite any existing skip logic. For questions with choices (like Radio Button), you must provide a rule for each choice. For other questions (like Text Entry), provide one rule without a specific choice.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to apply the logic to (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
            },
            rules: {
                type: Type.ARRAY,
                description: "A list of rules for skipping. The destination can be another question's QID (e.g., 'Q3'), 'next', or 'end'.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        choiceText: {
                            type: Type.STRING,
                            description: "The text of the choice that triggers this rule (e.g., 'Yes', 'Option A'). Omit for simple (non-choice-based) skip logic.",
                        },
                        destinationQid: {
                            type: Type.STRING,
                            description: "The QID of the question to skip to, or the keyword 'next' or 'end'.",
                        },
                    },
                    required: ['destinationQid'],
                },
            },
        },
        required: ['qid', 'rules'],
    },
};

const removeSkipLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'remove_skip_logic',
    description: 'Removes all skip logic from a question.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to remove logic from (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
            },
        },
        required: ['qid'],
    },
};

const repositionQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'reposition_question',
    description: 'Moves an existing question to a new position in the survey, either before or after another specified question.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        qid: {
          type: Type.STRING,
          description: "The variable name of the question to move (e.g., 'Q1').",
        },
        after_qid: {
            type: Type.STRING,
            description: "The variable name (e.g., 'Q2') of the question AFTER which the selected question should be moved."
        },
        before_qid: {
            type: Type.STRING,
            description: "The variable name (e.g., 'Q3') of the question BEFORE which the selected question should be moved."
        },
        force: {
            type: Type.BOOLEAN,
            description: "Defaults to false. If true, bypasses logic validation and forces the move. This should only be used after the user has been warned about potential logic issues and has confirmed they want to proceed."
        }
      },
      required: ['qid'],
    },
};

const deleteQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'delete_question',
    description: 'Deletes an existing question from the survey based on its variable name (QID).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        qid: {
          type: Type.STRING,
          description: "The variable name of the question to delete (e.g., 'Q1').",
        },
      },
      required: ['qid'],
    },
};

const initialMessages: ChatMessage[] = [
    { role: 'model', text: "Hi! How can I help you build your survey today? You can ask me to add questions, suggest improvements, or check for issues." }
];


const GeminiPanel: React.FC<GeminiPanelProps> = memo(({ onClose, onAddQuestion, onUpdateQuestion, onRepositionQuestion, onDeleteQuestion, helpTopic, selectedQuestion, survey, logicIssues }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingLogicChange, setPendingLogicChange] = useState<PendingLogicChange | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Only initialize chat if API key is available
    if (!hasAPIKey()) {
      return;
    }

    try {
      const systemInstruction = `You are a helpful survey building assistant integrated into a UI.
Your primary goal is to help users build and modify surveys using available tools.
With every user prompt, you will be provided with the complete current structure of the survey, including all questions, choices, and logic. You MUST treat this structure as the single source of truth.
The provided context may also include a list of 'Current Logic Issues'. You should be aware of these when making changes or if the user asks you to validate the survey.
When the user refers to "this question" or "the selected question," you should use the context provided about the currently selected question.
When calling 'reposition_question', you MUST provide either 'before_qid' or 'after_qid'.

When you propose a logic change (display or skip logic) or a question move (reposition_question), it will be validated. If validation fails, you will receive a response like "VALIDATION_FAILED: <details>".
When this happens, you MUST inform the user about the specific issues found in the details, and ask them if they want to proceed anyway.
Do not apologize or try to fix it yourself. Just present the facts and ask for confirmation.
If the user confirms, call the exact same function again, but for a reposition, add the 'force: true' parameter. For logic changes, just call the function again. If they cancel, simply confirm the cancellation.`;

      chatRef.current = getAI().chats.create({
        model: 'gemini-2.5-flash',
        history: initialMessages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        config: {
          tools: [{ functionDeclarations: [
              addQuestionFunctionDeclaration, 
              updateQuestionFunctionDeclaration,
              getQuestionDetailsFunctionDeclaration,
              setDisplayLogicFunctionDeclaration,
              removeDisplayLogicFunctionDeclaration,
              setSkipLogicFunctionDeclaration,
              removeSkipLogicFunctionDeclaration,
              repositionQuestionFunctionDeclaration,
              deleteQuestionFunctionDeclaration,
          ] }],
        },
        systemInstruction: { parts: [{ text: systemInstruction }] }
      });
    } catch (error) {
      console.error('Erro ao inicializar chat do Gemini:', error);
      setMessages([{ role: 'model', text: 'Erro ao inicializar o assistente Gemini. Por favor, verifique sua API key.' }]);
    }
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!hasAPIKey() || !helpTopic) {
      if (helpTopic) {
        setMessages([{ role: 'model', text: 'API Key não configurada. Por favor, configure a variável GEMINI_API_KEY no arquivo .env.local para usar este recurso.' }]);
      }
      return;
    }
    
    const fetchHelpTopic = async (topic: string) => {
      setMessages([]); // Clear previous chat
      setIsLoading(true);
      try {
        const prompt = `Explain the advanced syntax for ${topic} in this survey tool. 
        - Start with a brief explanation.
        - List the supported operators and their required structure. For example, 'Q1 equals Yes', or for skip logic 'Q5'.
        - Provide at least one concrete example for ${topic}.
        - Keep the explanation concise and formatted for a small panel using markdown for bolding and lists.`;

        const response = await getAI().models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        const helpText = response.text;
        setMessages([{ role: 'model', text: helpText }]);

      } catch (error) {
        console.error('Error fetching help topic:', error);
        setMessages([{ role: 'model', text: `Sorry, I couldn't fetch information about ${topic}. Please check your API key and network connection.` }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpTopic(helpTopic);
  }, [helpTopic]);
  
  const applyLogicChange = useCallback((name: string, args: any) => {
    const { qid } = args;
    if (!qid) return;

    switch (name) {
        case 'set_display_logic': {
            const { logicalOperator, conditions } = args as { logicalOperator?: 'AND' | 'OR'; conditions: { sourceQid: string; operator: any; value?: string }[] };
            const questionToUpdate = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
            if (questionToUpdate) {
                const newDisplayLogic: DisplayLogic = {
                    operator: logicalOperator || 'AND',
                    conditions: conditions.map(c => ({ id: generateId('dlc'), questionId: c.sourceQid, operator: c.operator, value: c.value || '', isConfirmed: true }))
                };
                onUpdateQuestion({ qid, displayLogic: newDisplayLogic });
            }
            break;
        }
        case 'remove_display_logic': {
            onUpdateQuestion({ qid, displayLogic: undefined });
            break;
        }
        case 'set_skip_logic': {
            const { rules } = args as { rules: { choiceText?: string; destinationQid: string }[] };
            const questionToUpdate = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
            if (!questionToUpdate) break;

            let newSkipLogic: SkipLogic | undefined;

            if (rules.length === 1 && !rules[0].choiceText && !CHOICE_BASED_QUESTION_TYPES.has(questionToUpdate.type)) {
                const destQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === rules[0].destinationQid.toLowerCase());
                const skipTo = ['next', 'end'].includes(rules[0].destinationQid.toLowerCase()) ? rules[0].destinationQid.toLowerCase() : destQ?.id || '';
                if (skipTo) newSkipLogic = { type: 'simple', skipTo, isConfirmed: true };
            } else if (questionToUpdate.choices) {
                const skipRules: SkipLogicRule[] = [];
                for (const rule of rules) {
                    const choice = questionToUpdate.choices.find(c => parseChoice(c.text).label.toLowerCase() === rule.choiceText?.toLowerCase());
                    if (choice) {
                        const destQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === rule.destinationQid.toLowerCase());
                        const skipTo = ['next', 'end'].includes(rule.destinationQid.toLowerCase()) ? rule.destinationQid.toLowerCase() : destQ?.id || '';
                        // FIX: Added the required 'id' property when creating a new SkipLogicRule.
                        if (skipTo) skipRules.push({ id: generateId('slr'), choiceId: choice.id, skipTo, isConfirmed: true });
                    }
                }
                if (skipRules.length > 0) newSkipLogic = { type: 'per_choice', rules: skipRules };
            }

            if (newSkipLogic) onUpdateQuestion({ qid, skipLogic: newSkipLogic });
            break;
        }
        case 'remove_skip_logic': {
            onUpdateQuestion({ qid, skipLogic: undefined });
            break;
        }
    }
}, [onUpdateQuestion, survey]);

const validateLogicChange = useCallback((name: string, args: any): { ok: boolean, error?: string } => {
    // Run standard validation for loops or skipping backward first
    const dryRunSurvey: Survey = JSON.parse(JSON.stringify(survey));
    const questionInDryRun = dryRunSurvey.blocks.flatMap((b: Block) => b.questions).find((q: Question) => q.qid === args.qid);
    if (!questionInDryRun) return { ok: false, error: 'Internal error during validation.' };

    switch (name) {
        case 'set_skip_logic': {
            const { rules } = args;
            if (rules.length === 1 && !rules[0].choiceText) { // Simple logic
                questionInDryRun.skipLogic = { type: 'simple', skipTo: rules[0].destinationQid, isConfirmed: true };
            } else { // Per-choice
                // FIX: Added the required 'id' property to the mapped SkipLogicRule objects.
                questionInDryRun.skipLogic = { type: 'per_choice', rules: (questionInDryRun.choices || []).map(() => ({ id: generateId('slr'), choiceId: '', skipTo: '', isConfirmed: true })) };
            }
            break;
        }
        // other cases can be added if needed
    }

    const initialIssues = validateSurveyLogic(survey);
    const newIssues = validateSurveyLogic(dryRunSurvey);
    const initialIssueKeys = new Set(initialIssues.map(i => `${i.questionId}-${i.message}`));
    
    let criticalNewIssues = newIssues.filter(issue => !initialIssueKeys.has(`${issue.questionId}-${issue.message}`));
    
    if (criticalNewIssues.length > 0) {
        const errorDetails = criticalNewIssues.map(issue => {
            const q = survey.blocks.flatMap(b => b.questions).find(q => q.id === issue.questionId);
            return `- On question ${q?.qid || 'unknown'}: ${issue.message}`;
        }).join('\n');
        return { ok: false, error: `This change may cause issues on other questions:\n${errorDetails}` };
    }


    // Advanced validation for impossible paths
    if (name === 'set_skip_logic') {
        const { qid, rules } = args;
        const sourceQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
        if (!sourceQ) return { ok: true }; // Should be caught by earlier checks

        for (const rule of rules) {
            const { destinationQid } = rule;
            if (!destinationQid || ['next', 'end'].includes(destinationQid.toLowerCase())) continue;

            const targetQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === destinationQid.toLowerCase());
            if (!targetQ || !targetQ.displayLogic) continue;
            
            const targetDisplayConditions = targetQ.displayLogic.conditions.filter(c => c.isConfirmed);
            const entryConditions = findDirectEntryConditions(sourceQ.id, survey);

            // Add the condition for this specific skip rule, if it's choice-based
            if (rule.choiceText && sourceQ.choices) {
                const choice = sourceQ.choices.find(c => parseChoice(c.text).label.toLowerCase() === rule.choiceText.toLowerCase());
                if (choice) {
                    entryConditions.push({
                        id: generateId('inferred'),
                        questionId: sourceQ.qid,
                        operator: 'equals',
                        value: choice.text, // The full value, e.g. Q1_1 Yes
                        isConfirmed: true,
                    });
                }
            }
            
            // Combine all conditions and check for conflicts
            const allConditions = [...targetDisplayConditions, ...entryConditions];
            const conditionsByQid = new Map<string, DisplayLogicCondition[]>();
            allConditions.forEach(c => {
                if (!conditionsByQid.has(c.questionId)) conditionsByQid.set(c.questionId, []);
                conditionsByQid.get(c.questionId)!.push(c);
            });

            for (const [conflictingQid, conditions] of conditionsByQid.entries()) {
                if (conditions.length < 2) continue;
                
                const values = new Set(conditions.filter(c => c.operator === 'equals').map(c => c.value));
                if (values.size > 1) {
                    return { ok: false, error: `This skip logic creates an impossible path. The conditions required to reach ${sourceQ.qid} mean the destination question ${targetQ.qid} would be HIDDEN due to its display logic. The conflict involves question ${conflictingQid}.` };
                }
            }
        }
    }
    
    return { ok: true };
}, [survey]);

const validateReposition = useCallback((args: any): { ok: boolean, error?: string } => {
    const { qid, after_qid, before_qid } = args;

    if (!after_qid && !before_qid) {
        return { ok: false, error: "The destination for the move is unclear. Please specify whether to move it before or after another question." };
    }

    const dryRunSurvey: Survey = JSON.parse(JSON.stringify(survey));
    
    let draggedQuestion: Question | undefined;
    let originalBlock: Block | undefined;
    
    for (const block of dryRunSurvey.blocks) {
        const qIndex = block.questions.findIndex((q: Question) => q.qid === qid);
        if (qIndex !== -1) {
            [draggedQuestion] = block.questions.splice(qIndex, 1);
            originalBlock = block;
            break;
        }
    }
    if (!draggedQuestion) return { ok: false, error: `Question ${qid} was not found in the survey.` };

    let targetPlaced = false;
    const targetQid = before_qid || after_qid;
    const isAfter = !!after_qid;

    if (targetQid) {
        for (const block of dryRunSurvey.blocks) {
            const targetQIndex = block.questions.findIndex((q: Question) => q.qid === targetQid);
            if (targetQIndex !== -1) {
                const insertionIndex = isAfter ? targetQIndex + 1 : targetQIndex;
                block.questions.splice(insertionIndex, 0, draggedQuestion);
                targetPlaced = true;
                break;
            }
        }
    }
    if (!targetPlaced) return { ok: false, error: `The target question ${targetQid} was not found.` };
    
    if (originalBlock && originalBlock.questions.length === 0 && dryRunSurvey.blocks.length > 1) {
        dryRunSurvey.blocks = dryRunSurvey.blocks.filter((b: Block) => b.id !== originalBlock!.id);
    }
    
    const renumberedDryRun = JSON.parse(JSON.stringify(dryRunSurvey));
    // The renumbering happens in reducer, but for validation we need to account for it.
    // The logic validator works on indices, which is what we need.
    const newIssues = validateSurveyLogic(dryRunSurvey);
    
    const currentIssueMessages = new Set(logicIssues.map(i => i.message));
    const criticalNewIssues = newIssues.filter(issue => !currentIssueMessages.has(issue.message));
    
    if (criticalNewIssues.length > 0) {
        const errorDetails = criticalNewIssues.map(issue => {
            const q = dryRunSurvey.blocks.flatMap(b => b.questions).find(q => q.id === issue.questionId);
            return `- On question ${q?.qid || 'unknown'}: ${issue.message}`;
        }).join('\n');
        return { ok: false, error: `This move will create new logic issues:\n${errorDetails}` };
    }

    return { ok: true };
}, [survey, logicIssues]);


  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading || !chatRef.current || !hasAPIKey()) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
        const surveyContext = generateSurveyContext(survey, logicIssues);
        let finalInput = `This is the current structure of the survey:\n${surveyContext}\nPlease use this as the single source of truth for the survey's content and logic.\n\n`;

        if (selectedQuestion) {
            finalInput += `The user currently has question ${selectedQuestion.qid} selected.\n\n`;
        }

        finalInput += `User request: "${trimmedInput}"`;

        const response = await chatRef.current.sendMessage({ message: finalInput });
      
        const functionCalls = response.functionCalls;
        let modelResponseText = response.text || '';

        if (functionCalls && functionCalls.length > 0) {
            const functionResponseParts = [];

            for (const funcCall of functionCalls) {
                const currentChange: PendingLogicChange = { name: funcCall.name, args: funcCall.args };
                const logicFunctionNames = ['set_display_logic', 'remove_display_logic', 'set_skip_logic', 'remove_skip_logic'];

                let resultPayload;

                if (logicFunctionNames.includes(funcCall.name)) {
                    if (isSameLogicChange(pendingLogicChange, currentChange)) {
                        setPendingLogicChange(null);
                        applyLogicChange(currentChange.name, currentChange.args);
                        resultPayload = { result: "OK, change applied as requested by user confirmation." };
                    } else {
                        const validationResult = validateLogicChange(funcCall.name, funcCall.args);
                        if (validationResult.ok) {
                            setPendingLogicChange(null);
                            applyLogicChange(funcCall.name, funcCall.args);
                            resultPayload = { result: "OK, logic applied successfully after passing validation." };
                        } else {
                            setPendingLogicChange(currentChange);
                            resultPayload = { result: `VALIDATION_FAILED: ${validationResult.error}` };
                        }
                    }
                } else if (funcCall.name === 'reposition_question') {
                    const { force } = funcCall.args;
                    if (force && isSameLogicChange(pendingLogicChange, currentChange)) {
                        setPendingLogicChange(null);
                        onRepositionQuestion(funcCall.args);
                        resultPayload = { result: "OK, the question has been moved as you confirmed." };
                    } else {
                        const validationResult = validateReposition(funcCall.args);
                        if (validationResult.ok) {
                            setPendingLogicChange(null);
                            onRepositionQuestion(funcCall.args);
                            resultPayload = { result: "OK, the question has been moved successfully." };
                        } else {
                            setPendingLogicChange(currentChange);
                            resultPayload = { result: `VALIDATION_FAILED: ${validationResult.error}` };
                        }
                    }
                } else if (funcCall.name === 'add_question') {
                    setPendingLogicChange(null);
                    const { title, type, choices, after_qid, before_qid } = funcCall.args;
                    onAddQuestion(type, title, choices, after_qid, before_qid);
                    resultPayload = { result: "OK, question added." };
                } else if (funcCall.name === 'update_question') {
                    setPendingLogicChange(null);
                    onUpdateQuestion(funcCall.args);
                    resultPayload = { result: "OK, question updated." };
                } else if (funcCall.name === 'delete_question') {
                    setPendingLogicChange(null);
                    const { qid } = funcCall.args;
                    onDeleteQuestion(qid);
                    resultPayload = { result: "OK, question deleted." };
                } else if (funcCall.name === 'get_question_details') {
                    setPendingLogicChange(null);
                    const { qid } = funcCall.args;
                    const question = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);

                    if (!question) {
                        resultPayload = { result: `ERROR: Question with QID '${qid}' not found.` };
                    } else {
                        const allQuestions = survey.blocks.flatMap(b => b.questions);
                        const findQuestionById = (id: string) => allQuestions.find(q => q.id === id);

                        const details: any = {
                            qid: question.qid,
                            text: question.text,
                            type: question.type,
                            isRequired: question.forceResponse || false,
                        };

                        if (question.choices) {
                            details.choices = question.choices.map(c => parseChoice(c.text).label);
                        }

                        if (question.scalePoints) {
                            details.scalePoints = question.scalePoints.map(sp => sp.text);
                        }

                        if (question.answerBehavior?.randomizeChoices) {
                            details.isChoiceOrderRandomized = true;
                        }

                        if (question.textEntrySettings) {
                            details.textEntryConfiguration = {
                                answerLength: question.textEntrySettings.answerLength,
                                contentTypeValidation: question.textEntrySettings.validation?.contentType
                            };
                        }

                        const logicToUse = {
                            display: question.draftDisplayLogic ?? question.displayLogic,
                            skip: question.draftSkipLogic ?? question.skipLogic,
                        };

                        if (logicToUse.display && logicToUse.display.conditions.length > 0) {
                            details.displayLogic = `Shown only if ${logicToUse.display.conditions.map(c => `${c.questionId} ${c.operator} ${c.value}`).join(` ${logicToUse.display.operator} `)}.`;
                        }

                        if (logicToUse.skip) {
                            if (logicToUse.skip.type === 'simple') {
                                const destQ = findQuestionById(logicToUse.skip.skipTo);
                                details.skipLogic = `After answering, skips to ${destQ ? destQ.qid : logicToUse.skip.skipTo}.`;
                            } else {
                                const rulesSummary = logicToUse.skip.rules.map(rule => {
                                    const choice = question.choices?.find(c => c.id === rule.choiceId);
                                    const destQ = findQuestionById(rule.skipTo);
                                    if (choice) {
                                        return `if '${parseChoice(choice.text).label}' is selected, skip to ${destQ ? destQ.qid : rule.skipTo}`;
                                    }
                                    return '';
                                }).filter(Boolean).join('; ');
                                details.skipLogic = `Skips based on answer: ${rulesSummary}.`;
                            }
                        }
                        
                        resultPayload = { result: JSON.stringify(details, null, 2) };
                    }
                }
                
                functionResponseParts.push({
                  functionResponse: {
                    name: funcCall.name,
                    response: resultPayload
                  }
                });
            }
            
            if (functionResponseParts.length > 0) {
                const followupResponse = await chatRef.current.sendMessage({ message: functionResponseParts });
                modelResponseText += followupResponse.text;
            }
        } else {
            setPendingLogicChange(null);
        }

        if (modelResponseText) {
            setMessages(prev => [...prev, { role: 'model', text: modelResponseText }]);
        }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: ChatMessage = { role: 'model', text: `Sorry, something went wrong. ${error instanceof Error ? error.message : String(error)}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, onAddQuestion, onUpdateQuestion, onRepositionQuestion, onDeleteQuestion, selectedQuestion, survey, applyLogicChange, validateLogicChange, validateReposition, pendingLogicChange, logicIssues]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  }, [handleSendMessage]);

  const isHelpMode = !!helpTopic;

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center">
            <SparkleIcon className="text-xl text-primary mr-2" />
            <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {isHelpMode ? `About ${helpTopic}` : 'Gemini Assistant'}
            </h2>
        </div>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="Close Gemini Assistant">
          <XIcon className="text-2xl" />
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        {!hasAPIKey() ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <SparkleIcon className="text-4xl text-on-surface-variant mb-4" />
            <h3 className="text-lg font-semibold text-on-surface mb-2">API Key não configurada</h3>
            <p className="text-sm text-on-surface-variant mb-4 max-w-md">
              Para usar o assistente Gemini, você precisa configurar sua chave de API do Google Gemini.
            </p>
            <div className="bg-surface-container-high rounded-lg p-4 max-w-md text-left">
              <p className="text-xs font-semibold text-on-surface mb-2">Como configurar:</p>
              <ol className="text-xs text-on-surface-variant space-y-1 list-decimal list-inside">
                <li>Crie um arquivo <code className="bg-surface px-1 rounded">.env.local</code> na raiz do projeto</li>
                <li>Adicione a linha: <code className="bg-surface px-1 rounded">GEMINI_API_KEY=sua_chave_aqui</code></li>
                <li>Reinicie o servidor de desenvolvimento</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                        <SparkleIcon className="text-lg text-on-primary-container" />
                    </div>
                )}
                <div className={`rounded-lg p-3 max-w-xs ${msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}>
                    <p className={`text-sm ${msg.role === 'user' ? '' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
                </div>
                 {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                        <AccountCircleIcon className="text-lg text-on-surface-variant" />
                    </div>
                )}
            </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <LoaderIcon className="text-lg text-on-primary-container animate-spin" />
                </div>
                <div className="bg-surface-container-high rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-on-surface-variant italic">
                        {helpTopic ? 'Fetching details...' : 'Gemini is thinking...'}
                    </p>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
          </>
        )}
      </div>

      <div className={`p-4 border-t border-outline-variant ${isHelpMode || !hasAPIKey() ? 'hidden' : ''}`}>
        <div className="relative">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini..."
            className="w-full bg-surface-container-high border-transparent rounded-md py-2 pl-4 pr-12 text-sm text-on-surface focus:outline-2 focus:outline-primary resize-none"
            style={{ fontFamily: "'Open Sans', sans-serif", maxHeight: '100px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            disabled={isLoading || isHelpMode}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || isHelpMode}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message to Gemini"
          >
            <SendIcon className="text-base" />
          </button>
        </div>
      </div>
    </aside>
  );
});

export default GeminiPanel;
