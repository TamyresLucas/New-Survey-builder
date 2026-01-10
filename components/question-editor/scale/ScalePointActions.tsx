import React from 'react';
import { PlusIcon } from '../../icons';
import { CopyAndPasteButton } from '../../logic-editor/shared';
import { Button } from '../../Button';

interface ScalePointActionsProps {
    onAddScalePoint: () => void;
    onPaste: () => void;
}

const ScalePointActions: React.FC<ScalePointActionsProps> = ({ onAddScalePoint, onPaste }) => {
    return (
        <div className="mt-3 flex items-center gap-4">
            <Button variant="tertiary-primary" size="large" onClick={onAddScalePoint}>
                <PlusIcon className="text-xl mr-2" /> Column
            </Button>
            <Button variant="tertiary-primary" size="large" onClick={onPaste}>
                <PlusIcon className="text-xl mr-2" /> Add multiple
            </Button>
        </div>
    );
};

export default ScalePointActions;
