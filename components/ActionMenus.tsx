import React, { useState, useMemo } from 'react';
import type { Question, QuestionType, ToolboxItemData, Survey } from '../types';
import { ChevronRightIcon } from './icons';
import { DropdownList, DropdownItem, DropdownDivider } from './DropdownList';

export const QuestionTypeSelectionMenuContent: React.FC<{
  onSelect: (type: QuestionType) => void;
  toolboxItems: ToolboxItemData[];
}> = ({ onSelect, toolboxItems }) => {
  const enabledTypes = new Set(['Description', 'Checkbox', 'Radio Button', 'Text Entry', 'Choice Grid']);

  const questionTypeOptions = toolboxItems
    .filter(item => item.name !== 'Block' && item.name !== 'Page Break')
    .map(item => ({
      type: item.name as QuestionType,
      label: item.name,
      icon: item.icon,
      isEnabled: enabledTypes.has(item.name),
    }));

  return (
    <DropdownList className="w-full max-h-80 overflow-y-auto">
      {questionTypeOptions.map(({ type, label, icon: Icon, isEnabled }) => (
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
      ))}
    </DropdownList>
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
      {onEdit && (
        <>
          <DropdownItem onClick={onEdit}>Edit block</DropdownItem>
          <DropdownDivider />
        </>
      )}
      {(onMoveUp || onMoveDown) && (
        <>
          {onMoveUp && <DropdownItem onClick={onMoveUp} disabled={!canMoveUp}>Move up</DropdownItem>}
          {onMoveDown && <DropdownItem onClick={onMoveDown} disabled={!canMoveDown}>Move down</DropdownItem>}
          <DropdownDivider />
        </>
      )}
      {onDuplicate && (
        <>
          <DropdownItem onClick={onDuplicate}>Duplicate</DropdownItem>
          <DropdownDivider />
        </>
      )}

      {onAddSimpleQuestion && (
        <DropdownItem onClick={onAddSimpleQuestion}>Add new question</DropdownItem>
      )}
      {onAddFromLibrary && <DropdownItem onClick={onAddFromLibrary}>Add from library</DropdownItem>}
      {onAddBlockAbove && <DropdownItem onClick={onAddBlockAbove}>Add block above</DropdownItem>}
      {onAddBlockBelow && <DropdownItem onClick={onAddBlockBelow}>Add block below</DropdownItem>}

      {(canSelectAll || canUnselectAll) && <DropdownDivider />}

      {canSelectAll && onSelectAll && <DropdownItem onClick={onSelectAll}>Select All</DropdownItem>}
      {canUnselectAll && onUnselectAll && <DropdownItem onClick={onUnselectAll}>Unselect All</DropdownItem>}

      {(canExpand || canCollapse) && <DropdownDivider />}

      {canExpand && onExpand && <DropdownItem onClick={onExpand}>Expand block</DropdownItem>}
      {canCollapse && onCollapse && <DropdownItem onClick={onCollapse}>Collapse block</DropdownItem>}

      {onDelete && (
        <>
          <DropdownDivider />
          <DropdownItem onClick={onDelete} variant="danger">Delete</DropdownItem>
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
  onMoveToNewBlock?: () => void;
  onReplaceFromLibrary?: () => void;
  onPreview?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export const QuestionActionsMenu: React.FC<QuestionActionsMenuProps> = ({ question, onDuplicate, onDelete, onAddPageBreak, onMoveToNewBlock, onReplaceFromLibrary, onPreview, onActivate, onDeactivate }) => {
  return (
    <DropdownList className="absolute top-full right-0 mt-2 w-56">
      {onMoveToNewBlock && (
        <DropdownItem onClick={(e) => { e.stopPropagation(); onMoveToNewBlock(); }}>
          Move to new block
        </DropdownItem>
      )}
      {onDuplicate && <DropdownItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>Duplicate</DropdownItem>}
      {onReplaceFromLibrary && <DropdownItem onClick={(e) => { e.stopPropagation(); onReplaceFromLibrary(); }}>Replace from library</DropdownItem>}
      <DropdownItem onClick={(e) => { e.stopPropagation(); alert('Not implemented'); }}>Add to library</DropdownItem>
      {onAddPageBreak && <DropdownItem onClick={(e) => { e.stopPropagation(); onAddPageBreak(); }}>Add page break</DropdownItem>}

      {onPreview && (
        <>
          <DropdownDivider />
          <DropdownItem onClick={(e) => { e.stopPropagation(); onPreview(); }}>Preview</DropdownItem>
        </>
      )}
      {(onActivate || onDeactivate) && (
        <>
          <DropdownDivider />
          {question.isHidden ? (
            onActivate && <DropdownItem onClick={(e) => { e.stopPropagation(); onActivate(); }}>Activate</DropdownItem>
          ) : (
            onDeactivate && <DropdownItem onClick={(e) => { e.stopPropagation(); onDeactivate(); }}>Deactivate</DropdownItem>
          )}
        </>
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