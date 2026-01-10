import React from 'react';
import {
  XIcon,
  AsteriskIcon,
  DeleteIcon,
  DoubleArrowRightIcon,
  DriveFileMoveIcon,
} from './icons';

interface BulkEditPanelProps {
  checkedQuestionCount: number;
  onClose: () => void;
  onMoveTo: () => void;
  onForceResponse: () => void;
  onAutoAdvance: () => void;
  onDelete: () => void;
}

const ActionButton: React.FC<{ icon: React.FC<{ className?: string }>, label: string, onClick: () => void, isDestructive?: boolean }> = ({ icon: Icon, label, onClick, isDestructive = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${isDestructive
      ? 'text-error hover:bg-error-container'
      : 'text-on-surface hover:bg-surface-container-lowest'
      }`}
  >
    <Icon className="text-xl mr-3" />
    <span>{label}</span>
  </button>
);

export const BulkEditPanel: React.FC<BulkEditPanelProps> = ({
  checkedQuestionCount,
  onClose,
  onMoveTo,
  onForceResponse,
  onAutoAdvance,
  onDelete
}) => {
  return (
    <aside
      className="w-full h-full bg-surface-container border-l border-outline-variant flex-shrink-0 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <h2 className="text-lg font-medium text-on-surface" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Bulk Edit ({checkedQuestionCount})
        </h2>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
          <XIcon className="text-2xl" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        <nav className="py-2">
          <ActionButton icon={DriveFileMoveIcon} label="Move to" onClick={onMoveTo} />
          <ActionButton icon={AsteriskIcon} label="Force response" onClick={onForceResponse} />
          <ActionButton icon={DoubleArrowRightIcon} label="Auto advance" onClick={onAutoAdvance} />
          <ActionButton icon={DeleteIcon} label="Delete" onClick={onDelete} isDestructive />
        </nav>
      </div>
    </aside>
  );
};