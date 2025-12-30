# BranchingLogicEditor

**File:** `components/logic-editor/BranchingLogicEditor.tsx`

## Purpose

This component handles the complex logic for routing survey questions. It allows users to define conditions (e.g., "If Question 1 is Yes") and destinations (e.g., "Then go to Question 2").

## Usage

Used within the "Advanced Logic" or "Logic Editor" tab of a question. It is the primary interface for defining flow control.

## Patterns

### Draft-Confirm Workflow
This component implements the **Draft-Confirm** pattern to prevent accidental logic breaks:
1.  **Draft State**: Changes made in the UI update local `draft` state (e.g., `draftBranchingLogic`). The main graph is NOT updated yet.
2.  **Confirm**: The user must click "Apply changes" (or similar) to commit the draft to the actual survey state, triggering a re-render of the diagram.
3.  **Cancel**: Discards the draft and reverts UI to the confirmed state.

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `question` | `Question` | - | Yes | The source question for the logic. |
| `survey` | `Survey` | - | Yes | Full survey context (for finding destinations). |
| `onSave` | `(logic) => void` | - | Yes | Callback to commit changes. |
| `onCancel` | `() => void` | - | No | Callback to discard changes. |

## States

| State | Appearance | Classes Used |
|-------|------------|--------------|
| View Mode | Read-only summary of logic | `bg-surface` |
| Edit Mode | Form controls visible | `bg-surface-container` |
| Draft Active | "Apply" button enabled | `bg-primary` |
| Error | Invalid condition red border | `border-error` |

## Accessibility

- [ ] Focus management when switching between View and Edit modes.
- [x] Logic conditions grouped by `<fieldset>`.
- [x] Dropdowns for Questions/Answers must have unique labels.
- [x] "Apply" button clearly indicates status (Disabled until changes made).

## Related Components

- `LogicExpression`: Renders individual condition rows (If X is Y).
- `LogicQuestionCard`: The card container for this editor.
