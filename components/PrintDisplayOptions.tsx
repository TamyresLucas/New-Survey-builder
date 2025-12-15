import React, { memo } from 'react';
import { CheckboxFilledIcon, CheckboxOutlineIcon } from './icons';
import { Button } from './Button';

interface PrintDisplayOptionsProps {
    options: Set<string>;
    onToggle: (option: string) => void;
}

const AVAILABLE_OPTIONS = [
    'Questionnaire Settings',
    'Block Settings',
    'Question Text',
    'Choices',
    'Columns and Rows',
    'Skip Logic',
    'Advanced Logic',
    'Variables',
    'References',
    'Options',
    'Advanced Settings',
    'Pagination'
];

export const PrintDisplayOptions: React.FC<PrintDisplayOptionsProps> = memo(({ options, onToggle }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <aside className="w-full h-fit flex-shrink-0 flex flex-col">
            <div className="flex flex-col gap-2">
                {AVAILABLE_OPTIONS.map((option) => (
                    <div
                        key={option}
                        className="flex items-center cursor-pointer"
                        onClick={() => onToggle(option)}
                    >
                        <div className="mr-2 text-primary flex-shrink-0">
                            {options.has(option) ? (
                                <CheckboxFilledIcon className="text-xl" />
                            ) : (
                                <CheckboxOutlineIcon className="text-xl text-on-surface-variant" />
                            )}
                        </div>
                        <span className="text-sm text-on-surface">{option}</span>
                    </div>
                ))}
            </div>
        </aside>
    );
});


