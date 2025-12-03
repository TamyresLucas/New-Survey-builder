# Secondary Navigation (Side Menu)

The Secondary Navigation component serves as the primary means of navigating between different functional modes within a specific workspace (e.g., switching between Build, Flow, and Logic views within the Survey Editor).

## Structure

The component is a vertical sidebar containing a list of navigation items. Each item is represented by an icon and a label.

```tsx
<nav className="w-16 bg-surface-container border-r border-outline-variant flex flex-col gap-[10px]">
  <button className="flex flex-col items-center justify-center w-full h-16 gap-1 ...">
    <Icon className="text-xl" />
    <span className="text-[11px]">Label</span>
  </button>
  {/* ... more items */}
</nav>
```

## Styling Specifications

### Container
-   **Width**: `w-16` (64px)
-   **Background**: `bg-surface-container`
-   **Border**: `border-r` (Right border), color `border-outline-variant`
-   **Layout**: Flex column
-   **Spacing**: `gap-[10px]` between items

### Navigation Item
-   **Dimensions**: `w-full h-16` (64px x 64px) - Square aspect ratio
-   **Layout**: Flex column, centered content
-   **Gap**: `gap-1` (4px) between icon and label
-   **Typography**:
    -   **Font Family**: 'Outfit', sans-serif
    -   **Size**: `text-[11px]`
    -   **Line Height**: `leading-[15px]`

### States

| **Active** | `text-primary` | `border-r-[3px] border-primary` | `font-medium` | None |
| **Inactive** | `text-on-surface-variant` | None | `font-light` | `hover:text-primary` |

## States

| State | Text/Icon Color | Border Indicator | Background |
| :--- | :--- | :--- | :--- |
| **Default (Inactive)** | `text-on-surface-variant` | None | Transparent |
| **Hover (Inactive)** | `text-primary` | None | Transparent |
| **Selected (Active)** | `text-primary` | `border-r-[3px] border-primary` | Transparent |
| **Focused** | `focus:outline-none` `focus:bg-surface-container-high` | - | `bg-surface-container-high` |
| **Disabled** | `text-on-surface-disabled` | None | Transparent |

## Scalability & Usage

This pattern is designed to be scalable. To add new navigation items:

1.  **Define the Item**: Add a new entry to the navigation configuration (e.g., `mainNavItems` constant).
2.  **Icon**: Ensure the icon is consistent in style (outline/filled) and size (`text-xl`).
3.  **Label**: Keep labels short (1-2 words) to fit within the 64px width without wrapping or truncation if possible.

### Example Configuration

```typescript
const navItems = [
  { id: 'build', label: 'Build', icon: BuildIcon },
  { id: 'flow', label: 'Flow', icon: FlowIcon },
  // Add new items here
];
```
