import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className = '', error, ...props }, ref) => {
    return (
        <div className="relative">
            <textarea
                ref={ref}
                className={`w-full bg-transparent border rounded-md p-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors placeholder:text-on-surface-variant/50 ${error ? 'border-error' : 'border-input-border'
                    } ${className}`}
                {...props}
            />
        </div>
    );
});

TextArea.displayName = 'TextArea';
