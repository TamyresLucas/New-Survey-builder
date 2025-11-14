import React from 'react';
import type { Question, Survey } from '../../../types';
import { CHOICE_BASED_QUESTION_TYPES } from '../../../utils';
import { RandomizeChoicesEditor } from '../../logic-editor/RandomizationEditor';
import { ChoiceEliminationEditor } from '../../logic-editor/ChoiceEliminationEditor';
import { ChoiceDisplayLogicEditor } from '../../logic-editor/ChoiceDisplayLogicEditor';

interface ChoiceBehaviorSectionProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    isFirstInteractiveQuestion: boolean;
}

const ChoiceBehaviorSection: React.FC<ChoiceBehaviorSectionProps> = ({
    question,
    survey,
    previousQuestions,
    onUpdate,
    onAddLogic,
    isFirstInteractiveQuestion
}) => {
    const isChoiceBased = CHOICE_BASED_QUESTION_TYPES.has(question.type);

    if (!isChoiceBased) {
        return null;
    }

    return (
        <div className="divide-y divide-outline-variant">
            <div className="py-6 first:pt-0">
                <RandomizeChoicesEditor 
                    question={question}
                    onUpdate={onUpdate}
                />
            </div>
            {!isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                <div className="py-6 first:pt-0">
                    <ChoiceEliminationEditor
                        question={question}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                    />
                </div>
            )}
            {!isFirstInteractiveQuestion && previousQuestions.length > 0 && (
                <div className="py-6 first:pt-0">
                    <ChoiceDisplayLogicEditor
                        question={question}
                        survey={survey}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                    />
                </div>
            )}
        </div>
    );
};

export default ChoiceBehaviorSection;
