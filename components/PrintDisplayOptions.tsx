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
        <aside className="w-full h-fit bg-surface-container border border-outline rounded-lg flex-shrink-0 flex flex-col p-4 mb-4">
            <h2 className="text-lg font-medium text-on-surface mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Display options</h2>
            <div className="flex flex-col gap-2 mb-4">
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
            <Button
                variant="primary"
                size="large"
                onClick={handlePrint}
                className="w-full"
            >
                Print
            </Button>
        </aside>
    );
});
