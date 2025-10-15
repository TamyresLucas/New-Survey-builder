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

-   **Smart Filtering**: Dropdown options for logic conditions are dynamically filtered based on the current context. For example, "Display Logic" only shows preceding questions, while "Advanced Logic" and "Skip Logic" only show following questions for destinations.
-   **Progressive Disclosure**: Advanced or secondary options (like "Copy and paste" logic) are hidden from the initial view and are only revealed after the primary action has been taken, reducing initial cognitive load.
-   **Context-Aware Inputs**: UI controls adapt based on user selections. For instance, a free-text value field transforms into a dropdown of pre-filled choices when the user selects a multiple-choice question in a logic condition.
-   **Draft & Confirm Workflow**: Changes to complex logic are not applied to the survey immediately. They are stored in a temporary "draft" state. The original, confirmed logic remains active on the canvas until the user explicitly confirms the new changes, preventing errors from incomplete or accidental edits.
-   **Consistent Actions**: UI controls for similar actions are standardized. For example, adding a new logic condition is always labeled "+ Add condition" and is placed consistently in the UI.
-   **Logical Grouping**: Related features are grouped. All advanced survey features, including complex branching and workflows, are consolidated under a single "Advanced Logic" section within the "Advanced" tab, creating a predictable location for power-user functionality.

### 6.1 Logic Flow Visualization

A key design pattern in the "Logic" tab is the clear, visual representation of the survey's flow. This is achieved through a set of specialized, read-only components that provide a high-level overview of the respondent's path.

#### 6.1.1 Logic Question Card

This component (`LogicQuestionCard.tsx`) is a condensed, non-interactive card that represents a single question in the survey flow. Its structure is designed for quick recognition and understanding:

*   **Header**: The top of the card features a colored badge containing the question's type icon (e.g., Radio Button, Checkbox) and its unique variable name (e.g., `Q1`, `Q2`), which is automatically inherited from the survey structure defined in the "Build" tab.
*   **Body**: Below the header, the card displays the truncated question text. If the question has choices, the first few are listed, including their own variables (e.g., `Q1_1 Yes`, `Q1_2 No`), to provide context without cluttering the view.
*   **Survey Flow Connectors**: These are the circular points on the left and right edges of the card that act as anchors for the connection lines. Their visibility is context-dependent to clearly define the start and end of a flow:
    *   The **first question** in the survey only has a right-side (outgoing) connector.
    *   All **intermediate questions** have both left (incoming) and right (outgoing) connectors.
    *   The **last question** in a sequence only has a left-side (incoming) connector.

#### 6.1.2 Survey Flow Lines & Branching

The path between questions is visualized using lines and branching patterns:

*   **Linear Flow**: For standard sequential progress, a straight, arrow-tipped line connects the right connector of one card to the left connector of the next.
*   **Branching Logic**: When skip logic is present, the flow visual changes to show the conditional path (`LogicBranch.tsx`).
    *   The question being skipped is moved below the main horizontal path.
    *   Smooth, curved lines branch off from the source question's connector, connecting down to the skipped question, and then back up to rejoin the main flow at the target question.
    *   These curved paths are labeled with the choice that triggers them (e.g., "No"), making the conditional logic immediately apparent. The direct path is also labeled (e.g., "Yes").

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
-   **Logic View Card**: A specialized, read-only card for visualizing survey flow, `LogicQuestionCard.tsx`.
-   **Dialogs**: Implemented as `PasteChoicesModal.tsx`.
-   **Menus**: Dropdown menus for actions, implemented in `ActionMenus.tsx`.
-   **Buttons, Toggles, Selects**: Standard form elements styled with Tailwind CSS according to the design system.
-   **Expansion Panels (Accordions)**: Implemented as `CollapsibleSection` within components.

## 8. Google Icons & Fonts

-   **Icons**: The project uses **Material Symbols Rounded**. A global style is applied to make all icons **Filled** (`font-variation-settings: 'FILL' 1`) for a consistent and bold appearance.
-   **Fonts**: The project uses **Outfit** for headings and **Open Sans** for body copy and UI elements, both served from Google Fonts.