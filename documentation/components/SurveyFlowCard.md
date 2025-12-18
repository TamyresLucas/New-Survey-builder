# Survey Flow Card Component

The Survey Flow Card is a specialized variant of the Logic Card used to display the default navigation path for a Block (e.g., "Default path -> Next Question").

## Structure

```tsx
<div className="p-3 border-2 border-dashed border-outline-variant rounded-md bg-surface-container-high cursor-pointer hover:border-primary ...">
  {/* Header */}
  <div className="flex items-center justify-between gap-2 mb-2">
    <div className="flex items-center gap-2">
      <ArrowRightAltIcon className="text-lg text-primary" />
      <h4 className="text-sm font-bold text-on-surface">Survey Flow</h4>
    </div>
  </div>

  {/* Content */}
  <div className="pl-2 space-y-1 text-sm text-on-surface-variant">
    <p>Default path → <span className="font-semibold text-on-surface">Destination</span>.</p>
  </div>
</div>
```

## Styling Specifications

-   **Padding**: `p-3` (12px)
-   **Border**: `border-2 border-dashed` (2px dashed)
-   **Radius**: `rounded-md` (6px)
-   **Background**: `bg-surface-container-high`
-   **Cursor**: `cursor-pointer`
-   **Hover**: `hover:border-primary`

## States & Color Tokens

| State | Background | Border | Text | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-surface-container-high` | `border-outline-variant` | `text-on-surface-variant` | `text-primary` |
| **Hover** | `bg-surface-container-high` | `border-primary` | `text-on-surface-variant` | `text-primary` |

### Child Elements

-   **Icon**: `text-lg text-primary`
-   **Title**: `text-sm font-bold text-on-surface`
-   **Content Text**: `text-sm text-on-surface-variant`
-   **Destination**: `font-semibold text-on-surface`

## Usage

-   **Survey Block**: Displayed at the bottom of a Block to indicate what happens after the last question is answered (if no other logic intervenes).
-   **Interaction**: Click to edit the default flow (usually opens Skip Logic editor).
