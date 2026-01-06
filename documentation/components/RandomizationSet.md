# RandomizationSet

The `RandomizationSet` component serves as a container for managing a collection of `RandomizationRow` components (rules) within a specific survey block. It handles the local state of rules, performs validation, and commits changes to the block via the "Apply" action.

## Features
- **Rule Management**: Add, update, and remove randomization rules.
- **Transactional Editing**: Uses local state to buffer changes. Updates are only committed to the block when "Apply" is clicked.
- **Validation**:
    - **Range Overlap**: Detects if multiple rules manipulate the same question range.
    - **Invalid Range**: Detects if Start question appears after End question.
    - **Feedback**: Reports issues as `LogicIssue` objects.
- **Lifecycle Management**: Resets local state when block props change or "Cancel" is triggered.

## Props
- `rules` (QuestionRandomizationRule[]): The list of randomization rules to display/manage.
- `availableQuestions` (Question[]): List of questions available for selection.
- `onUpdate` (function): Callback with the updated list of rules when "Apply" is clicked or rules are deleted.
- `availableGroups` (string[]): List of group names available for grouping.
- `transparentBackground` (boolean): Optional flag for transparency matches LogicSet styling.

## Usage

```tsx
<RandomizationSet
  rules={block.questionRandomization || []}
  onUpdate={(rules) => onUpdateBlock(block.id, { questionRandomization: rules })}
  availableQuestions={block.questions}
  availableGroups={localQuestionGroups}
/>
```

## Structure

```html
<div className="border border-outline ...">
  <!-- List of Rows or Empty State -->
  <div className="flex flex-col">
    <RandomizationRow />
    <RandomizationRow />
    <!-- ... -->
  </div>

  <!-- Footer Actions -->
  <div className="flex items-center justify-between ...">
    <!-- Add Button -->
    <button>+ Add randomization</button>
    
    <!-- Action Buttons -->
    <div>
        <Button variant="tertiary">Cancel</Button>
        <Button variant="primary">Apply</Button>
    </div>
  </div>
</div>
```

## Logic
1.  **Initialization**: `useEffect` syncs `localRules` with `block.questionRandomization` on mount or prop change.
2.  **Add Rule**: Appends a new empty rule with a generated ID.
3.  **Validate**: 
    - Checks `idx1_start > idx1_end` (Invalid Range).
    - Checks `min1 <= max2 && min2 <= max1` (Overlap).
    - Uses `availableQuestions` order for index calculation.
4.  **Save**: On "Apply", calls `onUpdate` with valid rules.

## Dependencies
- `RandomizationRow`: Renders individual rules.
- `types`: Uses `QuestionRandomizationRule`, `LogicIssue`.
