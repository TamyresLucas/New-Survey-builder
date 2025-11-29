import React from 'react';
import { LogicSet, LogicSetProps } from './LogicSet';
import { ChevronDownIcon } from '../../icons';

interface DisplayLogicSetProps extends Omit<LogicSetProps, 'headerContent' | 'actionValue' | 'onActionChange' | 'extraActionContent'> {
    actionValue: 'show' | 'hide';
    onActionChange: (value: 'show' | 'hide') => void;
    label?: React.ReactNode;
    targetContent?: React.ReactNode;
}

export const DisplayLogicSet: React.FC<DisplayLogicSetProps> = ({
    actionValue,
    onActionChange,
    label,
    targetContent,
    ...logicSetProps
}) => {
    const headerContent = (
        <div className="flex items-center gap-2 w-full">
            <div className="relative w-24 flex-shrink-0">
                <select
                    value={actionValue}
                    onChange={(e) => onActionChange(e.target.value as 'show' | 'hide')}
                    className="w-full bg-transparent border border-input-border rounded-md pl-2 pr-6 py-1.5 text-sm text-on-surface font-medium focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                    aria-label="Logic Action"
                >
                    <option value="show">Show</option>
                    <option value="hide">Hide</option>
                </select>
                <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
            </div>

            {label && (
                <div className="flex-shrink-0 flex items-center gap-2">
                    {typeof label === 'string' ? (
                        <span className="text-sm font-bold text-on-surface">{label}</span>
                    ) : (
                        label
                    )}
                    <span className="text-sm font-bold text-primary">IF</span>
                </div>
            )}

            {targetContent && (
                <div className="relative flex-1">
                    {targetContent}
                </div>
            )}
        </div>
    );

    return (
        <LogicSet
            {...logicSetProps}
            headerContent={headerContent}
        />
    );
};