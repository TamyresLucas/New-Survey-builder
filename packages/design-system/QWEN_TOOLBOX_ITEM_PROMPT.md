# 🎯 Task: Implement ToolboxItem Component in Design System

## Objective
Create a `ToolboxItem` component in the Design System with comprehensive Storybook documentation, including all states, all question types from the Survey Builder, and proper grouping.

---

## 📦 Component Reference

### Current Implementation (from Survey Builder)
Location: `/components/SidebarToolboxItem.tsx`

```tsx
import { DragIndicatorIcon } from './icons';

interface SidebarToolboxItemProps {
    icon: React.ElementType;
    label: string;
    isEnabled?: boolean;
    isDragged?: boolean;
    isDraggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    className?: string;
    endAction?: React.ReactNode;
}

export const SidebarToolboxItem: React.FC<SidebarToolboxItemProps> = ({
    icon: Icon,
    label,
    isEnabled = true,
    isDragged = false,
    isDraggable = true,
    onDragStart,
    onDragEnd,
    className = '',
    endAction
}) => {
    return (
        <div
            draggable={isEnabled && isDraggable}
            onDragStart={isEnabled && isDraggable ? onDragStart : undefined}
            onDragEnd={isEnabled && isDraggable ? onDragEnd : undefined}
            className={`flex items-center justify-between px-4 h-[40px] border-b border-outline transition-all bg-surface-container group ${isEnabled ? 'hover:bg-surface-container-lowest cursor-grab' : 'cursor-not-allowed'
                } ${isDragged ? 'opacity-30' : ''} ${className}`}
        >
            <div className="flex items-center flex-grow truncate">
                <div className="relative w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                    <Icon className={`text-xl leading-none transition-opacity duration-200 group-hover:opacity-0 ${isEnabled ? 'text-primary' : 'text-on-surface-disabled'}`} />
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${isEnabled ? 'text-on-surface-variant' : 'text-on-surface-disabled'}`}>
                        <DragIndicatorIcon className="text-xl leading-none" />
                    </div>
                </div>
                <span className={`text-sm truncate ${isEnabled ? 'text-on-surface' : 'text-on-surface-disabled'}`} style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {label}
                </span>
            </div>
            {endAction && (
                <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {endAction}
                </div>
            )}
        </div>
    );
};
```

---

## 🎨 Design System Adaptation

### Props Interface
```tsx
interface ToolboxItemProps {
    /** Icon component to display */
    icon: React.ElementType;
    /** Label text */
    label: string;
    /** Whether the item is enabled (default: true) */
    isEnabled?: boolean;
    /** Whether the item is currently being dragged */
    isDragged?: boolean;
    /** Whether the item can be dragged (default: true) */
    isDraggable?: boolean;
    /** Drag start handler */
    onDragStart?: (e: React.DragEvent) => void;
    /** Drag end handler */
    onDragEnd?: (e: React.DragEvent) => void;
    /** Click handler (for non-draggable items) */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Optional end action (button, icon, etc.) */
    endAction?: React.ReactNode;
}
```

### Visual States to Implement
1. **Default** - Normal state with icon and label
2. **Hover** - Icon swaps to drag indicator, background changes
3. **Disabled** - Grayed out, not draggable, cursor-not-allowed
4. **Dragging** - Reduced opacity (opacity-30)
5. **With End Action** - Shows action button on hover

### Styling Requirements
- Use Design System tokens (`bg-muted`, `text-foreground`, `text-primary`, etc.)
- Height: 40px
- Icon size: 20px (w-5 h-5)
- Border bottom for separation
- Smooth transitions for hover effects
- On hover: icon fades out, drag indicator fades in

---

## 📋 Question Types (All 40 items)

### Complete Toolbox Items List
```tsx
const toolboxItems = [
    { name: 'Block', icon: 'rectangle', group: 'Structural' },
    { name: 'Auto Complete Dropdown', icon: 'dropdown', group: 'Multiple choices' },
    { name: 'Card Sort', icon: 'style', group: 'Advanced & Interactive' },
    { name: 'Carousel', icon: 'view_carousel', group: 'Advanced & Interactive' },
    { name: 'Cascading Dropdown', icon: 'dropdown', group: 'Multiple choices' },
    { name: 'Check Box', icon: 'check_box', group: 'Multiple choices' },
    { name: 'Choice Grid', icon: 'grid_view', group: 'Grid' },
    { name: 'Click Map', icon: 'touch_app', group: 'Advanced & Interactive' },
    { name: 'Comment Box', icon: 'chat_bubble_outline', group: 'Advanced & Interactive' },
    { name: 'Custom Grid', icon: 'dashboard_customize', group: 'Grid' },
    { name: 'Custom Scripting', icon: 'code', group: 'Advanced & Interactive' },
    { name: 'Date & Time', icon: 'event', group: 'Input' },
    { name: 'Description', icon: 'format_paragraph', group: 'Structural' },
    { name: 'Drag and Drop Ranking', icon: 'move_up', group: 'Rating & Scoring' },
    { name: 'Dropdown', icon: 'dropdown', group: 'Multiple choices' },
    { name: 'Email Address', icon: 'mail', group: 'Input' },
    { name: 'Email Collector', icon: 'attach_money', group: 'System Variable' },
    { name: 'File Upload', icon: 'upload_file', group: 'Advanced & Interactive' },
    { name: 'Hot Spot', icon: 'ads_click', group: 'Advanced & Interactive' },
    { name: 'Image Grid', icon: 'image', group: 'Grid' },
    { name: 'Image Select', icon: 'image', group: 'Multiple choices' },
    { name: 'Language Preference', icon: 'attach_money', group: 'System Variable' },
    { name: 'Lookup Table', icon: 'table_chart', group: 'Structural' },
    { name: 'Metadata Collector', icon: 'attach_money', group: 'System Variable' },
    { name: 'NPS', icon: 'sentiment_satisfied', group: 'Rating & Scoring' },
    { name: 'Numeric Input', icon: 'pin', group: 'Input' },
    { name: 'Numeric Ranking', icon: 'format_list_numbered', group: 'Rating & Scoring' },
    { name: 'Page Break', icon: 'insert_page_break', group: 'Structural' },
    { name: 'Phone Number', icon: 'attach_money', group: 'System Variable' },
    { name: 'Radio Button', icon: 'radio_button_checked', group: 'Multiple choices' },
    { name: 'Running Total', icon: 'grid_view', group: 'Grid' },
    { name: 'Secured Temporary Variable', icon: 'security', group: 'System Variable' },
    { name: 'Signature', icon: 'draw', group: 'Advanced & Interactive' },
    { name: 'Slider', icon: 'tune', group: 'Rating & Scoring' },
    { name: 'Star Rating', icon: 'star', group: 'Rating & Scoring' },
    { name: 'Text Highlighter', icon: 'format_ink_highlighter', group: 'Advanced & Interactive' },
    { name: 'Text Input', icon: 'edit_note', group: 'Input' },
    { name: 'Time Zone', icon: 'attach_money', group: 'System Variable' },
    { name: 'Timer', icon: 'timer', group: 'Advanced & Interactive' },
];
```

---

## 📁 Question Type Groupings

```tsx
const questionGroups = {
    'Advanced & Interactive': [
        'Card Sort', 'Carousel', 'Click Map', 'Comment Box', 
        'Custom Scripting', 'File Upload', 'Hot Spot', 'Signature', 
        'Text Highlighter', 'Timer'
    ],
    'Grid': [
        'Choice Grid', 'Custom Grid', 'Image Grid', 'Running Total'
    ],
    'Input': [
        'Date & Time', 'Email Address', 'Numeric Input', 'Text Input'
    ],
    'Multiple choices': [
        'Auto Complete Dropdown', 'Cascading Dropdown', 'Check Box', 
        'Dropdown', 'Image Select', 'Radio Button'
    ],
    'Rating & Scoring': [
        'Drag and Drop Ranking', 'NPS', 'Numeric Ranking', 'Slider', 'Star Rating'
    ],
    'Structural': [
        'Block', 'Description', 'Lookup Table', 'Page Break'
    ],
    'System Variable': [
        'Email Collector', 'Language Preference', 'Metadata Collector', 
        'Phone Number', 'Secured Temporary Variable', 'Time Zone'
    ]
};
```

---

## 📖 Storybook Stories to Create

### File: `ToolboxItem.stories.tsx`

```tsx
// Stories to implement:

