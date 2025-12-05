# DataCard Component

## Overview
The `DataCard` component is a small informational card used in the Survey Structure widget to display key survey metrics and statistics. It shows an icon, a label, and a numeric or text value, with support for different visual states.

## Location
`components/SurveyStructureWidget.tsx` (internal component)

## Structure

### Container
- **Height**: `55px` (fixed, `h-[55px]`)
- **Padding**: `8px` (`p-2`)
- **Gap**: `4px` (`gap-1`)
- **Border**: `1px solid` with `rounded-md` (4px radius)
- **Layout**: Flexbox column, items aligned to start

### Content Layout
1. **Label** (top)
   - Font: Open Sans
   - Size: `11px` (`text-[11px]`)
   - Line height: `15px` (`leading-[15px]`)
   
2. **Value Row** (bottom)
   - Icon (16px, `text-base`)
   - Value text (16px, `text-base`, font-medium)
   - Gap: `8px` (`gap-2`)

## States

### Default State
- **Background**: `bg-surface-container`
- **Border**: `border-outline-variant`
- **Label**: `text-on-surface-variant`
- **Value**: `text-on-surface`
- **Icon**: Uses the provided `icon` prop with `text-on-surface` color

### Success State
- **Background**: `bg-success-container`
- **Border**: `border-success`
- **Label**: `text-on-surface-variant` (unchanged)
- **Value**: `text-on-surface` (unchanged)
- **Icon**: Automatically displays `CheckCircleIcon` with `text-on-success-container` color

### Warning State
- **Background**: `bg-warning-container`
- **Border**: `border-warning`
- **Label**: `text-on-surface-variant` (unchanged)
- **Value**: `text-on-surface` (unchanged)
- **Icon**: Automatically displays `WarningIcon` with `text-on-warning-container` color

### Error State
- **Background**: `bg-error-container`
- **Border**: `border-error`
- **Label**: `text-on-surface-variant` (unchanged)
- **Value**: `text-on-surface` (unchanged)
- **Icon**: Automatically displays `WarningIcon` with `text-on-error-container` color

**Note**: This component does not have hover, focus, or selected states. It is purely informational and non-interactive.

**Icon Behavior**: When a state is set to `success`, `warning`, or `error`, the component automatically overrides the provided icon with the appropriate state icon (CheckCircleIcon for success, WarningIcon for warning/error). In the default state, the component uses the icon passed via the `icon` prop.

## Color Tokens

### Default
- Background: `--surface-container`
- Border: `--outline-variant`
- Label: `--on-surface-variant`
- Value: `--on-surface`
- Icon: `--on-surface`

### Success
- Background: `--success-container`
- Border: `--success`
- Icon: `--on-success-container`

### Warning
- Background: `--warning-container`
- Border: `--warning`
- Icon: `--on-warning-container`

### Error
- Background: `--error-container`
- Border: `--error`
- Icon: `--on-error-container`

## Props

```typescript
interface DataCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    state?: 'success' | 'warning' | 'error' | 'default';
}
```

- **icon**: Material icon component to display
- **label**: Descriptive text label (e.g., "Total questions", "Issues")
- **value**: Numeric or text value to display
- **state**: Visual state of the card (defaults to 'default')

## Usage Examples

### Default Card
```tsx
<DataCard 
    icon={QuestionIcon} 
    label="Total questions" 
    value={42} 
/>
// Displays QuestionIcon in default colors
```

### Success Card
```tsx
<DataCard 
    icon={WarningIcon} 
    label="No issues" 
    value={0} 
    state="success"
/>
// Displays CheckCircleIcon (overrides WarningIcon) in success colors
```

### Warning Card
```tsx
<DataCard 
    icon={ClockSolidIcon} 
    label="Completion time" 
    value="15-20 min" 
    state="warning"
/>
// Displays WarningIcon (overrides ClockSolidIcon) in warning colors
```

### Error Card
```tsx
<DataCard 
    icon={WarningIcon} 
    label="Issues" 
    value={3} 
    state="error"
/>
// Displays WarningIcon in error colors
```

## Design Guidelines

1. **Fixed Height**: Always maintain the 55px height for consistency
2. **State Usage**: 
   - Use `success` for positive metrics (e.g., no issues)
   - Use `warning` for attention-needed metrics (e.g., long completion time)
   - Use `error` for problematic metrics (e.g., validation issues)
   - Use `default` for neutral informational metrics
3. **Icon Selection**: Choose icons that clearly represent the metric being displayed
4. **Label Text**: Keep labels concise (1-3 words) to fit within the card
5. **Value Format**: Format numbers appropriately (e.g., "15-20 min" for time ranges)

## Accessibility

- The component uses semantic HTML with appropriate text hierarchy
- Color is not the only indicator of state (icon changes accompany color changes)
- Text maintains sufficient contrast in all states
