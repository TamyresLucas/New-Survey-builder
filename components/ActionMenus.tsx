import React, { useState, useMemo } from 'react';
import type { QuestionType, ToolboxItemData, Survey } from '../types';
import { ChevronRightIcon } from './icons';

export const QuestionTypeSelectionMenuContent: React.FC<{ 
  onSelect: (type: QuestionType) => void;
  toolboxItems: ToolboxItemData[];
}> = ({ onSelect, toolboxItems }) => {
    const enabledTypes = new Set(['Page Break', 'Description', 'Checkbox', 'Radio Button', 'Text Entry', 'Choice Grid']);

    const questionTypeOptions = toolboxItems
      .filter(item => item.name !== 'Block')
      .map(item => ({
        type: item.name as QuestionType,
        label: item.name,
        icon: item.icon,
        isEnabled: enabledTypes.has(item.name),
      }));

    return (
      <ul className="w-full max-h-80 overflow-y-auto bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        {questionTypeOptions.map(({ type, label, icon: Icon, isEnabled }) => (
          <li key={type}>
            <button
              onClick={(e) => {
                if (!isEnabled) return;
                e.stopPropagation();
                onSelect(type);
              }}
              disabled={!isEnabled}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                  isEnabled 
                  ? 'text-on-surface hover:bg-surface-container-high' 
                  : 'text-on-surface-variant opacity-70 cursor-not-allowed'
              }`}
            >
              <Icon className={`text-base mr-3 flex-shrink-0 ${isEnabled ? 'text-primary' : 'text-on-surface-variant'}`} />
              <span className="truncate">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    );
};


// Shared Block Actions Menu
interface BlockActionsMenuProps {
  onEdit?: () => void;
  onMoveUp?: () => void;
  canMoveUp?: boolean;
  onMoveDown?: () => void;
  canMoveDown?: boolean;
  onDuplicate?: () => void;
  onAddSimpleQuestion?: () => void;
  onAddFromLibrary?: () => void;
  onAddBlockAbove?: () => void;
  onAddBlockBelow?: () => void;
  onSelectAll?: () => void;
  canSelectAll?: boolean;
  onUnselectAll?: () => void;
  canUnselectAll?: boolean;
  onExpand?: () => void;
  canExpand?: boolean;
  onCollapse?: () => void;
  canCollapse?: boolean;
  onDelete?: () => void;
}

export const BlockActionsMenu: React.FC<BlockActionsMenuProps> = ({ onEdit, onMoveUp, canMoveUp = true, onMoveDown, canMoveDown = true, onDuplicate, onAddSimpleQuestion, onAddFromLibrary, onAddBlockAbove, onAddBlockBelow, onSelectAll, canSelectAll = true, onUnselectAll, canUnselectAll = true, onExpand, canExpand = true, onCollapse, canCollapse = true, onDelete }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      {onEdit && (
        <>
            <div className="py-1">
                <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Edit block</button>
            </div>
            <div className="border-t border-dotted border-outline-variant mx-2" />
        </>
      )}
      {(onMoveUp || onMoveDown) && (
        <>
            <div className="py-1">
                {onMoveUp && <button onClick={onMoveUp} disabled={!canMoveUp} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed">Move up</button>}
                {onMoveDown && <button onClick={onMoveDown} disabled={!canMoveDown} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed">Move down</button>}
            </div>
            <div className="border-t border-dotted border-outline-variant mx-2" />
        </>
      )}
      {onDuplicate && (
        <>
          <div className="py-1">
            <button onClick={onDuplicate} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Duplicate</button>
          </div>
          <div className="border-t border-dotted border-outline-variant mx-2" />
        </>
      )}
      <div className="py-1">
        {onAddSimpleQuestion && (
            <button onClick={onAddSimpleQuestion} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add new question</button>
        )}
        {onAddFromLibrary && <button onClick={onAddFromLibrary} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add from library</button>}
        {onAddBlockAbove && <button onClick={onAddBlockAbove} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add block above</button>}
        {onAddBlockBelow && <button onClick={onAddBlockBelow} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Add block below</button>}
      </div>
      {(canSelectAll || canUnselectAll) && <div className="border-t border-dotted border-outline-variant mx-2" />}
      <div className="py-1">
        {canSelectAll && onSelectAll && <button onClick={onSelectAll} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Select All</button>}
        {canUnselectAll && onUnselectAll && <button onClick={onUnselectAll} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Unselect All</button>}
      </div>
      {(canExpand || canCollapse) && <div className="border-t border-dotted border-outline-variant mx-2" />}
      <div className="py-1">
        {canExpand && onExpand && <button onClick={onExpand} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Expand block</button>}
        {canCollapse && onCollapse && <button onClick={onCollapse} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high">Collapse block</button>}
      </div>
      {onDelete && (
          <>
            <div className="border-t border-dotted border-outline-variant mx-2" />
            <div className="py-1">
                <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container">Delete</button>
            </div>
          </>
      )}
    </div>
  );
};


// Shared Question Actions Menu
interface QuestionActionsMenuProps {
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAddPageBreak?: () => void;
  onMoveToNewBlock?: () => void;
  onReplaceFromLibrary?: () => void;
}

export const QuestionActionsMenu: React.FC<QuestionActionsMenuProps> = ({ onDuplicate, onDelete, onAddPageBreak, onMoveToNewBlock, onReplaceFromLibrary }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <ul className="py-1">
                {onMoveToNewBlock && (
                    <li>
                        <button
                            onClick={(e) => { e.stopPropagation(); onMoveToNewBlock(); }}
                            className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest"
                        >
                            Move to new block
                        </button>
                    </li>
                )}
                {onDuplicate && <li><button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Duplicate</button></li>}
                {onReplaceFromLibrary && <li><button onClick={(e) => { e.stopPropagation(); onReplaceFromLibrary(); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Replace from library</button></li>}
                <li><button onClick={(e) => { e.stopPropagation(); alert('Not implemented'); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Add to library</button></li>
                {onAddPageBreak && <li><button onClick={(e) => { e.stopPropagation(); onAddPageBreak(); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Add page break</button></li>}
                <li><button onClick={(e) => { e.stopPropagation(); alert('Not implemented'); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Add note</button></li>
            </ul>
            {onDelete && (
                <>
                    <div className="border-t border-dotted border-outline-variant mx-2" />
                    <div className="py-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// Simplified menu for Page Break elements
interface PageBreakActionsMenuProps {
  onMoveToNewBlock?: () => void;
  onDelete?: () => void;
}

export const PageBreakActionsMenu: React.FC<PageBreakActionsMenuProps> = ({ onMoveToNewBlock, onDelete }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <ul className="py-1">
                {onMoveToNewBlock && (
                    <li>
                        <button
                            onClick={(e) => { e.stopPropagation(); onMoveToNewBlock(); }}
                            className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest"
                        >
                            Move to new block
                        </button>
                    </li>
                )}
            </ul>
            {onDelete && (
                <>
                    <div className="border-t border-dotted border-outline-variant mx-2" />
                    <div className="py-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
