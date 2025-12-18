# Toggle Component

Toggles (Switches) are used to switch a single setting on or off. They are often paired with a label to indicate what feature is being controlled.

## Structure

The toggle component typically consists of a label and the switch itself, wrapped in a label element for accessibility and clickability.

```tsx
<label className="flex items-center cursor-pointer">
  <span className="text-sm font-medium text-on-surface mr-3">Label Text</span>
  <div className="relative">
    <input type="checkbox" className="sr-only peer" />
    <div className="w-10 h-6 bg-outline rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
  </div>
</label>
```

## Styling Specifications

### Label
-   **Typography**: `text-sm font-medium` (Open Sans)
-   **Color**: `text-on-surface`
-   **Spacing**: `mr-3` (Right margin to separate from toggle)

### Switch Track
-   **Dimensions**: `w-10 h-6` (40px x 24px)
-   **Shape**: `rounded-full`
-   **Default Color (Off)**: `bg-outline`
-   **Active Color (On)**: `bg-primary` (applied via `peer-checked:bg-primary`)

### Switch Knob
-   **Dimensions**: `h-5 w-5` (20px x 20px)
-   **Shape**: `rounded-full`
-   **Color**: `bg-white`
-   **Position**: Absolute, `top-0.5 left-[2px]`
-   **Transition**: `transition-all`
-   **Interaction**: Translates horizontally when checked (`peer-checked:after:translate-x-full`)

## States

| State | Track Color | Knob Position |
| :--- | :--- | :--- |
| **Default (Off)** | `bg-outline` | Left (`left-[2px]`) |
| **Checked (On)** | `bg-primary` | Right (`translate-x-full`) |
| **Hover** | `cursor-pointer` (on label) | - |
| **Focused** | `focus:ring-2` `focus:ring-primary` (on input) | - |
| **Disabled** | `opacity-50` `cursor-not-allowed` | - |

## Usage Examples

-   **Activate Survey**: Used in the Header to toggle the survey's active status.
-   **Autoadvance**: Used in Block settings to toggle automatic progression.
