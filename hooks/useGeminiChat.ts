import { GoogleGenAI, Chat, Part } from "@google/genai";
import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, Survey, LogicIssue, Question, Block, DisplayLogic, SkipLogic, SkipLogicRule, DisplayLogicCondition } from '../types';
import { QuestionType as QTEnum } from '../types';
import { generateId, parseChoice, CHOICE_BASED_QUESTION_TYPES } from '../utils';
import { validateSurveyLogic } from '../logicValidator';
import {
    addQuestionFunctionDeclaration,
    updateQuestionFunctionDeclaration,
    getQuestionDetailsFunctionDeclaration,
    setDisplayLogicFunctionDeclaration,
    removeDisplayLogicFunctionDeclaration,
    setSkipLogicFunctionDeclaration,
    removeSkipLogicFunctionDeclaration,
    repositionQuestionFunctionDeclaration,
    deleteQuestionFunctionDeclaration
} from '../services/geminiTools';

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string }); // REMOVED: Caused crash on load

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

const initialMessages: ChatMessage[] = [
    { role: 'model', text: "Hi! How can I help you build your survey today? You can ask me to add questions, suggest improvements, or check for issues." }
];

interface UseGeminiChatProps {
    survey: Survey;
    logicIssues: LogicIssue[];
    selectedQuestion: Question | null;
    onUpdateQuestion: (args: any) => void;
    onRepositionQuestion: (args: { qid: string, after_qid?: string, before_qid?: string }) => void;
    onAddQuestion: (type: any, text: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
    onDeleteQuestion: (qid: string) => void;
}

export const useGeminiChat = ({
    survey,
    logicIssues,
    selectedQuestion,
    onUpdateQuestion,
    onRepositionQuestion,
    onAddQuestion,
    onDeleteQuestion
}: UseGeminiChatProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingLogicChange, setPendingLogicChange] = useState<PendingLogicChange | null>(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("Gemini API Key is missing. AI features will be disabled.");
            setMessages([{ role: 'model', text: "AI features are currently disabled because the API Key is missing. Please configure your environment variables." }]);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

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

        try {
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: initialMessages.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                })),
                config: {
                    tools: [{
                        functionDeclarations: [
                            addQuestionFunctionDeclaration,
                            updateQuestionFunctionDeclaration,
                            getQuestionDetailsFunctionDeclaration,
                            setDisplayLogicFunctionDeclaration,
                            removeDisplayLogicFunctionDeclaration,
                            setSkipLogicFunctionDeclaration,
                            removeSkipLogicFunctionDeclaration,
                            repositionQuestionFunctionDeclaration,
                            deleteQuestionFunctionDeclaration,
                        ]
                    }],
                },
                // @ts-ignore
                systemInstruction: { parts: [{ text: systemInstruction }] }
            });
        } catch (error) {
            console.error("Failed to initialize Gemini chat:", error);
            setMessages([{ role: 'model', text: "Failed to initialize AI features. Please check your configuration." }]);
        }
    }, []);

    const fetchHelpTopic = useCallback(async (topic: string) => {
        setMessages([]); // Clear previous chat
        setIsLoading(true);
        try {
            if (!chatRef.current) {
                throw new Error("Chat not initialized (missing API key?)");
            }

            const prompt = `Explain the advanced syntax for ${topic} in this survey tool.
    - Start with a brief explanation.
    - List the supported operators and their required structure. For example, 'Q1 equals Yes', or for skip logic 'Q5'.
    - Provide at least one concrete example for ${topic}.
    - Keep the explanation concise and formatted for a small panel using markdown for bolding and lists.`;

            const response = await chatRef.current.sendMessage({ message: prompt });

            const helpText = response.text;
            setMessages([{ role: 'model', text: helpText || "No help text available." }]);

        } catch (error) {
            console.error('Error fetching help topic:', error);
            setMessages([{ role: 'model', text: `Sorry, I couldn't fetch information about ${topic}. Please check your API key and network connection.` }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                    questionInDryRun.skipLogic = { type: 'per_choice', rules: (questionInDryRun.choices || []).map(() => ({ id: generateId('slr'), choiceId: '', skipTo: '', isConfirmed: true })) };
                }
                break;
            }
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
            if (!sourceQ) return { ok: true };

            for (const rule of rules) {
                const { destinationQid } = rule;
                if (!destinationQid || ['next', 'end'].includes(destinationQid.toLowerCase())) continue;

                const targetQ = survey.blocks.flatMap(b => b.questions).find(q => q.qid.toLowerCase() === destinationQid.toLowerCase());
                if (!targetQ || !targetQ.displayLogic) continue;

                const targetDisplayConditions = targetQ.displayLogic.conditions.filter(c => c.isConfirmed);
                const entryConditions = findDirectEntryConditions(sourceQ.id, survey);

                if (rule.choiceText && sourceQ.choices) {
                    const choice = sourceQ.choices.find(c => parseChoice(c.text).label.toLowerCase() === rule.choiceText.toLowerCase());
                    if (choice) {
                        entryConditions.push({
                            id: generateId('inferred'),
                            questionId: sourceQ.qid,
                            operator: 'equals',
                            value: choice.text,
                            isConfirmed: true,
                        });
                    }
                }

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

    const handleSendMessage = useCallback(async (text: string) => {
        const trimmedInput = text.trim();
        if (!trimmedInput || isLoading) return;

        if (!chatRef.current) {
            setMessages(prev => [...prev, { role: 'user', text: trimmedInput }, { role: 'model', text: "AI features are disabled because the API key is missing." }]);
            return;
        }

        const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
        setMessages(prev => [...prev, userMessage]);
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
                const functionResponseParts: Part[] = [];

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
                            onRepositionQuestion(funcCall.args as any);
                            resultPayload = { result: "OK, moved as requested by user confirmation." };
                        } else {
                            const validationResult = validateReposition(funcCall.args);
                            if (validationResult.ok) {
                                setPendingLogicChange(null);
                                onRepositionQuestion(funcCall.args as any);
                                resultPayload = { result: "OK, moved successfully." };
                            } else {
                                setPendingLogicChange(currentChange);
                                resultPayload = { result: `VALIDATION_FAILED: ${validationResult.error}` };
                            }
                        }
                    } else if (funcCall.name === 'add_question') {
                        const { type, title, choices, after_qid, before_qid } = funcCall.args as any;
                        onAddQuestion(type, title, choices, after_qid, before_qid);
                        resultPayload = { result: "OK, question added." };
                    } else if (funcCall.name === 'delete_question') {
                        const { qid } = funcCall.args as any;
                        onDeleteQuestion(qid);
                        resultPayload = { result: "OK, question deleted." };
                    } else if (funcCall.name === 'update_question') {
                        onUpdateQuestion(funcCall.args);
                        resultPayload = { result: "OK, question updated." };
                    } else {
                        resultPayload = { result: "OK" };
                    }

                    functionResponseParts.push({
                        functionResponse: {
                            name: funcCall.name,
                            response: resultPayload,
                        }
                    });
                }

                // Send function results back to the model
                const functionResponse = await chatRef.current.sendMessage({ message: functionResponseParts });
                modelResponseText = functionResponse.text || '';
            }

            setMessages(prev => [...prev, { role: 'model', text: modelResponseText }]);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsLoading(false);
        }
    }, [survey, logicIssues, selectedQuestion, isLoading, pendingLogicChange, applyLogicChange, validateLogicChange, validateReposition, onUpdateQuestion, onRepositionQuestion, onAddQuestion, onDeleteQuestion]);

    return {
        messages,
        isLoading,
        handleSendMessage,
        fetchHelpTopic,
        setMessages // Exposed for resetting or manual updates
    };
};
