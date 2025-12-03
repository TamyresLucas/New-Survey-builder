# Tag Component

Tags are used to label items with status, categories, or specific features. They are compact elements that provide quick context.

## Status Tags

Used primarily in the Header to indicate the survey's lifecycle state.

-   **Shape**: `rounded-[16px]` (Pill shape)
-   **Padding**: `px-2 py-1`
-   **Typography**: `text-sm font-normal` (Open Sans)
-   **Height**: Fixed `h-[27px]`
-   **Border**: 1px solid

### Variants

| **Pending** | `bg-warning-container` | `border-warning` | `text-on-warning-container` | Pending update |

## States

| State | Visual Change |
| :--- | :--- |
| **Default** | See Variants table above. |
| **Hover** | None (Tags are typically static indicators). |
| **Focused** | None (unless interactive). |
| **Disabled** | `opacity-50` (if applicable). |

## Feature Tags

## Feature Tags

Used within components to indicate enabled features (e.g., Autoadvance on a Block).

-   **Shape**: `rounded-full`
-   **Padding**: `px-2 py-0.5`
-   **Typography**: `text-xs font-medium`
-   **Background**: `bg-primary-container`
-   **Text**: `text-on-primary-container`
