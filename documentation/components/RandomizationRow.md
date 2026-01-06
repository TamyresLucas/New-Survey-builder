# RandomizationRow

The `RandomizationRow` component renders a single row for configuring a randomization rule within a survey block. It allows users to start and end questions for the range, select a randomization pattern, and configure grouping or synchronization options.

## Features
- **Range Selection**: Select Start and End questions from the available list.
- **Pattern Selection**: Choose from predefined randomization patterns (Permutation, Rotation, Reverse Order, etc.).
- **Conditional Inputs**: Dynamic fields for "Synchronize With" and "Group By" based on the selected pattern.
- **Validation**: Visual feedback for disabled states.

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `rule` | `QuestionRandomizationRule` | The randomization rule object containing current values. |
| `questions` | `Question[]` | List of available questions for the start/end dropdowns. |
| `onUpdate` | `(updates: Partial<QuestionRandomizationRule>) => void` | Callback to update rule properties. |
| `onRemove` | `() => void` | Callback to remove this rule. |
| `index` | `number` | The visual index (0-based) of the row. |
| `totalRules` | `number` | Total number of rules in the set. |
| `availableGroups` | `string[]` | List of group names for "By Group Of" pattern. |
| `disabled` | `boolean` | Whether inputs are disabled (e.g., when set is confirmed). |

## Usage
- Renders a row of inputs for Start/End questions and Pattern.
- Displays "Synchronize With" input if `pattern === 'synchronized'`.
- Displays "By Group Of" dropdown for other patterns if groups exist.
- **Buttons**:
  - **Remove** (Trash): Always available to delete the rule.

```tsx
<RandomizationRow
  rule={currentRule}
  questions={blockQuestions}
  onUpdate={handleRuleUpdate}
  onRemove={handleRuleRemove}
  index={0}
  totalRules={1}
  availableGroups={['Group A', 'Group B']}
/>
```

## Structure

```html
<div className="flex items-center gap-2 p-2 ...">
  <!-- Index Number -->
  <div>1</div>
  
  <!-- Start Question -->
  <select>...</select>
  
  <!-- End Question -->
  <select>...</select>
  
  <!-- Pattern -->
  <select>...</select>
  
  <!-- Conditional: Synchronize With -->
  <input type="text" />
  
  <!-- Conditional: Group By -->
  <select>...</select>
  
  <!-- Remove Button -->
  <Button iconOnly variant="danger" />
</div>
```

## Notes
- **Accessibility**: Inputs have `aria-label` attributes for screen readers.
- **Data Model**: The component overloads `questionGroupId` for both "Synchronize With" target ID and "Group By" group name. Ensure correct context handling in parent components.
