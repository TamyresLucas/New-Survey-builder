# Design System Prerequisites & Checklist

Before creating or documenting any component, you MUST ensure it adheres to the following standards.

## 1. Color Tokens (Dark/Light Mode Consistency)
**Rule**: Never use hardcoded colors (e.g., `bg-white`, `text-gray-500`). Always use semantic tokens.

| Element | Token | Notes |
| :--- | :--- | :--- |
| **Background (Page)** | `bg-surface` | Main page background. |
| **Background (Card/Panel)** | `bg-surface-container` | Cards, Sidebars, Modals. |
| **Background (Hover)** | `bg-surface-container-high` | Hover state for ghost buttons/list items. |
| **Text (Primary)** | `text-on-surface` | Main content, labels, input text. |
| **Text (Secondary)** | `text-on-surface-variant` | Meta info, placeholders, less important icons. |
| **Border (Structural)** | `border-outline-variant` | Dividers, card borders. |
| **Border (Input)** | `border-input-border` | Text fields, dropdowns. |
| **Primary Brand** | `bg-primary`, `text-on-primary` | Primary buttons, active states. |
| **Error** | `text-error`, `border-error` | Validation failures. |

## 2. Sizing & Dimensions
**Rule**: Use fixed heights for interactive elements to ensure alignment.

| Component | Height | Padding | Icon Size |
| :--- | :--- | :--- | :--- |
| **Large Button** | `h-[32px]` | `px-4` | `text-xl` (20px) |
| **Small Button** | `h-[24px]` | `px-3` | `text-base` (16px) |
| **Icon-Only Button (L)**| `w-8 h-8` | - | `text-xl` |
| **Icon-Only Button (S)**| `w-6 h-6` | - | `text-base` |
| **Text Field / Input** | `h-[32px]` | `px-2` | - |
| **Dropdown Trigger** | `h-[32px]` | `px-2` | `w-[19px]` container |
| **Tab / Header Item** | `h-[40px]` | `px-4` | - |

## 3. Corner Radius
**Rule**: Use `rounded-md` (4px) for all interactive elements (buttons, inputs, dropdowns) to maintain a consistent "soft" geometric look.

| Element | Radius | Class |
| :--- | :--- | :--- |
| **Buttons** | 4px | `rounded-md` |
| **Inputs** | 4px | `rounded-md` |
| **Dropdowns** | 4px | `rounded-md` |
| **Cards/Panels** | 8px | `rounded-lg` (or `rounded-md` depending on context, but 4px is strict for controls) |

## 4. Spacing (Padding, Margin, Gap)
**Rule**: Always use multiples of **8px** (or **4px** for tight spacing). Avoid arbitrary values.

| Value | Tailwind Class | Usage |
| :--- | :--- | :--- |
| **4px** | `p-1`, `m-1`, `gap-1` | Tight spacing, icon gaps. |
| **8px** | `p-2`, `m-2`, `gap-2` | Standard spacing, internal component padding. |
| **16px** | `p-4`, `m-4`, `gap-4` | Section spacing, card padding, layout gaps. |
| **24px** | `p-6`, `m-6`, `gap-6` | Large section separation. |
| **32px** | `p-8`, `m-8`, `gap-8` | Major layout division. |

## 5. Typography
**Rule**: Use the correct font family and size.

*   **Headings / Brand**: `font-outfit` (Outfit).
*   **Body / UI**: `font-open-sans` (Open Sans).
*   **Standard Size**: `text-sm` (14px).
*   **Small Size**: `text-xs` (12px).
*   **Line Height**: `leading-[19px]` (often used to align text with 19px icons).

## 4. States
**Rule**: Every interactive component MUST define styles for all applicable states.

1.  **Default**: The resting state.
2.  **Hover**:
    *   Transparent/Ghost items: `hover:bg-surface-container-high`.
    *   Solid items: `hover:opacity-90` or `hover:bg-primary-hover`.
    *   Inputs: `hover:border-input-border-hover`.
3.  **Focused**:
    *   `focus:outline-none`.
    *   `focus:ring-2 focus:ring-primary`.
4.  **Disabled**:
    *   `disabled:opacity-50`.
    *   `disabled:cursor-not-allowed`.
    *   Text: `text-on-surface-disabled`.
5.  **Error** (Inputs):
    *   Border: `border-error`.
    *   Text: `text-error` (for validation message).

## 5. Icon Consistency
*   **Tertiary Buttons**: Icons should use `text-on-surface` (High Contrast/Impact) unless specified otherwise.
*   **Input Decorators**: Chevrons/Helpers use `text-on-surface-variant`.
*   **Alignment**: If an icon is next to text, wrap the icon in a fixed-width container (e.g., `w-[19px]`) to ensure text alignment matches non-icon items.

## 6. Implementation Checklist
When creating a component:
- [ ] Does it use the `Button` component for any buttons?
- [ ] Are all colors semantic tokens?
- [ ] Is the height explicitly set (32px/24px/40px)?
- [ ] Are Hover and Focus states defined?
- [ ] Is Dark Mode supported (via tokens)?
- [ ] Is the font family correct?
