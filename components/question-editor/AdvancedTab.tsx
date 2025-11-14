import React from 'react';
import type { Question, Survey, LogicIssue } from '../../types';
import { QuestionType } from '../../types';

import { CollapsibleSection, QuestionGroupEditor } from '../logic-editor/shared';
import { BranchingLogicEditor } from '../logic-editor/BranchingLogicEditor';
import { WorkflowSectionEditor } from '../logic-editor/WorkflowEditor';
import { ChoiceLayoutEditor, TextEntryAdvancedSettings } from './advanced';

interface AdvancedTabProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ 
    question,
    survey,
    previousQuestions,
    followingQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp
}) => {
    const isChoiceBased = [QuestionType.Radio, QuestionType.Checkbox, QuestionType.ChoiceGrid].includes(question.type);

    return (
        <div className="p-6 space-y-8">
            <QuestionGroupEditor question={question} survey={survey} onUpdateQuestion={onUpdate} />

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
                    />
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Workflows" defaultExpanded={true}>
                <div className="-mt-2 mb-4">
                    <p className="text-xs text-on-surface-variant">Automate tasks, and integrate with other services.</p>
                </div>
                <div className="divide-y divide-outline-variant">
                    <WorkflowSectionEditor
                        title="Before Showing This Question"
                        description="Set rules or actions triggered before the question is displayed."
                        questionQid={question.qid}
                        workflows={question.draftBeforeWorkflows ?? question.beforeWorkflows ?? []}
                        onUpdateWorkflows={(newWorkflows) => onUpdate({ beforeWorkflows: newWorkflows })}
                        onAddWorkflow={onAddLogic}
                    />
                    <WorkflowSectionEditor
                        title="After Answering This Question"
                        description="Set rules or actions triggered after the question is answered."
                        questionQid={question.qid}
                        workflows={question.draftAfterWorkflows ?? question.afterWorkflows ?? []}
                        onUpdateWorkflows={(newWorkflows) => onUpdate({ afterWorkflows: newWorkflows })}
                        onAddWorkflow={onAddLogic}
                    />
                </div>
            </CollapsibleSection>
            
            {isChoiceBased && (
                <CollapsibleSection title="Display & Layout" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
                        <ChoiceLayoutEditor question={question} onUpdate={onUpdate} />
                    </div>
                </CollapsibleSection>
            )}
            {question.type === QuestionType.TextEntry && (
                 <CollapsibleSection title="Text Box Options" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
                        <TextEntryAdvancedSettings question={question} onUpdate={onUpdate} />
                    </div>
                 </CollapsibleSection>
            )}
        </div>
    );
};

export default AdvancedTab;
