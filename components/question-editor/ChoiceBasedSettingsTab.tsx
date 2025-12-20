
import React from 'react';
import type { Question, Survey, ToolboxItemData } from '../../types';
import { QuestionType } from '../../types';
import { ActivateQuestionSection, ForceResponseSection } from '../logic-editor/shared';
import {
    QuestionTypeSelector,

    LinkChoicesSection,
    AnswerFormatSelector
} from './settings';


interface ChoiceBasedSettingsTabProps {
    question: Question;
    survey: Survey;
    onUpdate: (updates: Partial<Question>) => void;
    onAddChoice: (questionId: string) => void;
    onDeleteChoice: (questionId: string, choiceId: string) => void;
    toolboxItems: ToolboxItemData[];
    previousQuestions: Question[];
}

export const ChoiceBasedSettingsTab: React.FC<ChoiceBasedSettingsTabProps> = ({
    question,
    survey,
    onUpdate,
    onAddChoice,
    onDeleteChoice,
    toolboxItems,
    previousQuestions
}) => {
    const isLinked = !!question.linkedChoicesSource;
    const sourceQuestion = isLinked ? survey.blocks.flatMap(b => b.questions).find(q => q.id === question.linkedChoicesSource) : null;
    const sourceQid = sourceQuestion ? sourceQuestion.qid : '...';

    return (
        <div className="p-6 space-y-6">
            <QuestionTypeSelector
                question={question}
                onTypeSelect={(newType) => onUpdate({ type: newType })}
                toolboxItems={toolboxItems}
            />

            <ActivateQuestionSection question={question} handleUpdate={onUpdate} />
            <ForceResponseSection question={question} handleUpdate={onUpdate} />



            {(question.type !== QuestionType.ChoiceGrid) && (
                <AnswerFormatSelector
                    question={question}
                    onUpdate={onUpdate}
                />
            )}



            <LinkChoicesSection
                question={question}
                onUpdate={onUpdate}
                previousQuestions={previousQuestions}
            />





            {isLinked && (
                <div className="-mt-4 p-3 bg-primary-container/30 text-on-primary-container text-xs rounded-md border border-primary-container/50">
                    Choices are linked from question {sourceQid}. To edit, change the source question or unlink choices.
                </div>
            )}
        </div>
    );
};
