# [Component Name]

**File:** `components/[path]/[ComponentName].tsx`

## Purpose

One to two sentences describing what this component does and its primary use case.

## Usage

Where this component is used and when to choose it over alternatives.

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `propName` | `string` | `undefined` | Yes | What this prop controls |

## States

| State | Appearance | Classes Used |
|-------|------------|--------------|
| Default | Description | `bg-surface-container` |
| Hover | Description | `hover:bg-surface-container-high` |
| Focus | Description | `focus:ring-2 focus:ring-primary` |
| Disabled | Description | `disabled:opacity-50` |
| Error | Description | `border-error text-error` |

## Accessibility

- [ ] Keyboard navigable via Tab
- [ ] Activates via Enter/Space
- [ ] Dismisses via Escape (if applicable)
- [ ] Has visible focus indicator
- [ ] Uses appropriate ARIA attributes

## Example

```tsx
import { ComponentName } from '@/components/ComponentName';

// Basic usage
<ComponentName requiredProp="value" />

// With optional props
<ComponentName 
  requiredProp="value"
  optionalProp={true}
  onAction={() => console.log('action')}
/>
```

## Related Components

- `[RelatedComponent]` — Use when [scenario]
- `[AlternativeComponent]` — Use instead when [scenario]
