# Text Field Component

The Text Field component provides a user-friendly way to input text. It shares the same visual foundation as the Dropdown Field but allows for free-form text entry.

## Structure

```tsx
<div className="relative">
  {/* Input Field */}
  <input
    type="text"
    className="w-full h-[32px] bg-transparent border border-input-border rounded-md px-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors placeholder:text-on-surface-variant/50"
    placeholder="Enter text..."
  />
</div>
```

## Styling Specifications

### Input Field
-   **Height**: `h-[32px]` (Fixed)
-   **Padding**: `px-2` (Horizontal: 8px)
-   **Border**: `border border-input-border`
-   **Radius**: `rounded-md` (4px)
-   **Typography**: `text-sm` (14px), `text-on-surface`
-   **Placeholder**: `text-on-surface-variant/50`

## States & Color Tokens

### Input Field

| State | Background | Border | Text | Placeholder |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant/50` |
| **Hover** | `bg-transparent` | `border-input-border-hover` | `text-on-surface` | `text-on-surface-variant/50` |
| **Focused** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant/50` |
| **Disabled** | `bg-surface-container-high` | `border-input-border` | `text-on-surface-disabled` | `text-on-surface-disabled` |
| **Error** | `bg-transparent` | `border-error` | `text-on-surface` | `text-on-surface-variant/50` |

*Note: Focused state adds `focus:outline-primary` ring.*

## Usage Guidelines

1.  **Alignment**: Use the standard height of 32px to align with buttons and dropdowns.
2.  **Validation**: Use the Error state (`border-error`) when validation fails.
3.  **Labels**: Always pair with a label (typically `text-sm font-medium text-on-surface-variant`) above the input.
