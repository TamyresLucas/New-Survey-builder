# Start Node Component

The Start Node represents the entry point of the survey flow. It is a strictly visual start marker with a single outgoing connection.

## Structure

```tsx
<div className="w-48 h-[60px] bg-surface-container border-success rounded-lg flex items-center justify-center transition-all ...">
  <p className="text-base font-bold text-on-surface">Start of Survey</p>
  <OutputHandle highlighted={highlightSourceHandles} />
</div>
```

## Styling Specifications

-   **Dimensions**: `w-48 h-[60px]`
-   **Shape**: `rounded-lg` (Card shape, matching End Node)
-   **Background**: `bg-surface-container`
-   **Border**: `border-success` (Green border indicating "Start")
-   **Typography**: `text-base font-bold text-on-surface`
-   **Label**: Hardcoded to "Start of Survey" to ensure consistency.

## States

| State | Border Width | Shadow |
| :--- | :--- | :--- |
| **Default** | `border-2` | `shadow-md` |
| **Selected** | `border-4` | `shadow-xl` |

## Connections

-   **Output**: Single `OutputHandle` (Right).
-   **Input**: None.

## Components Used

-   **OutputHandle**: See `DiagramNode_Handles.md`.

## Usage

Generated automatically at the beginning of the survey flow diagram. Always connects to the first question or description node.
