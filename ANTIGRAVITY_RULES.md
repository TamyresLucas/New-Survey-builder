# Antigravity Development Rules
## Survey Builder Application

This document provides coding standards for AI-assisted development.
Follow these rules when generating or modifying code.

---

## Token Usage (Mandatory)

### Colors — Always Use Semantic Tokens

```
NEVER USE:
- Hardcoded hex: #ffffff, #000000, #3b82f6
- Tailwind defaults: bg-white, text-gray-500, border-blue-300
- RGB/RGBA values: rgb(255, 255, 255)

ALWAYS USE:
- bg-surface, bg-surface-container, bg-surface-container-high
- text-on-surface, text-on-surface-variant
- border-outline, border-outline-variant
- bg-primary, text-on-primary, bg-primary-container
- bg-error, bg-warning, bg-success (status colors)
```

### Color Token Quick Reference

| Purpose | Light Background | Dark Background |
|---------|------------------|-----------------|
| Page background | `bg-surface` | (automatic) |
| Cards/panels | `bg-surface-container` | (automatic) |
| Hover states | `bg-surface-container-high` | (automatic) |
| Primary text | `text-on-surface` | (automatic) |
| Secondary text | `text-on-surface-variant` | (automatic) |
| Borders | `border-outline-variant` | (automatic) |
| Interactive borders | `border-outline` | (automatic) |
| Primary action | `bg-primary text-on-primary` | (automatic) |
| Destructive | `text-error` or `bg-error` | (automatic) |

---

## Component Standards

### Heights (Consistency Required)

| Element Type | Height | Tailwind Class |
|--------------|--------|----------------|
| Standard buttons | 32px | `h-8` |
| Small buttons | 24px | `h-6` |
| Input fields | 32px | `h-8` |
| Header bars | 40px | `h-10` |
| Icon buttons | 32px | `h-8 w-8` |
| Small icon buttons | 24px | `h-6 w-6` |

### Interactive States (All Required)

Every interactive element MUST implement:

```tsx
// Button example
className={`
  // Default
  bg-surface-container text-on-surface border border-outline-variant
  
  // Hover
  hover:bg-surface-container-high
  
  // Focus (keyboard navigation)
  focus:outline-none focus:ring-2 focus:ring-primary
  
  // Disabled
  disabled:opacity-50 disabled:cursor-not-allowed
  
  // Transition
  transition-colors duration-150
`}
```

### Typography

| Context | Font Family | Class |
|---------|-------------|-------|
| Headings, branding | Outfit | `font-['Outfit']` |
| Body text, UI | Open Sans | Default (set on body) |

| Text Style | Classes |
|------------|---------|
| Section header | `text-base font-semibold text-on-surface` |
| Body text | `text-sm text-on-surface` |
| Secondary/helper | `text-sm text-on-surface-variant` |
| Labels | `text-xs font-medium text-on-surface-variant` |
| Error text | `text-sm text-error` |

---

## Established Patterns

### Draft-Confirm Workflow
For complex edits (branching logic, skip logic):
1. User edits a `draft*` state property
2. Original `confirmed` state remains active
3. User explicitly applies changes
4. Draft promotes to confirmed state

```tsx
// State shape
interface Question {
  branchingLogic: BranchingLogic;        // Confirmed (active)
  draftBranchingLogic?: BranchingLogic;  // Draft (editing)
}
```

### Collapsible Sections
Use the shared `CollapsibleSection` component:

```tsx
import { CollapsibleSection } from './shared';

<CollapsibleSection title="Advanced Options" defaultExpanded={false}>
  {/* Content */}
</CollapsibleSection>
```

### Action Menus
Follow the `BlockActionsMenu` / `QuestionActionsMenu` pattern:
- Props-driven rendering (action shown only if callback provided)
- Logical grouping with dividers
- Destructive actions in red at bottom
- `can*` boolean props for disabled states

### Icon Usage
- Library: Material Symbols Rounded (filled)
- Component: Create in `icons.tsx` following existing pattern
- Size: Match parent text size or use explicit `text-xl`, `text-2xl`

---

## File Organization

```
components/
├── [Feature].tsx           # Main component
├── [feature]/              # Sub-components if complex
│   ├── [SubComponent].tsx
│   └── index.ts            # Barrel export
├── diagram/                # Diagram canvas components
│   └── nodes/              # Custom node types
├── logic-editor/           # Logic editing components
│   └── shared/             # Reusable logic editor pieces
└── question-editor/        # Question editing components
    ├── advanced/
    ├── behavior/
    ├── choices/
    ├── scale/
    └── settings/
```

---

## Common Mistakes to Avoid

1. **Don't use Tailwind color defaults**
   - ❌ `bg-gray-100 text-gray-900`
   - ✅ `bg-surface-container text-on-surface`

2. **Don't forget dark mode**
   - Semantic tokens handle this automatically
   - Test both modes after changes

3. **Don't skip focus states**
   - Every interactive element needs `focus:ring-2 focus:ring-primary`

4. **Don't hardcode shadows**
   - Use elevation tokens (see token section)

5. **Don't break draft-confirm pattern**
   - Logic edits must use draft state
   - Never mutate confirmed state directly during editing

---

## Testing Checklist

Before completing any UI task:
- [ ] Uses semantic color tokens only
- [ ] All interactive states work (hover, focus, disabled)
- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] No TypeScript errors
- [ ] Follows existing component patterns

## Project Isolation Rules (Strict)

### Voxco Design System
- **Do NOT** modify files in `design-system/` unless explicitly instructed.
- **Do NOT** import from `design-system/` into the main `src/` application.
- **Do NOT** add `design-system` as a dependency to the main `package.json`.
- **EXCEPTION**: You may initialize and run Storybook within `design-system/` as a standalone project.
