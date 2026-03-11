import React from 'react';
import type { Question } from '../../types';
import { Button } from '../Button';
import { EditableText } from '../EditableText';
import { DragIndicatorIcon, XIcon, PlusIcon } from '../icons';
import { DescriptionLineDropIndicator } from './common';

interface DescriptionLinesRendererProps {
    question: Question;
    printMode?: boolean;
    onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
    onAddDescriptionLine: (id: string, afterLineId?: string) => void;
    onDeleteDescriptionLine: (questionId: string, lineId: string) => void;
    onSelect: (question: Question) => void;
    draggedDescLineId: string | null;
    dropTargetDescLineId: string | null;
    handleDescLineDragStart: (e: React.DragEvent, id: string) => void;
    handleDescLineDragOver: (e: React.DragEvent, id: string) => void;
    handleDescLineDrop: (e: React.DragEvent) => void;
    handleDescLineDragEnd: (e: React.DragEvent) => void;
    setDropTargetDescLineId: (id: string | null) => void;
}

export const DescriptionLinesRenderer: React.FC<DescriptionLinesRendererProps> = ({
    question, printMode, onUpdateQuestion, onAddDescriptionLine, onDeleteDescriptionLine, onSelect,
    draggedDescLineId, dropTargetDescLineId,
    handleDescLineDragStart, handleDescLineDragOver, handleDescLineDrop, handleDescLineDragEnd, setDropTargetDescLineId
}) => {
    const onUpdateLine = (lineId: string, newText: string) => {
        const newLines = (question.descriptionLines || []).map(l =>
            l.id === lineId ? { ...l, text: newText } : l
        );
        onUpdateQuestion(question.id, { descriptionLines: newLines });
    };

    return (
        <div
            className="space-y-2"
            onDrop={handleDescLineDrop}
            onDragOver={(e) => {
                if (!e.dataTransfer.types.includes('application/survey-description-line')) {
                    return;
                }
                e.preventDefault();
                setDropTargetDescLineId(null);
            }}
            onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTargetDescLineId(null);
                }
            }}
        >
            {(question.descriptionLines || []).map((line) => (
                <React.Fragment key={line.id}>
                    {dropTargetDescLineId === line.id && <DescriptionLineDropIndicator />}
                    <div
                        className={`flex flex-col group/line transition-opacity ${draggedDescLineId === line.id ? 'opacity-30' : ''}`}
                        onDragOver={(e) => handleDescLineDragOver(e, line.id)}
                    >
                        <div className="flex items-center min-h-[32px] relative py-1">
                            {!printMode && (
                                <div
                                    className="absolute -left-7 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover/line:opacity-100 drag-handle"
                                    draggable={true}
                                    onDragStart={(e) => handleDescLineDragStart(e, line.id)}
                                    onDragEnd={handleDescLineDragEnd}
                                >
                                    <DragIndicatorIcon className="text-base text-on-surface-variant" />
                                </div>
                            )}

                            <div className="text-on-surface flex-grow flex items-center gap-2" draggable={false} onDragStart={(e) => e.stopPropagation()}>
                                <EditableText
                                    html={line.text}
                                    onChange={(newText) => onUpdateLine(line.id, newText)}
                                    onFocus={() => onSelect(question)}
                                    className="font-survey text-lg text-on-surface flex-grow min-w-0"
                                    readOnly={printMode}
                                />
                            </div>

                            {!printMode && (
                                <div className="flex items-center ml-2 min-h-[24px] opacity-0 group-hover/line:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteDescriptionLine(question.id, line.id);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center rounded-md text-error hover:bg-error-container transition-colors"
                                        aria-label="Remove text line"
                                    >
                                        <XIcon className="text-base" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddDescriptionLine(question.id, line.id);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors ml-1"
                                        aria-label="Add text line below"
                                    >
                                        <PlusIcon className="text-base" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </React.Fragment>
            ))}
            {dropTargetDescLineId === null && draggedDescLineId && <DescriptionLineDropIndicator />}

            {!printMode && (
                <div className="flex mt-2">
                    <Button
                        variant="tertiary-primary"
                        size="large"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddDescriptionLine(question.id);
                        }}
                    >
                        <PlusIcon className="text-xl mr-2" /> Add text line
                    </Button>
                </div>
            )}
        </div>
    );
};
