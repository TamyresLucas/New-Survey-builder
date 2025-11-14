import React, { useMemo } from 'react';
import type { Question, Survey, LogicIssue } from '../../../types';
import { SkipLogicEditor } from '../../logic-editor/SkipLogicEditor';
import { CHOICE_BASED_QUESTION_TYPES } from '../../../utils';

interface SkipLogicSectionProps {
    question: Question;
    survey: Survey;
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
}

const SkipLogicSection: React.FC<SkipLogicSectionProps> = ({
    question,
    survey,
    followingQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp,
    focusedLogicSource
}) => {
    const isChoiceBased = useMemo(() => CHOICE_BASED_QUESTION_TYPES.has(question.type), [question.type]);
    const currentBlockId = useMemo(() => survey.blocks.find(b => b.questions.some(q => q.id === question.id))?.id || null, [survey.blocks, question.id]);

    return (
        <SkipLogicEditor
            question={question}
            followingQuestions={followingQuestions}
            issues={issues.filter(i => i.type === 'skip')}
            onUpdate={onUpdate}
            isChoiceBased={isChoiceBased}
            onAddLogic={onAddLogic}
            onRequestGeminiHelp={onRequestGeminiHelp}
            focusedLogicSource={focusedLogicSource}
            survey={survey}
            currentBlockId={currentBlockId}
        />
    );
};

export default SkipLogicSection;
