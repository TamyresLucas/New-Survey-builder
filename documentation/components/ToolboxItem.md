# ToolboxItem

The ToolboxItem component represents a draggable question type in the "Toolbox" tab of the Build Panel. It is currently rendered inline within `BuildPanel.tsx` but defines a distinct visual card style for available question types.

## Visual Style

-   **Container**: `flex items-center px-4 py-1 border-b border-outline transition-all`
-   **Typography**: Open Sans font.
-   **Icon**: 20px (`text-xl`) primary color icon on the left (`mr-3`).
-   **Text**: 14px (`text-sm`) label.

## States

| State | Visual |
|---|---|
| **Default** | Transparent background, `text-on-surface` text, `text-primary` icon. |
| **Hover** | `bg-surface-container-lowest`. |
| **Disabled** | `cursor-not-allowed`, `text-on-surface-disabled`. |
| **Dragging** | `opacity-30`. |

## Structure

```tsx
<li className="flex items-center px-4 py-1 border-b border-outline transition-all hover:bg-surface-container-lowest cursor-grab">
  <div className="flex items-center">
    <Icon className="text-xl mr-3 text-primary" />
    <span className="text-sm text-on-surface">Question Type Name</span>
  </div>
</li>
```

## Usage

Used in the `BuildPanel`'s "Toolbox" tab list.
