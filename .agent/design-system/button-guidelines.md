# Button Design System Guidelines

## Button Font Weight Tokens

The application uses semantic design tokens for button font weights to ensure consistency across all button implementations.

### Available Tokens

1. **`font-button-text`** (500)
   - **Use for**: Text-style buttons and links
   - **Examples**: "Add choice", "Add branch", "Back To Top", "Remove"
   - **CSS Variable**: `var(--button-text-weight)`
   - **Tailwind Class**: `font-button-text`

2. **`font-button-primary`** (600)
   - **Use for**: Primary action buttons (filled, prominent)
   - **Examples**: "Save", "Cancel" in modals, "Update" buttons
   - **CSS Variable**: `var(--button-primary-weight)`
   - **Tailwind Class**: `font-button-primary`

3. **`font-button-operator`** (700)
   - **Use for**: Very small operator buttons (use sparingly)
   - **Examples**: "AND/OR" toggle buttons in logic sets
   - **CSS Variable**: `var(--button-operator-weight)`
   - **Tailwind Class**: `font-button-operator`

## Implementation Rules

### ✅ DO

- Always use the semantic font weight tokens for buttons
- Use `font-button-text` for text/link style buttons with `text-primary` or `text-error`
- Use `font-button-primary` for filled action buttons
- Use `font-button-operator` only for tiny operator toggles

### ❌ DON'T

- Don't use generic font weights like `font-medium`, `font-semibold`, or `font-bold` for buttons
- Don't create custom font weights for buttons outside these three tokens
- Don't use `font-button-operator` for regular-sized buttons

## Common Button Patterns

### Text/Link Button
```tsx
<button className="text-sm font-button-text text-primary hover:underline">
  Add choice
</button>
```

### Primary Action Button
```tsx
<button className="px-4 py-1.5 text-xs font-button-primary text-on-primary bg-primary rounded-full hover:opacity-90">
  Save
</button>
```

### Operator Toggle Button
```tsx
<button className="px-2 py-0.5 text-[10px] font-button-operator rounded-full bg-primary text-on-primary">
  AND
</button>
```

## Token Definitions

These tokens are defined in `index.html`:

```css
:root {
  --button-text-weight: 500;
  --button-primary-weight: 600;
  --button-operator-weight: 700;
}
```

And mapped in Tailwind config:

```javascript
fontWeight: {
  'button-text': 'var(--button-text-weight)',
  'button-primary': 'var(--button-primary-weight)',
  'button-operator': 'var(--button-operator-weight)',
}
```

## Enforcement

All future button implementations MUST use these semantic tokens. This ensures:
- Consistent visual hierarchy across the application
- Easy global updates to button styles
- Clear semantic meaning in the code
- Better maintainability
