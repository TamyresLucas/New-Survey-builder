# End Node Component

The End Node represents the termination point of a survey branch. A survey may have multiple end nodes depending on branching logic.

## Structure

```tsx
<div className="w-48 h-[60px] bg-surface-container border-success rounded-lg flex items-center justify-center gap-2 transition-all ...">
  <InputHandle highlighted={highlightInputHandle} />
  <CheckCircleIcon className="text-xl text-success" />
  <p className="text-base font-bold text-on-surface">{label}</p>
</div>
```

## Styling Specifications

-   **Dimensions**: `w-48 h-[60px]`
-   **Shape**: `rounded-lg` (Rectangle with rounded corners)
-   **Background**: `bg-surface-container`
-   **Border**: `border-success`
-   **Layout**: `flex items-center justify-center gap-2`

## States

| State | Border Width | Shadow |
| :--- | :--- | :--- |
| **Default** | `border-2` | `shadow-md` |
| **Selected** | `border-4` | `shadow-xl` |

## Connections

-   **Output**: None.
-   **Input**: Single `InputHandle` (Left).

## Components Used

-   **InputHandle**: See `DiagramNode_Handles.md`.
-   **CheckCircleIcon**: Iconography.

## Usage

Placed at the end of every logic branch where no further questions exist.
