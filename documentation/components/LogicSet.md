# LogicSet

The `LogicSet` component serves as a container for managing a collection of `LogicConditionRow` components combined with an operator (AND/OR). It handles validation, transactional editing states, and rendering of the condition list.

## Features
- **Condition Management**: Add, update, and remove logic conditions.
- **Transactional Editing**: 
    - **Draft Mode**: Changes are made locally.
    - **Confirmed Mode**: View-only state (styled differently).
    - **Buttons**: "Apply" (commit), "Cancel" (revert/delete), "Delete" (remove set).
    - **Note**: The component manages an `isConfirmed` state for the Set itself to toggle these modes, but does not enforce row-level confirmation.
- **Operator Logic**: Toggle between AND/OR for multiple conditions.
- **Validation**: Validates completeness of all conditions (Question + Operator + Value) before applying.

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `logicSet` | `LogicSet` | The logic set object containing conditions and operator. |
| `availableQuestions` | `Question[]` | List of questions available for conditions. |
| `onUpdate` | `(updates: Partial<LogicSet>) => void` | Callback to update the logic set properties. |
| `onRemove` | `() => void` | Callback to remove the entire set. |
| `actionValue` | `'show' \| 'hide'` | Optional. Controls a "Show/Hide" dropdown header. |
| `transparentBackground` | `boolean` | Optional styling flag. |

## Usage

```tsx
<LogicSet
    logicSet={currentSet}
    availableQuestions={questions}
    onUpdate={handleSetUpdate}
    onRemove={handleSetRemove}
/>
```

## Logic
1.  **Validation**: `handleConfirmSet` checks if all conditions have required fields (`questionId`, `operator`, `value` unless empty operator).
2.  **Transactional State**: 
    - `isConfirmed`: True if the set is saved/applied. False if being edited.
    - On "Apply", validation runs. If valid, `onUpdate` is called with `isConfirmed: true`.
    - On "Cancel", reverts to `originalLogicSetRef` or removes if new.

## Dependencies
- `LogicConditionRow`: Renders individual conditions.
- `types`: Uses `LogicSet`, `DisplayLogicCondition`.
