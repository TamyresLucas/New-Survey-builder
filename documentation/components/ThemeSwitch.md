# Theme Switch Component

The Theme Switch allows users to toggle between Light and Dark modes. It is typically located within the User Menu.

## Structure

The component consists of a pill-shaped container holding two circular buttons, one for each theme state.

```tsx
<div className="flex items-center rounded-full bg-surface-container-high p-1">
  <button className="w-7 h-7 flex items-center justify-center rounded-full transition-colors bg-primary text-on-primary">
    <SunIcon className="text-base" />
  </button>
  <button className="w-7 h-7 flex items-center justify-center rounded-full transition-colors text-on-surface-variant">
    <MoonIcon className="text-base" />
  </button>
</div>
```

## Styling Specifications

### Container
-   **Background**: `bg-surface-container-high`
-   **Shape**: `rounded-full`
-   **Padding**: `p-1` (Creates spacing between the container edge and the buttons)
-   **Layout**: `flex items-center`

### Buttons (Options)
-   **Dimensions**: `w-7 h-7` (28px x 28px)
-   **Shape**: `rounded-full`
-   **Alignment**: `flex items-center justify-center`
-   **Transition**: `transition-colors`

### States

| State | Background | Text Color | Icon |
| :--- | :--- | :--- | :--- |
| **Active** | `bg-primary` | `text-on-primary` | Sun (Light) / Moon (Dark) |
| **Inactive** | Transparent | `text-on-surface-variant` | Sun (Light) / Moon (Dark) |

## Usage

-   **Location**: User Menu (Header).
-   **Function**: Toggles the global application theme between 'light' and 'dark'.
