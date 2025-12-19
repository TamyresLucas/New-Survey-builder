import React from 'react';
import type { Question, Survey, LogicIssue } from '../../types';
import { QuestionType } from '../../types';

import { CollapsibleSection } from '../logic-editor/shared';
import { AdvancedLogicSectionEditor } from '../logic-editor/AdvancedLogicSectionEditor';
import { ChoiceLayoutEditor, TextEntryAdvancedSettings } from './advanced';
import { PreviewQuestion } from '../PreviewQuestion';
import { MobilePreviewFrame } from '../MobilePreviewFrame';

interface AdvancedTabProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
    question,
    survey,
    previousQuestions,
    followingQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp,
    focusedLogicSource
}) => {
    const isChoiceBased = [QuestionType.Radio, QuestionType.Checkbox, QuestionType.ChoiceGrid].includes(question.type);

    return (
        <div className="p-6 space-y-8">
            <CollapsibleSection title="Advanced Logic" defaultExpanded={true}>
                <div className="-mt-2 mb-4">
                    <p className="text-xs text-on-surface-variant">Automate tasks, and integrate with other services.</p>
                </div>
                <div className="divide-y divide-outline-variant">
                    <AdvancedLogicSectionEditor
                        title="Before Showing This Question"
                        description="Set rules or actions triggered before the question is displayed."
                        questionQid={question.qid}
                        advancedLogics={question.draftBeforeAdvancedLogics ?? question.beforeAdvancedLogics ?? []}
                        onUpdateAdvancedLogics={(newLogics) => onUpdate({ beforeAdvancedLogics: newLogics })}
                        onAddAdvancedLogic={onAddLogic}
                    />
                    <AdvancedLogicSectionEditor
                        title="After Answering This Question"
                        description="Set rules or actions triggered after the question is answered."
                        questionQid={question.qid}
                        advancedLogics={question.draftAfterAdvancedLogics ?? question.afterAdvancedLogics ?? []}
                        onUpdateAdvancedLogics={(newLogics) => onUpdate({ afterAdvancedLogics: newLogics })}
                        onAddAdvancedLogic={onAddLogic}
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

export const PreviewTab: React.FC<{
    question: Question;
    survey: Survey;
    isExpanded: boolean;
}> = ({ question, survey, isExpanded }) => {
    // We need to mock answer change and validation for single question preview
    const [answer, setAnswer] = React.useState<any>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const availableHeight = containerRef.current.clientHeight;
                const padding = 48; // p-6 * 2
                const targetHeight = 670;

                // Calculate scale to fit. Max scale is 1.
                const newScale = Math.min(1, (availableHeight - padding) / targetHeight);
                setScale(newScale);
            }
        };

        // Initial update
        updateScale();

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="p-6 flex justify-center bg-surface-container-high h-full w-full overflow-hidden"
        >
            <MobilePreviewFrame
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    // The scale affects layout space, so we use margin to compensate if needed, 
                    // but usually top center origin works well in a flex center container.
                    marginBottom: scale < 1 ? `-${670 * (1 - scale)}px` : undefined
                }}
            >
                <header className="mb-4">
                    <h1 className="text-xl font-bold text-on-surface mb-2">{survey.title}</h1>
                </header>
                <PreviewQuestion
                    question={question}
                    onAnswerChange={(_, val) => setAnswer(val)}
                    isInvalid={false}
                    device="mobile"
                    value={answer}
                />
            </MobilePreviewFrame>
        </div>
    );
};