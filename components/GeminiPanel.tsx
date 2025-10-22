import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { XIcon, SparkleIcon, SendIcon, LoaderIcon, AccountCircleIcon } from './icons';
import type { ChatMessage, Question, QuestionType, Choice, Survey, DisplayLogic, SkipLogic, SkipLogicRule } from '../types';
import { QuestionType as QTEnum } from '../types';
import { generateId, parseChoice } from '../utils';

interface GeminiPanelProps {
  onClose: () => void;
  onAddQuestion: (questionType: QuestionType, title: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
  onUpdateQuestion: (args: any) => void;
  helpTopic: string | null;
  selectedQuestion: Question | null;
  survey: Survey;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

const initialMessages: ChatMessage[] = [
    { role: 'model', text: "Hi! How can I help you build your survey today? You can ask me to add questions, suggest improvements, or check for issues." }
];


const GeminiPanel: React.FC<GeminiPanelProps> = memo(({ onClose, onAddQuestion, onUpdateQuestion, helpTopic, selectedQuestion, survey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    const systemInstruction = `You are a helpful survey building assistant integrated into a UI.
    Your primary goal is to help users build and modify surveys using available tools.
    You can add questions, update questions, and add or remove display logic and skip logic.
    When the user refers to "this question" or "the selected question," you should use the context provided about the currently selected question (if any).
    Use the update_question tool to modify existing questions based on user requests like "make this required" or "change the choices".
    Use the set_display_logic and set_skip_logic tools to add conditional logic. Use the corresponding remove_... tools to delete logic.
    Always be concise and confirm actions taken.`;

    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: initialMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      config: {
        tools: [{ functionDeclarations: [
            addQuestionFunctionDeclaration, 
            updateQuestionFunctionDeclaration,
            setDisplayLogicFunctionDeclaration,
            removeDisplayLogicFunctionDeclaration,
            setSkipLogicFunctionDeclaration,
            removeSkipLogicFunctionDeclaration,
        ] }],
      },
      systemInstruction: { parts: [{ text: systemInstruction }] }
    });
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchHelpTopic = async (topic: string) => {
      setMessages([]); // Clear previous chat
      setIsLoading(true);
      try {
        const prompt = `Explain the advanced syntax for ${topic} in this survey tool. 
        - Start with a brief explanation.
        - List the supported operators and their required structure. For example, 'Q1 equals Yes', or for skip logic 'Q5'.
        - Provide at least one concrete example for ${topic}.
        - Keep the explanation concise and formatted for a small panel using markdown for bolding and lists.`;

        const response = await ai.models.generateContent({
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

    if (helpTopic) {
      fetchHelpTopic(helpTopic);
    } else {
      if (messages.length === 0) {
        setMessages(initialMessages);
      }
    }
  }, [helpTopic]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let finalInput = trimmedInput;
      if (selectedQuestion) {
          finalInput = `CONTEXT: The user has question ${selectedQuestion.qid} ('${selectedQuestion.text}') selected.\n\nUSER PROMPT: ${trimmedInput}`;
      }

      const response = await chatRef.current.sendMessage({ message: finalInput });
      
      const newModelMessages: ChatMessage[] = [];

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const funcCall of response.functionCalls) {
          if (funcCall.name === 'add_question') {
            const { title, type, choices, after_qid, before_qid } = funcCall.args as { title: string; type: QuestionType; choices?: string[]; after_qid?: string; before_qid?: string; };
            onAddQuestion(type, title, choices, after_qid, before_qid);

            let confirmationText = `Sure, I've added a "${type}" question with the title "${title}"`;
            if (before_qid) {
              confirmationText += ` before question ${before_qid}. The question numbers have been updated.`;
            } else if (after_qid) {
              confirmationText += ` after question ${after_qid}.`;
            } else {
              confirmationText += '.';
            }
            newModelMessages.push({ role: 'model', text: confirmationText });
          } else if (funcCall.name === 'update_question') {
            const args = funcCall.args as any;
            onUpdateQuestion(args);
            newModelMessages.push({ role: 'model', text: `OK, I've updated question ${args.qid}.` });
          } else if (funcCall.name === 'set_display_logic') {
                const { qid, logicalOperator, conditions } = funcCall.args as { qid: string; logicalOperator?: 'AND' | 'OR'; conditions: { sourceQid: string; operator: any; value?: string }[] };
                
                const questionToUpdate = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);
                if (questionToUpdate) {
                    const newDisplayLogic: DisplayLogic = {
                        operator: logicalOperator || 'AND',
                        conditions: conditions.map(c => ({
                            id: generateId('dlc'),
                            questionId: c.sourceQid,
                            operator: c.operator,
                            value: c.value || '',
                            isConfirmed: true, // AI actions are auto-confirmed
                        }))
                    };
                    onUpdateQuestion({ qid, displayLogic: newDisplayLogic });
                    newModelMessages.push({ role: 'model', text: `OK, I've added display logic to ${qid}.` });
                } else {
                    newModelMessages.push({ role: 'model', text: `Sorry, I couldn't find question ${qid}.` });
                }
            } else if (funcCall.name === 'remove_display_logic') {
                const { qid } = funcCall.args as { qid: string };
                onUpdateQuestion({ qid, displayLogic: undefined });
                newModelMessages.push({ role: 'model', text: `OK, I've removed the display logic from ${qid}.` });
            } else if (funcCall.name === 'set_skip_logic') {
                const { qid, rules } = funcCall.args as { qid: string; rules: { choiceText?: string; destinationQid: string }[] };
                const questionToUpdate = survey.blocks.flatMap(b => b.questions).find(q => q.qid === qid);

                if (questionToUpdate) {
                    let newSkipLogic: SkipLogic | undefined = undefined;

                    if (rules.length === 1 && !rules[0].choiceText && questionToUpdate.type === QTEnum.TextEntry) {
                        const destQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === rules[0].destinationQid.toLowerCase());
                        const skipTo = rules[0].destinationQid.toLowerCase() === 'next' ? 'next' : rules[0].destinationQid.toLowerCase() === 'end' ? 'end' : destQ?.id || '';

                        if (skipTo) {
                            newSkipLogic = { type: 'simple', skipTo, isConfirmed: true };
                        }
                    } else if (questionToUpdate.choices && rules.every(r => r.choiceText)) {
                        const skipRules: SkipLogicRule[] = [];
                        let allRulesValid = true;
                        for (const rule of rules) {
                            let choice = questionToUpdate.choices.find(c => parseChoice(c.text).label.toLowerCase() === rule.choiceText!.toLowerCase());
                            if (!choice) {
                                choice = questionToUpdate.choices.find(c => c.text.toLowerCase().includes(rule.choiceText!.toLowerCase()));
                            }

                            if (choice) {
                                const destQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === rule.destinationQid.toLowerCase());
                                const skipTo = rule.destinationQid.toLowerCase() === 'next' ? 'next' : rule.destinationQid.toLowerCase() === 'end' ? 'end' : destQ?.id || '';
                                
                                if (skipTo) {
                                    skipRules.push({ choiceId: choice.id, skipTo, isConfirmed: true });
                                } else {
                                    allRulesValid = false;
                                    newModelMessages.push({ role: 'model', text: `I couldn't find the destination question '${rule.destinationQid}' for choice '${rule.choiceText}'.` });
                                    break;
                                }
                            } else {
                                allRulesValid = false;
                                newModelMessages.push({ role: 'model', text: `I couldn't find the choice '${rule.choiceText}' in question ${qid}.` });
                                break;
                            }
                        }
                        if (allRulesValid) {
                            newSkipLogic = { type: 'per_choice', rules: skipRules };
                        }
                    }

                    if (newSkipLogic) {
                        onUpdateQuestion({ qid, skipLogic: newSkipLogic });
                        newModelMessages.push({ role: 'model', text: `OK, I've added skip logic to ${qid}.` });
                    } else if (newModelMessages.length === 0) {
                        newModelMessages.push({ role: 'model', text: `Sorry, I couldn't set up that skip logic for ${qid}. Please make sure the choices and destinations are correct.` });
                    }
                } else {
                    newModelMessages.push({ role: 'model', text: `Sorry, I couldn't find question ${qid}.` });
                }
            } else if (funcCall.name === 'remove_skip_logic') {
                const { qid } = funcCall.args as { qid: string };
                onUpdateQuestion({ qid, skipLogic: undefined });
                newModelMessages.push({ role: 'model', text: `OK, I've removed the skip logic from ${qid}.` });
            }
        }
      } else if (response.text) {
        newModelMessages.push({ role: 'model', text: response.text });
      } else {
        newModelMessages.push({ role: 'model', text: "Sorry, I couldn't process that request." });
      }

      if (newModelMessages.length > 0) {
        setMessages(prev => [...prev, ...newModelMessages]);
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, onAddQuestion, onUpdateQuestion, selectedQuestion, survey]);


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
      </div>

      <div className={`p-4 border-t border-outline-variant ${isHelpMode ? 'hidden' : ''}`}>
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