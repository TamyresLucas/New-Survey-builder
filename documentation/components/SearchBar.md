# Search Bar Component

The Search Bar allows users to filter content within panels or lists.

## Structure

```tsx
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <SearchIcon className="text-xl text-on-surface-variant" />
  </div>
  <input
    type="text"
    placeholder="Search..."
    className="w-full h-[28px] bg-transparent border border-input-border rounded-md pl-10 pr-4 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-2 focus:outline-primary transition-colors"
  />
</div>
```

## Styling Specifications

-   **Height**: `h-[32px]` (Fixed)
-   **Padding**: `pl-8` (Left padding for icon), `pr-2` (Right padding)
-   **Border**: `border border-input-border`
-   **Radius**: `rounded-md` (4px)
-   **Typography**: `text-sm`, `text-on-surface`
-   **Icon**: Absolute positioned `SearchIcon` with `text-on-surface-variant`.

## States & Color Tokens

| State | Background | Border | Text | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant` |
| **Hover** | `bg-transparent` | `border-input-border-hover` | `text-on-surface` | `text-on-surface-variant` |
| **Focused** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant` |
| **Disabled** | `bg-surface-container-high` | `border-input-border` | `text-on-surface-disabled` | `text-on-surface-disabled` |

*Note: Focused state adds `focus:outline-primary` ring.*

## Usage

-   **Build Panel**: Used to filter toolbox items and survey content.