export default {
    title: 'Components/Navigation/ToolboxItem',
    component: ToolboxItem,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

// 1. Default - Single item example
export const Default: Story = { ... };

// 2. AllStates - Shows all visual states
export const AllStates: Story = {
    render: () => (
        <div className="w-[280px] border rounded-lg overflow-hidden">
            <ToolboxItem icon={CheckBoxIcon} label="Default State" />
            <ToolboxItem icon={CheckBoxIcon} label="Disabled State" isEnabled={false} />
            <ToolboxItem icon={CheckBoxIcon} label="Dragging State" isDragged={true} />
            <ToolboxItem 
                icon={CheckBoxIcon} 
                label="With End Action" 
                endAction={<Button variant="ghost" size="icon">...</Button>}
            />
        </div>
    ),
};

// 3. AllQuestionTypes - Shows every question type with correct icon
export const AllQuestionTypes: Story = {
    render: () => (
        <div className="w-[280px] border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            {toolboxItems.map(item => (
                <ToolboxItem key={item.name} icon={item.icon} label={item.name} />
            ))}
        </div>
    ),
};

// 4. GroupedByCategory - Shows items organized by group with headers
export const GroupedByCategory: Story = {
    render: () => (
        <div className="w-[280px] border rounded-lg overflow-hidden">
            {Object.entries(questionGroups).map(([groupName, items]) => (
                <div key={groupName}>
                    <div className="px-4 py-2 bg-muted text-sm font-semibold">
                        {groupName}
                    </div>
                    {items.map(itemName => {
                        const item = toolboxItems.find(t => t.name === itemName);
                        return item ? (
                            <ToolboxItem 
                                key={item.name} 
                                icon={item.icon} 
                                label={item.name} 
                            />
                        ) : null;
                    })}
                </div>
            ))}
        </div>
    ),
};

