# Survey Builder Documentation

This document outlines the brand guidelines, technology stack, design system, and established design patterns for the Survey Builder application. It is a living document and will be updated with each new feature and design decision.

## 1. Brand Book

### Color Palette

The brand's primary color palette is based on a trio of core colors, implemented using the HSL color model for flexibility.

-   **Periwinkle (Primary)**: Used for key actions, selections, and focus states.
    -   Light Mode: `hsl(235 100% 67%)`
    -   Dark Mode: `hsl(235 100% 86%)`
-   **Green (Success)**: Used for confirmation messages, success states, and active status indicators.
    -   Light Mode: `hsl(162 100% 31%)`
    -   Dark Mode: `hsl(161 58% 65%)`
-   **Coral (Error)**: Used for warnings, errors, and destructive actions.
    -   Light Mode: `hsl(353 84% 64%)`
    -   Dark Mode: `hsl(353 100% 84%)`

### Typography

The application uses Google Fonts for a clean and modern aesthetic.

-   **Headings & Branding**: **Outfit** (Weights: 300 Light, 500 Medium, 800 Extrabold)
-   **Body & UI Text**: **Open Sans** (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold)

## 2. Style Sheet

Styling is implemented using **Tailwind CSS**, a utility-first CSS framework. A custom configuration in `index.html` extends Tailwind's default theme to include the application's design tokens (colors, fonts). This allows for rapid, consistent styling directly within the component markup.

## 3. Technology Used

-   **Frontend Framework**: React 19
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Icons**: Google Material Symbols (Rounded, Filled)
-   **Fonts**: Google Fonts (Outfit, Open Sans)
-   **State Management**: React Hooks (`useReducer`, `useContext`)
-   **AI Integration**: Google Gemini API (`@google/genai`)

## 4. Design System

The application employs a custom design system heavily inspired by **Google's Material Design 3 (MD3)**. It focuses on clarity, responsiveness, and accessibility. The system is built upon:

-   **Design Tokens**: A set of named variables for colors, typography, and spacing to ensure consistency.
-   **Reusable Components**: A library of React components for UI elements like cards, buttons, menus, and side panels.
-   **Iconography**: Consistent use of Google's Material Symbols.

## 5. Light & Dark Mode

The application supports both light and dark themes, which can be toggled by the user. The theme is persisted in `localStorage`. The color system is built on a set of semantic tokens that adapt to the current theme.

### Light Mode Tokens

```css
:root {
  --color-primary: 235 100% 67%;
  --color-on-primary: 0 0% 100%;
  --color-surface: 257 50% 99%;
  --color-surface-container: 0 0% 100%;
  --color-on-surface: 240 6% 10%;
  --color-outline: 221 7% 47%;
  --color-error: 353 84% 64%;
  --color-success: 162 100% 31%;
}
```

### Dark Mode Tokens

```css
.dark {
  --color-primary: 235 100% 86%;
  --color-on-primary: 236 51% 21%;
  --color-surface: 240 6% 10%;
  --color-surface-container: 230 5% 13%;
  --color-on-surface: 223 8% 90%;
  --color-outline: 223 6% 59%;
  --color-error: 353 100% 84%;
  --color-success: 161 58% 65%;
}
```

## 6. Design Patterns

Several key design patterns have been established to ensure a consistent and intuitive user experience, especially within the logic-building features.

