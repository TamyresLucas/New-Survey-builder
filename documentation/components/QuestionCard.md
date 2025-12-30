# QuestionCard

**File:** `components/QuestionCard.tsx`

## Purpose

The central component for displaying and editing a single survey question. It handles the display of the question text, input fields (based on type), and access to question-level actions (delete, duplicate, settings). It supports a specialized **Print View** for static rendering.

## Usage

This component is the primary building block of the "Build" view. It is rendered within a list of blocks/pages.

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `question` | `Question` | - | Yes | The full question object from state. |
| `index` | `number` | - | Yes | Position in the list (view only). |
| `isActive` | `boolean` | `false` | No | Whether this card is currently selected. |
| `printMode` | `boolean` | `false` | No | If `true`, renders in read-only Print View. |
| `onClick` | `() => void` | - | No | Callback when card is clicked. |
| `onUpdate` | `(q) => void` | - | Yes | Callback to update question data. |

## States

| State | Appearance | Classes Used |
|-------|------------|--------------|
| Default | White card with border | `bg-surface-container border-outline-variant` |
| Active/Selected | Blue border, elevated | `border-primary ring-1 ring-primary` |
| Hover | Subtle border darken | `hover:border-outline-hover` |
| Dragging | Reduced opacity, shadow | `opacity-50 shadow-elevation-3` |
| Print Mode | Simplified, no controls | (See below) |

## Print View State

The Print View state (`printMode={true}`) represents the question for static printing:

### Hidden Elements
1.  **Question Type Selector**: Dropdown hidden.
2.  **Action Menu**: "More Actions" hidden.
3.  **Add/Remove Controls**: All "+" and "x" buttons hidden.
4.  **Drag Indicators**: Handles hidden.
5.  **Page Break Actions**: Hidden.

### Visual Changes
*   Maintains Grid layout but removes "chrome".
*   Input fields remain as static placeholders.

## Accessibility

- [x] **Focus Order**: Card itself should be focusable if acts as selection.
- [x] **Headings**: Question text should use standard heading hierarchy (h3/h4) relative to page.
- [x] **ARIA**:
    -   `aria-selected={isActive}` on the card container.
    -   `aria-label` for "More Actions" menu.

## Related Components

- `LogicQuestionCard` — Simplified version used in the Logic Editor view.
- `PrintQuestionCard` — (Note: This might be deprecated if QuestionCard handles printMode internally, or this is the specialized component itself).
