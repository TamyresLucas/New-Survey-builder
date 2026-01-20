import React, { forwardRef } from 'react';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'tertiary-primary'
    | 'danger'
    | 'danger-solid'
    // New ghost variants from design system
    | 'ghost'
    | 'ghost-primary'
    | 'ghost-destructive'
    | 'ghost-success'
    | 'outline'
    | 'link';

export type ButtonSize = 'large' | 'small' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    isLoading?: boolean;
    active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className = '',
    variant = 'primary',
    size = 'large',
    iconOnly = false,
    isLoading = false,
    active = false,
    disabled,
    ...props
}, ref) => {

    // Base styles (Shape, Typography, Focus)
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed";

    // Size styles
    const sizeStyles = {
        large: iconOnly ? "w-8 h-8 text-sm" : "h-[32px] px-2 py-1.5 text-sm",
        small: iconOnly ? "w-6 h-6 text-xs" : "h-[24px] px-3 py-0.5 text-xs",
        icon: "h-10 w-10",
    };

    // Variant styles - Updated with ghost styles from design system Storybook
    const variantStyles = {
        // Solid variants
        primary: "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/90",
        secondary: "border border-[color:var(--button-btn-bd-def)] text-on-surface hover:bg-surface-container-lowest active:bg-surface-container-lowest",
        'danger-solid': "bg-error text-on-error hover:bg-error/90 active:bg-error/90",
        
        // Ghost variants (from Storybook design system)
        ghost: "text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:bg-surface-container-high",
        'ghost-primary': "text-primary hover:bg-primary hover:text-on-primary active:bg-primary active:text-on-primary",
        'ghost-destructive': "text-error hover:bg-error/10 hover:text-error active:bg-error/10",
        'ghost-success': "text-success hover:bg-success/10 hover:text-success active:bg-success/10",
        
        // Legacy aliases (map to new ghost variants for backwards compatibility)
        tertiary: "text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:bg-surface-container-high",
        'tertiary-primary': "text-primary hover:bg-primary hover:text-on-primary active:bg-primary active:text-on-primary",
        danger: "text-error hover:bg-error/10 hover:text-error active:bg-error/10",
        
        // Other variants
        outline: "border border-primary/40 bg-transparent hover:bg-primary/10 hover:text-primary active:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline active:underline",
    };

    // Forced active styles (matches hover state)
    const activeVariantStyles = {
        primary: "!bg-primary/90",
        secondary: "!bg-surface-container-lowest",
        'danger-solid': "!bg-error/90",
        ghost: "!text-primary !bg-surface-container-high",
        'ghost-primary': "!bg-primary !text-on-primary",
        'ghost-destructive': "!bg-error/10 !text-error",
        'ghost-success': "!bg-success/10 !text-success",
        tertiary: "!text-primary !bg-surface-container-high",
        'tertiary-primary': "!bg-primary !text-on-primary",
        danger: "!bg-error/10 !text-error",
        outline: "!bg-primary/10 !text-primary",
        link: "!underline",
    };

    // Combine classes
    const classes = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${active ? activeVariantStyles[variant] : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled || isLoading}
            data-loading={isLoading}
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
