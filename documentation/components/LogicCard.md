# Logic Card Component

The Logic Card component displays applied logic (Display, Skip, Branching) within a Question Card or Block. It provides a summary of the logic rules and allows for editing or removal.

## Structure

```tsx
<div className="mt-4 p-3 border rounded-md bg-surface-container-high relative group/logic transition-colors cursor-pointer ...">
  {/* Header */}
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <Icon className="text-lg text-primary" />
      <h4 className="text-sm font-semibold text-on-surface">Logic Title</h4>
    </div>
    <button className="text-on-surface-variant hover:text-error opacity-0 group-hover/logic:opacity-100 ...">
      <XIcon className="text-base" />
    </button>
  </div>

  {/* Content */}
  <div className="pl-2 space-y-1 text-sm text-on-surface-variant">
    <p>Logic summary text...</p>
    {/* Conditions/Rules */}
  </div>

  {/* Optional: Issue Card */}
  <IssueCard issues={...} />
</div>
```

## Styling Specifications

-   **Margin**: `mt-4` (16px top spacing from previous element)
-   **Padding**: `p-3` (12px)
-   **Border**: `border` (1px)
-   **Radius**: `rounded-md` (6px)
-   **Background**: `bg-surface-container-high`
-   **Cursor**: `cursor-pointer` (Indicates clickable to edit)
-   **Transition**: `transition-colors`

## States & Color Tokens

| State | Background | Border | Ring | Text |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-surface-container-high` | `border-outline-variant` | None | `text-on-surface-variant` |
| **Focused/Active** | `bg-surface-container-high` | `border-primary` | `ring-1 ring-primary` | `text-on-surface-variant` |
| **Hover (Card)** | `bg-surface-container-high` | `border-outline-variant` | None | - |

### Child Elements

-   **Icon**: `text-lg text-primary`
-   **Title**: `text-sm font-semibold text-on-surface`
-   **Remove Button**:
    -   Default: `text-on-surface-variant opacity-0` (Hidden)
    -   Group Hover: `opacity-100` (Visible)
    -   Hover: `text-error bg-error/10`
-   **Content Text**: `text-sm text-on-surface-variant`
-   **Keywords (IF, THEN, etc.)**: `font-semibold text-primary` or `text-on-surface`

## Variants

1.  **Display Logic**: Shows conditions for displaying the question.
2.  **Skip Logic**: Shows rules for skipping to other questions/blocks.
3.  **Branching Logic**: Shows complex branching paths.
4.  **Survey Flow**: Shows default flow (dashed border variant).

## Usage

-   **Question Card**: Displayed at the bottom of the card content when logic is applied.
-   **Survey Block**: Displayed at the bottom of the block for flow logic.
-   **Interaction**: Click the card to open the Logic Editor. Click the 'X' button to remove the logic.
