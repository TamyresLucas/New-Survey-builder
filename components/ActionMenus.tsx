import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import type { Question, QuestionType, ToolboxItemData, Survey, Block } from '../types';
import {
  ChevronRightIcon, ChevronLeftIcon, BlockIcon,
  PageBreakIcon, ArrowUpIcon, ArrowDownIcon, DriveFileMoveIcon,
  ContentCopyIcon, LibraryAddIcon, EyeIcon, VisibilityOffIcon,
  DeleteIcon, CheckCircleIcon, PlusIcon,
  EditIcon, CheckboxFilledIcon, CheckboxOutlineIcon,
  UnfoldMoreIcon, UnfoldLessIcon, SearchIcon
} from './icons';

import { DropdownList, DropdownItem, DropdownDivider } from './DropdownList';

export const QuestionTypeSelectionMenuContent: React.FC<{
  onSelect: (type: QuestionType) => void;
  toolboxItems: ToolboxItemData[];
}> = ({ onSelect, toolboxItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the search input when the menu opens
    inputRef.current?.focus();
  }, []);

  const enabledTypes = new Set(['Description', 'Check Box', 'Radio Button', 'Text Input', 'Choice Grid']);

  const questionTypeOptions = useMemo(() => toolboxItems
    .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(item => ({
      type: item.name as QuestionType,
      label: item.name,
      icon: item.icon,
      isEnabled: enabledTypes.has(item.name),
    })), [toolboxItems, searchTerm]);

  return (
    <div className="flex flex-col bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 overflow-hidden w-full">
      <div className="p-2 border-b border-outline-variant bg-surface-container-low sticky top-0 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <SearchIcon className="text-base text-on-surface-variant" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full h-[32px] bg-surface-container-highest border border-outline-variant rounded px-8 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline focus:outline-2 focus:outline-primary transition-colors"
            placeholder="Search question types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="max-h-[512px] overflow-y-auto py-1">
        {questionTypeOptions.length > 0 ? (
          questionTypeOptions.map(({ type, label, icon: Icon, isEnabled }) => (
            <DropdownItem
              key={type}
              onClick={(e) => {
                if (isEnabled) {
                  e.stopPropagation();
                  onSelect(type);
                }
              }}
              disabled={!isEnabled}
              icon={Icon}
            >
              {label}
            </DropdownItem>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-on-surface-variant text-center italic">
            No question types found
          </div>
        )}
      </div>
    </div>
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
    <DropdownList className="absolute top-full right-0 mt-2 w-48">
      {/* Add Actions - Primary Color */}
      {onAddSimpleQuestion && (
        <DropdownItem onClick={onAddSimpleQuestion} icon={PlusIcon} variant="primary">Add new question</DropdownItem>
      )}
      {onAddBlockAbove && <DropdownItem onClick={onAddBlockAbove} icon={PlusIcon} variant="primary">Add block above</DropdownItem>}
      {onAddBlockBelow && <DropdownItem onClick={onAddBlockBelow} icon={PlusIcon} variant="primary">Add block below</DropdownItem>}

      <DropdownDivider />

      {/* Move Actions */}
      {onMoveUp && <DropdownItem onClick={onMoveUp} disabled={!canMoveUp} icon={ArrowUpIcon}>Move up</DropdownItem>}
      {onMoveDown && <DropdownItem onClick={onMoveDown} disabled={!canMoveDown} icon={ArrowDownIcon}>Move down</DropdownItem>}

      {/* Duplicate */}
      {onDuplicate && (
        <DropdownItem onClick={onDuplicate} icon={ContentCopyIcon}>Duplicate</DropdownItem>
      )}

      {/* Save to Library */}
      {onAddFromLibrary && (
        <DropdownItem onClick={onAddFromLibrary} icon={LibraryAddIcon}>Save to library</DropdownItem>
      )}

      {/* Edit Block */}
      {onEdit && (
        <DropdownItem onClick={onEdit} icon={EditIcon}>Edit block</DropdownItem>
      )}

      {/* Expand/Collapse */}
      {(canExpand || canCollapse) && <DropdownDivider />}
      {canExpand && onExpand && <DropdownItem onClick={onExpand} icon={UnfoldMoreIcon}>Expand block</DropdownItem>}
      {canCollapse && onCollapse && <DropdownItem onClick={onCollapse} icon={UnfoldLessIcon}>Collapse block</DropdownItem>}

      {/* Bulk Edit / Unselect All */}
      {(canSelectAll || canUnselectAll) && <DropdownDivider />}
      {canSelectAll && onSelectAll && <DropdownItem onClick={onSelectAll} icon={EditIcon}>Bulk edit</DropdownItem>}
      {canUnselectAll && onUnselectAll && <DropdownItem onClick={onUnselectAll} icon={CheckboxOutlineIcon}>Unselect all</DropdownItem>}

      {/* Delete */}
      {onDelete && (
        <>
          <DropdownDivider />
          <DropdownItem onClick={onDelete} variant="danger" icon={DeleteIcon}>Delete</DropdownItem>
        </>
      )}
    </DropdownList>
  );
};


// Shared Question Actions Menu
interface QuestionActionsMenuProps {
  question: Question;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAddPageBreak?: () => void;
  onAddQuestionAbove?: () => void;
  onAddQuestionBelow?: () => void;
  onMoveToNewBlock?: () => void;
  onReplaceFromLibrary?: () => void;
  onAddToLibrary?: () => void;
  onPreview?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  blocks?: Block[];
  onMoveToBlock?: (blockId: string | 'new') => void;
  onMoveTo?: () => void;
  onBulkEdit?: () => void;
}

export const QuestionActionsMenu: React.FC<QuestionActionsMenuProps> = ({
  question,
  onDuplicate,
  onDelete,
  onAddPageBreak,
  onAddQuestionAbove,
  onAddQuestionBelow,
  onMoveToNewBlock,
  onReplaceFromLibrary,
  onAddToLibrary,
  onPreview,
  onActivate,
  onDeactivate,
  blocks,
  onMoveToBlock,
  onMoveTo,
  onBulkEdit
}) => {
  const [submenu, setSubmenu] = useState<'main' | 'moveto'>('main');
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Smart positioning: detect if menu would overflow bottom of viewport
  useLayoutEffect(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.top;
      const spaceAbove = rect.top;

      // If not enough space below (menu height ~400px for main, ~500px for moveto with many blocks)
      const estimatedMenuHeight = submenu === 'moveto' ? 500 : 400;

      if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [submenu]);

  // Reset positioning when submenu changes
  useEffect(() => {
    setOpenUpward(false);
  }, [submenu]);

  if (submenu === 'moveto' && blocks && onMoveToBlock && !onMoveTo) {
    const positionClasses = openUpward
      ? 'absolute bottom-full right-0 mb-2 w-64 max-h-80 overflow-y-auto'
      : 'absolute top-full right-0 mt-2 w-64 max-h-80 overflow-y-auto';

    return (
      <div ref={dropdownRef}>
        <DropdownList className={positionClasses}>
          <DropdownItem
            onClick={(e) => { e.stopPropagation(); setSubmenu('main'); }}
            icon={ChevronLeftIcon}
          >
            Back
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            onClick={(e) => { e.stopPropagation(); onMoveToBlock('new'); }}
            icon={BlockIcon}
          >
            New block
          </DropdownItem>
          <div className="border-t border-outline-variant my-1"></div>
          {blocks.map(block => (
            <DropdownItem
              key={block.id}
              onClick={(e) => { e.stopPropagation(); onMoveToBlock(block.id); }}
              icon={BlockIcon}
            >
              {block.title || 'Untitled Block'}
            </DropdownItem>
          ))}
        </DropdownList>
      </div>
    );
  }

  const positionClasses = openUpward
    ? 'absolute bottom-full right-0 mb-2 w-64'
    : 'absolute top-full right-0 mt-2 w-64';

  return (
    <div ref={dropdownRef}>
      <DropdownList className={positionClasses}>
        {/* Add Page Break */}
        {onAddPageBreak && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onAddPageBreak(); }} icon={PlusIcon} variant="primary">
            Add page break
          </DropdownItem>
        )}

        {/* Add Question Above/Below */}
        {onAddQuestionAbove && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onAddQuestionAbove(); }} icon={PlusIcon} variant="primary">
            Add question above
          </DropdownItem>
        )}
        {onAddQuestionBelow && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onAddQuestionBelow(); }} icon={PlusIcon} variant="primary">
            Add question below
          </DropdownItem>
        )}



        <DropdownDivider />

        {/* Move To */}
        {onMoveTo ? (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onMoveTo(); }} icon={DriveFileMoveIcon}>
            Move to
          </DropdownItem>
        ) : onMoveToBlock && blocks ? (
          <DropdownItem
            onClick={(e) => { e.stopPropagation(); setSubmenu('moveto'); }}
            icon={DriveFileMoveIcon}
          >
            <div className="flex items-center justify-between w-full">
              <span>Move to</span>
              <ChevronRightIcon className="text-base" />
            </div>
          </DropdownItem>
        ) : onMoveToNewBlock && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onMoveToNewBlock(); }} icon={DriveFileMoveIcon}>
            Move to new block
          </DropdownItem>
        )}

        {/* Duplicate */}
        {onDuplicate && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }} icon={ContentCopyIcon}>
            Duplicate
          </DropdownItem>
        )}

        {/* Save to Library */}
        <DropdownItem
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToLibrary) onAddToLibrary();
            else alert('Not implemented');
          }}
          icon={LibraryAddIcon}
        >
          Save to library
        </DropdownItem>

        {/* Bulk Edit */}
        {onBulkEdit && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onBulkEdit(); }} icon={EditIcon}>
            Bulk edit
          </DropdownItem>
        )}

        {/* Preview */}
        {onPreview && (
          <DropdownItem onClick={(e) => { e.stopPropagation(); onPreview(); }} icon={EyeIcon}>
            Preview
          </DropdownItem>
        )}

        <DropdownDivider />

        {/* Activate / Deactivate */}
        {(onActivate || onDeactivate) && (
          <>
            {question.isHidden ? (
              onActivate && <DropdownItem onClick={(e) => { e.stopPropagation(); onActivate(); }} icon={CheckCircleIcon}>Activate</DropdownItem>
            ) : (
              onDeactivate && <DropdownItem onClick={(e) => { e.stopPropagation(); onDeactivate(); }} icon={VisibilityOffIcon}>Deactivate</DropdownItem>
            )}
          </>
        )}

        {/* Delete */}
        {onDelete && (
          <>
            <DropdownItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              variant="danger"
              icon={DeleteIcon}
            >
              Delete
            </DropdownItem>
          </>
        )}
      </DropdownList>
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
    <DropdownList className="absolute top-full right-0 mt-2 w-56">
      {onMoveToNewBlock && (
        <DropdownItem onClick={(e) => { e.stopPropagation(); onMoveToNewBlock(); }}>
          Move to new block
        </DropdownItem>
      )}
      {onDelete && (
        <>
          <DropdownDivider />
          <DropdownItem
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            variant="danger"
          >
            Delete
          </DropdownItem>
        </>
      )}
    </DropdownList>
  );
};