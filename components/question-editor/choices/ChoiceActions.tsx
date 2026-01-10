import React from 'react';
import { PlusIcon } from '../../icons';
import { CopyAndPasteButton } from '../../logic-editor/shared';
import { Button } from '../../Button';

interface ChoiceActionsProps {
    questionType: string;
    onAddChoice: () => void;
    onPaste: () => void;
}

const ChoiceActions: React.FC<ChoiceActionsProps> = ({ questionType, onAddChoice, onPaste }) => {
    return (
        <div className="mt-3 flex items-center gap-4">
            <Button variant="tertiary-primary" size="large" onClick={onAddChoice}>
                <PlusIcon className="text-xl mr-2" /> {questionType === 'Choice Grid' ? 'Add row' : 'Add choice'}
            </Button>
            <Button variant="tertiary-primary" size="large" onClick={onPaste}>
                <PlusIcon className="text-xl mr-2" /> Add multiple
            </Button>
        </div>
    );
};

export default ChoiceActions;
