# Button Standards

To ensure visual consistency across the application, standard sizes, typography, shapes, and visual styles are defined for all buttons.

## Sizes

-   **Large Button**: Used for primary inputs, selectors, and main page actions.
    -   **Height**: `32px` (`h-[32px]`)
    -   **Padding**: `px-2 py-1.5` (8px horizontal, 6px vertical)
    -   **Typography**: `text-sm font-semibold` (14px)
    -   **Icon Size**: `text-xl` (20px)
    -   **Icon-Only Size**: `w-8 h-8` (32px × 32px)
    -   **Exception (Icon Only)**: If the button contains *only* an icon (no text), remove horizontal padding and ensure a square aspect ratio (e.g., `w-8 h-8` or `p-1.5` depending on icon size).
-   **Small Button**: Used for secondary actions, compact UI elements, and local component actions.
    -   **Dimensions**: Height 24px
    -   **Classes**: `px-3 py-0.5 text-xs`
    -   **Exception (Icon Only)**: If the button contains *only* an icon, ensure a square aspect ratio (e.g., `w-6 h-6`).

## Typography

-   **Font Weight**: All buttons with text labels must use **Semibold** weight (600).
    -   **Class**: `font-semibold` (or custom classes mapping to weight 600).
    -   **Note**: This applies to Primary, Secondary, and Tertiary buttons.

## Shape

-   **Border Radius**: All buttons must have a **4px** corner radius.
    -   **Class**: `rounded` (Tailwind's default `rounded` is 0.25rem = 4px).
    -   **Note**: Do not use `rounded-full` (pill shape) or `rounded-none` unless explicitly required by a specific design exception.

## Visual Styles

### Primary
Used for the main action on a screen or component.
-   **Background**: `bg-primary`
-   **Text**: `text-on-primary`
-   **Hover**: `hover:opacity-90` or `hover:bg-primary-hover`

### Secondary
Used for alternative actions or to group with a primary button.
-   **Background**: Transparent or `bg-surface`
-   **Border**: `border border-outline` or `border-primary` (depending on emphasis)
-   **Text**: `text-primary` or `text-on-surface`
-   **Hover**: `hover:bg-primary-container` or `hover:bg-surface-container-high`

### Tertiary (Ghost/Text)
Used for less prominent actions, often in lists or toolbars.
-   **Background**: Transparent
-   **Text**: `text-on-surface` (preferred) or `text-on-surface-variant`
-   **Hover**: `hover:bg-surface-container-high` or `hover:underline` (for link-style buttons)

### Tertiary (Primary)
Used for primary actions that need to be less visually heavy than a solid button but more prominent than a standard tertiary button (e.g., "Add row").
-   **Background**: Transparent
-   **Text**: `text-primary`
-   **Hover**: `hover:bg-primary` and `hover:text-on-primary`
-   **Note**: Follows standard **Small** or **Large** button dimensions and padding.

### Danger
Used for destructive actions like delete or remove.
-   **Background**: Transparent (Ghost) or `bg-error` (Solid)
-   **Text**: `text-error` (Ghost) or `text-on-error` (Solid)
-   **Hover**: `hover:bg-error-container` (Ghost) or `hover:opacity-90` (Solid)

## States

| State | Primary | Secondary | Tertiary |
| :--- | :--- | :--- | :--- |
| **Default** | `bg-primary` `text-on-primary` | `bg-transparent` `border-outline` `text-primary` | `bg-transparent` `text-on-surface-variant` |
| **Hover** | `hover:opacity-90` | `hover:bg-surface-container-high` | `hover:bg-surface-container-high` |
| **Focused** | `focus:ring-2` `focus:ring-primary` `focus:ring-offset-2` | `focus:ring-2` `focus:ring-primary` `focus:ring-offset-2` | `focus:ring-2` `focus:ring-primary` `focus:ring-offset-2` |
| **Disabled** | `opacity-50` `cursor-not-allowed` | `opacity-50` `cursor-not-allowed` | `opacity-50` `cursor-not-allowed` |
