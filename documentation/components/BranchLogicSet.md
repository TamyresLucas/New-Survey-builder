---
title: Skip Logic Set (BranchLogicSet)
description: A component representing a set of logic conditions that result in a specific branch/skip action, typically used as a child of the Branching Logic Editor or Question Logic Set.
---

# Structure
The `BranchLogicSet` (conceptualized as "Skip Logic Set" by the user) is a specialized logic container that combines a set of conditions with a destination action ("Then skip to").

```jsx
<div id={branch.id} className="p-3 border border-outline-variant rounded-md bg-surface-container">
  {/* Header: Operators */}
  <div className="flex justify-between items-center mb-3">
    <span className="font-bold text-on-surface">IF</span>
    {/* Operator Toggle (AND/OR) if multiple conditions */}
  </div>

  {/* Conditions List */}
  <div className="space-y-2 mb-3">
    {/* Renders multiple LogicConditionRows */}
    <LogicConditionRow ... />
  </div>

  {/* Destination Row */}
  <DestinationRow 
    label="Then skip to" 
    ... 
  />

  {/* Footer: Actions */}
  <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/30">
    <Button variant="tertiary-primary">Add condition</Button>
    <div className="flex gap-2">
      <Button variant="tertiary">Cancel/Delete</Button>
      <Button variant="primary">Apply</Button>
    </div>
  </div>
</div>
```

# Styling Specifications
The component follows the standard card styling for logic sets.

## Container
- **Background**: `bg-surface-container`
- **Border**: `border border-outline-variant`
- **Radius**: `rounded-md`
- **Padding**: `p-3`

## Headers & Labels
- **"IF" Label**: `font-bold text-on-surface`
- **Operator Toggle**:
  - **Active**: `bg-primary text-on-primary`
  - **Inactive**: `bg-surface border border-outline text-on-surface-variant`
  - **Font**: `text-[10px] font-button-operator`

## Condition Rows
Uses `LogicConditionRow` with responsive width props to ensure fields fit within the container.
- **Question Width**: `flex-[1.5] min-w-[120px]`
- **Operator Width**: `flex-[1] min-w-[100px]`
- **Value Width**: `flex-[1] min-w-[100px]`

## Footer Actions
- **Add Condition**: `variant="tertiary-primary"`, `size="large"`
- **Cancel/Delete**: `variant="tertiary"` (or `danger` if confirmed), `size="large"`
- **Apply**: `variant="primary"`, `size="large"`
- **Separator**: `border-t border-outline-variant/30`

# States
1.  **Editing (Unconfirmed)**:
    -   Shows "Apply" button.
    -   "Cancel" button reverts changes.
    -   Inputs are editable.
2.  **Confirmed**:
    -   "Apply" button is hidden.
    -   "Delete" button removes the set.
    -   Inputs are typically read-only or click-to-edit (handled by children).

# Usage Guidelines
This component should be used within a `BranchingLogicEditor` to define a single branch path.

```tsx
import { BranchLogicSet } from './shared/BranchLogicSet';

<BranchLogicSet
    branch={branchData}
    onUpdate={handleUpdate}
    onRemove={handleRemove}
    availableQuestions={questions}
    followingQuestions={questions}
    survey={survey}
    currentBlockId={blockId}
    issues={issues}
    currentQuestion={currentQuestion}
/>
```

# Accessibility
-   All interactive elements (buttons, inputs) are keyboard focusable.
-   Semantic labeling for "IF" and "Then skip to" sections.
-   Contrast ratios met by standard color tokens.