-   **Smart Filtering**: Dropdown options for logic conditions are dynamically filtered based on the current context. For example, "Display Logic" only shows preceding questions, while "Branching Logic" and "Skip Logic" only show following questions for destinations.
-   **Progressive Disclosure**: Advanced or secondary options (like "Copy and paste" logic) are hidden from the initial view and are only revealed after the primary action has been taken, reducing initial cognitive load.
-   **Context-Aware Inputs**: UI controls adapt based on user selections. For instance, a free-text value field transforms into a dropdown of pre-filled choices when the user selects a multiple-choice question in a logic condition.
-   **Draft & Confirm Workflow**: Changes to complex logic are not applied to the survey immediately. They are stored in a temporary "draft" state. The original, confirmed logic remains active on the canvas until the user explicitly confirms the new changes, preventing errors from incomplete or accidental edits.
-   **Consistent Actions**: UI controls for similar actions are standardized. For example, adding a new logic condition is always labeled "+ Add condition" and is placed consistently in the UI.
-   **Logical Grouping**: Related features are grouped. All advanced survey features, including complex branching and workflows, are consolidated under a single "Branching Logic" section within the "Branching Logic" tab, creating a predictable location for power-user functionality.

## 7. MD3 Design Tokens & Components

### 7.1 Design Tokens

The application uses a token-based color system inspired by MD3. Key tokens include:

-   `primary`: The main accent color.
-   `on-primary`: Text/icons on top of the primary color.
-   `primary-container`: A lighter/toned-down version of the primary color for backgrounds.
-   `surface`: The main app background color.
-   `surface-container`: The background for components like cards, sidebars, and modals.
-   `on-surface`: The primary text color.
-   `on-surface-variant`: The secondary text color.
-   `outline`: For borders and dividers.
-   `error`/`success`: For feedback states.

### 7.2 Component Library (based on MD3 concepts)

-   **Top App Bar**: Implemented as `Header.tsx` and `SubHeader.tsx`.
-   **Navigation Rail**: Implemented as `LeftSidebar.tsx`.
-   **Side Sheet / Panel**: Implemented as `RightSidebar.tsx`, `BuildPanel.tsx`, and `GeminiPanel.tsx`.
-   **Cards**: The main component for questions, `QuestionCard.tsx`.
-   **Dialogs**: Implemented as `PasteChoicesModal.tsx`.
-   **Menus**: Dropdown menus for actions, implemented in `ActionMenus.tsx`.
-   **Buttons, Toggles, Selects**: Standard form elements styled with Tailwind CSS according to the design system.
-   **Expansion Panels (Accordions)**: Implemented as `CollapsibleSection` within components.

## 8. Google Icons & Fonts

-   **Icons**: The project uses **Material Symbols Rounded**. A global style is applied to make all icons **Filled** (`font-variation-settings: 'FILL' 1`) for a consistent and bold appearance.
-   **Fonts**: The project uses **Outfit** for headings and **Open Sans** for body copy and UI elements, both served from Google Fonts.

## 9. Component Documentation

This section provides detailed documentation for key reusable components within the application.

### 9.1 BlockActionsMenu

-   **File Location**: `components/ActionMenus.tsx`
-   **Component Name**: `BlockActionsMenu`

#### Purpose

The `BlockActionsMenu` is a unified, context-aware dropdown component that provides users with a consistent set of actions for a survey block. It is designed to be highly reusable and adaptable, showing only the actions that are relevant to the context in which it's used.

#### Usage

This component is triggered by clicking the "three-dots" icon on a block and is used in two primary locations:

1.  **Build Panel > Content Tab (`BuildPanel.tsx`)**: In this context, the menu provides a comprehensive set of actions, including editing, reordering, duplicating, and deleting blocks.
2.  **Survey Canvas (`SurveyBlock.tsx`)**: On the main canvas, the menu provides a slightly reduced set of actions. For example, "Move up/down" is omitted because reordering is handled via drag-and-drop in this view.

The component's flexibility comes from its props-driven rendering. An action is only displayed in the menu if its corresponding `on...` callback function is passed as a prop.

#### Design & UX

-   **Appearance**: Styled as an MD3-style menu, appearing as an absolutely positioned floating panel.
-   **Grouping**: Actions are logically grouped and separated by dotted dividers for improved scannability:
    -   Primary actions (Edit)
    -   Movement (Move up/down)
    -   Creation (Duplicate, Add question/block)
    -   Selection (Select/Unselect all)
    -   State changes (Collapse/Expand)
    -   Destructive actions (Delete)
