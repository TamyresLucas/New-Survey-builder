# BlockActionsMenu

-   **File Location**: `components/ActionMenus.tsx`
-   **Component Name**: `BlockActionsMenu`

## Purpose

The `BlockActionsMenu` is a unified, context-aware dropdown component that provides users with a consistent set of actions for a survey block. It is designed to be highly reusable and adaptable, showing only the actions that are relevant to the context in which it's used.

## Usage

This component is triggered by clicking the "three-dots" icon on a block and is used in two primary locations:

1.  **Build Panel > Content Tab (`BuildPanel.tsx`)**: In this context, the menu provides a comprehensive set of actions, including editing, reordering, duplicating, and deleting blocks.
2.  **Survey Canvas (`SurveyBlock.tsx`)**: On the main canvas, the menu provides a slightly reduced set of actions. For example, "Move up/down" is omitted because reordering is handled via drag-and-drop in this view.

The component's flexibility comes from its props-driven rendering. An action is only displayed in the menu if its corresponding `on...` callback function is passed as a prop.

## Design & UX

-   **Appearance**: Styled as an MD3-style menu, appearing as an absolutely positioned floating panel.
-   **Grouping**: Actions are logically grouped and separated by dotted dividers for improved scannability:
    -   Primary actions (Edit)
    -   Movement (Move up/down)
    -   Creation (Duplicate, Add question/block)
    -   Selection (Select/Unselect all)
    -   State changes (Collapse/Expand)
    -   Destructive actions (Delete)
-   **Contextual Disabling**: The menu accepts boolean `can...` props (e.g., `canMoveUp`) which control the `disabled` state of menu items, providing clear visual feedback to the user about which actions are currently available.

## Props (API)

| Prop              | Type                | Description                                                                  |
| ----------------- | ------------------- | ---------------------------------------------------------------------------- |
| `onEdit`          | `() => void`        | Triggers opening the block editor sidebar.                                   |
| `onMoveUp`        | `() => void`        | Moves the block one position up in the survey.                               |
| `canMoveUp`       | `boolean`           | If `false`, the "Move up" option is disabled.                                |
| `onMoveDown`      | `() => void`        | Moves the block one position down in the survey.                             |
| `canMoveDown`     | `boolean`           | If `false`, the "Move down" option is disabled.                              |
| `onDuplicate`     | `() => void`        | Creates a copy of the block immediately below the original.                  |
| `onAddSimpleQuestion` | `() => void`    | Adds a new, default question to the end of the block.                        |
| `onAddFromLibrary` | `() => void`       | (Not implemented) Triggers opening the content library to add items.         |
| `onAddBlockAbove` | `() => void`        | Adds a new, empty block directly above the current one.                      |
| `onAddBlockBelow` | `() => void`        | Adds a new, empty block directly below the current one.                      |
| `onSelectAll`     | `() => void`        | Checks all questions within the block for bulk editing.                      |
| `canSelectAll`    | `boolean`           | If `false`, the "Select All" option is disabled.                             |
| `onUnselectAll`   | `() => void`        | Unchecks all questions within the block.                                     |
| `canUnselectAll`  | `boolean`           | If `false`, the "Unselect All" option is disabled.                           |
| `onExpand`        | `() => void`        | Expands a collapsed block to show its questions.                             |
| `canExpand`       | `boolean`           | If `false`, the "Expand block" option is disabled.                           |
| `onCollapse`      | `() => void`        | Collapses an expanded block to hide its questions.                           |
| `canCollapse`     | `boolean`           | If `false`, the "Collapse block" option is disabled.                         |
| `onDelete`        | `() => void`        | Deletes the block and all questions within it (displays in red).             |
