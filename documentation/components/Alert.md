# Alert Component

The `Alert` component is used to display important messages, warnings, errors, or success notifications to the user. It supports different variants for semantic meaning and is designed to hug its content.

## Structure

```tsx
<div className="flex flex-row items-start px-4 py-2 gap-2 w-full box-border text-sm text-on-surface ...">
  <Icon />
  <div className="flex-grow">
    {children}
  </div>
</div>
```

## Styling Specifications

- **Typography**: `text-sm` (14px), `font-open-sans` (inherited).
- **Padding**: `px-4` (16px), `py-2` (8px).
- **Gap**: `gap-2` (8px).
- **Border Radius**: `rounded-[2px]` (Exception: Sticky mode uses `border-b` only).
- **Icon**: `w-[16px] h-[16px] text-[16px] leading-none mt-0.5` (aligned to first line of text).
- **Height**: Hug contents (auto).

### Color Tokens (Variants)

| Variant | Background | Border | Icon Color | Icon Symbol |
| :--- | :--- | :--- | :--- | :--- |
| **Error** | `var(--notification-err-bg)` | `var(--notification-err-bd)` | `var(--notification-err-txt)` | Warning (Triangle) |
| **Warning** | `var(--notification-warn-bg)` | `var(--notification-warn-bd)` | `var(--notification-warn-txt)` | Error (Circle Exclamation) |
| **Success** | `var(--notification-suc-bg)` | `var(--notification-suc-bd)` | `var(--notification-suc-txt)` | Check Circle |
| **Info** | `var(--notification-info-bg)` | `var(--notification-info-bd)` | `var(--notification-info-txt)` | Info |

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'error' \| 'warning' \| 'success' \| 'info'` | Required | Determines the style and icon of the alert. |
| `children` | `ReactNode` | Required | The content of the alert. |
| `className` | `string` | `''` | Additional classes to apply to the container. |
| `sticky` | `boolean` | `false` | If true, removes rounded corners and side borders, keeping only the bottom border. Useful for alerts placed at the top of a panel. |

## Usage Examples

### Info Alert
```tsx
<Alert variant="info">
    This is an informational message.
</Alert>
```

### Error Alert
```tsx
<Alert variant="error">
    Critical error occurred.
</Alert>
```

### Warning Alert
```tsx
<Alert variant="warning">
    This action cannot be undone.
</Alert>
```

### Success Alert
```tsx
<Alert variant="success">
    Changes saved successfully.
</Alert>
```
