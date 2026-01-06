import React from 'react';
import classNames from 'classnames';

export type BadgeVariant = 'purple' | 'green' | 'grey' | 'red' | 'periwinkle' | 'yellow' | 'cyan';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    active?: boolean;
    className?: string;
    icon?: React.ReactNode;
    hideDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'periwinkle',
    active = false,
    className,
    icon,
    hideDot = false,
}) => {
    const baseClasses = 'box-border flex flex-row justify-center items-center px-2 py-1 gap-2 absolute sm:static rounded-[16px] border h-[27px] min-w-[56px] transition-colors duration-200';

    const textClasses = 'font-open-sans not-italic font-normal text-sm leading-[19px] flex items-center text-center';

    const variantClasses = {
        purple: {
            bg: 'var(--tags-tag-bg--4)',
            border: 'var(--tags-tag-bd-icon--4)',
            text: 'var(--tags-tag-bd-icon--4)',
            dot: 'var(--tags-tag-bd-icon--4)',
        },
        green: {
            bg: 'var(--tags-tag-bg--9)',
            border: 'var(--tags-tag-bd-icon--9)',
            text: 'var(--tags-tag-bd-icon--9)',
            dot: 'var(--tags-tag-bd-icon--9)',
        },
        grey: {
            bg: 'var(--tags-tag-bg--1)',
            border: 'var(--tags-tag-bd-icon--1)',
            text: 'var(--tags-tag-bd-icon--1)',
            dot: 'var(--tags-tag-bd-icon--1)',
        },
        red: {
            bg: 'var(--tags-tag-bg--2)',
            border: 'var(--tags-tag-bd-icon--2)',
            text: 'var(--tags-tag-bd-icon--2)',
            dot: 'var(--tags-tag-bd-icon--2)',
        },
        periwinkle: {
            bg: 'var(--tags-tag-bg--10)',
            border: 'var(--tags-tag-bd-icon--10)',
            text: 'var(--tags-tag-bd-icon--10)',
            dot: 'var(--tags-tag-bd-icon--10)',
        },
        yellow: {
            bg: 'var(--tags-tag-bg--11)',
            border: 'var(--tags-tag-bd-icon--11)',
            text: 'var(--tags-tag-bd-icon--11)',
            dot: 'var(--tags-tag-bd-icon--11)',
        },
        cyan: {
            bg: 'var(--tags-tag-bg--5)',
            border: 'var(--tags-tag-bd-icon--5)',
            text: 'var(--tags-tag-bd-icon--5)',
            dot: 'var(--tags-tag-bd-icon--5)',
        },
    };

    const selectedVariant = variantClasses[variant];

    const style = active ? {
        backgroundColor: selectedVariant.bg,
        borderColor: selectedVariant.border,
    } : {
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--border-bd-def)',
    };

    const dotColor = selectedVariant.dot;

    return (
        <div
            className={classNames(baseClasses, className)}
            style={style}
        >
            {!icon && !hideDot && (
                <div
                    className="w-[9px] h-[9px] rounded-full flex-none order-0 flex-grow-0"
                    style={{ backgroundColor: dotColor }}
                />
            )}
            {icon && (
                <div className="flex-none order-0 flex-grow-0 w-4 h-4 flex items-center justify-center" style={{ color: dotColor }}>
                    {icon}
                </div>
            )}
            <span
                className={classNames(textClasses, 'flex-none order-2 flex-grow-1')}
                style={{ color: active ? 'var(--text-txt-pri)' : 'var(--text-txt-sec)' }}
            >
                {children}
            </span>
        </div>
    );
};
