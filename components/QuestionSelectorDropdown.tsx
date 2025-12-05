import React from 'react';
import { DropdownField, DropdownOption } from './DropdownField';
import { Question } from '../types';
import { truncate } from '../utils';

interface QuestionSelectorDropdownProps {
    questions: Question[];
    selectedQuestionId: string;
    onSelect: (questionId: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const QuestionSelectorDropdown: React.FC<QuestionSelectorDropdownProps> = ({
    questions,
    selectedQuestionId,
    onSelect,
    className = '',
    placeholder = 'Select question',
    disabled = false,
}) => {
    const options: DropdownOption[] = [
        { value: '', label: placeholder, disabled: true },
        ...questions.map(q => ({
            value: q.qid,
            label: `${q.qid}: ${truncate(q.text, 30)}`,
        }))
    ];

    return (
        <div className={`inline-block ${className}`}>
            <DropdownField
                value={selectedQuestionId}
                onChange={onSelect}
                options={options}
                disabled={disabled}
                className="w-full"
            />
        </div>
    );
};
