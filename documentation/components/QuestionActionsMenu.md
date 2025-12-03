# QuestionActionsMenu

-   **File Location**: `components/ActionMenus.tsx`
-   **Component Name**: `QuestionActionsMenu`

## Purpose

The `QuestionActionsMenu` is a unified dropdown component providing a consistent set of actions for a single survey question. It is designed to be context-aware, showing only relevant actions based on the question's state (e.g., active vs. deactivated) and the view it's rendered in.

## Usage

This component is triggered by clicking the "three-dots" icon on a question and is used in two locations:

1.  **Build Panel > Content Tab (`BuildPanel.tsx`)**: In the list of survey content, this menu provides a full set of actions for managing questions from the sidebar.
2.  **Survey Canvas (`QuestionCard.tsx`)**: Directly on the question card, this menu offers quick access to the most common actions.

Like the `BlockActionsMenu`, its props-driven rendering ensures flexibility. An action is only displayed if its corresponding `on...` callback is provided.

## Design & UX

-   **Appearance**: Styled as an MD3-style menu, appearing as an absolutely positioned floating panel.
-   **Grouping**: Actions are logically grouped with dotted dividers for clarity:
    -   **Structural Actions**: Modifying the question's position or content (Move, Duplicate, Add to Library, Add Page Break).
    -   **State & Interaction**: Actions that change the question's state or allow inspection (Preview, Activate/Deactivate).
    -   **Destructive Actions**: Actions that permanently remove the question (Delete), styled in red.
-   **Contextual Actions**: The menu intelligently displays "Activate" for a hidden question and "Deactivate" for a visible one, providing a clear toggle for the question's state.

## Props (API)

| Prop                  | Type                  | Description                                                                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `question`            | `Question`            | **Required.** The question object to which the actions apply. Used to determine state (e.g., `isHidden`).    |
| `onMoveToNewBlock`    | `() => void`          | Moves the question into a new, dedicated block.                                                               |
| `onDuplicate`         | `() => void`          | Creates a copy of the question immediately below the original.                                                |
| `onAddToLibrary`      | `() => void`          | (Not implemented) Placeholder for adding the question to a reusable content library.                          |
| `onAddPageBreak`      | `() => void`          | Inserts a page break element directly after the current question.                                             |
| `onPreview`           | `() => void`          | Opens the right sidebar and navigates directly to the "Preview" tab for this question.                        |
| `onActivate`          | `() => void`          | Makes a hidden question visible to respondents. Only shown if `question.isHidden` is `true`.                    |
| `onDeactivate`        | `() => void`          | Hides a visible question from respondents. Only shown if `question.isHidden` is `false` or `undefined`.       |
| `onDelete`            | `() => void`          | Permanently deletes the question from the survey.                                                             |
| `onReplaceFromLibrary`| `() => void`          | (Not implemented) Placeholder for replacing the question with one from the library.                           |
