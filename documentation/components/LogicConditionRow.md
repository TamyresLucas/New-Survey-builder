# LogicConditionRow

The `LogicConditionRow` component renders a single row for configuring a logic condition (Display or Branching). It allows users to select a question, operator, and value/answer to define a condition.

## Features
- **Question Selection**: Select from available questions.
- **Operator Selection**: Dynamic operators based on question type (e.g., 'equals', 'contains', 'is empty').
- **Value Input**: 
    - Dropdown for Close-ended questions (Radio, Checkbox).
    - Numeric input for Numeric questions.
    - Text input for Open-ended questions.
    - specialized inputs for Choice Grids (Row + Value).
- **Validation**: Visual feedback (red borders) for invalid fields or logic issues.
- **Tooltips**: Displays logic issue messages on hover.

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `condition` | `DisplayLogicCondition \| BranchingLogicCondition` | The condition object containing current values. |
| `onUpdateCondition` | `(field, value) => void` | Callback to update specific fields of the condition. |
| `onRemoveCondition` | `() => void` | Callback to remove this condition. |
| `onAddCondition` | `() => void` | Optional. Callback to add a new condition after this one. |
| `availableQuestions` | `Question[]` | List of questions available for the condition selector. |
| `issues` | `LogicIssue[]` | List of issues related to this condition. |
| `invalidFields` | `Set<string>` | Set of field names that failed validation. |

## Usage

```tsx
<LogicConditionRow
    condition={currentCondition}
    onUpdateCondition={(field, value) => handleUpdate(index, field, value)}
    onRemoveCondition={() => handleRemove(index)}
    availableQuestions={questions}
    issues={[]}
/>
```

## Structure

```html
<div className="flex items-center gap-2 ...">
  <!-- Question Selector -->
  <QuestionSelectorDropdown />
  
  <!-- Operator Selector -->
  <select>...</select>
  
  <!-- Value/Answer Input -->
  <select> (or <input>) ...</select>
  
  <!-- Remove Button -->
  <Button variant="danger" iconOnly />
</div>
```
