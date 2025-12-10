# Dropdown Field & List Component

The Dropdown component provides a user-friendly way to select a single option from a list. It consists of a **Trigger Button** and a **Dropdown List** (menu) containing **Option Items**.

## Structure

```tsx
<div className="relative">
  {/* Trigger Button */}
  <button className="w-full h-[40px] flex items-center justify-between bg-transparent border border-input-border rounded-md px-3 text-sm text-left text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-2 focus:outline-primary transition-colors">
    <div className="flex items-center truncate">
       {/* Icon Container (Fixed 19px) */}
      {selectedOption?.icon && (
        <div className="w-[19px] h-[19px] flex-shrink-0 flex items-center justify-center mr-2">
          <Icon className="text-base text-primary" />
        </div>
      )}
      {/* Label (Line Height 19px) */}
      <span className="truncate leading-[19px]">Selected Option</span>
    </div>
    <ChevronDownIcon className="text-base text-on-surface-variant flex-shrink-0" />
  </button>

  {/* Dropdown List */}
  {isOpen && (
    <ul className="absolute top-full left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto bg-surface-container border border-outline-variant rounded-md shadow-lg z-20 py-1">
      {/* Option Item */}
      <li>
        <button className="w-full text-left px-3 py-2 text-sm flex items-center text-on-surface hover:bg-surface-container-high">
           {/* Icon Container (Fixed 19px) */}
          {option.icon && (
            <div className="w-[19px] h-[19px] flex-shrink-0 flex items-center justify-center mr-2">
              <Icon className="text-base text-primary" />
            </div>
          )}
           {/* Label (Line Height 19px) */}
          <span className="truncate leading-[19px]">Option Label</span>
        </button>
      </li>
    </ul>
  )}
</div>
```

## Styling Specifications

### Trigger Button
-   **Height**: `h-[32px]` (Fixed)
-   **Padding**: `px-2` (Horizontal: 8px)
-   **Border**: `border border-input-border`
-   **Radius**: `rounded-md` (4px)
-   **Typography**: `text-sm` (14px), `text-on-surface`

### Dropdown List (Container)
Inherits styling and behavior from the [Dropdown List](./DropdownList.md) component.

-   **Background**: `bg-surface-container`
-   **Border**: `border border-outline-variant`
-   **Shadow**: `shadow-lg`
-   **Spacing**: `mt-1` (4px margin from trigger)
-   **Z-Index**: `z-20` (Layers above content)

### Option Item
-   **Height**: Auto (determined by padding + content)
-   **Padding**: `px-2 py-2` (Horizontal: 8px, Vertical: 8px)
-   **Typography**: `text-sm` (14px), `leading-[19px]`
-   **Icon Alignment**: Fixed `w-[19px] h-[19px]` container to ensure perfect text alignment across options with/without icons.

## States & Color Tokens

### Trigger Button

| State | Background | Border | Text | Icon (Chevron) |
| :--- | :--- | :--- | :--- | :--- |
| **Default** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant` |
| **Hover** | `bg-transparent` | `border-input-border-hover` | `text-on-surface` | `text-on-surface-variant` |
| **Focused** | `bg-transparent` | `border-input-border` | `text-on-surface` | `text-on-surface-variant` |
| **Disabled** | `bg-surface-container-high` | `border-input-border` | `text-on-surface-disabled` | `text-on-surface-disabled` |

*Note: Focused state adds `focus:outline-primary` ring.*

### Dropdown List Item

| State | Background | Text | Icon |
| :--- | :--- | :--- | :--- |
| **Default** | `bg-transparent` | `text-on-surface` | `text-primary` (or specific color) |
| **Hover** | `bg-surface-container-high` | `text-on-surface` | `text-primary` |
| **Selected** | `bg-transparent` | `text-on-surface` | `text-primary` |
| **Disabled** | `bg-transparent` | `text-on-surface-disabled` | `text-on-surface-disabled` |

## Usage Guidelines

1.  **Alignment**: Always use the `DropdownField` component to ensure consistent 40px height and padding.
2.  **Icons**: Icons are optional. If used, they are automatically wrapped in a 19px container to maintain text alignment with non-icon options.
3.  **Scrolling**: The list automatically scrolls (`max-h-60`) if there are many options.
