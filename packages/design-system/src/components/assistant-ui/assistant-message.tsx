import React from 'react';
import { Sparkles } from '../ui/icons';
import { cn } from '../../lib/utils';

export interface AssistantMessageProps {
    content: string;
    isLoading?: boolean;
    className?: string;
}

/**
 * AssistantMessage - Displays an AI assistant's chat message.
 * Styled with card background, left-aligned with subtle border.
 */
export const AssistantMessage: React.FC<AssistantMessageProps> = ({
    content,
    isLoading,
    className
}) => {
    return (
        <div className={cn('flex justify-start gap-2', className)}>
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
            </div>

            {/* Message bubble */}
            <div className="max-w-[80%] bg-card border border-primary/20 px-4 py-3 rounded-md shadow-sm">
                {isLoading ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                ) : (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
                )}
            </div>
        </div>
    );
};

export default AssistantMessage;
