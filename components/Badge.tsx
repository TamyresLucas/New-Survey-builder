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

    const textClasses = 'font-open-sans not-italic font-normal text-sm leading-[19px] flex items-end text-center text-on-surface';

    const variantClasses = {
        purple: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#E8DAFF] border-[#8E25D0]', // chart-grape-20, chart-grape
            dot: '#8E25D0',
        },
        green: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#CEF1E1] border-[#00A078]', // chart-avocado-10, foundation-green (chart-avocado)
            dot: '#00A078',
        },
        grey: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#E2E5E7] border-[#707D89]', // chart-grey-20, chart-grey
            dot: '#707D89',
        },
        red: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#FEEFF1] border-[#EF576B]', // foundation-coral-light, foundation-coral (chart-apple)
            dot: '#EF576B',
        },
        periwinkle: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#D4E2FF] border-[#5568F2]', // tags-tag-bg--10, foundation-periwinkle-dark
            dot: '#5568F2',
        },
        yellow: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#FFFCF2] border-[#EC6B09]', // tags-tag-bg--11, foundation-tangerine
            dot: '#EC6B09',
        },
        cyan: {
            default: 'bg-white border-[#E0E4FF]',
            active: 'bg-[#DFF3FB] border-[#0192D0]',
            dot: '#0192D0',
        },
    };

    const selectedVariant = variantClasses[variant];
    const stateClasses = active ? selectedVariant.active : selectedVariant.default;
    const dotColor = selectedVariant.dot;

    return (
        <div className={classNames(baseClasses, stateClasses, className)}>
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
            <span className={classNames(textClasses, 'flex-none order-2 flex-grow-1')}>
                {children}
            </span>
        </div>
    );
};
