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
                className={`w-full h-[32px] bg-transparent border rounded-md px-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors placeholder:text-on-surface-variant/50 ${error ? 'border-error' : 'border-input-border'
                    } ${className}`}
                {...props}
            />
        </div>
    );
});

TextField.displayName = 'TextField';
