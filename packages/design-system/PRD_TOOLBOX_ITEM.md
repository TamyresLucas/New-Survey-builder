# ToolboxItem Component - PRD & Specifications

**Version:** 1.0  
**Created:** January 21, 2026  
**Status:** Draft  
**Owner:** Design System Team  

---

## 1. Overview

### 1.1 Purpose
The `ToolboxItem` component represents a draggable item in the Survey Builder's toolbox sidebar. It allows users to drag question types onto the survey canvas to create new questions.

### 1.2 Problem Statement
Currently, the Survey Builder uses a legacy `SidebarToolboxItem` component with hardcoded tokens that don't integrate with the Design System's dynamic theming capabilities. This creates visual inconsistencies and limits theme customization.

### 1.3 Goals
- Create a reusable, accessible ToolboxItem component in the Design System
- Support all 40 question types used in Survey Builder
- Enable dynamic theming via Design System tokens
- Maintain visual and behavioral parity with existing implementation
- Provide comprehensive Storybook documentation

### 1.4 Non-Goals
- Drag-and-drop logic implementation (handled by parent)
- Search/filter functionality (separate component)
- Collapsible group headers (separate component)

---

## 2. User Stories

### 2.1 Primary User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | Survey Creator | See all available question types in the toolbox | I can choose what to add to my survey |
| US-02 | Survey Creator | Drag a question type to the canvas | I can add questions to my survey |
| US-03 | Survey Creator | See visual feedback when hovering | I know the item is interactive |
| US-04 | Survey Creator | See visual feedback when dragging | I know the drag operation is in progress |
| US-05 | Survey Creator | See disabled items clearly | I know which items I cannot use |

### 2.2 Secondary User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-06 | Theme Designer | Have items respond to theme changes | Brand colors are consistently applied |
| US-07 | Accessibility User | Navigate with keyboard | I can use the toolbox without a mouse |
| US-08 | Screen Reader User | Hear item labels announced | I know what each item does |

---

## 3. Functional Requirements

### 3.1 Core Functionality

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Display an icon and text label | P0 |
| FR-02 | Support drag-and-drop via HTML5 Drag API | P0 |
| FR-03 | Show hover state with icon transition | P0 |
| FR-04 | Show disabled state | P0 |
| FR-05 | Show dragging state (reduced opacity) | P0 |
| FR-06 | Support optional end action slot | P1 |
| FR-07 | Support click handler for non-draggable mode | P1 |
| FR-08 | Truncate long labels with ellipsis | P1 |

### 3.2 Visual States

| State | Trigger | Visual Changes |
|-------|---------|----------------|
| Default | Initial render | Icon (primary), Label (foreground), Background (card) |
| Hover | Mouse enter | Icon fades to DragIndicator, Background lightens |
| Focus | Keyboard focus | Focus ring visible |
| Active/Pressed | Mouse down | Slight scale reduction |
| Dragging | During drag | Opacity reduced to 30% |
| Disabled | `isEnabled={false}` | Muted colors, cursor-not-allowed |

### 3.3 Interactions

| Interaction | Behavior |
|-------------|----------|
| Mouse Enter | Transition icon to DragIndicator (200ms fade) |
| Mouse Leave | Transition back to original icon (200ms fade) |
| Drag Start | Fire `onDragStart`, apply dragging styles |
| Drag End | Fire `onDragEnd`, remove dragging styles |
| Click (if enabled) | Fire `onClick` if provided |
| Keyboard Enter/Space | Trigger click action |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Render time | < 16ms per item |
| NFR-02 | Animation smoothness | 60fps transitions |
| NFR-03 | Bundle size contribution | < 2KB gzipped |
| NFR-04 | Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-05 | Accessibility | WCAG 2.1 AA compliant |

---

## 5. Design Specifications

### 5.1 Dimensions

```
┌─────────────────────────────────────────────────────┐
│ [Icon]  Label Text                        [Action?] │
└─────────────────────────────────────────────────────┘
     ↑        ↑                                  ↑
   20×20    flex-1                            optional

Height: 40px (fixed)
Width: 100% (fills container)
Padding: 16px horizontal
Icon Size: 20×20px (w-5 h-5)
Icon-Label Gap: 12px (mr-3)
```

