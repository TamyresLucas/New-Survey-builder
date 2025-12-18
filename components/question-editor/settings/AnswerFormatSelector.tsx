import React from 'react';
import type { Question } from '../../../types';
import { DropdownField } from '../../DropdownField';

interface AnswerFormatSelectorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

const AnswerFormatSelector: React.FC<AnswerFormatSelectorProps> = ({ question, onUpdate }) => {
    const options = [
        { value: 'list', label: 'List (Vertical)' },
        { value: 'grid', label: 'Grid' }
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Answer Format</label>
            <DropdownField
                value={question.answerFormat || 'list'}
                options={options}
                onChange={(value) => onUpdate({ answerFormat: value as any })}
            />
        </div>
    );
};

export default AnswerFormatSelector;