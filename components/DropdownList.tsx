import React from 'react';

export interface DropdownListProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const DropdownList: React.FC<DropdownListProps> = ({ children, className = '', style }) => {
    return (
        <div
            className={`bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1 ${className}`}
            style={{ fontFamily: "'Open Sans', sans-serif", ...style }}
        >
            {children}
        </div>
    );
};

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'danger';
    active?: boolean;
    iconClassName?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
    children,
    onClick,
    icon: Icon,
    disabled = false,
    className = '',
    variant = 'default',
    active = false,
    iconClassName = '',
    ...props
}) => {
    const baseClasses = "w-full text-left px-4 py-2 text-sm flex items-center transition-colors truncate";

    let stateClasses = "text-on-surface hover:bg-surface-container-lowest";
    if (variant === 'danger') {
        stateClasses = "text-error hover:bg-error-container/10";
    }

    if (disabled) {
        stateClasses = "text-on-surface-variant opacity-70 cursor-not-allowed";
    }

    if (active) {
        stateClasses += " bg-surface-container-high";
    }

    const defaultIconColor = disabled
        ? 'text-on-surface-variant'
        : variant === 'danger' ? 'text-error' : 'text-primary';

    const finalIconClass = iconClassName || defaultIconColor;

    return (
        <button
            onClick={(e) => {
                if (disabled) return;
                if (onClick) onClick(e);
            }}
            disabled={disabled}
            className={`${baseClasses} ${stateClasses} ${className}`}
            {...props}
        >
            {Icon && <Icon className={`text-base mr-3 flex-shrink-0 ${finalIconClass}`} />}
            <span className="truncate w-full">{children}</span>
        </button>
    );
};

export const DropdownDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`border-t border-dotted border-outline-variant mx-2 ${className}`} />
);

// Wrapper for simple lists (ul/li structure optional, but divs are flexible for ActionMenus)
// If we want semantic ul/li, we can export logic for that, but ActionMenus often use flat divs.
// DropdownField uses <ul>. We can make DropdownList generic enough or utilize ul if needed.
// For now, defaulting to 'div' container as ActionMenus use it.
// Wait, DropdownField uses <ul>.
// Let's allow specific 'as' prop? Or just standardizing.
// ActionMenus.tsx uses <div> wrapper, and some inner <ul>.
// We'll stick to div for the container to be safe for diverse children.