### 5.2 Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Label | Inter (--font-sans) | 14px (text-sm) | 400 (normal) | 1.25 |

### 5.3 Colors (Design System Tokens)

| Element | State | Token |
|---------|-------|-------|
| Background | Default | `bg-card` |
| Background | Hover | `bg-muted` |
| Background | Disabled | `bg-card` |
| Icon | Default | `text-primary` |
| Icon | Hover | `text-muted-foreground` (DragIndicator) |
| Icon | Disabled | `text-muted-foreground/50` |
| Label | Default | `text-foreground` |
| Label | Disabled | `text-muted-foreground` |
| Border | All states | `border-primary/20` (bottom only) |
| Focus Ring | Focus | `ring-ring` |

### 5.4 Animations

| Property | Duration | Easing | Trigger |
|----------|----------|--------|---------|
| Icon opacity | 200ms | ease-in-out | Hover |
| Background color | 150ms | ease-in-out | Hover |
| Opacity (dragging) | 0ms | - | Drag start/end |

### 5.5 Visual Reference

```
┌─────────────────────────────────────────────────────┐
│                    DEFAULT STATE                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [✓] Check Box                                │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│                    HOVER STATE                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ [⠿] Check Box                          [bg]  │  │
│  └──────────────────────────────────────────────┘  │
│       ↑ DragIndicator icon                ↑ muted  │
│                                                     │
│                   DISABLED STATE                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [✓] Check Box          (grayed out)          │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│                   DRAGGING STATE                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [✓] Check Box              (opacity: 0.3)    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 6. Component API

### 6.1 Props Interface

```typescript
interface ToolboxItemProps {
  /**
   * Icon component to display
   * @required
   */
  icon: React.ElementType;

  /**
   * Text label for the item
   * @required
   */
  label: string;

  /**
   * Whether the item is enabled and interactive
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Whether the item is currently being dragged
   * @default false
   */
  isDragging?: boolean;

  /**
   * Whether the item supports drag-and-drop
   * @default true
   */
  isDraggable?: boolean;

  /**
   * Data to pass when dragging starts
   * Used for drag-and-drop data transfer
   */
  dragData?: string | Record<string, unknown>;

  /**
   * Callback fired when drag operation starts
   */
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;

  /**
   * Callback fired when drag operation ends
   */
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;

  /**
   * Callback fired when item is clicked
   * Only fires if item is enabled
   */
  onClick?: () => void;

  /**
   * Optional element to render at the end (e.g., action button)
   * Only visible on hover
   */
  endAction?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label (if different from label prop)
   */
  'aria-label'?: string;
}
```

### 6.2 Usage Examples

```tsx
// Basic usage
<ToolboxItem 
  icon={CheckBoxIcon} 
  label="Check Box" 
/>

// Disabled state
<ToolboxItem 
  icon={CheckBoxIcon} 
  label="Check Box" 
  isEnabled={false} 
/>

// With drag handlers
<ToolboxItem 
  icon={CheckBoxIcon} 
  label="Check Box"
  dragData={{ type: 'checkbox', category: 'multiple-choice' }}
  onDragStart={(e) => console.log('Started dragging')}
  onDragEnd={(e) => console.log('Finished dragging')}
/>

// With end action
<ToolboxItem 
  icon={CheckBoxIcon} 
  label="Check Box"
  endAction={
    <Button variant="ghost" size="icon" className="h-6 w-6">
      <InfoIcon className="h-4 w-4" />
    </Button>
  }
/>

// Non-draggable with click
<ToolboxItem 
  icon={BlockIcon} 
  label="Add Block"
  isDraggable={false}
  onClick={() => addBlock()}
