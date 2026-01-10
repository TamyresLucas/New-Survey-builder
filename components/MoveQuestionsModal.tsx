import React, { useState } from 'react';
import { Survey } from '../types';
import { Button } from './Button';
import { XIcon } from './icons';

interface MoveQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (targetBlockId: string | 'new') => void;
    survey: Survey;
    questionCount: number;
}

export const MoveQuestionsModal: React.FC<MoveQuestionsModalProps> = ({ isOpen, onClose, onMove, survey, questionCount }) => {
    const [selectedTarget, setSelectedTarget] = useState<string | 'new'>('new');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onMove(selectedTarget);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-low rounded-lg shadow-xl w-full max-w-md flex flex-col border border-outline-variant">
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                    <h2 className="text-lg font-bold text-on-surface">Move {questionCount} question{questionCount !== 1 ? 's' : ''} to...</h2>
                    <Button variant="tertiary" iconOnly onClick={onClose}>
                        <XIcon className="text-xl" />
                    </Button>
                </div>

                <div className="p-4">
                    <label className="block text-sm font-medium text-on-surface mb-2">
                        Select block
                    </label>
                    <select
                        value={selectedTarget}
                        onChange={(e) => setSelectedTarget(e.target.value)}
                        className="w-full p-3 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        <option value="new">+ New block</option>
                        {survey.blocks.map(block => (
                            <option key={block.id} value={block.id}>
                                {block.bid || block.id}: {block.title || 'Untitled Block'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-4 border-t border-outline-variant flex justify-end gap-2">
                    <Button variant="tertiary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
                </div>
            </div>
        </div>
    );
};
