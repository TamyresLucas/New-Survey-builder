import { GoogleGenAI, Chat, Part } from "@google/genai";
import { useState, useRef, useEffect, useCallback } from 'react';
import { systemInstruction } from '../services/geminiSystemInstruction';

import type { ChatMessage, Survey, LogicIssue, Question } from '../types';
import {
    addQuestionFunctionDeclaration,
    updateQuestionFunctionDeclaration,
    getQuestionDetailsFunctionDeclaration,
    setDisplayLogicFunctionDeclaration,
    removeDisplayLogicFunctionDeclaration,
    setSkipLogicFunctionDeclaration,
    removeSkipLogicFunctionDeclaration,
    repositionQuestionFunctionDeclaration,
    deleteQuestionFunctionDeclaration,
    setBranchingLogicFunctionDeclaration,
    addBlockFunctionDeclaration,
    updateBlockFunctionDeclaration
} from '../services/geminiTools';
import { generateSurveyContext } from '../services/geminiContext';
import { validateLogicChange, validateReposition } from '../services/geminiValidation';
import { calculateLogicUpdate, isSameLogicChange } from '../services/geminiLogicHandlers';

type PendingLogicChange = {
    name: string;
    args: any;
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
    onAddBlock: (title: string, insertAfterBid?: string) => void;
    onUpdateBlock: (args: any) => void;
}

export const useGeminiChat = ({
    survey,
    logicIssues,
    selectedQuestion,
    onUpdateQuestion,
    onRepositionQuestion,
    onAddQuestion,
    onDeleteQuestion,
    onAddBlock,
    onUpdateBlock
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
                            setBranchingLogicFunctionDeclaration,
                            addBlockFunctionDeclaration,
                            updateBlockFunctionDeclaration
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
    - List the supported operators and their required structure.For example, 'Q1 equals Yes', or for skip logic 'Q5'.
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
        const result = calculateLogicUpdate(name, args, survey);
        if (result) {
            if (result.qid) {
                onUpdateQuestion({ qid: result.qid, ...result.payload });
            } else if (result.bid) {
                onUpdateBlock({ bid: result.bid, ...result.payload });
            }
        }
    }, [onUpdateQuestion, onUpdateBlock, survey]);

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
                    const logicFunctionNames = ['set_display_logic', 'remove_display_logic', 'set_skip_logic', 'remove_skip_logic', 'set_branching_logic'];

                    let resultPayload;

                    if (logicFunctionNames.includes(funcCall.name)) {
                        if (isSameLogicChange(pendingLogicChange, currentChange)) {
                            setPendingLogicChange(null);
                            applyLogicChange(currentChange.name, currentChange.args);
                            resultPayload = { result: "OK, change applied as requested by user confirmation." };
                        } else {
                            const validationResult = validateLogicChange(funcCall.name, funcCall.args, survey);
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
                            const validationResult = validateReposition(funcCall.args, survey, logicIssues);
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
                    } else if (funcCall.name === 'add_block') {
                        const { title, insertAfterBid } = funcCall.args as any;
                        onAddBlock(title, insertAfterBid);
                        resultPayload = { result: "OK, block added." };
                    } else if (funcCall.name === 'update_block') {
                        onUpdateBlock(funcCall.args);
                        resultPayload = { result: "OK, block updated." };
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

        } catch (error: any) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error processing your request. Details: ${error.message || String(error)}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [survey, logicIssues, selectedQuestion, isLoading, pendingLogicChange, applyLogicChange, onUpdateQuestion, onRepositionQuestion, onAddQuestion, onDeleteQuestion, onAddBlock, onUpdateBlock]);

    return {
        messages,
        isLoading,
        handleSendMessage,
        fetchHelpTopic,
        setMessages // Exposed for resetting or manual updates
    };
};
