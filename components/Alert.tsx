import React from 'react';
import { WarningIcon, ErrorIcon, CheckCircleIcon, InfoIcon } from './icons';

export interface AlertProps {
    variant: 'error' | 'warning' | 'success' | 'info';
    children: React.ReactNode;
    className?: string;
    sticky?: boolean;
}

export const Alert: React.FC<AlertProps> = ({ variant, children, className = '', sticky = false }) => {
    const styles = {
        error: {
            container: 'bg-[var(--notification-err-bg)] border-[var(--notification-err-bd)]',
            iconColor: 'text-[var(--notification-err-txt)]',
            Icon: WarningIcon // Triangle for Error
        },
        warning: {
            container: 'bg-[var(--notification-warn-bg)] border-[var(--notification-warn-bd)]',
            iconColor: 'text-[var(--notification-warn-txt)]',
            Icon: ErrorIcon // Circle Exclamation for Warning
        },
        success: {
            container: 'bg-[var(--notification-suc-bg)] border-[var(--notification-suc-bd)]',
            iconColor: 'text-[var(--notification-suc-txt)]',
            Icon: CheckCircleIcon
        },
        info: {
            container: 'bg-[var(--notification-info-bg)] border-[var(--notification-info-bd)]',
            iconColor: 'text-[var(--notification-info-txt)]',
            Icon: InfoIcon
        }
    };

    const config = styles[variant];
    const borderClass = sticky ? 'border-b' : 'border rounded-[2px]';

    return (
        <div className={`
            flex flex-row items-start px-4 py-2 gap-4
            w-full min-h-[40px] box-border
            text-sm text-on-surface
            ${config.container}
            ${borderClass}
            ${className}
        `}>
            <config.Icon className={`w-[16px] h-[16px] text-[16px] leading-none flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-grow">
                {children}
            </div>
        </div>
    );
};
