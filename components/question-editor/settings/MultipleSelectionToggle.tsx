import React from 'react';
import type { Question } from '../../../types';
import { QuestionType } from '../../../types';

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
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="multiple-selection"
                        checked={question.type === QuestionType.Checkbox}
                        onChange={(e) => onUpdate({ type: e.target.checked ? QuestionType.Checkbox : QuestionType.Radio })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
        </div>
    );
};

export default MultipleSelectionToggle;