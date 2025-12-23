
import React from 'react';
import { QuestionType } from '../../types';
import type { Question, ToolboxItemData } from '../../types';
import { ActivateQuestionSection, ForceResponseSection } from '../logic-editor/shared';
import {
    QuestionTypeSelector,
    TextValidationSettings
} from './settings';

interface GenericSettingsTabProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
    toolboxItems: ToolboxItemData[];
}

export const GenericSettingsTab: React.FC<GenericSettingsTabProps> = ({ question, onUpdate, toolboxItems }) => {

    const handleTypeSelect = (newType: Question['type']) => {
        onUpdate({ type: newType });
    };

    const handleTextChange = (newText: string) => {
        onUpdate({ text: newText });
    };

    return (
        <div className="p-6 space-y-6">
            <QuestionTypeSelector
                question={question}
                onTypeSelect={handleTypeSelect}
                toolboxItems={toolboxItems}
            />

            <ActivateQuestionSection question={question} handleUpdate={onUpdate} />
            {question.type !== QuestionType.Description && (
                <ForceResponseSection question={question} handleUpdate={onUpdate} />
            )}


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
}

export const TextEntrySettingsTab: React.FC<TextEntrySettingsTabProps> = ({ question, onUpdate, toolboxItems }) => {

    const handleTypeSelect = (newType: Question['type']) => {
        onUpdate({ type: newType });
    };

    const handleTextChange = (newText: string) => {
        onUpdate({ text: newText });
    };

    return (
        <div className="p-6 space-y-6">
            <QuestionTypeSelector
                question={question}
                onTypeSelect={handleTypeSelect}
                toolboxItems={toolboxItems}
            />

            <ActivateQuestionSection question={question} handleUpdate={onUpdate} />
            <ForceResponseSection question={question} handleUpdate={onUpdate} />



            <TextValidationSettings
                question={question}
                onUpdate={onUpdate}
            />
        </div>
    );
};
