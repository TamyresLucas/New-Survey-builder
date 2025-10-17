import type { Survey, ToolboxItemData, NavItem } from './types';
import { QuestionType } from './types';
import { 
  // Main Nav
  PlusIcon, ArrowSplitIcon, BrushIcon, GlobeIcon, TuneIcon, ClockIcon, AccountTreeIcon,

  // Toolbox Icons (in order of list)
  BlockIcon, 
  PageBreakIcon, 
  DescriptionIcon as DescriptionToolboxIcon,
  CheckboxFilledIcon as CheckboxToolboxIcon,
  RadioIcon, 
  OpenEndAnswerIcon as TextEntryIcon, 
  ChoiceGridIcon, 
  AutocompleteIcon, 
  CardSortIcon, 
  CustomQuestionIcon, 
  DateTimeIcon, 
  DragDropIcon, 
  DrillDownIcon, 
  DropDownIcon, 
  EmailIcon, 
  FileUploadIcon,
  HybridGridIcon,
  LookupTableIcon,
  NpsIcon,
  NumericRankingIcon,
  NumericAnswerIcon,
  RespondentEmailIcon,
  RespondentLanguageIcon,
  RespondentMetadataIcon,
  RespondentPhoneIcon,
  RunningTotalIcon,
  SecuredVariableIcon,
  SignatureIcon,
  SliderIcon,
  StarRatingIcon,
  TextHighlighterIcon,
  TimerIcon,
} from './components/icons';


export const initialSurveyData: Survey = {
  title: 'Survey Name',
  blocks: [
    {
      id: 'block1',
      title: 'Purchase Habits & Preferences',
      questions: [
        {
          id: 'q1',
          qid: 'Q1',
          text: 'Have you purchased coffee from our café in the past month?',
          type: QuestionType.Radio,
          choices: [
            { id: 'q1c1', text: 'Q1_1 Yes' },
            { id: 'q1c2', text: 'Q1_2 No' },
          ],
          skipLogic: {
            type: 'per_choice',
            rules: [
              { choiceId: 'q1c1', skipTo: 'q3', isConfirmed: true },
              { choiceId: 'q1c2', skipTo: 'next', isConfirmed: true },
            ],
          },
        },
        {
          id: 'q2',
          qid: 'Q2',
          text: 'How often do you visit our café?',
          type: QuestionType.TextEntry,
          textEntrySettings: {
            answerLength: 'long',
            placeholder: 'e.g., Once a week'
          }
        },
        {
          id: 'q3',
          qid: 'Q3',
          text: 'What type of coffee do you usually order?',
          type: QuestionType.Checkbox,
          choices: [
            { id: 'q3c1', text: 'Q3_1 Espresso' },
            { id: 'q3c2', text: 'Q3_2 Latte/Cappuccino' },
            { id: 'q3c3', text: 'Q3_3 Cold Brew' },
            { id: 'q3c4', text: 'Q3_4 Drip Coffee' },
            { id: 'q3c5', text: 'Q3_5 Other: ____' },
          ],
        },
        {
            id: 'q4',
            qid: 'Q3', // Note: This is intentional to match the image having two Q3s
            text: 'Click to write the question text',
            type: QuestionType.Checkbox,
            choices: [
              { id: 'q4c1', text: 'Click to write choice 1' },
              { id: 'q4c2', text: 'Click to write choice 2' },
              { id: 'q4c3', text: 'Click to write choice 3' },
            ],
          },
      ],
    },
  ],
};

export const mainNavItems: NavItem[] = [
    { id: 'Build', label: 'Build', icon: PlusIcon },
    { id: 'Flow', label: 'Flow', icon: ArrowSplitIcon },
    { id: 'Logic', label: 'Logic', icon: ArrowSplitIcon },
    { id: 'Style', label: 'Style', icon: BrushIcon },
    { id: 'Language', label: 'Language', icon: GlobeIcon },
    { id: 'Settings', label: 'Settings', icon: TuneIcon },
    { id: 'History', label: 'History', icon: ClockIcon },
];

export const toolboxItems: ToolboxItemData[] = [
    { name: 'Block', icon: BlockIcon },
    { name: 'Page Break', icon: PageBreakIcon },
    { name: 'Description', icon: DescriptionToolboxIcon },
    { name: 'Checkbox', icon: CheckboxToolboxIcon },
    { name: 'Radio Button', icon: RadioIcon },
    { name: 'Text Entry', icon: TextEntryIcon },
    { name: 'Choice Grid', icon: ChoiceGridIcon },
    { name: 'Autocomplete', icon: AutocompleteIcon },
    { name: 'Card Sort', icon: CardSortIcon },
    { name: 'Custom Question', icon: CustomQuestionIcon },
    { name: 'Date Time Answer', icon: DateTimeIcon },
    { name: 'Drag And Drop Ranking', icon: DragDropIcon },
    { name: 'Drill-Down', icon: DrillDownIcon },
    { name: 'Drop-Down List', icon: DropDownIcon },
    { name: 'Email Address Answer', icon: EmailIcon },
    { name: 'File Upload', icon: FileUploadIcon },
    { name: 'Hybrid Grid', icon: HybridGridIcon },
    { name: 'Lookup Table', icon: LookupTableIcon },
    { name: 'Net Promoter (NPS)', icon: NpsIcon },
    { name: 'Numeric Ranking', icon: NumericRankingIcon },
    { name: 'Numeric Answer', icon: NumericAnswerIcon },
    { name: 'Respondent Email', icon: RespondentEmailIcon },
    { name: 'Respondent Language', icon: RespondentLanguageIcon },
    { name: 'Respondent Metadata', icon: RespondentMetadataIcon },
    { name: 'Respondent Phone', icon: RespondentPhoneIcon },
    { name: 'Respondent Time Zone', icon: ClockIcon },
    { name: 'Running Total', icon: RunningTotalIcon },
    { name: 'Secured Temporary Variable', icon: SecuredVariableIcon },
    { name: 'Signature', icon: SignatureIcon },
    { name: 'Slider', icon: SliderIcon },
    { name: 'Star Rating', icon: StarRatingIcon },
    { name: 'Text Highlighter', icon: TextHighlighterIcon },
    { name: 'Timer', icon: TimerIcon },
];

// --- DIAGRAM CANVAS CONSTANTS ---

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 4;
export const DEFAULT_NODE_WIDTH = 320; // w-80 in tailwind

// Default heights for different node types for initial placement
export const START_NODE_HEIGHT = 60;
export const TEXT_ENTRY_NODE_HEIGHT = 120;
export const MULTIPLE_CHOICE_NODE_BASE_HEIGHT = 100;
export const MULTIPLE_CHOICE_OPTION_HEIGHT = 32;
export const LOGIC_NODE_HEIGHT = 80;