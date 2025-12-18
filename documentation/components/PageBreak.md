# Page Break Component

The Page Break component visually separates questions into different pages within the survey. It can be an explicit element (added by the user) or an implicit indicator (start of a block).

## Structure

```tsx
<div className="relative py-4 group cursor-grab ...">
  {/* Drag Handle (Explicit only) */}
  <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 ...">
    <DragIndicatorIcon className="text-xl text-on-surface-variant" />
  </div>

  {/* Content */}
  <div className="flex items-center gap-4">
    <div className="flex-grow h-px bg-outline-variant"></div>
    <div className="flex-shrink-0">
      {/* Page Name (Editable) */}
      <span className="font-semibold text-sm text-on-surface ...">
        Page X
      </span>
    </div>
    <div className="flex-grow h-px bg-outline-variant"></div>
  </div>

  {/* Actions Menu (Explicit only) */}
  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 ...">
    <button className="p-1.5 rounded-md hover:bg-surface-container-high ...">
      <DotsHorizontalIcon className="text-xl" />
    </button>
  </div>
</div>
```

## Styling Specifications

-   **Container**: `relative py-4` (Vertical spacing)
-   **Divider Line**: `h-px bg-outline-variant` (1px height, variant outline color)
-   **Page Name**:
    -   **Typography**: `font-semibold text-sm text-on-surface`
    -   **Background**: `bg-surface-container` (Default), `hover:bg-surface-container-high` (Hover)
    -   **Padding**: `px-3 py-1.5`
-   **Cursor**: `cursor-grab` (Explicit), `default` (Implicit)

## States & Color Tokens

| State | Divider | Text | Background |
| :--- | :--- | :--- | :--- |
| **Default** | `bg-outline-variant` | `text-on-surface` | `bg-surface-container` |
| **Hover (Label)** | - | `text-on-surface` | `bg-surface-container-high` |
| **Dragging** | - | - | `opacity-50` |

### Child Elements

-   **Drag Indicator**: `text-xl text-on-surface-variant` (Visible on hover for explicit breaks)
-   **Actions Button**:
    -   Size: `p-1.5` (Compact)
    -   Icon: `text-xl`
    -   Hover: `bg-surface-container-high`

## Usage

-   **Survey Canvas**:
    -   **Explicit**: Added by the user to force a page break. Can be dragged, renamed, and deleted.
    -   **Implicit**: Automatically shown at the start of a Block (if the previous block didn't end with a break). Can be renamed but not dragged or deleted directly.
