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
        id: '2025-12-10-1',
        version: 'v1.0.14',
        date: '2025-12-10',
        time: '12:43 PM',
        request: 'Document AI Assistant Message Component',
        improvements: [
            'Created and documented `GeminiMessage` component for the AI Assistant.',
            'Refactored `GeminiPanel` to use the new reusable `GeminiMessage` component.',
            'Standardized AI message styling to use `bg-surface` and `border-outline` tokens.',
            'Ensured the AI Assistant loading indicator matches the new message styling with `border-outline`.'
        ],
        technicalChanges: [
            'Created components/GeminiMessage.tsx.',
            'Updated components/GeminiPanel.tsx to implement GeminiMessage.',
            'Created documentation/components/GeminiMessage.md.'
        ]
    },
    {
        id: '2025-12-09-1',
        version: 'v1.0.13',
        date: '2025-12-09',
        time: '5:00 PM',
        request: 'Visual Refresh & Standardization',
        improvements: [
            'Updated General Border Color: Changed the global border token to #E0E4FF (periwinkle tint) in light mode.',
            'Structural UI Updates: Applied the new border color to the Header, SubHeader, Left Sidebar, Build Panel, Right Sidebar, Question Cards, and Block Editor.',
            'Input Field Standardization: Standardized all text inputs, text areas, and dropdowns to use consistent colors and font weight.',
            'Button Styling: Updated the "Secondary" button variant and the "Copy Link" button in the header to explicitly use the new border color token.',
            'Logic Editor UX: Updated skip logic creation to default to an empty choice selection, requiring explicit user input.'
        ],
        technicalChanges: [
            'Updated index.html: Modified --border-bd-def CSS variable.',
            'Updated Header.tsx, SubHeader.tsx, LeftSidebar.tsx, RightSidebar.tsx, BuildPanel.tsx, BlockEditor.tsx, QuestionCard.tsx: Updated border classes to use new token.',
            'Updated Button.tsx: Fixed secondary button variant border color.',
            'Updated SkipLogicEditor.tsx: Changed default state for new logic rules.',
            'Updated TextField.tsx, TextArea.tsx, DropdownField.tsx: Standardized input styles.'
        ]
    },
    {
        id: '2025-12-08-1',
        version: 'v1.0.12',
        date: '2025-12-08',
        time: '2:24 PM',
        request: 'Logic Editor Refinements & Documentation',
        improvements: [
            'Updated Preview Survey UI to match design: removed borders/backgrounds from questions and utilized surface colors.',
            'Restricted Skip Logic selection to only allow questions within the same block.',
            'Updated Skip Logic supporting text for clarity.',
            'Documented the BranchLogicSet component (referred to as Skip Logic Set).'
        ],
        technicalChanges: [
            'Modified components/SurveyPreview.tsx and PreviewQuestion.tsx for UI updates.',
            'Modified components/logic-editor/SkipLogicEditor.tsx to filter available questions.',
            'Created documentation/components/BranchLogicSet.md.'
        ]
    },
    {
        id: '2025-12-05-1',
        version: 'v1.0.11',
        date: '2025-12-05',
        time: '5:58 PM',
        request: 'Branch Logic Editor UI Refinements',
        improvements: [
            'Updated "Then skip to" label casing in BranchLogicSet.',
            'Added safety check for logic conditions in BranchLogicSet.',
            'Added inline add/remove buttons to BranchLogicSet condition rows.',
            'Refined BranchLogicSet UI: replaced operator dropdown with toggle, moved delete action.',
            'Updated BranchLogicSet footer: remove inline checkmarks, added global Apply/Cancel buttons.',
            'Styled BranchLogicSet delete button as danger variant.',
            'Removed global "Remove" button from BranchingLogicEditor header.',
            'Updated "Add condition" button size to large in BranchLogicSet.',
            'Updated Delete/Cancel and Apply button sizes to large in BranchLogicSet.',
            'Relabeled "Workflows" as "Advanced Logic" across the application.'
        ],
        technicalChanges: [
            'Updated BranchLogicSet.tsx: UI overhaul including button sizes, toggle operators, and footer layout.',
            'Updated BranchingLogicEditor.tsx: Removed global remove button.',
            'Renamed Workflow interface to AdvancedLogic and updated related properties.',
            'Renamed WorkflowSectionEditor to AdvancedLogicSectionEditor.',
            'Renamed shared/AdvancedLogicEditor to Shared/LogicExpressionEditor to avoid conflict.'
        ]
    },
    {
        id: '2025-12-04-1',
        version: 'v1.0.10',
        date: '2025-12-04',
        time: '2:45 PM',
        request: 'UI Refinements & Click-to-Edit Inputs',
        improvements: [
            'Updated "Issues" label to display "No issues" when there are no logic issues (Survey Structure Widget only).',
            'Enhanced Survey Structure Widget cards to automatically switch icons based on state (Success/Warning/Error).',
            'Updated "Required questions" indicator to use an Asterisk icon (*) instead of a badge.',
            'Implemented "Click-to-Edit" style for text fields in the Survey Canvas (Question text, Choice text, Survey Name, Block Name) with 1px bottom border.',
            'Added "Required questions" filter to the Build Panel content dropdown (with danger color asterisk).',
            'Updated component documentation to ensure all button labels use sentence case.',
            'Fixed "Add choice" button styling and casing in Settings and Question Card.',
            'Removed dashed border style from Survey Flow card in Survey Canvas.',
            'Added dashed border style to Question Card when Display Logic is applied.',
            'Standardized "+ Add condition", "Cancel/Delete", and "Apply" buttons in Logic Set to Large style.',
            'Standardized "X" and "+" buttons in Logic Condition Row to Large style.',
            'Standardized "X" and "+" buttons in Logic Condition Row to Large style.',
            'Fixed overlapping fields in Logic Condition Row by allowing Question Selector to shrink properly.',
            'Adjusted gap between inputs and action buttons in Logic Condition Row to 8px.',
            'Fixed overflow issue in Logic Condition Row by allowing all input fields to shrink.',
            'Reduced side padding of input fields in Logic Condition Row to 8px.',
            'Updated Logic Set fields to fill available width, ensuring proper button alignment.',
            'Applied Logic Set alignment fixes to Choice Display Logic as well.',
            'Restored white background (bg-surface) to Choice Display Logic target choice dropdown to match default state.',
            'Forced transparent background on Logic Set when requested, fixing background persistence issues.',
            'Added hover state to editable text fields for better interactivity.',
            'Fixed layout issues in Question Card.',
            'Refactored Advanced Tab components to use standardized UI components (Button, EditableText, DropdownField, TextField).',
            'Hidden "Otherwise Skip To" setting when logic is exhaustive.',
            'Created reusable Alert component (with icon aligned to first line, 16x16px, hug height) and applied it to "Otherwise" path disabled message.',
            'Documented Alert component in documentation/components/Alert.md.',
            'Reduced Alert component gap to 8px (gap-2).',
            'Removed "Otherwise path disabled" message from Branching Logic Editor.',
            'Hidden "Otherwise" section logic separator when logic is exhaustive.',
            'Refactored BranchingLogicEditor to use reusable BranchLogicSet component.',

        ],
        technicalChanges: [
            'Updated BuildPanel.tsx and SurveyStructureWidget.tsx logic for "Issues" label.',
            'Refactored DataCard component to handle state-specific icons internally.',
            'Created components/EditableText.tsx for reusable click-to-edit input behavior.',
            'Updated QuestionCard.tsx to use EditableText and AsteriskIcon.',
            'Updated Header.tsx to use EditableText for survey name editing.',
            'Fixed broken Tailwind class names in QuestionCard.tsx.',
            'Created documentation/components/DataCard.md.',
            'Refactored BranchingLogicEditor, WorkflowEditor, ChoiceLayoutEditor, and TextEntryAdvancedSettings to use shared components.',
            'Created reusable Toggle component and applied it to Advanced Tab settings.'
        ]
    },
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
