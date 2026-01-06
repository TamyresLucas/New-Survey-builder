# Content Sidebar Item Component

The Content Sidebar Item represents a question or element (like Page Break or Description) within the Build Panel's content list.

## Structure

```tsx
<li className="box-border flex flex-row items-center px-2 gap-2 h-[32px] rounded text-sm transition-all group relative border cursor-grab ...">
  <div className="flex items-center flex-shrink-0">
    <Icon className="text-base mr-2 ..." />
    <span className="font-semibold text-sm ...">QID</span>
  </div>
  <span className="font-normal truncate flex-grow ...">Question Text</span>
  <div className="relative ml-2 flex-shrink-0">
    <button className="w-6 h-6 flex items-center justify-center rounded-md ...">
      <DotsHorizontalIcon />
    </button>
  </div>
</li>
```

## Styling Specifications

-   **Height**: `h-[32px]` (Fixed)
-   **Padding**: `px-2` (Horizontal: 8px)
-   **Gap**: `gap-2` (8px)
-   **Border**: `border` (1px)
-   **Radius**: `rounded` (4px)
-   **Typography**: `text-sm` (14px)
-   **Cursor**: `cursor-grab` (Indicates draggability)

## States & Color Tokens

| State | Background | Border | Text | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-surface-container` | `border-outline-variant` | `text-on-surface` | `text-primary` |
| **Hover** | `bg-surface-container-lowest` | `border-outline-hover` | `text-on-surface` | `text-primary` |
| **Selected** | `bg-primary` | `border-primary` | `text-on-primary` | `text-on-primary` |
| **Selected (Error)** | `bg-error` | `border-error` | `text-on-error` | `text-on-error` |
| **Error (Unselected)** | `bg-surface-container` | `border-outline-variant` | `text-error` | `text-error` |
| **Dragged** | `opacity-30` | - | - | - |

### Child Elements

-   **Question ID**: `font-semibold`
-   **Question Text**: `font-normal truncate`
-   **Actions Button**:
    -   Size: `w-6 h-6` (Small Tertiary Button)
    -   Default: `text-on-surface-variant` (or `text-on-primary`/`text-on-error` if selected)
    -   Hover: `bg-surface-container-highest` (or `bg-white/20` if selected)
    -   Visibility: Visible on hover or when menu is open (always visible if selected)

## Usage

-   **Build Panel**: Used in the "Content" tab to list questions within blocks.
-   **Drag & Drop**: Supports reordering within and between blocks.
