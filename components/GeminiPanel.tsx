import React, { useRef, useEffect } from 'react';
import { Button } from './Button';
import { TextField } from './TextField';
import { XIcon, SparkleIcon } from './icons';
import type { Survey, LogicIssue, Question } from '../types';
import { useGeminiChat } from '../hooks/useGeminiChat';
import ReactMarkdown from 'react-markdown';
import { GeminiMessage } from './GeminiMessage';

interface GeminiPanelProps {
    onClose: () => void;
    onAddQuestion: (type: any, text: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
    onUpdateQuestion: (args: any) => void;
    onRepositionQuestion: (args: { qid: string, after_qid?: string, before_qid?: string }) => void;
    onDeleteQuestion: (qid: string) => void;
    onAddBlock: (title: string, insertAfterBid?: string) => void;
    onUpdateBlock: (args: any) => void;
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
    onAddBlock,
    onUpdateBlock,
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
        onDeleteQuestion,
        onAddBlock,
        onUpdateBlock
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (helpTopic) {
            fetchHelpTopic(helpTopic);
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

    return (
        <div
            className="flex flex-col h-full bg-surface"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container">
                <div className="flex items-center gap-2 text-on-surface">
                    <SparkleIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>AI Assistant</h2>
                </div>
                <Button
                    variant="tertiary"
                    iconOnly
                    onClick={onClose}
                    className="text-on-surface-variant"
                >
                    <XIcon className="text-xl" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container/50">
                {messages.map((msg, idx) => (
                    <GeminiMessage key={idx} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div
                            className="bg-surface border border-outline p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2"
                            style={{ backgroundColor: 'var(--background--surface-bg)' }}
                        >
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-outline-variant bg-surface-container">
                <div className="relative">
                    <TextField
                        ref={inputRef}
                        placeholder="Ask AI to add questions or change logic..."
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="pr-12 !h-12 !rounded-full pl-5"
                    />
                    <div className="absolute right-2 top-0 bottom-0 flex items-center">
                        <Button
                            onClick={onSend}
                            disabled={isLoading}
                            variant="primary"
                            size="large"
                            iconOnly
                            className="rounded-full"
                        >
                            <span className="material-symbols-rounded text-[20px]">send</span>
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GeminiPanel;
