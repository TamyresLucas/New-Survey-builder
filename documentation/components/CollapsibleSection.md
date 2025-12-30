# CollapsibleSection

**File:** `components/logic-editor/shared/CollapsibleSection.tsx`

## Purpose

A reusable container component that allows users to toggle the visibility of its content. It is primarily used to hide advanced or secondary options to reduce cognitive load (Progressive Disclosure).

## Usage

Use this component when:
- You have a group of settings that are not frequently accessed.
- You want to simplify a complex form by hiding detailed configurations by default.
- You need a consistent "Accordion" style interface.

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `title` | `string` | - | Yes | The text displayed in the header row. |
| `children` | `ReactNode` | - | Yes | The content to show/hide. |
| `defaultExpanded` | `boolean` | `false` | No | Initial state of the section. |
| `className` | `string` | - | No | Additional classes for the container. |

## States

| State | Appearance | Classes Used |
|-------|------------|--------------|
| Collapsed | Header only, chevron pointing right | `text-on-surface-variant` |
| Expanded | Header + Content, chevron pointing down | `text-on-surface` |
| Hover | Header background slightly darker | `hover:bg-surface-container-high` |
| Focus | Focus ring on the header button | `focus:ring-2` |

## Accessibility

- [x] Keyboard navigable via Tab (focuses the header button).
- [x] Activates via Enter/Space (toggles expansion).
- [x] Uses `aria-expanded` to communicate state to screen readers.
- [x] Uses `aria-controls` to link header to content region.

## Example

```tsx
import { CollapsibleSection } from '@/components/logic-editor/shared/CollapsibleSection';

<CollapsibleSection title="Advanced Settings" defaultExpanded={false}>
  <div className="flex flex-col gap-4 p-4">
    <label>Option 1</label>
    <input type="text" className="h-8 border rounded-md" />
  </div>
</CollapsibleSection>
```
