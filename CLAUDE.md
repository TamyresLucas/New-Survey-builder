# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Survey Builder application - a visual survey design tool with advanced logic capabilities, flow diagramming, and AI-assisted survey creation. Built with React 19, TypeScript, and Tailwind CSS, it provides a drag-and-drop interface for creating complex multi-path surveys with conditional logic.

## Development Commands

### Running the Application
```bash
npm install          # Install dependencies
npm run dev          # Start development server (runs on port 3000)
npm run build        # Build for production (runs TypeScript compiler + Vite build)
npm run preview      # Preview production build
```

### Notes
- The app runs on port 3000 and is configured for deployment to IIS at `/SurveyBuilderPoc/`
- Environment variables are configured in `.env.local` (requires `GEMINI_API_KEY`)
- Build output goes to `dist/` directory
- No test suite currently exists in this project

## Architecture Overview

### State Management
The application uses a **reducer-based architecture** with React hooks:

- **Central State**: `useSurveyState` hook manages the entire survey state via `surveyReducer`
- **Modular Reducers**: State updates are split across specialized reducers:
  - `blockReducer` - Block operations (add, delete, reorder)
  - `questionReducer` - Question operations (add, update, delete, move)
  - `choiceReducer` - Choice/answer option operations
  - `bulkReducer` - Batch operations on multiple questions
  - `metaReducer` - Survey-level settings (title, paging mode)

- **Undo System**: Selected actions (deletions, reordering, moves) are tracked in a history stack (max 10 levels)
- **Local Storage**: Survey state auto-saves to `localStorage` on every change

### Core Data Flow

```
Survey Data (types.ts)
    ↓
useSurveyState (hooks/useSurveyState.ts) → dispatch/dispatchAndRecord
    ↓
surveyReducer (state/surveyReducer.ts) → Delegates to specialized reducers
    ↓
Updated Survey State → Auto-saved to localStorage → UI re-renders
```

### Key Concepts

**Draft-Confirm Pattern**: Complex logic edits (branching logic, skip logic) use a two-phase approach:
1. User edits a `draft*` property (e.g., `draftBranchingLogic`)
2. Original confirmed state remains active in the diagram
3. User explicitly applies changes to promote draft to confirmed state
4. This prevents broken logic from affecting the live survey during editing

**Question Identification**: Questions have both:
- `id` - Internal unique identifier (e.g., "q1", "q-welcome")
- `qid` - User-visible variable name for logic (e.g., "Q1", "Q2") - empty for Description/PageBreak types

**Logic System**: Three types of conditional logic:
- **Display Logic** - Controls when questions appear (references preceding questions)
- **Skip Logic** - Controls survey flow navigation (skip to later questions/blocks)
- **Branching Logic** - Advanced multi-path routing with named branches and convergence points

**Block System**: Surveys are organized into Blocks (pages/sections):
- Each block contains multiple questions
- Blocks can have names and branch paths
- Paging modes: "one-per-page", "all-on-one", "custom"
- Page breaks can be inserted between questions

### Component Structure

**Main Layout Components**:
- `App.tsx` - Root component, orchestrates all panels and state
- `Header.tsx` / `SubHeader.tsx` - Top navigation and actions
- `LeftSidebar.tsx` - Main navigation rail (Build, Diagram, Blueprint tabs)
- `BuildPanel.tsx` - Toolbox for adding questions (collapsible left panel)
- `RightSidebar.tsx` - Question editor (Settings, Advanced, Behavior tabs)
- `BlockSidebar.tsx` - Block-level settings editor

**Canvas Components**:
- `SurveyCanvas.tsx` - Main survey editing canvas (shows QuestionCards)
- `DiagramCanvas.tsx` - Flow diagram visualization using React Flow
- `BlueprintCanvas.tsx` - Print/export preview view

**Question Editor** (`components/question-editor/`):
- Tab-based editor with three main tabs:
  - **Settings Tab** - Basic question text, choices, scale points
  - **Advanced Tab** - Layout, randomization, choice elimination
  - **Behavior Tab** - Display logic, skip logic, branching logic, auto-advance

**Logic Editors** (`components/logic-editor/`):
- `BranchingLogicEditor.tsx` - Multi-path routing with named branches
- `SkipLogicEditor.tsx` - Simple skip-to navigation
- `QuestionDisplayLogicEditor.tsx` - Show/hide conditions
- All share common components in `logic-editor/shared/`

**Diagram System** (`components/diagram/`):
- Uses `@xyflow/react` for visual flow diagrams
- Custom node types: StartNode, MultipleChoiceNode, TextEntryNode, DescriptionNode, EndNode
- Implements sophisticated **swimlane layout algorithm** for branching paths
- Handles convergence points where branches merge back together

### Important Files

