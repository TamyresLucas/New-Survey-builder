import React from 'react';
import { OpenEndAnswerIcon as TextEntryIcon, CheckboxFilledIcon as CheckboxToolboxIcon } from '../icons';

interface DiagramToolbarProps {
  onAddNode: (type: 'multiple_choice' | 'text_entry' | 'logic') => void;
}

const DiagramToolbar: React.FC<DiagramToolbarProps> = ({ onAddNode }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface-container border border-outline-variant rounded-lg shadow-md p-2 flex items-center gap-2">
      <button
        onClick={() => onAddNode('text_entry')}
        className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="Add Text Entry Node"
      >
        <TextEntryIcon className="text-xl" />
      </button>
      <button
        onClick={() => onAddNode('multiple_choice')}
        className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="Add Multiple Choice Node"
      >
        <CheckboxToolboxIcon className="text-xl" />
      </button>
    </div>
  );
};

export default DiagramToolbar;
