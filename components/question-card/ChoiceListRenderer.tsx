import React from 'react';
import type { Question } from '../../types';
import { QuestionType } from '../../types';
import { parseChoice } from '../../utils';
import { Button } from '../Button';
import { EditableText } from '../EditableText';
import {
    DragIndicatorIcon, RadioIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon, XIcon, PlusIcon, ContentPasteIcon, MoreVertIcon, VisibilityOffIcon, OpenEndAnswerIcon
} from '../icons';
import { ChoiceDropIndicator } from './common';
import { DropdownList } from '../DropdownList';

interface ChoiceListRendererProps {
    question: Question;
    printMode?: boolean;
    draggedChoiceId: string | null;
    dropTargetChoiceId: string | null;
    onSelect: (question: Question) => void;
    onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
    onAddChoice: (id: string) => void;
    handleChoiceDragStart: (e: React.DragEvent, id: string) => void;
    handleChoiceDragOver: (e: React.DragEvent, id: string) => void;
    handleChoiceDrop: (e: React.DragEvent) => void;
    handleChoiceDragEnd: (e: React.DragEvent) => void;
    setDropTargetChoiceId: (id: string | null) => void;
    onPaste: () => void;
}

export const ChoiceListRenderer: React.FC<ChoiceListRendererProps> = ({
    question, printMode, draggedChoiceId, dropTargetChoiceId,
    onSelect, onUpdateQuestion, onAddChoice,
    handleChoiceDragStart, handleChoiceDragOver, handleChoiceDrop, handleChoiceDragEnd, setDropTargetChoiceId, onPaste
}) => {
    const [expandedChoiceId, setExpandedChoiceId] = React.useState<string | null>(null);

    if (!question.choices || question.choices.length === 0) return null;

    const handlePropertyChange = (choiceId: string, property: keyof typeof question.choices[0], value: any) => {
        const newChoices = (question.choices || []).map(c =>
            c.id === choiceId ? { ...c, [property]: value } : c
        );
        onUpdateQuestion(question.id, { choices: newChoices });
    };

    return (
        <div
            className="mt-4 space-y-2"
            onDrop={handleChoiceDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setDropTargetChoiceId(null);
            }}
        >
            {question.choices.map((choice, index) => {
                const { variable, label } = parseChoice(choice.text);
                const isExpanded = expandedChoiceId === choice.id;
                return (
                    <React.Fragment key={choice.id}>
                        {dropTargetChoiceId === choice.id && <ChoiceDropIndicator />}
                        <div
                            className={`flex flex-col group/choice transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}
                            draggable={true}
                            onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                            onDragOver={(e) => handleChoiceDragOver(e, choice.id)}
                            onDragEnd={handleChoiceDragEnd}
                        >
                            <div className="flex items-center min-h-[32px] relative py-1">
                                {!printMode && <DragIndicatorIcon className="absolute -left-8 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant cursor-grab opacity-0 group-hover/choice:opacity-100" />}
                                {question.type === QuestionType.Radio ? (
                                    index === 0 ? (
                                        <RadioIcon className="text-xl text-primary mr-2 flex-shrink-0" />
                                    ) : (
                                        <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant mr-2 flex-shrink-0" />
                                    )
                                ) : (
                                    <CheckboxOutlineIcon className="text-xl text-on-surface-variant mr-2 flex-shrink-0" />
                                )}

                                <div className="text-on-surface flex-grow flex items-center gap-2">
                                    {variable && <span className="font-semibold text-on-surface mr-2 flex-shrink-0">{variable}</span>}
                                    {choice.visible === false && (
                                        <VisibilityOffIcon className="text-on-surface-variant text-base mr-2 flex-shrink-0" />
                                    )}
                                    {choice.allowTextEntry && (
                                        <OpenEndAnswerIcon className="text-on-surface-variant text-base mr-2 flex-shrink-0" />
                                    )}
                                    <EditableText
                                        html={label}
                                        onChange={(newLabel) => {
                                            const newText = variable ? `${variable} ${newLabel} ` : newLabel;
                                            const newChoices = (question.choices || []).map(c =>
                                                c.id === choice.id ? { ...c, text: newText } : c
                                            );
                                            onUpdateQuestion(question.id, { choices: newChoices });
                                        }}
                                        onFocus={() => onSelect(question)}
                                        className="text-on-surface flex-grow"
                                        readOnly={printMode}
                                    />
                                </div>

                                {!printMode && (
                                    <div className="flex items-center opacity-0 group-hover/choice:opacity-100 transition-opacity">
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedChoiceId(isExpanded ? null : choice.id);
                                                }}
                                                className={`w-6 h-6 flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest transition-colors mr-1 ${isExpanded ? 'bg-surface-container-highest' : ''}`}
                                                aria-label="Choice options"
                                            >
                                                <MoreVertIcon className="text-base" />
                                            </button>
                                            {isExpanded && (
                                                <div className="absolute right-0 top-full mt-1 z-20 w-48" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownList>
                                                        <div
                                                            className="px-4 py-2 flex items-center justify-between hover:bg-surface-container-lowest cursor-pointer transition-colors"
                                                            onClick={() => handlePropertyChange(choice.id, 'visible', !(choice.visible ?? true))}
                                                        >
                                                            <span className="text-sm text-on-surface">Visible</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={choice.visible ?? true}
                                                                readOnly
                                                                className="accent-primary cursor-pointer"
                                                            />
                                                        </div>
                                                        <div
                                                            className="px-4 py-2 flex items-center justify-between hover:bg-surface-container-lowest cursor-pointer transition-colors"
                                                            onClick={() => handlePropertyChange(choice.id, 'allowTextEntry', !(choice.allowTextEntry ?? false))}
                                                        >
                                                            <span className="text-sm text-on-surface">Allow Text Entry</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={choice.allowTextEntry ?? false}
                                                                readOnly
                                                                className="accent-primary cursor-pointer"
                                                            />
                                                        </div>
                                                    </DropdownList>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newChoices = question.choices?.filter(c => c.id !== choice.id);
                                                onUpdateQuestion(question.id, { choices: newChoices });
                                            }}
                                            className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container transition-colors"
                                            aria-label="Remove choice"
                                        >
                                            <XIcon className="text-base" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
            {dropTargetChoiceId === null && draggedChoiceId && <ChoiceDropIndicator />}
            {!printMode && (
                <Button
                    variant="tertiary-primary"
                    size="large"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddChoice(question.id);
                    }}
                    className="mt-2"
                >
                    <PlusIcon className="text-xl mr-2" /> Add choice
                </Button>
            )}
            {!printMode && (
                <Button
                    variant="tertiary-primary"
                    size="large"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPaste();
                    }}
                    className="mt-2 ml-4"
                >
                    <PlusIcon className="text-xl mr-2" /> Add multiple
                </Button>
            )}
        </div>
    );
};