// 5. InteractiveDemo - Fully interactive with drag simulation
export const InteractiveDemo: Story = { ... };

// 6. Searchable - With search filter (like real toolbox)
export const Searchable: Story = { ... };
```

---

## 🎯 Implementation Checklist

### Component (`/components/ui/toolbox-item.tsx`)
- [ ] Create ToolboxItem component with all props
- [ ] Implement hover state with icon swap animation
- [ ] Support disabled state
- [ ] Support dragging state (opacity reduction)
- [ ] Support endAction slot
- [ ] Use Design System tokens (NOT legacy tokens like `bg-surface-container`)
- [ ] Export from index.ts

### Icons
- [ ] Use Material Symbols from Design System
- [ ] Create DragIndicator icon if not exists
- [ ] Map all question type icons

### Stories
- [ ] Default story
- [ ] AllStates story
- [ ] AllQuestionTypes story (40 items)
- [ ] GroupedByCategory story (7 groups)
- [ ] InteractiveDemo story
- [ ] Searchable story (optional)

### Token Mapping (Legacy → Design System)
| Legacy Token | Design System Token |
|--------------|---------------------|
| `bg-surface-container` | `bg-card` |
| `bg-surface-container-lowest` | `bg-muted` |
| `text-primary` | `text-primary` |
| `text-on-surface` | `text-foreground` |
| `text-on-surface-disabled` | `text-muted-foreground` |
| `text-on-surface-variant` | `text-muted-foreground` |
| `border-outline` | `border-border` ou `border-primary/20` |

---

## ⚠️ Important Notes

1. **Do NOT use legacy tokens** like `bg-surface-container` - use Design System tokens
2. **Icons must use Material Symbols** - the Design System already has these set up
3. **Test hover state carefully** - the icon swap animation is a key UX feature
4. **Maintain 40px height** - this is consistent with the Survey Builder
5. **Border-bottom is important** - creates visual separation between items

---

## 📁 Files to Create/Modify

1. `packages/design-system/src/components/ui/toolbox-item.tsx` - Component
2. `packages/design-system/src/components/ToolboxItem.stories.tsx` - Stories
3. `packages/design-system/src/index.ts` - Export

---

## 🔍 Reference Screenshots

The component should look exactly like the toolbox in the Survey Builder's Build panel left sidebar. Key visual characteristics:
- Clean, minimal design
- Icon on the left (20px)
- Label text truncates if too long
- On hover: icon fades to drag indicator
- Disabled items are grayed out
- Smooth transitions (200ms)
