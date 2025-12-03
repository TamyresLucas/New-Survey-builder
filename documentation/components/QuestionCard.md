# Question Card Component

The Question Card is the primary interface for editing questions within the Survey Canvas. It encapsulates all settings, content, and actions for a single question.

## Structure

The card uses a grid layout to align the selection checkbox with the content.

```tsx
<div className="p-4 rounded-lg border transition-all cursor-grab group grid grid-cols-[auto_1fr] items-start gap-x-3 relative ...">
  {/* Column 1: Selection Checkbox */}
  <input type="checkbox" className="h-4 w-4 ..." />

  {/* Column 2: Content */}
  <div className="col-start-2 min-w-0">
    {/* Header: ID, Tags, Type Selector, Actions */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center ...">
        <span className="font-bold ...">QID</span>
        {/* Tags */}
      </div>
      <div className="flex items-center gap-2">
        <QuestionTypeSelector />
        <QuestionActionsButton />
      </div>
    </div>

    {/* Body: Question Text */}
    <EditableText className="text-on-surface min-h-[24px] ..." />

    {/* Body: Input Area (Varies by Type) */}
    <div className="mt-4">
      {/* Radio, Checkbox, Text Entry, etc. */}
    </div>
  </div>
</div>
```

## Styling Specifications

-   **Padding**: `p-4` (16px)
-   **Border**: `border` (1px)
-   **Radius**: `rounded-lg` (8px)
-   **Layout**: `grid grid-cols-[auto_1fr]` with `gap-x-3` (12px)
-   **Cursor**: `cursor-grab` (Indicates draggability)
-   **Transition**: `transition-all`

## States & Color Tokens

| State | Background | Border | Shadow | Opacity |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-surface` (Implicit) | `border-outline-variant` | None | 100% |
| **Hover** | `bg-surface` | `border-outline` | `shadow-md` | 100% |
| **Selected** | `bg-surface` | `border-primary` | `shadow-md` | 100% |
| **Selected (Error)** | `bg-surface` | `border-error` | `shadow-md` | 100% |
| **Hidden** | `bg-surface-container` | `border-outline-variant` | None | 60% |
| **Dragged** | `bg-surface` | `border-outline-variant` | None | 50% |

### Child Elements

-   **Checkbox**:
    -   Size: `h-4 w-4`
    -   Color: `text-primary`
    -   Border: `border-input-border`
-   **Question ID**: `font-bold text-on-surface`
-   **Question Text**: `text-on-surface`
-   **Input Elements**:
    -   Radio/Checkbox Icons: `text-xl` (`text-primary` for selected, `text-on-surface-variant` for unselected)
    -   Text Inputs: `border-input-border rounded-md p-2 text-sm`

## Components Used

-   **Question Type Selector**: See `QuestionSelectorDropdown.md` (Note: Uses specific 32px height implementation).
-   **Question Actions**: Small Tertiary Button (`w-8 h-8`).
-   **Tags**: See `Tag.md`.

## Usage

-   **Survey Canvas**: Represents individual questions within a Block.
-   **Interaction**:
    -   Click anywhere to select.
    -   Drag to reorder.
    -   Use the header controls to change type or perform actions.
    -   Edit text inline.
