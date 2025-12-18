# Dropdown List Component

The **Dropdown List** is the foundational "father" component used to building menus, action lists, and select options throughout the application. It standardizes the visual container, list items, and interaction states.

> **Parent Component**: This component defines the shared styles and behavior.
> **Child Implementations**: [Dropdown Field](./DropdownField.md), [Block Actions Menu](./BlockActionsMenu.md), [Question Actions Menu](./QuestionActionsMenu.md).

## Structure

```tsx
<DropdownList className="w-56">
  <DropdownItem onClick={handleEdit} icon={EditIcon}>
    Edit Item
  </DropdownItem>
  <DropdownDivider />
  <DropdownItem onClick={handleDelete} variant="danger">
    Delete
  </DropdownItem>
</DropdownList>
```

## Styling Specifications

### Container (List)
-   **Background**: `bg-surface-container`
-   **Border**: `border border-outline-variant`
-   **Shadow**: `shadow-lg`
-   **Radius**: `rounded-md`
-   **Padding**: `py-1` (Vertical padding)
-   **Z-Index**: `z-20` or higher

### List Item
-   **Height**: Auto / Min-height recommended
-   **Padding**: `px-4 py-2` (Standard) or `px-2 py-2` (Compact/Inputs)
-   **Typography**: `text-sm`, `text-on-surface`
-   **Hover**: `hover:bg-surface-container-high`
-   **Disabled**: `opacity-50`, `cursor-not-allowed`

### Variant: Danger
-   **Text**: `text-error`
-   **Hover**: `hover:bg-error-container` (Optional)

## Component API

### `<DropdownList>`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | - | List items |
| `className` | `string` | - | Additional styles (e.g., width) |
| `style` | `CSSProperties` | - | Inline styles (e.g., fonts) |

### `<DropdownItem>`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onClick` | `() => void` | - | Click handler |
| `icon` | `ComponentType` | - | Optional leading icon |
| `children` | `ReactNode` | - | Item label/content |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | - | Override styles |
| `variant` | `'default' \| 'danger'` | `'default'` | Semantic coloring |

### `<DropdownDivider>`
-   **Style**: `border-t border-dotted border-outline-variant mx-2`
