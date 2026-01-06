
import React from 'react';
import { QuestionType } from '../../types';
import type { Question, ToolboxItemData } from '../../types';
import { ActivateQuestionSection, ForceResponseSection, QuestionGroupEditor, CollapsibleSection } from '../logic-editor/shared';
import { Survey } from '../../types';
import {
    QuestionTypeSelector,
    TextValidationSettings
} from './settings';
import { NavigationSettings } from './behavior';

interface GenericSettingsTabProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
    toolboxItems: ToolboxItemData[];
    survey: Survey;
}

export const GenericSettingsTab: React.FC<GenericSettingsTabProps> = ({ question, onUpdate, toolboxItems, survey }) => {
    // Find parent block to check for randomization
    const parentBlock = survey.blocks.find(b => b.questions.some(q => q.id === question.id));
    // Only show question group editor if the block has randomization enabled
    const showQuestionGroup = !!parentBlock?.questionRandomization;

    const handleTypeSelect = (newType: Question['type']) => {
        onUpdate({ type: newType });
    };

    const handleTextChange = (newText: string) => {
        onUpdate({ text: newText });
    };

    return (
        <div className="p-6 space-y-8">
            <CollapsibleSection title="Question" defaultExpanded={true}>
                <div className="space-y-6 py-6 first:pt-0">
                    <QuestionTypeSelector
                        question={question}
                        onTypeSelect={handleTypeSelect}
                        toolboxItems={toolboxItems}
                    />

                    <ActivateQuestionSection question={question} handleUpdate={onUpdate} />



                    {showQuestionGroup && (
                        <QuestionGroupEditor question={question} survey={survey} onUpdate={onUpdate} />
                    )}
                </div>
            </CollapsibleSection>

            {question.type !== QuestionType.Description && (
                <CollapsibleSection title="Response" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
                        <ForceResponseSection question={question} handleUpdate={onUpdate} />
                    </div>
                </CollapsibleSection>
            )}

            <CollapsibleSection title="Navigation" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    <NavigationSettings question={question} onUpdate={onUpdate} />
                </div>
            </CollapsibleSection>
        </div>
    );
};

// ====================================================================================
// TEXT ENTRY SETTINGS TAB COMPONENT
// ====================================================================================

interface TextEntrySettingsTabProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
    toolboxItems: ToolboxItemData[];
    survey: Survey;
}

export const TextEntrySettingsTab: React.FC<TextEntrySettingsTabProps> = ({ question, onUpdate, toolboxItems, survey }) => {
    // Find parent block to check for randomization
    const parentBlock = survey.blocks.find(b => b.questions.some(q => q.id === question.id));
    // Only show question group editor if the block has randomization enabled
    const showQuestionGroup = !!parentBlock?.questionRandomization;

    const handleTypeSelect = (newType: Question['type']) => {
        onUpdate({ type: newType });
    };

    const handleTextChange = (newText: string) => {
        onUpdate({ text: newText });
    };

    return (
        <div className="p-6 space-y-8">
            <CollapsibleSection title="Question" defaultExpanded={true}>
                <div className="space-y-6 py-6 first:pt-0">
                    <QuestionTypeSelector
                        question={question}
                        onTypeSelect={handleTypeSelect}
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

                    <TextValidationSettings
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
        </div>
    );
};