/>
```

---

## 7. Question Types Catalog

### 7.1 Complete Item List (40 items)

| # | Name | Icon (Material Symbol) | Group |
|---|------|------------------------|-------|
| 1 | Auto Complete Dropdown | `dropdown` | Multiple choices |
| 2 | Block | `rectangle` | Structural |
| 3 | Card Sort | `style` | Advanced & Interactive |
| 4 | Carousel | `view_carousel` | Advanced & Interactive |
| 5 | Cascading Dropdown | `dropdown` | Multiple choices |
| 6 | Check Box | `check_box` | Multiple choices |
| 7 | Choice Grid | `grid_view` | Grid |
| 8 | Click Map | `touch_app` | Advanced & Interactive |
| 9 | Comment Box | `chat_bubble_outline` | Advanced & Interactive |
| 10 | Custom Grid | `dashboard_customize` | Grid |
| 11 | Custom Scripting | `code` | Advanced & Interactive |
| 12 | Date & Time | `event` | Input |
| 13 | Description | `format_paragraph` | Structural |
| 14 | Drag and Drop Ranking | `move_up` | Rating & Scoring |
| 15 | Dropdown | `dropdown` | Multiple choices |
| 16 | Email Address | `mail` | Input |
| 17 | Email Collector | `attach_money` | System Variable |
| 18 | File Upload | `upload_file` | Advanced & Interactive |
| 19 | Hot Spot | `ads_click` | Advanced & Interactive |
| 20 | Image Grid | `image` | Grid |
| 21 | Image Select | `image` | Multiple choices |
| 22 | Language Preference | `attach_money` | System Variable |
| 23 | Lookup Table | `table_chart` | Structural |
| 24 | Metadata Collector | `attach_money` | System Variable |
| 25 | NPS | `sentiment_satisfied` | Rating & Scoring |
| 26 | Numeric Input | `pin` | Input |
| 27 | Numeric Ranking | `format_list_numbered` | Rating & Scoring |
| 28 | Page Break | `insert_page_break` | Structural |
| 29 | Phone Number | `attach_money` | System Variable |
| 30 | Radio Button | `radio_button_checked` | Multiple choices |
| 31 | Running Total | `grid_view` | Grid |
| 32 | Secured Temporary Variable | `security` | System Variable |
| 33 | Signature | `draw` | Advanced & Interactive |
| 34 | Slider | `tune` | Rating & Scoring |
| 35 | Star Rating | `star` | Rating & Scoring |
| 36 | Text Highlighter | `format_ink_highlighter` | Advanced & Interactive |
| 37 | Text Input | `edit_note` | Input |
| 38 | Time Zone | `attach_money` | System Variable |
| 39 | Timer | `timer` | Advanced & Interactive |

### 7.2 Groups

| Group | Items | Description |
|-------|-------|-------------|
| Advanced & Interactive | 10 | Complex question types requiring user interaction |
| Grid | 4 | Matrix/grid-based questions |
| Input | 4 | Free-form text/numeric entry |
| Multiple choices | 6 | Selection from predefined options |
| Rating & Scoring | 5 | Scale and ranking questions |
| Structural | 4 | Non-question elements for survey organization |
| System Variable | 6 | Auto-collected respondent data |

---

## 8. Accessibility

### 8.1 Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Tab to focus, Enter/Space to activate |
| Screen Reader | `role="button"` or `role="listitem"`, `aria-label` |
| Focus Visible | Visible focus ring using `ring-ring` token |
| Reduced Motion | Respect `prefers-reduced-motion` |
| Color Contrast | Minimum 4.5:1 for text, 3:1 for icons |

### 8.2 ARIA Attributes

```tsx
<div
  role="button"
  tabIndex={isEnabled ? 0 : -1}
  aria-disabled={!isEnabled}
  aria-grabbed={isDragging}
  aria-label={`Add ${label} question`}
  draggable={isEnabled && isDraggable}
