import React from 'react';
import { cn } from '../../lib/utils';

export interface MessageProps {
    content: string;
    className?: string;
}

/**
 * UserMessage - Displays a user's chat message.
 * Styled with primary color, right-aligned with rounded corners.
 */
export const UserMessage: React.FC<MessageProps> = ({ content, className }) => {
    return (
        <div className={cn('flex justify-end', className)}>
            <div className="max-w-[80%] bg-[color-mix(in_oklab,hsl(var(--primary)),hsl(var(--background))_90%)] text-foreground border border-primary/40 px-4 py-3 rounded-md shadow-sm">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
};

export default UserMessage;
