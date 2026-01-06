import React from 'react';
import { QuestionType } from '../../types';
import type { Question, Survey, LogicIssue, Block } from '../../types';
import { CHOICE_BASED_QUESTION_TYPES } from '../../utils';
import { CollapsibleSection } from '../logic-editor/shared';
import {
    ChoiceBehaviorSection,
    SkipLogicSection,
    QuestionBehaviorSection
} from './behavior';
import { BranchingLogicEditor } from '../logic-editor/BranchingLogicEditor';

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


            {question.type !== QuestionType.Description && (
                <CollapsibleSection title="Skip Logic" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
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
                </CollapsibleSection>
            )}





            <CollapsibleSection title="Display Logic" defaultExpanded={true}>
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
                {isChoiceBased && (
                    <div className="py-6 first:pt-0 border-t border-outline-variant">
                        <ChoiceBehaviorSection
                            question={question}
                            survey={survey}
                            previousQuestions={previousQuestions}
                            onUpdate={onUpdate}
                            onAddLogic={onAddLogic}
                            isFirstInteractiveQuestion={isFirstInteractiveQuestion}
                            issues={issues} // Pass issues down
                        />
                    </div>
                )}
            </CollapsibleSection>

            {question.type !== QuestionType.Description && (
                <CollapsibleSection title="Branching Logic" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
                        <BranchingLogicEditor
                            question={question}
                            survey={survey}
                            previousQuestions={previousQuestions}
                            followingQuestions={followingQuestions}
                            issues={issues.filter(i => i.type === 'branching')}
                            onUpdate={onUpdate}
                            onAddLogic={onAddLogic}
                            onRequestGeminiHelp={onRequestGeminiHelp}
                            focusedLogicSource={focusedLogicSource}
                        />
                    </div>
                </CollapsibleSection>
            )}


        </div>
    );
};

export default BehaviorTab;