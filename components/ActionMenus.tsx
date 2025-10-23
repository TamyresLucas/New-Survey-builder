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

export const BlockActionsMenu: React.FC<BlockActionsMenuProps> = ({ onDuplicate, onAddSimpleQuestion, onAddFromLibrary, onAddBlockAbove, onAddBlockBelow, onSelectAll, canSelectAll = true, onUnselectAll, canUnselectAll = true, onExpand, canExpand = true, onCollapse, canCollapse = true, onDelete }) => {
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
  survey: Survey;
  currentBlockId: string;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAddPageBreak?: () => void;
  onMoveToNewBlock?: () => void;
  onMoveToExistingBlock?: (targetBlockId: string) => void;
}

export const QuestionActionsMenu: React.FC<QuestionActionsMenuProps> = ({ survey, currentBlockId, onDuplicate, onDelete, onAddPageBreak, onMoveToNewBlock, onMoveToExistingBlock }) => {
    const [isMoveSubMenuOpen, setIsMoveSubMenuOpen] = useState(false);
    
    const otherBlocks = useMemo(() => 
        survey.blocks.filter(b => b.id !== currentBlockId),
        [survey.blocks, currentBlockId]
    );

    const showMoveToSubMenu = otherBlocks.length > 0;

    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant rounded-md shadow-lg z-20" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            <ul className="py-1">
                {onMoveToNewBlock && onMoveToExistingBlock && (
                    <li 
                        className="relative"
                        onMouseEnter={() => showMoveToSubMenu && setIsMoveSubMenuOpen(true)}
                        onMouseLeave={() => showMoveToSubMenu && setIsMoveSubMenuOpen(false)}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!showMoveToSubMenu) {
                                    onMoveToNewBlock();
                                }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest flex justify-between items-center"
                        >
                            <span>{showMoveToSubMenu ? 'Move to' : 'Move to new block'}</span>
                            {showMoveToSubMenu && <ChevronRightIcon className="text-base" />}
                        </button>
                        {showMoveToSubMenu && isMoveSubMenuOpen && (
                            <div className="absolute top-0 left-full ml-1 w-56 bg-surface-container-high border border-outline-variant rounded-md shadow-lg z-30">
                                <ul className="py-1 max-h-48 overflow-y-auto">
                                    {otherBlocks.map(block => (
                                        <li key={block.id}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onMoveToExistingBlock(block.id); }}
                                                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest truncate"
                                                title={`${block.bid}: ${block.title}`}
                                            >
                                                {block.bid}: {block.title}
                                            </button>
                                        </li>
                                    ))}
                                    <div className="border-t border-dotted border-outline-variant mx-2" />
                                    <li>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onMoveToNewBlock(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest"
                                        >
                                            New block
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </li>
                )}
                {onDuplicate && <li><button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Duplicate</button></li>}
                <li><button onClick={(e) => { e.stopPropagation(); alert('Not implemented'); }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest">Replace from library</button></li>
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