>
```

### 8.3 Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move focus to next/previous item |
| Enter | Trigger click action |
| Space | Trigger click action |
| Escape | Cancel drag operation (if supported) |

---

## 9. Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very long label | Truncate with ellipsis (`truncate` class) |
| Missing icon | Show placeholder or label only |
| Rapid hover in/out | Debounce transitions, no visual glitches |
| Drag outside viewport | Maintain dragging state until drop/cancel |
| Multiple items dragged | Only one item can be dragged at a time |
| Touch devices | Fallback to tap-to-add (no drag) |
| Theme change during hover | Smooth color transition |

---

## 10. Test Cases

### 10.1 Unit Tests

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| TC-01 | Renders with icon and label | Both visible |
| TC-02 | Applies disabled styles when `isEnabled={false}` | Correct classes applied |
| TC-03 | Applies dragging styles when `isDragging={true}` | Opacity reduced |
| TC-04 | Fires `onDragStart` when drag begins | Callback invoked with event |
| TC-05 | Fires `onDragEnd` when drag ends | Callback invoked with event |
| TC-06 | Fires `onClick` when clicked | Callback invoked |
| TC-07 | Does not fire `onClick` when disabled | Callback not invoked |
| TC-08 | Renders endAction when provided | Action visible on hover |
| TC-09 | Truncates long labels | Ellipsis appears |
| TC-10 | Applies custom className | Class present in DOM |

### 10.2 Visual Regression Tests

| ID | Test Case |
|----|-----------|
| VRT-01 | Default state snapshot |
| VRT-02 | Hover state snapshot |
| VRT-03 | Disabled state snapshot |
| VRT-04 | Dragging state snapshot |
| VRT-05 | With end action snapshot |
| VRT-06 | Dark mode - all states |
| VRT-07 | Custom theme colors |

### 10.3 Accessibility Tests

| ID | Test Case |
|----|-----------|
| A11Y-01 | Keyboard navigation works |
| A11Y-02 | Screen reader announces correctly |
| A11Y-03 | Focus ring visible |
| A11Y-04 | Color contrast passes |

---

## 11. Storybook Documentation

### 11.1 Stories to Implement

| Story | Description |
|-------|-------------|
| `Default` | Single item with default props |
| `AllStates` | All visual states in one view |
| `Disabled` | Disabled state example |
| `Dragging` | Simulated dragging state |
| `WithEndAction` | Item with action button |
| `AllQuestionTypes` | All 40 items displayed |
| `GroupedByCategory` | Items organized by group |
| `InteractiveDemo` | Fully interactive with console logs |
| `DarkMode` | Dark theme variant |
| `CustomTheme` | With custom brand colors |

### 11.2 Documentation Sections

- Overview & Purpose
- Installation
- Basic Usage
- Props Reference (auto-generated)
- States & Variants
- Question Types Catalog
- Accessibility Guidelines
- Theming Guide

---

## 12. Implementation Notes

### 12.1 File Structure

```
packages/design-system/src/
├── components/
│   └── ui/
│       └── toolbox-item.tsx      # Component
├── components/
│   └── ToolboxItem.stories.tsx   # Stories
└── index.ts                      # Export
```

### 12.2 Dependencies

- `@radix-ui/react-slot` (for asChild pattern, optional)
- `class-variance-authority` (for variant management)
- Material Symbols font (already in Design System)

### 12.3 Token Mapping Reference

| Legacy (Survey Builder) | Design System |
|-------------------------|---------------|
| `bg-surface-container` | `bg-card` |
| `bg-surface-container-lowest` | `bg-muted` |
| `text-primary` | `text-primary` |
| `text-on-surface` | `text-foreground` |
| `text-on-surface-disabled` | `text-muted-foreground` |
| `text-on-surface-variant` | `text-muted-foreground` |
| `border-outline` | `border-primary/20` |
| `cursor-grab` | `cursor-grab` |
| `cursor-not-allowed` | `cursor-not-allowed` |

---

## 13. Timeline & Milestones

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1 | Component implementation | 2 days |
| Phase 2 | Basic stories | 1 day |
| Phase 3 | All question types stories | 1 day |
| Phase 4 | Accessibility audit | 1 day |
| Phase 5 | Documentation & review | 1 day |

**Total Estimated:** 6 days

---

## 14. Open Questions

1. Should the component support multi-select for bulk operations?
2. Should there be a "favorite" or "recently used" indicator?
3. How should touch interactions work on mobile?
4. Should we support keyboard-based drag-and-drop?

---

## 15. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-21 | Initial PRD created |

---

## 16. Approvals

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | Pending |
| Design Lead | | | Pending |
| Engineering Lead | | | Pending |
| QA Lead | | | Pending |
