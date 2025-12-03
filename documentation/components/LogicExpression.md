# Logic Expression Component

The Logic Expression component (implemented as `LogicConditionRow`) is the fundamental building block for defining logic rules. It allows users to construct a sentence-like condition (e.g., "If Q1 is selected").

## Structure

The component is a horizontal row containing inputs for the Question, Value (Answer), and Operator (Interaction).

```tsx
<div className="flex items-center gap-2 p-2 rounded-md w-full ...">
  {/* 1. Question Selector */}
  <div className="w-48 flex-shrink-0 ...">
    <QuestionSelectorDropdown />
  </div>

  {/* 2. Value/Answer Input */}
  <div className="flex-1 min-w-[150px] ...">
    <select className="w-full bg-transparent border rounded-md px-4 py-1.5 ...">
      {/* Options */}
    </select>
    {/* OR Input for text/numbers */}
  </div>

  {/* 3. Operator/Interaction Selector */}
  <div className="w-40 flex-shrink-0 ...">
    <select className="w-full bg-transparent border rounded-md px-4 py-1.5 ...">
      {/* Options */}
    </select>
  </div>

  {/* Actions */}
  <button className="p-1.5 text-on-surface-variant hover:text-error ...">
    <XIcon />
  </button>
  {/* Add/Confirm buttons... */}
</div>
```

## Styling Specifications

-   **Container**: `flex items-center gap-2 p-2 rounded-md w-full`
-   **Inputs (Select/Text)**:
    -   **Height**: `py-1.5` (Matches 32px standard with text-sm)
    -   **Padding**: `px-4` (16px)
    -   **Border**: `border` (1px)
    -   **Radius**: `rounded-md` (6px)
    -   **Background**: `bg-transparent`
    -   **Typography**: `text-sm text-on-surface`
-   **Action Buttons**:
    -   **Size**: `p-1.5` (Compact)
    -   **Icon Size**: `text-lg` (18px)

## States & Color Tokens

| State | Border | Text | Background |
| :--- | :--- | :--- | :--- |
| **Default** | `border-input-border` | `text-on-surface` | `bg-transparent` |
| **Focus** | `focus:outline-2 focus:outline-primary` | `text-on-surface` | `bg-transparent` |
| **Disabled** | `border-input-border` | `text-on-surface-variant` | `bg-surface-container-high` |
| **Error** | `border-error` | `text-on-surface` | `bg-transparent` |

### Action Buttons

-   **Remove**:
    -   Default: `text-on-surface-variant`
    -   Hover: `text-error bg-error-container`
-   **Add**:
    -   Default: `text-primary`
    -   Hover: `text-on-primary bg-primary`
-   **Confirm**:
    -   Default: `bg-primary text-on-primary`
    -   Hover: `opacity-90`

## Variants

1.  **Standard**: Question -> Value -> Operator
2.  **Choice Grid**: Question -> Row -> Operator -> Column Value
3.  **First Condition**: Question selector is read-only/fixed to the current question.

## Usage

-   **Logic Editors**: Used in Display Logic, Skip Logic, and Branching Logic editors.
-   **Interaction**:
    -   Select a question to populate available operators and values.
    -   Select an operator to define the relationship.
    -   Select/Enter a value to complete the condition.
    -   Use action buttons to manage the list of conditions.
