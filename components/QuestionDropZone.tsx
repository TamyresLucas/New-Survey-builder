import React from 'react';

interface QuestionDropZoneProps {
    isDraggedOver: boolean;
}

export const QuestionDropZone: React.FC<QuestionDropZoneProps> = ({ isDraggedOver }) => (
    <div
        className={`flex items-center justify-center py-8 border-2 border-dashed rounded-lg transition-colors ${isDraggedOver
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant text-on-surface-variant'
            }`}
    >
        <span className="text-sm">
            {isDraggedOver ? 'Drop here to add' : 'Drag a question here or use the menu above'}
        </span>
    </div>
);
