import React, { forwardRef } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ className = '', error, ...props }, ref) => {
    return (
        <div className="relative">
            <input
                ref={ref}
                type="text"
                className={`w-full h-[32px] bg-[var(--input-bg)] border rounded-md px-2 text-sm text-[var(--input-field-input-txt)] font-normal hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors placeholder:text-on-surface-variant/50 ${error ? 'border-error' : 'border-[var(--input-border)]'
                    } ${className}`}
                {...props}
            />
        </div>
    );
});

TextField.displayName = 'TextField';