-   **Contextual Disabling**: The menu accepts boolean `can...` props (e.g., `canMoveUp`) which control the `disabled` state of menu items, providing clear visual feedback to the user about which actions are currently available.

#### Props (API)

| Prop              | Type                | Description                                                                  |
| ----------------- | ------------------- | ---------------------------------------------------------------------------- |
| `onEdit`          | `() => void`        | Triggers opening the block editor sidebar.                                   |
| `onMoveUp`        | `() => void`        | Moves the block one position up in the survey.                               |
| `canMoveUp`       | `boolean`           | If `false`, the "Move up" option is disabled.                                |
| `onMoveDown`      | `() => void`        | Moves the block one position down in the survey.                             |
| `canMoveDown`     | `boolean`           | If `false`, the "Move down" option is disabled.                              |
| `onDuplicate`     | `() => void`        | Creates a copy of the block immediately below the original.                  |
| `onAddSimpleQuestion` | `() => void`    | Adds a new, default question to the end of the block.                        |
| `onAddFromLibrary` | `() => void`       | (Not implemented) Triggers opening the content library to add items.         |
| `onAddBlockAbove` | `() => void`        | Adds a new, empty block directly above the current one.                      |
| `onAddBlockBelow` | `() => void`        | Adds a new, empty block directly below the current one.                      |
| `onSelectAll`     | `() => void`        | Checks all questions within the block for bulk editing.                      |
| `canSelectAll`    | `boolean`           | If `false`, the "Select All" option is disabled.                             |
| `onUnselectAll`   | `() => void`        | Unchecks all questions within the block.                                     |
| `canUnselectAll`  | `boolean`           | If `false`, the "Unselect All" option is disabled.                           |
| `onExpand`        | `() => void`        | Expands a collapsed block to show its questions.                             |
| `canExpand`       | `boolean`           | If `false`, the "Expand block" option is disabled.                           |
| `onCollapse`      | `() => void`        | Collapses an expanded block to hide its questions.                           |
| `canCollapse`     | `boolean`           | If `false`, the "Collapse block" option is disabled.                         |
| `onDelete`        | `() => void`        | Deletes the block and all questions within it (displays in red).             |

### 9.2 QuestionActionsMenu

-   **File Location**: `components/ActionMenus.tsx`
-   **Component Name**: `QuestionActionsMenu`

#### Purpose

The `QuestionActionsMenu` is a unified dropdown component providing a consistent set of actions for a single survey question. It is designed to be context-aware, showing only relevant actions based on the question's state (e.g., active vs. deactivated) and the view it's rendered in.

#### Usage

This component is triggered by clicking the "three-dots" icon on a question and is used in two locations:

1.  **Build Panel > Content Tab (`BuildPanel.tsx`)**: In the list of survey content, this menu provides a full set of actions for managing questions from the sidebar.
2.  **Survey Canvas (`QuestionCard.tsx`)**: Directly on the question card, this menu offers quick access to the most common actions.

Like the `BlockActionsMenu`, its props-driven rendering ensures flexibility. An action is only displayed if its corresponding `on...` callback is provided.

#### Design & UX

-   **Appearance**: Styled as an MD3-style menu, appearing as an absolutely positioned floating panel.
-   **Grouping**: Actions are logically grouped with dotted dividers for clarity:
    -   **Structural Actions**: Modifying the question's position or content (Move, Duplicate, Add to Library, Add Page Break).
    -   **State & Interaction**: Actions that change the question's state or allow inspection (Preview, Activate/Deactivate).
    -   **Destructive Actions**: Actions that permanently remove the question (Delete), styled in red.
-   **Contextual Actions**: The menu intelligently displays "Activate" for a hidden question and "Deactivate" for a visible one, providing a clear toggle for the question's state.

#### Props (API)

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
