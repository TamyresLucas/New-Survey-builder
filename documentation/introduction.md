# Survey Builder Documentation

This document outlines the brand guidelines, technology stack, design system, and established design patterns for the Survey Builder application. It is a living document and will be updated with each new feature and design decision.

## Technology Used

-   **Frontend Framework**: React 19
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Icons**: Google Material Symbols (Rounded, Filled)
-   **Fonts**: Google Fonts (Outfit, Open Sans)
-   **State Management**: React Hooks (`useReducer`, `useContext`)
-   **AI Integration**: Google Gemini API (`@google/genai`)

## Design System

The application employs a custom design system heavily inspired by **Google's Material Design 3 (MD3)**. It focuses on clarity, responsiveness, and accessibility. The system is built upon:

-   **Design Tokens**: A set of named variables for colors, typography, and spacing to ensure consistency.
-   **Reusable Components**: A library of React components for UI elements like cards, buttons, menus, and side panels.
-   **Iconography**: Consistent use of Google's Material Symbols.

### Style Sheet

Styling is implemented using **Tailwind CSS**, a utility-first CSS framework. A custom configuration in `index.html` extends Tailwind's default theme to include the application's design tokens (colors, fonts). This allows for rapid, consistent styling directly within the component markup.

## Design Patterns

Several key design patterns have been established to ensure a consistent and intuitive user experience, especially within the logic-building features.

-   **Smart Filtering**: Dropdown options for logic conditions are dynamically filtered based on the current context. For example, "Display Logic" only shows preceding questions, while "Branching Logic" and "Skip Logic" only show following questions for destinations.
-   **Progressive Disclosure**: Advanced or secondary options (like "Copy and paste" logic) are hidden from the initial view and are only revealed after the primary action has been taken, reducing initial cognitive load.
-   **Context-Aware Inputs**: UI controls adapt based on user selections. For instance, a free-text value field transforms into a dropdown of pre-filled choices when the user selects a multiple-choice question in a logic condition.
-   **Draft & Confirm Process**: Changes to complex logic are not applied to the survey immediately. They are stored in a temporary "draft" state. The original, confirmed logic remains active on the canvas until the user explicitly confirms the new changes, preventing errors from incomplete or accidental edits.
-   **Consistent Actions**: UI controls for similar actions are standardized. For example, adding a new logic condition is always labeled "+ Add condition" and is placed consistently in the UI.
-   **Logical Grouping**: Related features are grouped. All advanced survey features, including complex branching and advanced logic, are consolidated under a single "Branching Logic" section within the "Branching Logic" tab, creating a predictable location for power-user functionality.

## Component Library Overview

Based on MD3 concepts:

-   **Top App Bar**: Implemented as `Header.tsx` and `SubHeader.tsx`.
-   **Navigation Rail**: Implemented as `LeftSidebar.tsx`.
-   **Side Sheet / Panel**: Implemented as `RightSidebar.tsx`, `BuildPanel.tsx`, and `GeminiPanel.tsx`.
-   **Cards**: The main component for questions, `QuestionCard.tsx`.
-   **Dialogs**: Implemented as `PasteChoicesModal.tsx`.
-   **Menus**: Dropdown menus for actions, implemented in `ActionMenus.tsx`.
-   **Buttons, Toggles, Selects**: Standard form elements styled with Tailwind CSS according to the design system.
-   **Expansion Panels (Accordions)**: Implemented as `CollapsibleSection` within components.

## App Changelog

The application maintains a detailed changelog of all modifications, improvements, and technical changes. These logs are organized by date in the `changelogs/` directory.

### Structure
Each entry in the changelog follows this format:
1.  **Written Request**: The original request from the user.
2.  **Improvements**: A summary of the functional or visual improvements made.
3.  **Technical Changes**: Detailed explanation of the code modifications.

### Daily Summaries
To view the changes for a specific day, refer to the corresponding markdown file (e.g., `changelogs/2025-12-01.md`). You can ask the AI assistant to "Summarize today's changes" to get a consolidated report based on these files.
