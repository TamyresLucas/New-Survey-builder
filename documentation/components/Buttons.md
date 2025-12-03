# Button Standards

To ensure visual consistency across the application, standard sizes, typography, shapes, and visual styles are defined for all buttons.

## Sizes

-   **Large Button**: Used for primary inputs, selectors, and main page actions.
    -   **Dimensions**: Height ~32px
    -   **Classes**: `px-4 py-1.5 text-sm` (16px horizontal padding)
    -   **Exception (Icon Only)**: If the button contains *only* an icon (no text), remove horizontal padding and ensure a square aspect ratio (e.g., `w-8 h-8` or `p-1.5` depending on icon size).
-   **Small Button**: Used for secondary actions, compact UI elements, and local component actions.
    -   **Dimensions**: Height ~28px
    -   **Classes**: `px-3 py-1.5 text-xs`

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
-   **Text**: `text-primary` or `text-on-surface-variant`
-   **Hover**: `hover:bg-surface-container-high` or `hover:underline` (for link-style buttons)
