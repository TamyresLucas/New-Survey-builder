# Incoming Logic Display Component

The Incoming Logic Display is a specialized variant of the Logic Card used to display branching logic that targets the current Block from a previous question (e.g., "Branch Name: Q1 -> Current Block").

## Structure

```tsx
<div className="p-3 border border-outline-variant rounded-md bg-surface-container-high cursor-pointer hover:border-primary ...">
  {/* Header */}
  <div className="flex items-center justify-between gap-2 mb-2">
    <div className="flex items-center gap-2">
      <CallSplitIcon className="text-lg text-primary" />
      <h4 className="text-sm font-bold text-on-surface">Branch Name</h4>
    </div>
  </div>

  {/* Content */}
  <div className="pl-2 space-y-1 text-sm text-on-surface-variant flex items-center gap-1">
    <span className="font-semibold text-on-surface">SourceQ_ID</span>
    <ArrowRightAltIcon className="text-base text-on-surface-variant rotate-0" />
    <span className="font-semibold text-on-surface">Current Block</span>.
  </div>
</div>
```

## Styling Specifications

-   **Padding**: `p-3` (12px)
-   **Border**: `border` (1px solid)
-   **Radius**: `rounded-md` (6px)
-   **Background**: `bg-surface-container-high`
-   **Cursor**: `cursor-pointer`
-   **Hover**: `hover:border-primary`
-   **Margin**: `mb-4` (when rendered in list)

## States & Color Tokens

| State | Background | Border | Text | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-surface-container-high` | `border-outline-variant` | `text-on-surface-variant` | `text-primary` |
| **Hover** | `bg-surface-container-high` | `border-primary` | `text-on-surface-variant` | `text-primary` |

### Child Elements

-   **Icon**: `text-lg text-primary` (CallSplitIcon)
-   **Title**: `text-sm font-bold text-on-surface` (Branch Name)
-   **Source Label**: `font-semibold text-on-surface` (Question ID)
-   **Destination**: `font-semibold text-on-surface` (Current Block Name)

## Usage

-   **Survey Block**: Displayed at the **top** of a Block to indicate incoming paths.
-   **Interaction**: Click to navigate to source or view details (future scope).
