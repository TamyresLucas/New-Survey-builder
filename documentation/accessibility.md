# Accessibility Standards

## Keyboard Navigation Requirements

| Interaction | Required Keys | Behavior |
|-------------|---------------|----------|
| Focus navigation | Tab / Shift+Tab | Move between interactive elements |
| Activation | Enter or Space | Trigger buttons, toggles, links |
| Dismissal | Escape | Close modals, dropdowns, popovers |
| List navigation | Arrow Up/Down | Move selection in dropdowns/lists |
| Tab navigation | Arrow Left/Right | Switch between tabs |

## Focus Indicators

All interactive elements must have visible focus states:

```tsx
// Standard focus ring
className="focus:outline-none focus:ring-2 focus:ring-primary"

// Focus within container
className="focus-within:ring-2 focus-within:ring-primary"
```

**Rules:**
- Never use `outline: none` without a replacement indicator
- Focus ring must have sufficient contrast (3:1 minimum)
- Focus must be visible in both light and dark modes

## Color Contrast

The semantic token system ensures WCAG AA compliance:

| Token Pair | Contrast Ratio | Passes |
|------------|----------------|--------|
| `on-surface` / `surface` | >7:1 | AAA |
| `on-surface-variant` / `surface` | >4.5:1 | AA |
| `on-primary` / `primary` | >4.5:1 | AA |
| `error` / `surface` | >4.5:1 | AA |

## ARIA Attributes

| Pattern | Required ARIA | Example |
|---------|---------------|---------|
| Icon-only button | `aria-label` | `<button aria-label="Close">` |
| Expandable section | `aria-expanded` | `<button aria-expanded={isOpen}>` |
| Dropdown trigger | `aria-haspopup`, `aria-expanded` | See ActionMenus |
| Toggle | `aria-pressed` | `<button aria-pressed={isActive}>` |
| Invalid input | `aria-invalid`, `aria-describedby` | Link to error message |

## Screen Reader Considerations

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`)
- Ensure state changes are announced (expandable, selected)
- Provide text alternatives for icons
- Group related form controls with `<fieldset>` and `<legend>`
