import React from 'react';
import type { Question, Survey, LogicIssue } from '../../types';
import { CollapsibleSection } from '../logic-editor/shared';
import {
    ChoiceBehaviorSection,
    DisplayLogicSection,
    NavigationSettings,
    SkipLogicSection
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
    isFirstInteractiveQuestion
}) => {
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

            <CollapsibleSection title="Question Display Logic" defaultExpanded={true}>
                <DisplayLogicSection
                    question={question}
                    previousQuestions={previousQuestions}
                    issues={issues}
                    onUpdate={onUpdate}
                    onAddLogic={onAddLogic}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                />
            </CollapsibleSection>
            
            <CollapsibleSection title="Choices" defaultExpanded={true}>
                <ChoiceBehaviorSection
                    question={question}
                    survey={survey}
                    previousQuestions={previousQuestions}
                    onUpdate={onUpdate}
                    onAddLogic={onAddLogic}
                    isFirstInteractiveQuestion={isFirstInteractiveQuestion}
                />
            </CollapsibleSection>
        </div>
    );
};

export default BehaviorTab;