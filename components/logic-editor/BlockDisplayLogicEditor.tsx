import React, { useMemo } from 'react';
import type { Block, Survey, DisplayLogic, DisplayLogicCondition } from '../../types';
import { QuestionType } from '../../types';
import { DisplayLogicSet } from './shared';
import { Button } from '../Button';
import { PlusIcon } from '../icons';
import { generateId } from '../../utils';

interface BlockDisplayLogicEditorProps {
    block: Block;
    survey: Survey;
    onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
    onExpandSidebar: () => void;
}

export const BlockDisplayLogicEditor: React.FC<BlockDisplayLogicEditorProps> = ({ block, survey, onUpdateBlock, onExpandSidebar }) => {
    const previousQuestions = useMemo(() => {
        const allBlocks = survey.blocks;
        const currentBlockIndex = allBlocks.findIndex(b => b.id === block.id);
        if (currentBlockIndex === -1) return [];

        return allBlocks
            .slice(0, currentBlockIndex)
            .flatMap(b => b.questions)
            .filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
    }, [survey, block.id]);

    const logic = block.draftDisplayLogic ?? block.displayLogic;

    const handleUpdate = (updates: Partial<Block>) => {
        onUpdateBlock(block.id, updates);
    };

    const handleLogicUpdate = (updates: Partial<DisplayLogic>) => {
        const newLogic = { ...(logic || { operator: 'AND', conditions: [], action: 'show' }), ...updates } as DisplayLogic;

        // If confirmed, move to main prop and clear draft. If not, keep in draft.
        if (updates.isConfirmed) {
            handleUpdate({ displayLogic: newLogic, draftDisplayLogic: undefined });
        } else {
            handleUpdate({ draftDisplayLogic: newLogic });
        }
    };

    const handleAddLogic = () => {
        const newLogic: DisplayLogic = {
            operator: 'AND',
            conditions: [{
                id: generateId('cond'),
                questionId: '',
                operator: '',
                value: '',
                isConfirmed: false
            }],
            action: 'show',
            isConfirmed: false
        };
        handleUpdate({ draftDisplayLogic: newLogic });
        onExpandSidebar();
    };

    const handleRemoveLogic = () => {
        handleUpdate({ displayLogic: undefined, draftDisplayLogic: undefined });
    };

    if (!logic) {
        return (
            <div>
                <p className="text-xs text-on-surface-variant mb-3">Control when this block is shown to respondents.</p>
                <div className="flex items-center gap-4">
                    <Button variant="tertiary-primary" size="large" onClick={handleAddLogic}>
                        <PlusIcon className="text-xl mr-2" /> Add logic set
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                    <p className="text-xs text-on-surface-variant">Control when this block is shown to respondents.</p>
                </div>
            </div>

            <DisplayLogicSet
                logicSet={{
                    id: block.id,
                    operator: logic.operator,
                    conditions: logic.conditions,
                    isConfirmed: logic.isConfirmed
                }}
                actionValue={logic.action || 'show'}
                onActionChange={(value) => handleLogicUpdate({ action: value })}
                label={`Block ${block.bid}`}
                availableQuestions={previousQuestions}
                onUpdate={(updates: any) => handleLogicUpdate(updates)}
                onRemove={handleRemoveLogic}
            />
        </div>
    );
};
