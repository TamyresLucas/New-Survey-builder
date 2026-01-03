
import React, { memo, useMemo } from 'react';
import type { Survey, Question, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, Block } from '../../types';
import { QuestionType } from '../../types';
import { generateId, isBranchingLogicExhaustive } from '../../utils';
import {
    XIcon, PlusIcon,
    InfoIcon
} from '../icons';
import {
    DestinationRow,
    BranchLogicSet
} from './shared';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';


export const BranchingLogicEditor: React.FC<{
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
    focusedLogicSource: string | null;
}> = ({
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
        const branchingLogic = question.draftBranchingLogic ?? question.branchingLogic;

        const currentBlockId = useMemo(() => {
            return survey.blocks.find(b => b.questions.some(q => q.id === question.id))?.id || null;
        }, [survey.blocks, question.id]);


        React.useEffect(() => {
            if (focusedLogicSource) {
                // Small timeout to ensure DOM is ready
                setTimeout(() => {
                    const element = document.getElementById(focusedLogicSource);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('ring-2', 'ring-primary');
                        setTimeout(() => element.classList.remove('ring-2', 'ring-primary'), 2000);
                    }
                }, 100);
            }
        }, [focusedLogicSource]);



        const handleUpdate = (updates: Partial<Question>) => {
            onUpdate(updates);
        };

        const handleAddBranchingLogic = () => {
            const newBranch: BranchingLogicBranch = {
                id: generateId('branch'),
                operator: 'AND',
                // FIX: Pre-fill questionId with the current question ID
                conditions: [{ id: generateId('cond'), questionId: question.qid, operator: 'equals', value: '', isConfirmed: false }],
                thenSkipTo: '',
                thenSkipToIsConfirmed: false,
            };
            const newLogic: BranchingLogic = {
                branches: [newBranch],
                otherwiseSkipTo: 'next',
                otherwiseIsConfirmed: true,
            };
            handleUpdate({ branchingLogic: newLogic });
            onAddLogic();
        };

        if (!question) return null;

        if (!branchingLogic || branchingLogic.branches.length === 0) {
            return (
                <div className="h-full flex flex-col bg-surface-50">

                    <div className="flex-none bg-white">

                        <p className="text-xs text-on-surface-variant mb-3">Redirect respondents to different blocks, sections, or survey paths within this survey based on their answers.</p>
                        <Button variant="tertiary-primary" size="large" onClick={handleAddBranchingLogic}>
                            <PlusIcon className="text-xl mr-2" /> Add branch
                        </Button>
                    </div>
                </div>
            );
        }

        const calculateSmartDefault = (): string => {
            if (!survey.blocks || !currentBlockId) return 'end';
            const currentBlockIndex = survey.blocks.findIndex(b => b.id === currentBlockId);
            if (currentBlockIndex === -1) return 'end';

            for (let i = currentBlockIndex + 1; i < survey.blocks.length; i++) {
                const block = survey.blocks[i];
                // "Shared Module" check: No branch name (and implicitly not exclusive, per recent change)
                if (!block.branchName) {
                    return `block:${block.id}`;
                }
            }
            return 'end';
        };

        const processLogicUpdate = (newBranches: BranchingLogicBranch[]) => {
            // Priority 2: Non-choice questions (TextEntry, etc) cannot be exhaustive.
            const isChoiceQuestion = question.type === QuestionType.Radio ||
                question.type === QuestionType.Checkbox ||
                question.type === QuestionType.ChoiceGrid ||
                question.type === QuestionType.ImageSelector ||
                question.type === QuestionType.DropDownList;

            if (!isChoiceQuestion) {
                const simpleLogic: BranchingLogic = {
                    ...branchingLogic,
                    branches: newBranches,
                    isExhaustive: false,
                };

                // Only confirm if we have a valid target
                if (!simpleLogic.otherwiseSkipTo) {
                    const smartDefault = calculateSmartDefault();
                    simpleLogic.otherwiseSkipTo = smartDefault || undefined;
                    // Only mark confirmed if we actually have a destination
                    simpleLogic.otherwiseIsConfirmed = !!smartDefault;
                }

                return simpleLogic;
            }

            // Calculate exhaustive state dynamically
            const updatedLogicState = { ...branchingLogic, branches: newBranches };

            const tempQuestion = {
                ...question,
                draftBranchingLogic: updatedLogicState,
                branchingLogic: updatedLogicState
            };
            const isExhaustive = isBranchingLogicExhaustive(tempQuestion);

            const newLogic: BranchingLogic = {
                ...branchingLogic, // Keep existing fields (like otherwiseSkipTo if it exists)
                branches: newBranches,
                isExhaustive
            };

            if (isExhaustive) {
                // STRICT RULE: If exhaustive, remove otherwiseSkipTo
                delete newLogic.otherwiseSkipTo;
                delete newLogic.otherwiseIsConfirmed;
                delete newLogic.otherwisePathName;
            } else {
                if (!newLogic.otherwiseSkipTo) {
                    newLogic.otherwiseSkipTo = calculateSmartDefault();
                    newLogic.otherwiseIsConfirmed = true;
                }
            }

            return newLogic;
        };

        const handleUpdateBranch = (branchId: string, updates: Partial<BranchingLogicBranch>) => {
            const newBranches = branchingLogic.branches.map(b =>
                b.id === branchId ? { ...b, ...updates } : b
            );
            handleUpdate({ branchingLogic: processLogicUpdate(newBranches) });
        };

        const handleAddBranch = () => {
            const newBranch: BranchingLogicBranch = {
                id: generateId('branch'),
                operator: 'AND',
                // FIX: Pre-fill questionId with the current question ID
                conditions: [{
                    id: generateId('cond'),
                    questionId: question.qid,
                    operator: 'equals', // Default to equals for better UX
                    value: '',
                    isConfirmed: false
                }],
                thenSkipTo: '',
                thenSkipToIsConfirmed: false
            };
            // Use processLogicUpdate here too to ensure state consistency
            handleUpdate({ branchingLogic: processLogicUpdate([...branchingLogic.branches, newBranch]) });
        };

        const handleRemoveBranch = (branchId: string) => {
            const newBranches = branchingLogic.branches.filter(b => b.id !== branchId);
            if (newBranches.length === 0) {
                // FIX: If removing the last branch, remove the entire branching logic.
                // Natural fallthrough + block.continueTo will handle routing.
                handleUpdate({ branchingLogic: undefined });
            } else {
                handleUpdate({ branchingLogic: processLogicUpdate(newBranches) });
            }
        };

        // Use the persisted tag if available, otherwise fallback to runtime check (for legacy data)
        const isOtherwiseExhaustive = branchingLogic?.isExhaustive ?? isBranchingLogicExhaustive(question);


        return (
            <div>

                <div className="mb-4">

                    <p className="text-xs text-on-surface-variant">
                        Redirect respondents to different blocks, sections, or survey paths within this survey based on their answers.
                    </p>
                </div>

                <div className="space-y-4">
                    {branchingLogic.branches.map((branch) => (
                        <BranchLogicSet
                            key={branch.id}
                            branch={branch}
                            onUpdate={(updates) => handleUpdateBranch(branch.id, updates)}
                            onRemove={() => handleRemoveBranch(branch.id)}
                            availableQuestions={previousQuestions}
                            followingQuestions={followingQuestions}
                            survey={survey}
                            currentBlockId={currentBlockId}
                            issues={issues}
                            currentQuestion={question}
                        />
                    ))}
                </div>

                <Button
                    variant="tertiary-primary"
                    size="large"
                    onClick={handleAddBranch}
                    className="mt-4"
                >
                    <PlusIcon className="text-xl mr-2" /> Add branch
                </Button>

                {!isOtherwiseExhaustive && (
                    <div className="mt-4 pt-4">
                        <DestinationRow
                            label={<span className="text-sm font-medium text-on-surface">Otherwise skip to</span>}
                            value={branchingLogic.otherwiseSkipTo}
                            onChange={(value) => handleUpdate({
                                branchingLogic: {
                                    ...branchingLogic,
                                    otherwiseSkipTo: value,
                                    otherwiseIsConfirmed: true
                                }
                            })}
                            onConfirm={() => handleUpdate({
                                branchingLogic: {
                                    ...branchingLogic,
                                    otherwiseIsConfirmed: true
                                }
                            })}
                            isConfirmed={branchingLogic.otherwiseIsConfirmed}
                            followingQuestions={followingQuestions}
                            survey={survey}
                            currentBlockId={currentBlockId}
                            hideNextQuestion={isOtherwiseExhaustive}
                        />
                    </div>
                )}
            </div>
        );
    };