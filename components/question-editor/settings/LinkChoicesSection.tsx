import React from 'react';
import type { Question } from '../../../types';
import { CHOICE_BASED_QUESTION_TYPES, truncate } from '../../../utils';
import { ChevronDownIcon } from '../../icons';
import { QuestionSelectorDropdown } from '../../QuestionSelectorDropdown';

interface LinkChoicesSectionProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
    previousQuestions: Question[];
}

const LinkChoicesSection: React.FC<LinkChoicesSectionProps> = ({ question, onUpdate, previousQuestions }) => {
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label htmlFor="link-choices" className="text-sm font-medium text-on-surface block">
                        Link choices to question
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Use the same choices as another question.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="link-choices"
                        checked={question.linkedChoicesSource !== undefined}
                        onChange={(e) => {
                            const isEnabling = e.target.checked;
                            onUpdate({ linkedChoicesSource: isEnabling ? '' : undefined });
                        }}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            {question.linkedChoicesSource !== undefined && (
                <div className="mt-4 pl-4 border-l-2 border-outline-variant">
                    <label htmlFor="linked-choices-source" className="block text-sm font-medium text-on-surface-variant mb-1">Source question</label>
                    <div className="relative">
                        <QuestionSelectorDropdown
                            questions={previousQuestions.filter(q => q.id !== question.id && CHOICE_BASED_QUESTION_TYPES.has(q.type))}
                            selectedQuestionId={question.linkedChoicesSource || ''}
                            onSelect={(qid) => onUpdate({ linkedChoicesSource: qid || undefined })}
                            className="w-full"
                            placeholder="Select a source question..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkChoicesSection;