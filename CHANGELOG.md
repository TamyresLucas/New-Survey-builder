# Changelog
- **Renamed "Rearrange" tab to "Outline"**: Updated the Build Panel sidebar tab label from "Rearrange" to "Outline" for better clarity and alignment with the tab's purpose of showing the survey structure overview.
- **Standardized tertiary button hover states**: Updated all `tertiary-primary`, `ghost-primary`, `ghost-destructive`, `ghost-success`, and `danger` button variants to show a subtle 20% opacity tint on hover instead of a solid background fill. Text color now remains the semantic color on hover (no longer flips to white). This creates a clear visual hierarchy between solid buttons (primary, danger-solid) and ghost/tertiary buttons.
- **Bulk Edit "Select all" button**: Added a "Select all" button to the Bulk Edit right sidebar header. Standardized button size to "large" to match the Preview button.

## [Unreleased]
- **Reduced spacing in Description blocks**: Decreased the vertical gap between the description title/label and the first line of text by removing redundant top margins in the `DescriptionLinesRenderer` component.
- **Fixed Page Actions dropdown visibility**: Fixed a z-index and overflow bug where the "page actions" dropdown in the survey canvas was cut off by subsequent question cards. Added `z-10` to the page break indicator when its menu is open and ensured the menu remains visible (`opacity-100`) even when not hovered if it's currently open.
- **Drag-and-drop reordering for Description text lines**: Added a drag handle icon to each text line in Description questions, allowing users to reorder lines by dragging — mirroring the existing choice reordering behavior. Includes drop indicators and visual feedback during drag.
- **Multiple text lines for Description questions**: Added an "Add text line" button to Description question cards, allowing users to add, edit, and delete multiple lines of supplementary text. Each line is editable inline and behaves similarly to choices in multiple-choice questions. These lines are displayed in the main canvas and the question preview.
- **Enter key exits inline edit mode**: Pressing Enter on any inline-editable text field (survey title, survey name, question text, choice text, row/column text, block name) now exits edit mode and saves changes — matching the click-away (blur) behavior. Prevents accidental line breaks in single-line fields.
- **Fixed question preview survey title**: The Preview tab in the Edit Question sidebar now displays the respondent-facing Survey Title (`displayTitle`) instead of the internal survey name, and uses the `font-survey` typography class with `font-semibold` weight — matching the full Survey Preview behavior.
- **Simplified Delete Confirmation Logic**: The delete confirmation popup now only checks the question **text** — if the question text is still a default placeholder (e.g., "Click to write the question text"), the question is deleted immediately without a popup. Previously, the check also considered choices, scale points, and logic, which caused the popup to appear even for unmodified questions.
- **Updated "Add page break" icon**: Changed the icon for the "Add page break" option in the question actions menu from the generic plus (+) icon to the dedicated `PageBreakIcon`, matching the icon used in the Add Questions panel.
- **Adjusted Dark Mode Border Tokens**: Re-configured `--border-bd-def` from `#363D65` to `#262a4a` and `--border-bd-hov` to `#363d65` in `src/styles/tokens.css` for `.dark` mode to make borders much more subtle and visually appealing, addressing feedback that borders were too prominent.
- **Moved Lookup Table question type**: Relocated "Lookup Table" from the "Basic" category to the "Grid" category in the Build sidebar's "+Add question" panel for better categorization.
- **Fixed Azure DevOps Build Failure**: Merged diverged `master` branch (Survey Title feature) into `main`. Resolved merge conflicts in `ChoiceListRenderer.tsx`, removed stale `BuildPanel.mdx`, and created missing `QuestionDropZone` component. Root cause: `master` was 7 commits behind `main` and the pipeline was building old code with TypeScript errors.
- **Removed Design System Package & Dead Code**:
  - Removed `@voxco/design-system` from dependencies as it will be maintained in a separate workspace.
  - Deleted unused Storybook configuration.
  - Deleted dead code components depending on the DS: `src/adapters/`, `DebugDS.tsx`, `ImportJsonSurveyModal.tsx`.
  - Maintained core CSS tokens (`src/index.css`, `src/styles/tokens.css`) to ensure application remains completely styled and functional.
  - Fixed pre-existing TypeScript issue in `ChoiceListRenderer.tsx`.
- Pulled the latest changes from `https://github.com/TamyresLucas/New-Survey-builder`.
- Initialized local git repository and synchronized with the remote `main` branch.
- Reinstalled dependencies to ensure environment consistency.
- **Implemented IME (Skill Lifecycle Orchestrator)**: Created a new custom orchestrator agent ("Dono da Porra Toda") and corresponding skill based on Notion documentation.
- **Agent Routing Logic**: Configured automatic triggers for `acionar`, `delegar`, and `chamar` keywords in `ANTIGRAVITY_RULES.md`.

### Components
- **Introduced QuestionDropZone**: Created a dedicated `QuestionDropZone` component to replace inline empty state logic for survey blocks. Empty blocks now automatically display this component with the label "Question drop zone".

### Infrastructure
- **Migrated to Remote Notion MCP**: Replaced discontinued local Notion MCP server with new remote `@notionhq/notion-mcp-server` using OAuth authentication. Configuration updated in `~/.cursor/mcp.json` with NOTION_TOKEN environment variable for secure integration access.

### Features
- Added a search bar to the question type selector dropdown to allow filtering question types by name.
- Grouped question types in the question type selector dropdown by categories (Basic, Input, Multiple choices, etc.) as defined in the Build sidebar.
- Default choices for new Radio Button questions are now set to "Yes" and "No" by default.
- Changed the icons for "Add question above" and "Add question below" in the question actions menu from plus icons to arrow up/down icons for better visual feedback.
- Reverted the icons in the question type selector menu to use the primary color style.
- Changed the quick "Add question" button that appears when hovering over a question card to use a tertiary variant style without shadow, making it less intrusive.
- Adjusted the maximum height of the question type selector and generic dropdown lists to 512px, ensuring the "Dropdown" type is the last visible item before scrolling.
- Increased the maximum height of the question type selector and generic dropdown lists to 600px to display more options simultaneously.
- Restored "Page Break" option to the "Add question" side panel and categorized it under the "Basic" group. removed "Block" from the panel.
- Renamed "Toolbox" tab to "Add question" in the Build Panel sidebar.
- Fixed drag propagation issues where selecting text in choice fields would incorrectly trigger drag-and-drop operations.
- Implemented "Drag Handle" pattern across `ChoiceItem`, `ScalePointItem`, `ChoiceListRenderer`, and `ChoiceGridRenderer`, moving the `draggable` attribute from the choice container to a dedicated handle icon.
- Fixed an issue where question and choice drag events would bubble up to the question card during text selection by adding `draggable={false}` and `e.stopPropagation()` to text containers.
- Resolved "drop" issue in question drag reordering by wrapping the handle icon in a stable span element to prevent loss of drag state.
- Enabled reliable text selection in all choice and question fields while maintaining full drag-and-drop reordering functionality via handles.
- **Survey Title feature**: Added a new `displayTitle` property to surveys that is distinct from the internal Survey Name. Survey Title is displayed to respondents in preview/live modes and appears at the top of the Survey Canvas. It auto-populates from Survey Name on creation, is editable inline with a 100-character limit, and is read-only in preview mode.
- **Fixed Survey Title reset bug**: Survey Title now persists correctly when switching menus or entering preview mode. Root cause was UPDATE_DISPLAY_TITLE action not being routed to metaReducer in surveyReducer.ts. Fixed by: (1) adding UPDATE_DISPLAY_TITLE to Meta/Global Actions case statement in surveyReducer, (2) changing fallback patterns from `||` to `??` in SurveyCanvas and SurveyTitleEditor, (3) consolidating EditableText useEffects, and (4) enhancing migration logic.
- **Fixed preview mode title display**: Preview mode now correctly displays the respondent-facing Survey Title (survey.displayTitle) instead of the internal Survey Name (survey.title). Updated SurveyPreview.tsx to use nullish coalescing operator (??) to fall back to survey.title only when displayTitle is null or undefined.
- Renamed "Overview" tab to "Rearrange" in the Build Panel for better clarity of its purpose.

