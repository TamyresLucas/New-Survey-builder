import React from 'react';
import type { Question } from '../../../types';
import { QuestionType } from '../../../types';
import { Toggle } from '../../Toggle';

interface MultipleSelectionToggleProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

const MultipleSelectionToggle: React.FC<MultipleSelectionToggleProps> = ({ question, onUpdate }) => {
    if (question.type !== QuestionType.Radio && question.type !== QuestionType.Checkbox) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label htmlFor="multiple-selection" className="text-sm font-medium text-on-surface block">
                        Multiple selection
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Allow respondent to select more than one answer.</p>
                </div>
                <Toggle
                    id="multiple-selection"
                    checked={question.type === QuestionType.Checkbox}
                    onChange={(checked) => onUpdate({ type: checked ? QuestionType.Checkbox : QuestionType.Radio })}
                />
            </div>
        </div>
    );
};

export default MultipleSelectionToggle;