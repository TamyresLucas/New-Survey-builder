import React from 'react';
import type { Question, Survey, ToolboxItemData } from '../../types';
import { QuestionType } from '../../types';
import { ActivateQuestionSection, ForceResponseSection } from '../logic-editor/shared';
import { 
    QuestionTypeSelector, 
    QuestionTextEditor, 
    MultipleSelectionToggle,
    LinkChoicesSection,
    AnswerFormatSelector 
} from './settings';
import { ChoicesEditor } from './ChoicesEditor';

interface ChoiceBasedSettingsTabProps {
    question: Question;
    survey: Survey;
    onUpdate: (updates: Partial<Question>) => void;
    onAddChoice: (questionId: string) => void;
    onDeleteChoice: (questionId: string, choiceId: string) => void;
    toolboxItems: ToolboxItemData[];
}

export const ChoiceBasedSettingsTab: React.FC<ChoiceBasedSettingsTabProps> = ({
    question,
    survey,
    onUpdate,
    onAddChoice,
    onDeleteChoice,
    toolboxItems
}) => {
    const allSurveyQuestions = survey.blocks.flatMap(b => b.questions);
    const isLinked = !!question.linkedChoicesSource;
    const sourceQuestion = isLinked ? allSurveyQuestions.find(q => q.id === question.linkedChoicesSource) : null;

    return (
        <div className="p-6 space-y-6">
            <QuestionTypeSelector 
                question={question} 
                onTypeSelect={(newType) => onUpdate({ type: newType })} 
                toolboxItems={toolboxItems} 
            />

            <ActivateQuestionSection question={question} handleUpdate={onUpdate} />
            <ForceResponseSection question={question} handleUpdate={onUpdate} />

            {(question.type === QuestionType.Radio || question.type === QuestionType.Checkbox) && (
                <MultipleSelectionToggle 
                    question={question} 
                    onUpdate={onUpdate} 
                />
            )}

            <QuestionTextEditor 
                text={question.text} 
                onTextChange={(newText) => onUpdate({ text: newText })} 
            />

            {question.type === QuestionType.ChoiceGrid && (
                <AnswerFormatSelector 
                    question={question} 
                    onUpdate={onUpdate} 
                />
            )}

            <LinkChoicesSection
                question={question}
                survey={survey}
                onUpdate={onUpdate}
            />

            {!isLinked && (
                <ChoicesEditor
                    question={question}
                    onUpdate={onUpdate}
                    onAddChoice={onAddChoice}
                    onDeleteChoice={onDeleteChoice}
                />
            )}

            {isLinked && sourceQuestion && (
                <div className="p-4 bg-surface-container-high rounded-md">
                    <p className="text-sm text-on-surface-variant">
                        Choices are linked to <span className="font-medium text-on-surface">{sourceQuestion.qid}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChoiceBasedSettingsTab;
