import React, { useState, useEffect, useRef } from 'react';
import type { Question, ToolboxItemData } from '../../../types';
import { QuestionTypeSelectionMenuContent } from '../../ActionMenus';
import { ChevronDownIcon } from '../../icons';

interface QuestionTypeSelectorProps {
    question: Question;
    onTypeSelect: (newType: Question['type']) => void;
    toolboxItems: ToolboxItemData[];
}

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({ question, onTypeSelect, toolboxItems }) => {
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const typeMenuRef = useRef<HTMLDivElement>(null);

    const CurrentQuestionTypeInfo = toolboxItems.find(item => item.name === question.type);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
                setIsTypeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (newType: Question['type']) => {
        onTypeSelect(newType);
        setIsTypeMenuOpen(false);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Question Type
            </label>
            <div className="relative" ref={typeMenuRef}>
                <button
                    onClick={() => setIsTypeMenuOpen(prev => !prev)}
                    className="w-full flex items-center gap-2 text-left bg-transparent border border-input-border rounded-md px-4 py-1.5 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isTypeMenuOpen}
                >
                    {CurrentQuestionTypeInfo ? <CurrentQuestionTypeInfo.icon className="text-base text-primary flex-shrink-0" /> : <div className="w-4 h-4 mr-3 flex-shrink-0" />}
                    <span className="flex-grow">{question.type}</span>
                    <ChevronDownIcon className="text-lg text-on-surface-variant flex-shrink-0" />
                </button>
                {isTypeMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                        <QuestionTypeSelectionMenuContent onSelect={handleSelect} toolboxItems={toolboxItems} />
                    </div>
                )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Changing type may reset some settings</p>
        </div>
    );
};

export default QuestionTypeSelector;