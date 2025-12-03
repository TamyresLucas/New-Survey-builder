# Tertiary Navigation (Panel Tabs)

The Tertiary Navigation component allows users to switch between different views or tools within a specific panel (e.g., switching between Toolbox, Content, and Library within the Build Panel).

## Structure

The component is a horizontal tab bar located at the top of a panel, below the panel header.

```tsx
<nav className="-mb-px flex space-x-6">
  <button className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-primary text-primary">
    Toolbox
  </button>
  <button className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-on-surface-variant hover:text-primary">
    Content
  </button>
  {/* ... more tabs */}
</nav>
```

## Styling Specifications

### Container
-   **Layout**: `flex space-x-6` (Horizontal layout with spacing)
-   **Positioning**: `-mb-px` (Aligns border with parent container border)

### Tab Item
-   **Height**: `h-[40px]`
-   **Layout**: `flex items-center`
-   **Padding**: `px-1`
-   **Typography**:
    -   **Font Family**: 'Open Sans', sans-serif
    -   **Size**: `text-sm`
    -   **Weight**: `font-medium`
-   **Border**: `border-b-2` (Bottom border indicator)
-   **Transition**: `transition-colors`

### States

| **Active** | `text-primary` | `border-primary` | None |
| **Inactive** | `text-on-surface-variant` | `border-transparent` | `hover:text-primary` |

## States

| State | Text Color | Border Color | Background |
| :--- | :--- | :--- | :--- |
| **Default (Inactive)** | `text-on-surface-variant` | `border-transparent` | Transparent |
| **Hover (Inactive)** | `text-primary` | `border-transparent` | Transparent |
| **Selected (Active)** | `text-primary` | `border-primary` | Transparent |
| **Focused** | `focus:outline-none` `focus:bg-surface-container-high` | - | `bg-surface-container-high` |
| **Disabled** | `text-on-surface-disabled` | `border-transparent` | Transparent |

## Scalability & Usage

This pattern is scalable for any panel requiring sub-navigation.

1.  **Define Tabs**: Create an array of tab names (e.g., `['Toolbox', 'Content', 'Library']`).
2.  **State Management**: Use a state variable (e.g., `activeTab`) to track the currently selected tab.
3.  **Rendering**: Map through the tabs array to render buttons, applying conditional styling based on the active state.

### Example Configuration

```typescript
const tabs = ['Toolbox', 'Content', 'Library'];
const [activeTab, setActiveTab] = useState('Toolbox');

// Render loop
{tabs.map(tab => (
  <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    className={...}
  >
    {tab}
  </button>
))}
```
