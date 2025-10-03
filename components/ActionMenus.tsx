import React, { useState } from 'react';
import type { QuestionType, ToolboxItemData } from '../types';
import { ChevronRightIcon } from './icons';

export const QuestionTypeSelectionMenuContent: React.FC<{ 
  onSelect: (type: QuestionType) => void;
  toolboxItems: ToolboxItemData[];
}> = ({ onSelect, toolboxItems }) => {
    const questionTypeOptions = toolboxItems
      .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
      .map(item => ({
        type: item.name as QuestionType,
        label: item.name,
        icon: item.icon,
      }));

    return (
      <ul className="w-full max-h-80 overflow-y-auto bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        {questionTypeOptions.map(({ type, label, icon: Icon }) => (
          <li key={type}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(type);
              }}
              className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high flex items-center"
            >
              <Icon className="text-base mr-3 text-primary flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    );
};


// Shared Block Actions Menu
interface BlockActionsMenuProps {
  onDuplicate?: () => void;
  onAddQuestion?: (questionType: QuestionType) => void;
  onAddFromLibrary?: () => void;
  onAddBlockAbove?: () => void;
  onAddBlockBelow?: () => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  onDelete?: () => void;
  toolboxItems?: ToolboxItemData[];
}

export const BlockActionsMenu: React.FC<BlockActionsMenuProps> = ({ onDuplicate, onAddQuestion, onAddFromLibrary, onAddBlockAbove, onAddBlockBelow, onSelectAll, onUnselectAll, onExpand, onCollapse, onDelete, toolboxItems }) => {
  const [isAddQuestionSubMenuOpen, setIsAddQuestionSubMenuOpen] = useState(false);
  
  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {onDuplicate && (
        <>
          <div className="py-1">
            <button onClick={onDuplicate} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Duplicate</button>
          </div>
          <div className="border-t border-dotted border-outline-variant mx-2" />
        </>
      )}
      <div className="py-1">
        {onAddQuestion && toolboxItems && (
          <div className="relative" onMouseEnter={() => setIsAddQuestionSubMenuOpen(true)} onMouseLeave={() => setIsAddQuestionSubMenuOpen(false)}>
            <button className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high flex justify-between items-center">
                <span>Add new question</span>
                <ChevronRightIcon className="text-base" />
            </button>
            {isAddQuestionSubMenuOpen && (
                <div className="absolute top-0 left-full ml-1 w-64">
                    <QuestionTypeSelectionMenuContent onSelect={onAddQuestion} toolboxItems={toolboxItems} />
                </div>
            )}
          </div>
        )}
        {onAddBlockAbove && <button onClick={onAddBlockAbove} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add block above</button>}
        {onAddBlockBelow && <button onClick={onAddBlockBelow} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add block below</button>}
        {onAddFromLibrary && <button onClick={onAddFromLibrary} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add from library</button>}
      </div>
      <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        {onSelectAll && <button onClick={onSelectAll} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Select All</button>}
        {onUnselectAll && <button onClick={onUnselectAll} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Unselect All</button>}
      </div>
      <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        {onExpand && <button onClick={onExpand} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Expand block</button>}
        {onCollapse && <button onClick={onCollapse} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Collapse block</button>}
      </div>
      <div className="border-t border-dotted border-outline-variant mx-2" />
      <div className="py-1">
        {onDelete && <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container">Delete</button>}
      </div>
    </div>
  );
};


// Shared Question Actions Menu
interface QuestionActionsMenuProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onAddPageBreak: () => void;
}

export const QuestionActionsMenu: React.FC<QuestionActionsMenuProps> = ({ onDuplicate, onDelete, onAddPageBreak }) => {
    const menuItems = [
        { label: 'Move to block', action: () => {} },
        { label: 'Duplicate', action: onDuplicate },
        { label: 'Replace from library', action: () => {} },
        { label: 'Add to library', action: () => {} },
        { label: 'Add page break', action: onAddPageBreak },
        { label: 'Add note', action: () => {} },
    ];

    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        <ul className="py-1">
            {menuItems.map((item) => (
            <li key={item.label}>
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                }}
                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest"
                >
                {item.label}
                </button>
            </li>
            ))}
        </ul>
        <div className="border-t border-dotted border-outline-variant mx-2" />
        <div className="py-1">
            <button
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container"
            >
            Delete
            </button>
        </div>
        </div>
    );
};
