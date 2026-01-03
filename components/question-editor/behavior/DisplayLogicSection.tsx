import React from 'react';
import type { Question, LogicIssue } from '../../../types';
import { ConditionalLogicEditor } from '../../logic-editor/QuestionDisplayLogicEditor';

interface DisplayLogicSectionProps {
    question: Question;
    previousQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
}

const DisplayLogicSection: React.FC<DisplayLogicSectionProps> = ({
    question,
    previousQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp
}) => {
    return (
        <div className="divide-y divide-outline-variant">
            <div className="py-6 first:pt-0">
                <ConditionalLogicEditor
                    logicType="display"
                    title="Show this question if"
                    description="Control when this question is shown to respondents"
                    logicProp="displayLogic"
                    draftLogicProp="draftDisplayLogic"
                    target={question}
                    previousQuestions={previousQuestions}
                    issues={issues.filter(i => i.type === 'display')}
                    onUpdate={onUpdate}
                    onAddLogic={onAddLogic}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                />
            </div>
            <div className="py-6">
                <ConditionalLogicEditor
                    logicType="hide"
                    title="Hide this question if"
                    description="Control when this question is hidden from respondents"
                    logicProp="hideLogic"
                    draftLogicProp="draftHideLogic"
                    target={question}
                    previousQuestions={previousQuestions}
                    issues={issues.filter(i => i.type === 'hide')}
                    onUpdate={onUpdate}
                    onAddLogic={onAddLogic}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                />
            </div>
        </div>
    );
};

export default DisplayLogicSection;
