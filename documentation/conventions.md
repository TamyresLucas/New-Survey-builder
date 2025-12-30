# Project Conventions

This document serves as the single source of truth for established technical and design conventions in the Survey Builder project.

## 1. Technology Stack

*   **Frontend Framework**: React 19
*   **Build Tool**: Vite 4
*   **Language**: TypeScript 5.9
*   **Styling**: Tailwind CSS (Loaded via CDN in `index.html`, NOT via npm)
*   **Icons**: Google Material Symbols (Rounded, Filled, via CDN)
*   **Fonts**: 
    *   **Headings**: Outfit
    *   **Body**: Open Sans
*   **State Management**: React Hooks (`useReducer`, `useContext`)
*   **Diagramming**: React Flow (`@xyflow/react`)
*   **AI**: Google Gemini API

## 2. Architecture & File Structure

*   **/components**: Reusable UI components.
*   **/state**: Global state management (Reducers, Actions).
*   **/documentation**: Project documentation and guidelines.
*   **/changelogs**: Daily changelog entries.
*   **index.html**: Critical configuration for Tailwind tokens and CSS variables.

## 3. Design System

> [!IMPORTANT]
> Always verify new UI against [DesignSystemChecklist.md](file:///Users/tamyreslucas/Survey%20Builder%20Git/New-Survey-builder-1/documentation/DesignSystemChecklist.md).

### Colors & Tokens
*   **Source of Truth**: CSS Variables defined in `index.html` (`:root` and `.dark`).
*   **Usage**: Use semantic Tailwind classes (e.g., `bg-surface`, `text-on-surface`) extended in the Tailwind config script in `index.html`.
*   **Dark Mode**: Supported via `class="dark"` on `<html>`. All colors must have dark mode definitions.

### Sizing & Spacing
*   **Heights**: Fixed heights for interactive elements (Buttons: 32px/24px, Headers: 40px).
*   **Spacing**: Multiples of **8px** (Structure) or **4px** (Tight).
*   **Radius**: `rounded-md` (4px) generally, `rounded-lg` (8px) for cards.

## 4. Coding Standards

*   **Logic Terminology**: Use "Advanced Logic" instead of "Workflow".
*   **Component Style**: Functional Components with Hooks.
*   **CSS**: No separate CSS files for components generally; use Tailwind utility classes. Global overrides are in `index.html`.
*   **Type Safety**: Strict TypeScript usage. No `any`.

## 5. UI/UX Patterns

*   **Smart Filtering**: Dropdowns should filter options based on context (e.g., only showing preceding questions).
*   **Progressive Disclosure**: Hide advanced options until needed to reduce cognitive load.
*   **Draft & Confirm**: Complex logic changes (like diagrams) should be drafted locally and only applied/saved on explicit confirmation.
*   **Swimlanes**: In diagrams, use "Swimlanes" to visually separate logical branches, with a shared center lane for convergent nodes.

## 6. Versioning & Workflow

*   **Changelogs**: Update `changelogs/YYYY-MM-DD.md` with every significant change.
*   **Task Management**: Use `task.md` to track progress during active development sessions.
*   **Implementation Plans**: Always create an `implementation_plan.md` before starting complex coding tasks.

## 7. Key Files

*   `components/DiagramCanvas.tsx`: Core logic for the survey flow visualizer.
*   `components/QuestionCard.tsx`: Main component for editing survey questions.
*   `state/surveyReducer.ts`: Central logic for survey state updates.
