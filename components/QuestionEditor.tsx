
import React, { memo, useMemo } from 'react';
import type { Survey, Question, ToolboxItemData, LogicIssue } from '../types';
import { QuestionType } from '../types';
import { CHOICE_BASED_QUESTION_TYPES } from '../utils';

import {
    AdvancedTab,
    BehaviorTab,
    ChoiceBasedSettingsTab,
    GenericSettingsTab,
    PreviewTab,
    TextEntrySettingsTab
} from './question-editor';

export interface QuestionEditorProps {
    question: Question;
    survey: Survey;
    logicIssues: LogicIssue[];
    activeTab: string;
    focusedLogicSource: string | null;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onAddChoice: (questionId: string) => void;
    onDeleteChoice: (questionId: string, choiceId: string) => void;
    isExpanded: boolean;
    onExpandSidebar: () => void;
    toolboxItems: ToolboxItemData[];
    onRequestGeminiHelp: (topic: string) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = memo(({
    question, survey, logicIssues, activeTab, focusedLogicSource, onUpdateQuestion, onAddChoice, onDeleteChoice,
    isExpanded, onExpandSidebar, toolboxItems, onRequestGeminiHelp
}) => {

    const allSurveyQuestions = useMemo(() => survey.blocks.flatMap(b => b.questions), [survey]);
    const currentQuestionIndex = useMemo(() => allSurveyQuestions.findIndex(q => q.id === question.id), [allSurveyQuestions, question.id]);

    const previousQuestions = useMemo(() =>
        allSurveyQuestions
            .slice(0, currentQuestionIndex)
            .filter(q =>
                q.id !== question.id &&
                q.type !== QuestionType.PageBreak &&
                q.type !== QuestionType.Description &&
                !q.isHidden
            ),
        [allSurveyQuestions, currentQuestionIndex, question.id]
    );

    const followingQuestions = useMemo(() =>
        allSurveyQuestions
            .slice(currentQuestionIndex + 1)
            .filter(q =>
                q.id !== question.id &&
                q.type !== QuestionType.PageBreak &&
                q.type !== QuestionType.Description &&
                !q.isHidden
            ),
        [allSurveyQuestions, currentQuestionIndex, question.id]
    );

    const isFirstInteractiveQuestion = useMemo(() => {
        const firstInteractive = allSurveyQuestions.find(q => 
            q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak
        );
        return firstInteractive?.id === question.id;
    }, [allSurveyQuestions, question.id]);

    const handleUpdate = (updates: Partial<Question>) => {
        onUpdateQuestion(question.id, updates);
    };

    const isChoiceBased = useMemo(() => CHOICE_BASED_QUESTION_TYPES.has(question.type), [question.type]);

    switch (activeTab) {
        case 'Settings':
            if (isChoiceBased) {
                return (
                    <ChoiceBasedSettingsTab
                        question={question}
                        survey={survey}
                        onUpdate={handleUpdate}
                        onAddChoice={onAddChoice}
                        onDeleteChoice={onDeleteChoice}
                        toolboxItems={toolboxItems}
                        previousQuestions={previousQuestions}
                    />
                );
            }
            if (question.type === QuestionType.TextEntry) {
                return (
                    <TextEntrySettingsTab
                        question={question}
                        onUpdate={handleUpdate}
                        toolboxItems={toolboxItems}
                    />
                );
            }
            if (question.type !== QuestionType.Description && question.type !== QuestionType.PageBreak) {
                return (
                    <GenericSettingsTab
                        question={question}
                        onUpdate={handleUpdate}
                        toolboxItems={toolboxItems}
                    />
                );
            }
            return <p className="p-6 text-sm text-on-surface-variant text-center">This question type has no editable settings.</p>;
        
        case 'Behavior':
            return (
                <BehaviorTab
                    question={question}
                    survey={survey}
                    previousQuestions={previousQuestions}
                    followingQuestions={followingQuestions}
                    issues={logicIssues}
                    onUpdate={handleUpdate}
                    onAddLogic={onExpandSidebar}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                    focusedLogicSource={focusedLogicSource}
                    isFirstInteractiveQuestion={isFirstInteractiveQuestion}
                />
            );
        
        case 'Advanced':
            return (
                <AdvancedTab
                    question={question}
                    survey={survey}
                    previousQuestions={previousQuestions}
                    followingQuestions={followingQuestions}
                    issues={logicIssues}
                    onUpdate={handleUpdate}
                    onAddLogic={onExpandSidebar}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                />
            );

        case 'Preview':
             return (
                <PreviewTab
                    question={question}
                    survey={survey}
                    isExpanded={isExpanded}
                />
            );

        default:
            return <p className="p-6">Content not available</p>;
    }
});
