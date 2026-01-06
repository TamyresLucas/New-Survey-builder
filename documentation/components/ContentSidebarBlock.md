# Content Sidebar Block Component

The Content Sidebar Block represents a survey block (group of questions) within the Build Panel's content list. It acts as a container and header for the questions inside it.

## Structure

```tsx
<div className="px-4 h-[40px] cursor-pointer border-b border-t border-outline-variant flex items-center justify-between ...">
  <div className="flex items-center cursor-grab flex-grow truncate">
    <DragIndicatorIcon className="text-base mr-2 flex-shrink-0 ..." />
    <h3 className="text-sm font-semibold truncate ...">
      <span className="font-bold mr-2">BID</span>
      Block Title
      <span className="font-normal ml-1 ...">(Count)</span>
    </h3>
  </div>
  <div className="relative flex-shrink-0">
    <button className="w-6 h-6 flex items-center justify-center rounded-md ...">
      <DotsHorizontalIcon />
    </button>
  </div>
</div>
```

## Styling Specifications

-   **Height**: `h-[40px]` (Fixed)
-   **Padding**: `px-4` (Horizontal: 16px)
-   **Border**: `border-t border-b border-outline-variant` (Top and Bottom borders)
-   **Typography**: `text-sm` (14px)
-   **Cursor**: `cursor-pointer` (Entire row), `cursor-grab` (Drag indicator/Title area)

## States & Color Tokens

| State | Background | Border | Text | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-surface-container` | `border-outline-variant` | `text-on-surface` | `text-on-surface-variant` |
| **Hover** | `bg-surface-container-lowest` | `border-outline-hover` | `text-on-surface` | `text-on-surface-variant` |
| **Selected** | `bg-primary` | `border-outline-variant` | `text-on-primary` | `text-on-primary` |
| **Dragged** | `opacity-30` | - | - | - |

### Child Elements

-   **Block ID**: `font-bold`
-   **Block Title**: `font-semibold`
-   **Question Count**: `font-normal` (Parentheses)
-   **Actions Button**:
    -   Size: `w-6 h-6` (Small Tertiary Button)
    -   Default: `text-on-surface-variant` (or `text-on-primary` if selected)
    -   Hover: `bg-surface-container-highest` (or `bg-white/20` if selected)

## Usage

-   **Build Panel**: Used in the "Content" tab to group questions.
-   **Drag & Drop**: Supports reordering of blocks.
-   **Collapsible**: Can be expanded/collapsed to show/hide questions.
