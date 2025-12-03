import React from 'react';
import { PlusIcon } from '../../icons';
import { CopyAndPasteButton } from '../../logic-editor/shared';

interface ChoiceActionsProps {
    questionType: string;
    onAddChoice: () => void;
    onPaste: () => void;
}

const ChoiceActions: React.FC<ChoiceActionsProps> = ({ questionType, onAddChoice, onPaste }) => {
    return (
        <div className="mt-3 flex items-center gap-4">
            <button onClick={onAddChoice} className="flex items-center text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">
                <PlusIcon className="text-base mr-1" /> {questionType === 'Choice Grid' ? 'Add Row' : 'Add Choice'}
            </button>
            <CopyAndPasteButton onClick={onPaste} />
        </div>
    );
};

export default ChoiceActions;
