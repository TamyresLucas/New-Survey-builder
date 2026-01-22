# Implementation Plan - Refactor ToolboxItem

This plan outlines the steps to refactor the `ToolboxItem` component in the Design System to match the PRD and Technical Specifications, incorporating user feedback.

## Goal Description
Refactor the `ToolboxItem` component to match the `SidebarToolboxItem` legacy functionality but using the Design System tokens, ensuring accessibility, and providing comprehensive documentation in Storybook.

## User Review Required
> [!IMPORTANT]
> - **Prop Name Change**: `isDragged` will be renamed to `isDragging`.
> - **New Data File**: A new file `src/data/toolbox-items.ts` will be created to centralize question type definitions.
> - **Story Location**: Stories will be created in `src/components/ToolboxItem.stories.tsx` (or `src/stories/ToolboxItem.stories.tsx` to match project structure if necessary).

## Proposed Changes

### Design System Package (`packages/design-system`)

#### [MODIFY] [toolbox-item.tsx](packages/design-system/src/components/ui/toolbox-item.tsx)
- Rename `isDragged` -> `isDragging`.
- Remove inline `fontFamily`.
- Update border: `border-primary/20`.
- Update hover: `bg-muted`.
- Add ARIA attributes per PRD.
- Use `DragIndicator` icon from existing icons (or ensure it's imported correctly).

#### [CREATE] [toolbox-items.ts](packages/design-system/src/data/toolbox-items.ts)
- Export `toolboxItems` array (40 items).
- Export `questionGroups` object (7 groups).
- Export icon mapping.

#### [CREATE] [ToolboxItem.stories.tsx](packages/design-system/src/stories/ToolboxItem.stories.tsx)
*Note: Placing in `src/stories/` to align with existing `SidebarToolboxItem.stories.tsx` unless strict co-location is enforced.*
- Create stories: `Default`, `AllStates`, `Disabled`, `Dragging`, `WithEndAction`.
- Create stories: `AllQuestionTypes`, `GroupedByCategory`.

#### [DELETE] [SidebarToolboxItem.stories.tsx](packages/design-system/src/stories/SidebarToolboxItem.stories.tsx)
- Remove the legacy story file.

## Verification Plan

### Automated Tests
- Run Storybook and verify visually.

### Manual Verification
- Check all states in Storybook (Hover, Dragging, Disabled).
- Check the "All Question Types" catalog to ensure icons render correctly.
- Verify accessibility (Tab order, Focus rings).
