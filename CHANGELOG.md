# Changelog

## [Unreleased]

- Added a search bar to the question type selector dropdown to allow filtering question types by name.
- Adjusted the maximum height of the question type selector and generic dropdown lists to 512px, ensuring the "Dropdown" type is the last visible item before scrolling.
- Increased the maximum height of the question type selector and generic dropdown lists to 600px to display more options simultaneously.
- Removed "Block" and "Page Break" from the "Add question" side panel.
- Renamed "Toolbox" tab to "Add question" in the Build Panel sidebar.
- Fixed drag propagation issues where selecting text in choice fields would incorrectly trigger drag-and-drop operations.
- Implemented "Drag Handle" pattern across `ChoiceItem`, `ScalePointItem`, `ChoiceListRenderer`, and `ChoiceGridRenderer`, moving the `draggable` attribute from the choice container to a dedicated handle icon.
- Fixed an issue where question and choice drag events would bubble up to the question card during text selection by adding `draggable={false}` and `e.stopPropagation()` to text containers.
- Resolved "drop" issue in question drag reordering by wrapping the handle icon in a stable span element to prevent loss of drag state.
- Enabled reliable text selection in all choice and question fields while maintaining full drag-and-drop reordering functionality via handles.
- **Survey Title feature**: Added a new `displayTitle` property to surveys that is distinct from the internal Survey Name. Survey Title is displayed to respondents in preview/live modes and appears at the top of the Survey Canvas. It auto-populates from Survey Name on creation, is editable inline with a 100-character limit, and is read-only in preview mode.
- **Fixed Survey Title reset bug**: Survey Title now persists correctly when switching menus or entering preview mode. Fixed by: (1) changing fallback pattern from `||` to `??` in SurveyCanvas, (2) consolidating EditableText useEffects to properly sync content on mount and updates, and (3) enhancing migration logic to handle empty strings.

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
