import React from 'react';
import type { Question, Survey, LogicIssue } from '../../types';
import { QuestionType } from '../../types';
import { EditableText } from '../EditableText';
import { DisplayLogicDisplay, SkipLogicDisplay, BranchingLogicDisplay } from '../LogicDisplays';
import { TextEntryRenderer } from './TextEntryRenderer';
import { ChoiceGridRenderer } from './ChoiceGridRenderer';
import { ChoiceListRenderer } from './ChoiceListRenderer';
import { DescriptionLinesRenderer } from './DescriptionLinesRenderer';

interface QuestionCardBodyProps {
    question: Question;
    survey: Survey;
    printMode?: boolean;
    showBulkEditCheckbox?: boolean;
    logicIssues: LogicIssue[];
    focusedLogicSource: string | null;

    // Logic Props
    draggedChoiceId: string | null;
    dropTargetChoiceId: string | null;

    // Handlers
    onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
    onSelect: (question: Question, options?: any) => void;
    onAddChoice: (id: string, afterChoiceId?: string) => void;
    onAddDescriptionLine: (id: string, afterLineId?: string) => void;
    onDeleteDescriptionLine: (questionId: string, lineId: string) => void;
    draggedDescLineId: string | null;
    dropTargetDescLineId: string | null;
    handleDescLineDragStart: (e: React.DragEvent, id: string) => void;
    handleDescLineDragOver: (e: React.DragEvent, id: string) => void;
    handleDescLineDrop: (e: React.DragEvent) => void;
    handleDescLineDragEnd: (e: React.DragEvent) => void;
    setDropTargetDescLineId: (id: string | null) => void;
    handleChoiceDragStart: (e: React.DragEvent, id: string) => void;
    handleChoiceDragOver: (e: React.DragEvent, id: string) => void;
    handleChoiceDrop: (e: React.DragEvent) => void;
    handleChoiceDragEnd: (e: React.DragEvent) => void;
    handleAddColumn: () => void;
    handleScalePointTextChange: (id: string, text: string) => void;
    setDropTargetChoiceId: (id: string | null) => void;
    onPaste: () => void;
}

export const QuestionCardBody: React.FC<QuestionCardBodyProps> = (props) => {
    const {
        question, survey, printMode, showBulkEditCheckbox = false, logicIssues, focusedLogicSource,
        onUpdateQuestion, onSelect
    } = props;

    return (
        <div className="col-start-2 mt-3 min-w-0">
            {question.type !== QuestionType.Description && (
                <EditableText
                    html={question.text}
                    onChange={(newText) => onUpdateQuestion(question.id, { text: newText })}
                    onFocus={() => onSelect(question)}
                    className="font-survey text-lg text-on-surface min-h-[24px]"
                    readOnly={printMode}
                />
            )}

            {question.type === QuestionType.TextEntry && (
                <TextEntryRenderer question={question} />
            )}

            {question.type === QuestionType.Description && (
                <DescriptionLinesRenderer
                    question={question}
                    printMode={printMode}
                    onUpdateQuestion={onUpdateQuestion}
                    onAddDescriptionLine={props.onAddDescriptionLine}
                    onDeleteDescriptionLine={props.onDeleteDescriptionLine}
                    onSelect={onSelect}
                    draggedDescLineId={props.draggedDescLineId}
                    dropTargetDescLineId={props.dropTargetDescLineId}
                    handleDescLineDragStart={props.handleDescLineDragStart}
                    handleDescLineDragOver={props.handleDescLineDragOver}
                    handleDescLineDrop={props.handleDescLineDrop}
                    handleDescLineDragEnd={props.handleDescLineDragEnd}
                    setDropTargetDescLineId={props.setDropTargetDescLineId}
                />
            )}

            {question.type === QuestionType.ChoiceGrid && (
                <ChoiceGridRenderer {...props} />
            )}

            {question.choices && question.type !== QuestionType.ChoiceGrid && (
                <ChoiceListRenderer {...props} />
            )}

            {/* Logic Displays */}
            {question.displayLogic && (
                <DisplayLogicDisplay
                    logic={question.displayLogic}
                    survey={survey}
                    onClick={(id) => onSelect(question, { tab: 'Behavior', focusOn: id || 'display' })}
                    issues={logicIssues?.filter(i => i.type === 'display') || []}
                    isFocused={focusedLogicSource === 'display'}
                    focusedId={focusedLogicSource}
                    onRemove={() => onUpdateQuestion(question.id, { displayLogic: undefined })}
                    readOnly={printMode}
                />
            )}

            {question.skipLogic && (
                <SkipLogicDisplay
                    logic={question.skipLogic}
                    currentQuestion={question}
                    survey={survey}
                    onClick={() => onSelect(question, { tab: 'Behavior', focusOn: 'skip' })}
                    issues={logicIssues?.filter(i => i.type === 'skip') || []}
                    isFocused={focusedLogicSource === 'skip'}
                    onRemove={() => onUpdateQuestion(question.id, { skipLogic: undefined })}
                    readOnly={printMode}
                />
            )}

            {question.branchingLogic && (
                <BranchingLogicDisplay
                    logic={question.branchingLogic}
                    survey={survey}
                    onClick={(id) => onSelect(question, { tab: 'Behavior', focusOn: id || 'branching' })}
                    question={question}
                    issues={logicIssues?.filter(i => i.type === 'branching') || []}
                    isFocused={focusedLogicSource === 'branching'}
                    focusedId={focusedLogicSource}
                    onRemove={() => onUpdateQuestion(question.id, { branchingLogic: undefined })}
                    readOnly={printMode}
                />
            )}
        </div>
    );
};
