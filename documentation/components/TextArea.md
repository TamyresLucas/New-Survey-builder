# Text Area Component

The Text Area component provides a user-friendly way to input multi-line text. It shares the same visual foundation as the Text Field.

## Structure

```tsx
<div className="relative">
  {/* Text Area */}
  <textarea
    className="w-full bg-transparent border border-input-border rounded-md p-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors placeholder:text-on-surface-variant/50"
    placeholder="Enter text..."
  />
</div>
```

## Styling Specifications

### Text Area
-   **Height**: Auto (controlled by `rows` or content).
-   **Padding**: `p-2` (8px)
-   **Border**: `border border-input-border`
-   **Radius**: `rounded-md` (4px)
-   **Typography**: `text-sm` (14px), `text-on-surface`
-   **Placeholder**: `text-on-surface-variant/50`

## States & Color Tokens

### Text Area

| State | Background | Border | Text | Placeholder |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant/50` |
| **Hover** | `bg-transparent` | `border-input-border-hover` | `text-on-surface` | `text-on-surface-variant/50` |
| **Focused** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant/50` |
| **Disabled** | `bg-surface-container-high` | `border-input-border` | `text-on-surface-disabled` | `text-on-surface-disabled` |
| **Error** | `bg-transparent` | `border-error` | `text-on-surface` | `text-on-surface-variant/50` |

*Note: Focused state adds `focus:outline-primary` ring.*

## Usage Guidelines

1.  **Alignment**: Use for multi-line input (e.g., descriptions, long answers).
2.  **Validation**: Use the Error state (`border-error`) when validation fails.
3.  **Labels**: Always pair with a label above the input.
