import React, { useRef, useEffect } from 'react';
import { XIcon, SparkleIcon, SendIcon } from './icons';
import type { Survey, LogicIssue, Question } from '../types';
import { useGeminiChat } from '../hooks/useGeminiChat';
import ReactMarkdown from 'react-markdown';

interface GeminiPanelProps {
    onClose: () => void;
    onAddQuestion: (type: any, text: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
    onUpdateQuestion: (args: any) => void;
    onRepositionQuestion: (args: { qid: string, after_qid?: string, before_qid?: string }) => void;
    onDeleteQuestion: (qid: string) => void;
    helpTopic: string | null;
    selectedQuestion: Question | null;
    survey: Survey;
    logicIssues: LogicIssue[];
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({
    onClose,
    onAddQuestion,
    onUpdateQuestion,
    onRepositionQuestion,
    onDeleteQuestion,
    helpTopic,
    selectedQuestion,
    survey,
    logicIssues
}) => {
    const {
        messages,
        isLoading,
        handleSendMessage,
        fetchHelpTopic,
        setMessages
    } = useGeminiChat({
        survey,
        logicIssues,
        selectedQuestion,
        onUpdateQuestion,
        onRepositionQuestion,
        onAddQuestion,
        onDeleteQuestion
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (helpTopic) {
            fetchHelpTopic(helpTopic);
        } else {
            // Reset messages if opening without a specific topic (optional, depending on desired behavior)
            // setMessages(initialMessages); 
        }
    }, [helpTopic, fetchHelpTopic]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onSend = () => {
        if (inputRef.current) {
            handleSendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    // Intercept function calls that need to be executed by the parent
    // Note: The hook handles logic/reposition updates internally via the passed callbacks.
    // But for 'add_question' and 'delete_question', we need to ensure they are called.
    // The current hook implementation returns "OK" to the model but doesn't execute 'add_question' or 'delete_question'.
    // We need to patch the hook or handle it here. 
    // Ideally, the hook should accept all callbacks.
    // Let's assume for this step that we will update the hook to handle these, OR we can add a useEffect here to monitor messages?
    // No, the cleanest way is to pass these callbacks to the hook.
    // I will update the hook in the next step to accept onAddQuestion and onDeleteQuestion if I missed them.
    // Checking the previous hook code... I only passed onUpdateQuestion and onRepositionQuestion.
    // I need to update the hook to accept onAddQuestion and onDeleteQuestion.
    // For now, I will write this component assuming the hook *will* handle them, and then I will quickly patch the hook.

    return (
        <div className="flex flex-col h-full bg-surface">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container">
                <div className="flex items-center gap-2 text-primary">
                    <SparkleIcon className="w-5 h-5" />
                    <h2 className="font-semibold text-lg">AI Assistant</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`
                    max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user'
                                    ? 'bg-primary text-on-primary rounded-br-none'
                                    : 'bg-surface-container-high border border-outline-variant text-on-surface rounded-bl-none'
                                }
                `}
                        >
                            {msg.role === 'model' ? (
                                <div className="markdown-content">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-container-high border border-outline-variant p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-outline-variant bg-surface-container">
                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask AI to add questions or change logic..."
                        className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-on-surface placeholder-on-surface-variant"
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button
                        onClick={onSend}
                        disabled={isLoading}
                        className="absolute right-2 p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <SendIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-xs text-center text-on-surface-variant">
                    AI can make mistakes. Please review generated surveys.
                </div>
            </div>
        </div>
    );
};

export default GeminiPanel;