- `types.ts` - All TypeScript interfaces and enums (Survey, Block, Question, Logic types)
- `constants.tsx` - Initial survey data, toolbox items, navigation config
- `logicValidator.ts` - Validates logic for contradictions and circular references
- `utils/logic.ts` - Logic helper functions (path analysis, exhaustiveness checks)
- `utils/parser.ts` - Parses logic expressions and converts between formats
- `state/surveyHelpers.ts` - Pure functions for survey data manipulation

## Design System

**Critical: Always use semantic design tokens** - Never hardcoded colors or Tailwind defaults.

### Color Usage
The app uses Material Design 3 semantic tokens defined in `index.html`:

```tsx
// ✅ CORRECT - Semantic tokens
bg-surface, bg-surface-container, bg-surface-container-high
text-on-surface, text-on-surface-variant
border-outline, border-outline-variant
bg-primary, text-on-primary, bg-error, bg-success

// ❌ WRONG - Never use these
bg-white, bg-gray-100, text-gray-900, border-blue-300
```

These tokens automatically adapt for dark mode (toggled via `.dark` class on `<html>`).

### Component Standards
- **Button heights**: 32px (h-8) standard, 24px (h-6) small
- **Input fields**: 32px (h-8)
- **Header bars**: 40px (h-10)
- **Border radius**: `rounded-md` (4px) for inputs/buttons, `rounded-lg` (8px) for cards
- **Font families**: Outfit for headings, Open Sans for body (default)

### Interactive States
Every interactive element must implement:
```tsx
hover:bg-surface-container-high
focus:outline-none focus:ring-2 focus:ring-primary
disabled:opacity-50 disabled:cursor-not-allowed
transition-colors duration-150
```

**Reference**: See `ANTIGRAVITY_RULES.md` for complete design system guidelines.

## Logic Syntax

The application supports a Voxco-style logic syntax for advanced users:

```
Q1.A1 = 1                          // Answer A1 selected
Q2 > 18                            // Numeric comparison
Q1.A1 = 1 AND Q2 > 18             // Combined conditions
(Q1.A1 = 1 OR Q1.A2 = 1) AND Q3   // Grouped logic
```

**Operators**: `=`, `<>`, `>`, `>=`, `<`, `<=`, `LIKE`, `RLIKE`
**Logic**: `AND`, `OR`, `NOT` (with parentheses for grouping)

See `LOGIC_SYNTAX.md` for complete syntax documentation.

## AI Integration

The app integrates Google Gemini API for AI-assisted survey creation:

- **Services** (`services/`): Gemini tool definitions, context building, validation
- **Component**: `GeminiPanel.tsx` provides chat interface
- **Hook**: `useGeminiChat.ts` manages conversation state
- **Capabilities**: Generate questions, suggest logic, explain survey structure

## Survey Publishing Workflow

- **Draft** - Default state for new/unpublished surveys
- **Active** - Published and live to respondents
- **Publish button** - Activates draft surveys OR pushes updates to active surveys
- **Dirty state** - Tracked when active survey has unpublished changes

See `documentation/PublishActivationWorkflow.md` for details.

## Common Patterns

### Adding a New Question Type
1. Add enum value to `QuestionType` in `types.ts`
2. Create toolbox item in `constants.tsx` with icon
3. Add type-specific settings UI in `question-editor/` components
4. Add diagram node component in `diagram/nodes/` if needed
5. Update validation logic in `logicValidator.ts` if needed

### Modifying Survey State
Always use dispatch actions, never mutate state directly:

```tsx
// ✅ Correct
dispatch({
  type: SurveyActionType.UPDATE_QUESTION,
  payload: { questionId: 'q1', updates: { text: 'New text' } }
});

// ❌ Wrong
question.text = 'New text';  // Direct mutation
```

### Smart Filtering in Dropdowns
Logic editors filter available questions based on context:
- Display Logic: Only shows **preceding** questions (can't reference future questions)
- Skip Logic: Only shows **following** questions/blocks (can't skip backwards)
- Branching Logic: Shows all reachable destinations

This is implemented in the respective editor components using question ordering.

## Deployment

The app is configured for IIS deployment:
- **Base path**: `/SurveyBuilderPoc/` (configured in `vite.config.ts`)
- **web.config**: Automatically copied to `dist/` after build
- **Azure Pipeline**: Configured in `azure-pipelines.yml`

See `IIS_DEPLOYMENT.md` for deployment instructions.

## Additional Documentation

- `documentation/introduction.md` - Detailed design system and patterns
- `documentation/DesignSystemChecklist.md` - UI verification checklist
- `documentation/conventions.md` - Technical conventions and key files
- `documentation/components/` - Individual component documentation
- `changelogs/` - Daily changelog entries with implementation details
