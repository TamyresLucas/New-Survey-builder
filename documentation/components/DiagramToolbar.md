# Diagram Toolbar Component

> **Note**: This component is currently hidden in the UI (`hidden` class applied).

The Diagram Toolbar is a floating control palette intended to allow users to add new nodes to the diagram directly from the canvas.

## Structure

```tsx
<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface-container border border-outline-variant rounded-lg shadow-md p-2 flex items-center gap-2 hidden">
  <button onClick={...} aria-label="Add Text Entry Node">
     <TextEntryIcon />
  </button>
  <button onClick={...} aria-label="Add Multiple Choice Node">
     <CheckboxToolboxIcon />
  </button>
</div>
```

## Styling Specifications

-   **Position**: `absolute top-4 left-1/2 -translate-x-1/2` (Centered at top)
-   **Z-Index**: `z-10` (Above canvas)
-   **Container**:
    -   Background: `bg-surface-container`
    -   Border: `border border-outline-variant`
    -   Radius: `rounded-lg`
    -   Shadow: `shadow-md`
    -   Padding: `p-2`

## Child Elements

-   **Action Buttons**:
    -   Padding: `p-2`
    -   Radius: `rounded-md`
    -   Interaction: `hover:bg-surface-container-high`
    -   Icon Color: `text-on-surface-variant` -> `hover:text-on-surface`

## Usage

Intended to be injected into the `ReactFlow` component as a child to appear as an overlay. Currently facilitates adding `multiple_choice` and `text_entry` nodes, though logic implementation may vary.
