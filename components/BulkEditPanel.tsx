import React from 'react';
import {
  XIcon,
  ContentCopyIcon,
  LibraryAddIcon,
  DriveFileMoveIcon,
  CreateNewFolderIcon,
  VisibilityOffIcon,
  HideSourceIcon,
  TaskAltIcon,
  DeleteIcon,
  ToggleOffIcon,
} from './icons';

interface BulkEditPanelProps {
  checkedQuestionCount: number;
  onClose: () => void;
  onDuplicate: () => void;
  onAddToLibrary: () => void;
  onMoveQuestions: () => void;
  onMoveToNewBlock: () => void;
  onHideQuestion: () => void;
  onHideBackButton: () => void;
  onForceResponse: () => void;
  showForceResponse: boolean;
  onUnforceResponse: () => void;
  showUnforceResponse: boolean;
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
  onDuplicate,
  onAddToLibrary,
  onMoveQuestions,
  onMoveToNewBlock,
  onHideQuestion,
  onHideBackButton,
  onForceResponse,
  showForceResponse,
  onUnforceResponse,
  showUnforceResponse,
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
          <ActionButton icon={ContentCopyIcon} label="Duplicate" onClick={onDuplicate} />
          <ActionButton icon={LibraryAddIcon} label="Add to Library" onClick={onAddToLibrary} />
          <ActionButton icon={DriveFileMoveIcon} label="Move questions" onClick={onMoveQuestions} />
          <ActionButton icon={CreateNewFolderIcon} label="Move to a new block" onClick={onMoveToNewBlock} />
          <ActionButton icon={VisibilityOffIcon} label="Hide question" onClick={onHideQuestion} />
          <ActionButton icon={HideSourceIcon} label="Hide back button" onClick={onHideBackButton} />
          {showForceResponse && <ActionButton icon={TaskAltIcon} label="Force response" onClick={onForceResponse} />}
          {showUnforceResponse && <ActionButton icon={ToggleOffIcon} label="Make Optional" onClick={onUnforceResponse} />}
          <ActionButton icon={DeleteIcon} label="Delete" onClick={onDelete} isDestructive />
        </nav>
      </div>
    </aside>
  );
};