### Typography
- **Survey Content Typography Tokens**: Introduced a separate typography system for survey content (questions, choices, block names, etc.).
  - Added `--font-survey` CSS variable (defaulting to `inherit`) and `.font-survey` utility class in the design system.
  - Applied the `font-survey` class to all respondent-facing text elements across the Survey Canvas and Survey Preview (Survey Title, Block Titles, Question Text, Choice Labels, and Grid Headers).
  - This structure allows for future customization of survey content fonts while maintaining UI consistency.


### Changed
- Removed unused stories (`DarkModePreview`, `InteractiveDemo`, `CustomTheme`, `WithEndAction`) from `ToolboxItem` component documentation in Storybook.
- Refactored `ColorPaletteEditor` to "Product Color Palette" with dropdown support for multiple products (Voxco, Ascribe, Discuss).
- Updated synchronization logic: **Primary color** is unique per product, while all other colors (Success, Warning, Charts) are shared globally across products using local storage.
- Standardized Typography storage to `global-typography-shared` to enforce global consistency across all products.
- Updated "Add multiple" button label to "Copy & paste choices" and switched icon to `ContentPaste` across Sidebar and Question Card components.
- Updated "Question Actions" menu: reordered items, added icons for all actions, and implemented "Add question above" and "Add question below" functionality.
- Standardized `DropdownItem` icons to inherit text color instead of using primary color, ensuring visual consistency.
- Updated "Copy & paste choices" functionality to replace existing choices instead of appending them.
- Updated empty block placeholder text from "Drag and drop your first question" to "Drag and drop question".
- Updated "Question Actions" menu: all "Add" actions now use the `PlusIcon` and `primary` variant color for better emphasis.
- Added "Bulk Edit" option to Question Actions menu (with `EditIcon`), positioned below "Save to library".
- "Bulk Edit" automatically selects the origin question to facilitate bulk actions.
- Checkboxes for bulk edit selection are now only visible when the Bulk Edit panel is active.
- Ensured consistent left-side formatting of question content by reserving space for the hidden checkbox.
- **Ensured feature parity**: Question actions dropdown in Build > Overview/Content now displays the same options as the Survey Canvas, including "Add question above", "Add question below", "Save to library", "Bulk edit", and "Move to" with block selection.
- **Smart dropdown positioning**: Question actions context menu now automatically adjusts its position to prevent being cut off at the bottom of the viewport, opening upward when necessary.
- **Block actions menu improvements**: 
  - Added icons to all block action options for better visual clarity
  - Reordered options to match question actions menu structure
  - Changed "Add from library" to "Save to library" for consistency
  - Changed "Select all" to "Bulk edit" for better clarity of action
  - Placed "Expand/Collapse block" options above "Bulk edit" for better logical grouping
  - All "Add" actions now use primary text color for better emphasis
  - Consistent icon usage with question actions (same icons for related operations)
  - Divider placement matches question actions pattern (grouping related actions together)
- **Block selection behavior**: Blocks can now only be selected by clicking on the block header (where block ID and name are displayed), not on the block body where question cards are. This prevents accidental block selection when interacting with questions.
- **Block collapse/expand behavior**: Blocks can now only be collapsed or expanded by clicking on the chevron button itself, not by clicking anywhere on the block header. This provides more precise control and prevents accidental collapse/expand when selecting blocks or editing block titles.
- **Block actions menu visibility**: In Build > Overview view, the block context menu (...) now appears only when hovering over block cards or when the menu is open, matching the behavior in the Survey Canvas. This provides consistent and discoverable access to block actions without cluttering the interface.
- **Block actions in Build > Overview**: Removed "Move up" and "Move down" options from the block actions menu in Build > Overview view, as block reordering is handled through drag-and-drop in this view.
