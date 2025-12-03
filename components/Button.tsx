import React, { forwardRef } from 'react';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'tertiary-primary'
    | 'danger'
    | 'danger-solid';

export type ButtonSize = 'large' | 'small';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className = '',
    variant = 'primary',
    size = 'large',
    iconOnly = false,
    isLoading = false,
    disabled,
    ...props
}, ref) => {

    // Base styles (Shape, Typography, Focus)
    const baseStyles = "inline-flex items-center justify-center rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    // Size styles
    const sizeStyles = {
        large: iconOnly ? "w-8 h-8 text-sm" : "h-[32px] px-4 py-1.5 text-sm",
        small: iconOnly ? "w-6 h-6 text-xs" : "h-[24px] px-3 py-0.5 text-xs",
    };

    // Variant styles
    const variantStyles = {
        primary: "bg-primary text-on-primary hover:opacity-90",
        secondary: "bg-transparent border border-outline text-primary hover:bg-surface-container-high",
        tertiary: "bg-transparent text-on-surface hover:bg-surface-container-high",
        'tertiary-primary': "bg-transparent text-primary hover:bg-primary hover:text-on-primary",
        danger: "bg-transparent text-error hover:bg-error-container",
        'danger-solid': "bg-error text-on-error hover:opacity-90",
    };

    // Combine classes
    const classes = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin mr-2">
                    {/* Simple spinner SVG */}
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>
            ) : null}
            {children}
        </button>
    );
});

Button.displayName = 'Button';
