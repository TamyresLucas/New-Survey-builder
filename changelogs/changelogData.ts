export interface ChangelogEntry {
    id: string;
    version: string;
    date: string;
    time: string;
    request: string;
    improvements: string[];
    technicalChanges: string[];
}

// NOTE: Always update 'time' to the current local time when adding an entry.
export const changelogs: ChangelogEntry[] = [
    {
        id: '2025-12-03-2',
        version: 'v1.0.9',
        date: '2025-12-03',
        time: '6:13 PM',
        request: 'Refactor Edit Question Sidebar',
        improvements: [
            'Created and documented `TextArea` component.',
            'Refactored question editor components to use standardized `Button`, `TextField`, `TextArea`, and `DropdownField`.',
            'Updated all "Add Choice", "Add Row", "Column", and "Paste" buttons to Large Tertiary Primary style.',
            'Updated all "Add logic set", "Write expression", and "Add skip logic" buttons to Large Tertiary Primary style.',
            'Fixed Secondary Button text color to use `text-on-surface` instead of `text-primary`.',
            'Updated Large Button padding to `px-2` (8px) for consistency.',
            'Converted "Set question randomization" to Secondary Button style.'
        ],
        technicalChanges: [
            'Created components/TextArea.tsx',
            'Created documentation/components/TextArea.md',
            'Refactored ChoiceItem.tsx to use TextField and Button components',
            'Refactored ChoiceActions.tsx and ScalePointActions.tsx to use Button component',
            'Refactored AnswerFormatSelector.tsx to use DropdownField',
            'Refactored QuestionTextEditor.tsx to use TextArea',
            'Refactored ScalePointItem.tsx and ScalePointActions.tsx to use Button and TextField',
            'Updated ChoiceBehaviorSection.tsx, QuestionBehaviorSection.tsx, and SkipLogicEditor.tsx to use Button component',
            'Updated Button.tsx: Changed large button padding from px-4 to px-2',
            'Updated Button.tsx: Fixed secondary variant text color to text-on-surface',
            'Updated documentation/components/Buttons.md with new padding specifications'
        ]
    },
    {
        id: '2025-12-03-1',
        version: 'v1.0.9',
        date: '2025-12-03',
        time: '5:36 PM',
        request: 'UI Standardization & Documentation',
        improvements: [
            'Standardized "Large Tertiary Buttons" across the application (Sidebar headers, Survey Structure Widget).',
            'Created reusable `Button` component to enforce design system consistency.',
            'Documented `Page Break` component.',
            'Documented `Survey Flow Card` component.',
            'Documented `Text Field` component.',
            'Updated `Dropdown Field` documentation.',
            'Refactored sidebars and widgets to use the new `Button` component.'
        ],
        technicalChanges: [
            'Modified various components to use the new Button component.',
            'Created documentation/components/TextField.md.',
            'Updated documentation/components/DropdownField.md.'
        ]
    },
    {
        id: '2025-12-02-3',
        version: 'v1.0.8',
        date: '2025-12-02',
        time: '8:55 PM',
        request: 'Button Standardization & UI Polish',
        improvements: [
            'Button Standardization: Updated all "Large" buttons to use 16px horizontal padding (px-4), ensuring consistency across the application.',
            'Header Polish: Refined the Header toolbar buttons. "Preview" is now a Large Primary button, "Actions" is a square icon-only button, and "AI/Notifications/Help" are consistent square Tertiary buttons.',
            'Theme Switch: Updated the Light/Dark mode toggle buttons to be perfect circles.',
            'Documentation: Added comprehensive documentation for Buttons, Tags, Toggles, Avatars, Theme Switch, Secondary Navigation, Tertiary Navigation, Search Bar, Dropdown Field, Question Selector Dropdown, Content Sidebar Item, Content Sidebar Block, Question Card, Logic Card, Logic Expression, Survey Flow Card, and Page Break components.'
        ],
        technicalChanges: [
            'Modified documentation/components/Buttons.md: Updated Large Button standards and added new visual style definitions.',
            'Modified components/Header.tsx: Updated button styles for Preview, Actions, Copy Link, and toolbar icons.',
            'Modified various components (SurveyBlock.tsx, BlockEditor.tsx, LogicConditionRow.tsx, etc.): Applied px-4 padding to large buttons and inputs.',
            'Created documentation/components/Tag.md, Toggle.md, Avatar.md, ThemeSwitch.md, SecondaryNavigation.md, TertiaryNavigation.md, SearchBar.md, DropdownField.md, QuestionSelectorDropdown.md, ContentSidebarItem.md, ContentSidebarBlock.md, QuestionCard.md, LogicCard.md, LogicExpression.md, SurveyFlowCard.md, PageBreak.md.'
        ]
    },
    {
        id: '2025-12-02-2',
        version: 'v1.0.7',
        date: '2025-12-02',
        time: '3:00 PM',
        request: 'Editor Terminology & Interaction Refinements',
        improvements: [
            'Terminology Updates: Renamed "Copy and paste" to "Paste" in general settings. In the Behavior tab, renamed "Paste" to "Write expression" and added a pencil icon to better reflect the action.',
            'Editor UX: The "Add logic set" and "Write expression" buttons are now hidden when the advanced expression editor is active, reducing clutter.',
            'Header Refinement: Updated the "Advanced editor" header styling.'
        ],
        technicalChanges: [
            'Modified components/logic-editor/shared/CopyAndPasteButton.tsx: Updated button label and icon logic.',
            'Modified components/question-editor/behavior/QuestionBehaviorSection.tsx: Updated button labels and visibility logic.',
            'Modified components/logic-editor/shared/AdvancedLogicEditor.tsx: Updated header styles and button visibility logic.'
        ]
    },
    {
        id: '2025-12-02-1',
        version: 'v1.0.6',
        date: '2025-12-02',
        time: '10:39 AM',
        request: 'Refine Logic Card UI',
        improvements: [
            'Logic Card Typography: Updated the font weight of logic card titles (Display Logic, Skip Logic, Branching Logic) to semibold for better hierarchy.',
            'Choice Variable Styling: Choice variables in the survey canvas now use semibold weight and inherit the surrounding text color, improving readability and consistency.'
        ],
        technicalChanges: [
            'Modified components/LogicDisplays.tsx: Updated title classes to font-semibold.',
            'Modified components/QuestionCard.tsx: Updated choice variable styles.'
        ]
    },
    {
        id: '2025-12-01-5',
        version: 'v1.0.5',
        date: '2025-12-01',
        time: '4:30 PM',
        request: 'System Notification & UI Consistency Updates',
        improvements: [
            'Refined Logic Validation Notifications: Aggregated logic validation errors into a single toast notification per action, preventing duplicate alerts.',
            'System Notification Styling: Moved notifications to the bottom right corner, updated error toast style to match design reference (Pink background, Red border), and updated "Undo" button to follow tertiary button patterns.',
            'UI Consistency: Fixed inconsistent hover colors for "Cancel" buttons in ImportSurveyModal and AdvancedLogicEditor (Question Display Logic), ensuring they match the standard tertiary button style.'
        ],
        technicalChanges: [
            'Modified state/surveyReducer.ts: Refactored validateAndCleanLogicAfterMove to return messages instead of triggering side effects directly.',
            'Modified App.tsx: Added useEffect to handle logic validation messages, updated Toast component styles, and updated "Undo" button styles.',
            'Modified components/ImportSurveyModal.tsx: Updated Cancel button hover class to hover:bg-surface-container-high.',
            'Modified components/logic-editor/shared/AdvancedLogicEditor.tsx: Updated Cancel button styles to match standard tertiary buttons.'
        ]
    },
    {
        id: '2025-12-01-4',
        version: 'v1.0.4',
        date: '2025-12-01',
        time: '2:00 PM',
        request: 'Logic Navigation, UI Consistency, and Visual Polish',
        improvements: [
            'Enhanced Logic Navigation: Clicking on a logic card (specifically branching logic) now correctly opens the right sidebar, switches to the appropriate tab, and scrolls to the specific logic condition.',
            'Granular Focus: Individual conditions within a branching logic display are now clickable for precise navigation.',
            'UI Consistency: Updated headings in the Build Panel, Right Sidebar, Block Sidebar, and Bulk Edit Panel to use the \'Outfit\' font and medium weight, matching the Survey Structure widget.',
            'Visual Polish: The selected radio button icon in the Question Card now uses the primary color token for better visibility and adherence to the design system.'
        ],
        technicalChanges: [
            'Modified App.tsx: Updated handleSelectQuestion to respect focusOn and tab options.',
            'Modified components/LogicDisplays.tsx: Updated BranchingLogicDisplay to make individual conditions clickable.',
            'Modified components/QuestionCard.tsx: Updated the selected radio button icon to use the text-primary class.',
            'Modified components/BuildPanel.tsx, RightSidebar.tsx, BlockSidebar.tsx, BulkEditPanel.tsx: Updated headings to use Outfit font and font-medium weight.'
        ]
    },
    {
        id: '2025-12-01-3',
        version: 'v1.0.3',
        date: '2025-12-01',
        time: '12:00 PM',
        request: 'UI Consistency and Design System Refinements',
        improvements: [
            'Visual Consistency: Updated the App Changelog modal to use a white background in light mode and standardized input/select styles with correct focus rings and custom icons.',
            'Design System Tokens: Updated global color tokens to ensure borders are off-black (#232323) in light mode and white (#ffffff) in dark mode. Defined specific hover states for borders to transition correctly.',
            'Build Panel Polish: Applied the new hover border styles to content items and block headers in the Build panel for a consistent interactive experience.'
        ],
        technicalChanges: [
            'Modified index.html: Updated CSS variables for --border-bd-def, --border-bd-hov, --border-bd-dis, and --thumbnail-thumbnail-bd-* to match new color requirements. Added outline-hover token.',
            'Modified components/AppChangelogModal.tsx: Updated background classes, input borders (to border-outline), and header styles.',
            'Modified components/BuildPanel.tsx: Added hover:border-outline-hover class to interactive elements.'
        ]
    },
    {
        id: '2025-12-01-2',
        version: 'v1.0.2',
        date: '2025-12-01',
        time: '11:30 AM',
        request: 'App Changelog Integration',
        improvements: [
            'New Feature: Introduced an "App Changelog" modal accessible from the user menu in the header.',
            'Transparency: Users can now view a history of changes, improvements, and technical details, filterable by date and searchable by text.',
            'Documentation: Added a new section to DOCUMENTATION.md outlining the changelog structure.'
        ],
        technicalChanges: [
            'Created components/AppChangelogModal.tsx: Implemented the modal UI with filtering logic.',
            'Created changelogs/changelogData.ts: Defined the data structure for changelog entries.',
            'Modified components/Header.tsx: Added the "See app changelog" menu item and state to control the modal.',
            'Modified components/icons.tsx: Added HistoryIcon, CalendarIcon, and ChevronDownIcon.'
        ]
    },
    {
        id: '2025-12-01-1',
        version: 'v1.0.1',
        date: '2025-12-01',
        time: '10:05 AM',
        request: 'Remove the button copy and paste from Skip logic',
        improvements: [
            'Simplified UI: The "Copy and Paste" button and its associated "Advanced Logic Editor" (text-based input) were removed from the Skip Logic interfaces. This reduces clutter and focuses the user on the primary visual builder.',
            'Code Cleanup: Removed unused state variables (isPasting) and helper functions (handlePasteLogic) that were only used for this feature.',
            'Consistency: The "Add Skip Logic" button is now the sole entry point, making the workflow more consistent across different logic editors.'
        ],
        technicalChanges: [
            'Modified components/logic-editor/SkipLogicEditor.tsx: Removed isPasting state, handlePasteLogic function, and imports for AdvancedLogicEditor and CopyAndPasteButton. Simplified render logic.',
            'Modified components/logic-editor/BlockSkipLogicEditor.tsx: Removed isPasting state, handlePasteLogic function, and imports for AdvancedLogicEditor and CopyAndPasteButton. Simplified render logic.',
            'Modified components/BlockEditor.tsx: Removed the local BlockSkipLogicEditor implementation\'s isPasting state and handlePasteLogic. Removed PasteInlineForm and CopyAndPasteButton usage.'
        ]
    }
];
