import React from 'react';
import { PlusIcon } from '../../icons';
import { CopyAndPasteButton } from '../../logic-editor/shared';

interface ScalePointActionsProps {
    onAddScalePoint: () => void;
    onPaste: () => void;
}

const ScalePointActions: React.FC<ScalePointActionsProps> = ({ onAddScalePoint, onPaste }) => {
    return (
        <div className="mt-3 flex items-center gap-4">
            <button onClick={onAddScalePoint} className="flex items-center text-sm font-medium text-primary hover:underline">
                <PlusIcon className="text-base mr-1" /> Column
            </button>
            <CopyAndPasteButton onClick={onPaste} />
        </div>
    );
};

export default ScalePointActions;
