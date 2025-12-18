
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
import { ScalePointsEditor } from './ScalePointsEditor';

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

            {(question.type === QuestionType.Radio || question.type === QuestionType.Checkbox) && (
                <MultipleSelectionToggle 
                    question={question} 
                    onUpdate={onUpdate} 
                />
            )}
            
            {(question.type !== QuestionType.ChoiceGrid) && (
                 <AnswerFormatSelector 
                    question={question} 
                    onUpdate={onUpdate} 
                />
            )}

            <QuestionTextEditor 
                text={question.text} 
                onTextChange={(newText) => onUpdate({ text: newText })} 
            />

            <LinkChoicesSection
                question={question}
                onUpdate={onUpdate}
                previousQuestions={previousQuestions}
            />

            <div className={isLinked ? 'opacity-50 pointer-events-none' : ''}>
                <ChoicesEditor
                    question={question}
                    onUpdate={onUpdate}
                    onAddChoice={onAddChoice}
                    onDeleteChoice={onDeleteChoice}
                />
            </div>
            
            {question.type === QuestionType.ChoiceGrid && (
                 <div className={`mt-6 ${isLinked ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ScalePointsEditor
                        question={question}
                        onUpdate={onUpdate}
                    />
                </div>
            )}

            {isLinked && (
                <div className="-mt-4 p-3 bg-primary-container/30 text-on-primary-container text-xs rounded-md border border-primary-container/50">
                    Choices are linked from question {sourceQid}. To edit, change the source question or unlink choices.
                </div>
            )}
        </div>
    );
};
