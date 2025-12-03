import React from 'react';
import type { Question, Survey, LogicIssue, Block } from '../../types';
import { CHOICE_BASED_QUESTION_TYPES } from '../../utils';
import { CollapsibleSection } from '../logic-editor/shared';
import {
    ChoiceBehaviorSection,
    NavigationSettings,
    SkipLogicSection,
    QuestionBehaviorSection
} from './behavior';

interface BehaviorTabProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
    isFirstInteractiveQuestion: boolean;
    onSelectBlock: (block: Block | null, options?: { tab: string; focusOn: string; }) => void;
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({
    question,
    survey,
    previousQuestions,
    followingQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp,
    focusedLogicSource,
    isFirstInteractiveQuestion,
    onSelectBlock
}) => {
    const isChoiceBased = CHOICE_BASED_QUESTION_TYPES.has(question.type);

    return (
        <div className="p-6 space-y-8">
            <CollapsibleSection title="Navigation" defaultExpanded={true}>
                <div className="divide-y divide-outline-variant">
                    <div className="py-6 first:pt-0">
                        <NavigationSettings question={question} onUpdate={onUpdate} />
                    </div>
                    <div className="py-6">
                        <SkipLogicSection
                            question={question}
                            survey={survey}
                            followingQuestions={followingQuestions}
                            issues={issues}
                            onUpdate={onUpdate}
                            onAddLogic={onAddLogic}
                            onRequestGeminiHelp={onRequestGeminiHelp}
                            focusedLogicSource={focusedLogicSource}
                        />
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Question" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    <QuestionBehaviorSection
                        question={question}
                        survey={survey}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onSelectBlock={onSelectBlock}
                        onAddLogic={onAddLogic}
                        issues={issues} // Pass issues down
                        onRequestGeminiHelp={onRequestGeminiHelp}
                        focusedLogicSource={focusedLogicSource}
                    />
                </div>
            </CollapsibleSection>

            {isChoiceBased && (
                <CollapsibleSection title="Choices" defaultExpanded={true}>
                    <ChoiceBehaviorSection
                        question={question}
                        survey={survey}
                        previousQuestions={previousQuestions}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                        isFirstInteractiveQuestion={isFirstInteractiveQuestion}
                        issues={issues} // Pass issues down
                    />
                </CollapsibleSection>
            )}
        </div>
    );
};

export default BehaviorTab;