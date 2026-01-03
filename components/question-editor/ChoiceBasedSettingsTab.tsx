
import React from 'react';
import type { Question, Survey, ToolboxItemData } from '../../types';
import { QuestionType } from '../../types';
import { ActivateQuestionSection, ForceResponseSection, QuestionGroupEditor, CollapsibleSection } from '../logic-editor/shared';
import { RandomizeChoicesEditor } from '../logic-editor/RandomizationEditor';
import {
    QuestionTypeSelector,

    LinkChoicesSection,
    AnswerFormatSelector
} from './settings';
import { NavigationSettings } from './behavior';
import { ChoiceLayoutEditor } from './advanced';


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

    // Find parent block to check for randomization
    const parentBlock = survey.blocks.find(b => b.questions.some(q => q.id === question.id));
    // Only show question group editor if the block has randomization enabled
    const showQuestionGroup = !!parentBlock?.questionRandomization;

    return (
        <div className="p-6 space-y-8">
            <CollapsibleSection title="Question" defaultExpanded={true}>
                <div className="space-y-6 py-6 first:pt-0">
                    <QuestionTypeSelector
                        question={question}
                        onTypeSelect={(newType) => onUpdate({ type: newType })}
                        toolboxItems={toolboxItems}
                    />

                    <ActivateQuestionSection question={question} handleUpdate={onUpdate} />



                    {showQuestionGroup && (
                        <QuestionGroupEditor question={question} survey={survey} onUpdate={onUpdate} />
                    )}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Response" defaultExpanded={true}>
                <div className="space-y-6 py-6 first:pt-0">
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

                    <RandomizeChoicesEditor
                        question={question}
                        onUpdate={onUpdate}
                    />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Navigation" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    <NavigationSettings question={question} onUpdate={onUpdate} />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Display & Layout" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    <ChoiceLayoutEditor question={question} onUpdate={onUpdate} />
                </div>
            </CollapsibleSection>
        </div>
    );
};
