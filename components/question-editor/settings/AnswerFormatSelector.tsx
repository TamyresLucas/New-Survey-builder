import React from 'react';
import type { Question } from '../../../types';
import { ChevronDownIcon } from '../../icons';

interface AnswerFormatSelectorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

const AnswerFormatSelector: React.FC<AnswerFormatSelectorProps> = ({ question, onUpdate }) => {
    return (
        <div>
            <label htmlFor="answer-format" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Format</label>
            <div className="relative">
                <select id="answer-format" value={question.answerFormat || 'list'} onChange={e => onUpdate({ answerFormat: e.target.value as any })} className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                    <option value="list">List (Vertical)</option>
                    <option value="grid">Grid</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
            </div>
        </div>
    );
};

export default AnswerFormatSelector;