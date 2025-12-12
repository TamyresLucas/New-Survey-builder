import React from 'react';
import type { Question } from '../../types';
import { QuestionType } from '../../types';
import { parseChoice } from '../../utils';
import { Button } from '../Button';
import { EditableText } from '../EditableText';
import {
    DragIndicatorIcon, RadioIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon, XIcon, PlusIcon
} from '../icons';
import { ChoiceDropIndicator } from './common';

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
}

export const ChoiceListRenderer: React.FC<ChoiceListRendererProps> = ({
    question, printMode, draggedChoiceId, dropTargetChoiceId,
    onSelect, onUpdateQuestion, onAddChoice,
    handleChoiceDragStart, handleChoiceDragOver, handleChoiceDrop, handleChoiceDragEnd, setDropTargetChoiceId
}) => {
    if (!question.choices || question.choices.length === 0) return null;

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
                return (
                    <React.Fragment key={choice.id}>
                        {dropTargetChoiceId === choice.id && <ChoiceDropIndicator />}
                        <div
                            className={`flex items-center group/choice transition-opacity h-[32px] ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}
                            draggable={true}
                            onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                            onDragOver={(e) => handleChoiceDragOver(e, choice.id)}
                            onDragEnd={handleChoiceDragEnd}
                        >
                            {!printMode && <DragIndicatorIcon className="text-xl text-on-surface-variant mr-1 cursor-grab opacity-0 group-hover/choice:opacity-100" />}
                            {question.type === QuestionType.Radio ? (
                                index === 0 ? (
                                    <RadioIcon className="text-xl text-primary mr-2" />
                                ) : (
                                    <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant mr-2" />
                                )
                            ) : (
                                <CheckboxOutlineIcon className="text-xl text-on-surface-variant mr-2" />
                            )}

                            <div className="text-on-surface flex-grow h-full flex items-center gap-2">
                                {variable && <span className="font-semibold text-on-surface mr-2">{variable}</span>}
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
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newChoices = question.choices?.filter(c => c.id !== choice.id);
                                        onUpdateQuestion(question.id, { choices: newChoices });
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container opacity-0 group-hover/choice:opacity-100 transition-opacity"
                                    aria-label="Remove choice"
                                >
                                    <XIcon className="text-base" />
                                </button>
                            )}
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
        </div>
    );
};
