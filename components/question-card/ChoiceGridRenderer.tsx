import React from 'react';
import type { Question } from '../../types';
import { parseChoice } from '../../utils';
import { Button } from '../Button';
import { EditableText } from '../EditableText';
import {
    DragIndicatorIcon, RadioButtonUncheckedIcon, XIcon, PlusIcon
} from '../icons';
import { TableDropIndicator } from './common';

interface ChoiceGridRendererProps {
    question: Question;
    printMode?: boolean;
    draggedChoiceId: string | null;
    dropTargetChoiceId: string | null;
    onSelect: (question: Question) => void;
    onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
    onAddChoice: (id: string) => void;
    handleAddColumn: () => void;
    handleScalePointTextChange: (id: string, text: string) => void;
    handleChoiceDragStart: (e: React.DragEvent, id: string) => void;
    handleChoiceDragOver: (e: React.DragEvent, id: string) => void;
    handleChoiceDrop: (e: React.DragEvent) => void;
    handleChoiceDragEnd: (e: React.DragEvent) => void;
    setDropTargetChoiceId: (id: string | null) => void;
}

export const ChoiceGridRenderer: React.FC<ChoiceGridRendererProps> = ({
    question, printMode, draggedChoiceId, dropTargetChoiceId,
    onSelect, onUpdateQuestion, onAddChoice, handleAddColumn, handleScalePointTextChange,
    handleChoiceDragStart, handleChoiceDragOver, handleChoiceDrop, handleChoiceDragEnd, setDropTargetChoiceId
}) => {
    return (
        <div className="mt-4">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-outline">
                            <th className="py-2 pr-2 text-left"></th>
                            {(question.scalePoints || []).map(sp => (
                                <th key={sp.id} className="py-2 px-3 text-center text-xs font-normal text-on-surface-variant align-bottom group/header relative">
                                    <EditableText
                                        html={sp.text}
                                        onChange={(newText) => handleScalePointTextChange(sp.id, newText)}
                                        onFocus={() => onSelect(question)}
                                        className="text-on-surface-variant"
                                        readOnly={printMode}
                                    />
                                    {!printMode && (
                                        <Button
                                            variant="danger"
                                            size="small"
                                            iconOnly
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newScalePoints = question.scalePoints?.filter(p => p.id !== sp.id);
                                                onUpdateQuestion(question.id, { scalePoints: newScalePoints });
                                            }}
                                            className="absolute -top-1 -right-1 opacity-0 group-hover/header:opacity-100"
                                            aria-label="Remove column"
                                        >
                                            <XIcon className="text-base" />
                                        </Button>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody
                        onDrop={handleChoiceDrop}
                        onDragOver={(e) => {
                            // Only accept choice drags - ignore question/block drags
                            if (!e.dataTransfer.types.includes('application/survey-choice')) {
                                return;
                            }
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTargetChoiceId(null);
                        }}
                        onDragLeave={(e) => {
                            // Clear drop target when leaving the container entirely
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setDropTargetChoiceId(null);
                            }
                        }}
                    >
                        {(question.choices || []).map(choice => {
                            const { variable, label } = parseChoice(choice.text);
                            const numColumns = (question.scalePoints?.length || 0) + 1;
                            return (
                                <React.Fragment key={choice.id}>
                                    {dropTargetChoiceId === choice.id && <TableDropIndicator colSpan={numColumns} />}
                                    <tr
                                        className={`border-b border-outline last:border-b-0 group/choice transition-opacity ${draggedChoiceId === choice.id ? 'opacity-30' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleChoiceDragStart(e, choice.id)}
                                        onDragOver={(e) => handleChoiceDragOver(e, choice.id)}
                                        onDragEnd={handleChoiceDragEnd}
                                    >
                                        <td className="p-2 text-sm text-on-surface pr-4 relative">
                                            <div className="flex items-center gap-1">
                                                {!printMode && <DragIndicatorIcon className="text-xl text-on-surface-variant cursor-grab opacity-0 group-hover/choice:opacity-100 transition-opacity" />}
                                                {variable && <span className="font-semibold text-on-surface">{variable}</span>}
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
                                                {!printMode && (
                                                    <Button
                                                        variant="danger"
                                                        size="small"
                                                        iconOnly
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newChoices = question.choices?.filter(c => c.id !== choice.id);
                                                            onUpdateQuestion(question.id, { choices: newChoices });
                                                        }}
                                                        className="opacity-0 group-hover/choice:opacity-100"
                                                        aria-label="Remove row"
                                                    >
                                                        <XIcon className="text-base" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        {(question.scalePoints || []).map(sp => (
                                            <td key={sp.id} className="p-2 text-center">
                                                <RadioButtonUncheckedIcon className="text-xl text-input-border" />
                                            </td>
                                        ))}
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                        {dropTargetChoiceId === null && draggedChoiceId && <TableDropIndicator colSpan={(question.scalePoints?.length || 0) + 1} />}
                    </tbody>
                </table>
            </div>
            {!printMode && (
                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChoice(question.id);
                        }}
                        className="flex items-center text-sm text-primary font-semibold transition-colors hover:bg-primary hover:text-on-primary rounded-md px-4 py-1.5"
                    >
                        <PlusIcon className="text-base mr-1" /> Add row
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddColumn();
                        }}
                        className="flex items-center text-sm text-primary font-semibold transition-colors hover:bg-primary hover:text-on-primary rounded-md px-4 py-1.5"
                    >
                        <PlusIcon className="text-base mr-1" /> Add column
                    </button>
                </div>
            )}
        </div>
    );
};
