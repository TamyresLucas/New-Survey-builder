import type { Survey, ToolboxItemData, NavItem } from './types';
import { QuestionType } from './types';
import {
  // Main Nav
  PlusIcon, ArrowSplitIcon, BrushIcon, GlobeIcon, TuneIcon, ClockIcon, BlueprintIcon,

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
import { generateId } from './utils';


export const initialSurveyData: Survey = {
  title: 'Customer Feedback',
  pagingMode: 'one-per-page',
  globalAutoAdvance: false,
  blocks: [
    {
      id: 'block1',
      title: 'Introduction.',
      pageName: 'Page 1',
      autoAdvance: false,
      questions: [
        {
          id: 'q-welcome',
          qid: '',
          text: 'Welcome to our feedback survey! Your opinion is important to us.',
          type: QuestionType.Description,
          label: 'Description 1'
        },
        {
          id: 'q1',
          qid: 'Q1',
          text: 'Have you purchased coffee from our café in the past month?',
          type: QuestionType.Radio,
          autoAdvance: false,
          choices: [
            { id: 'q1c1', text: 'Q1_1 Yes' },
            { id: 'q1c2', text: 'Q1_2 No' }
          ],
          branchingLogic: {
            branches: [
              {
                id: 'branch-q1-purchaser',
                operator: 'AND',
                conditions: [{ id: 'cond-q1-1', questionId: 'Q1', operator: 'equals', value: 'Q1_1 Yes', isConfirmed: true }],
                thenSkipTo: 'block:block2',
                thenSkipToIsConfirmed: true,
                pathName: 'Purchaser Path',
              },
              {
                id: 'branch-q1-nonpurchaser',
                operator: 'AND',
                conditions: [{ id: 'cond-q1-2', questionId: 'Q1', operator: 'equals', value: 'Q1_2 No', isConfirmed: true }],
                thenSkipTo: 'block:block3',
                thenSkipToIsConfirmed: true,
                pathName: 'Non-Purchaser Path',
              },
            ],
            otherwiseSkipTo: 'end',
            otherwiseIsConfirmed: true,
          },
        },
      ],
      bid: 'BL1'
    },
    {
      id: 'block2',
      title: 'Purchase Details',
      pageName: 'Page 2',
      branchName: 'Purchaser Path',
      autoAdvance: false,
      questions: [
        {
          id: 'q2',
          qid: 'Q2',
          text: 'What type of coffee do you usually order?',
          type: QuestionType.Checkbox,
          choices: [
            { id: 'q2c1', text: 'Q2_1 Espresso' },
            { id: 'q2c2', text: 'Q2_2 Latte/Cappuccino' },
            { id: 'q2c3', text: 'Q2_3 Cold Brew' },
          ],
        },
        {
          id: 'pb-1766078580119-dukdmg6',
          qid: '',
          text: 'Page Break',
          type: QuestionType.PageBreak,
          isAutomatic: true,
        },
        {
          id: 'q3',
          qid: 'Q3',
          text: 'Please rate your experience:',
          type: QuestionType.ChoiceGrid,
          autoAdvance: false,
          choices: [
            { id: 'q3r1', text: 'Q3_1 Product' },
            { id: 'q3r2', text: 'Q3_2 Service' },
            { id: 'q3r3', text: 'Q3_3 Speed' },
          ],
          scalePoints: [
            { id: 'q3s1', text: 'Very Dissatisfied' },
            { id: 'q3s2', text: 'Dissatisfied' },
            { id: 'q3s3', text: 'Neutral' },
            { id: 'q3s4', text: 'Satisfied' },
            { id: 'q3s5', text: 'Very Satisfied' },
          ],
          branchingLogic: {
            branches: [
              {
                id: 'branch-q3-product-dissatisfied',
                operator: 'AND',
                conditions: [{ id: 'cond-q3-1', questionId: 'Q3', operator: 'equals', value: 'Product_Very Dissatisfied', isConfirmed: true }],
                thenSkipTo: 'q3_why',
                thenSkipToIsConfirmed: true,
                pathName: 'Dissatisfied Customer',
              }
            ],
            otherwiseSkipTo: 'block:block4',
            otherwiseIsConfirmed: true,
          },
        },
        {
          id: 'pb-1766078580119-lnj9sy8',
          qid: '',
          text: 'Page Break',
          type: QuestionType.PageBreak,
          isAutomatic: true,
        },
        {
          id: 'q3_why',
          qid: 'Q4',
          text: 'We are sorry to hear that. Can you tell us why?',
          type: QuestionType.TextEntry,
          branchingLogic: {
            branches: [],
            otherwiseSkipTo: 'block:block4',
            otherwiseIsConfirmed: true,
          },
        },
      ],
      bid: 'BL2'
    },
    {
      id: 'block3',
      title: 'Feedback for Non-Purchasers',
      pageName: 'Page 3',
      branchName: 'Non-Purchaser Path',
      autoAdvance: false,
      questions: [
        {
          id: 'q4',
          qid: 'Q5',
          text: 'What are the main reasons for not purchasing?',
          type: QuestionType.Radio,
          autoAdvance: false,
          choices: [
            { id: 'q4c1', text: 'Q5_1 Price' },
            { id: 'q4c2', text: 'Q5_2 Location' },
            { id: 'q4c3', text: 'Q5_3 Variety' },
          ],
        },
        {
          id: 'pb-1766078580119-82fo389',
          qid: '',
          text: 'Page Break',
          type: QuestionType.PageBreak,
          isAutomatic: true,
        },
        {
          id: 'q5',
          qid: 'Q6',
          text: 'What could we do to encourage you to visit?',
          type: QuestionType.TextEntry,
          branchingLogic: {
            branches: [],
            otherwiseSkipTo: 'block:block4',
            otherwiseIsConfirmed: true,
          },
        },
      ],
      bid: 'BL3'
    },
    {
      id: 'block4',
      title: 'Conclusion',
      pageName: 'Page 4',
      autoAdvance: false,
      questions: [
        {
          id: 'q6',
          qid: 'Q7',
          text: 'Would you like to receive special offers?',
          type: QuestionType.Radio,
          autoAdvance: false,
          choices: [
            { id: 'q6c1', text: 'Q7_1 Yes' },
            { id: 'q6c2', text: 'Q7_2 No' },
          ],
        },
      ],
      bid: 'BL4'
    },
  ],
};

export const mainNavItems: NavItem[] = [
  { id: 'Build', label: 'Build', icon: PlusIcon },
  { id: 'Flow', label: 'Flow', icon: ArrowSplitIcon },
  { id: 'Blueprint', label: 'Blueprint', icon: BlueprintIcon },
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