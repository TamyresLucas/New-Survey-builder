# Question Selector Dropdown

The **Question Selector Dropdown** is a specialized variation of the [Dropdown Field](./DropdownField.md) designed specifically for selecting questions within the survey logic editors.

It inherits all styling and behavior from the standard Dropdown Field but is configured to **hug its content** rather than filling the full width of its container.

## Structure

```tsx
<QuestionSelectorDropdown
  questions={availableQuestions}
  selectedQuestionId={currentCondition.questionId}
  onSelect={(qid) => updateCondition('questionId', qid)}
/>
```

## Styling Specifications

-   **Width**: `w-fit` (Hugs content) with `min-w-[200px]`
-   **Height**: `h-[32px]`
-   **Padding**: `px-2`
-   **Typography**: `text-sm`
-   **Format**: Displays question ID and truncated text (e.g., `Q1: What is your...`)

## States & Color Tokens

Since this component is a child of the Dropdown Field, it uses the same semantic color tokens.

### Trigger Button

| State | Background | Border | Text |
| :--- | :--- | :--- | :--- |
| **Default** | `bg-transparent` | `border-input-border` | `text-on-surface` |
| **Hover** | `bg-transparent` | `border-input-border-hover` | `text-on-surface` |
| **Focused** | `bg-transparent` | `border-input-border` | `text-on-surface` |
| **Disabled** | `bg-surface-container-high` | `border-input-border` | `text-on-surface-disabled` |

### Dropdown List Item

| State | Background | Text |
| :--- | :--- | :--- |
| **Default** | `bg-transparent` | `text-on-surface` |
| **Hover** | `bg-surface-container-high` | `text-on-surface` |
| **Selected** | `bg-transparent` | `text-on-surface` |
| **Disabled** | `bg-transparent` | `text-on-surface-disabled` |

## Usage

-   **Logic Editors**: Used in Display Logic, Skip Logic, and Branching Logic rows to select the target question.
-   **Validation**: Automatically handles truncated text for long question titles.
