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
    // We now construct the header content here, but LogicSet also handles actionValue internally if we pass it.
    // However, since we want full control, we can pass it as extraActionContent or rely on LogicSet's built-in support.
    // Since I restored LogicSet's internal actionValue support in the previous file, we can just pass props through.
    // But wait, LogicSet's actionValue renders ABOVE the box.
    // If we want it inside, we use headerContent.
    
    // Let's assume LogicSet handles it via actionValue prop now (based on Step 35/37).
    
    return (
        <LogicSet
            {...logicSetProps}
            actionValue={actionValue}
            onActionChange={onActionChange}
            headerContent={label} // Label (e.g. QID) goes here
            extraActionContent={targetContent} // Target choice dropdown goes here
        />
    );
};