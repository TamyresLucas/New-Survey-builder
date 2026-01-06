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

export const MIN_ZOOM = 0.04;
export const MAX_ZOOM = 4;
export const DEFAULT_NODE_WIDTH = 320; // w-80 in tailwind

// Default heights for different node types for initial placement
export const START_NODE_HEIGHT = 60;
export const TEXT_ENTRY_NODE_HEIGHT = 120;
export const MULTIPLE_CHOICE_NODE_BASE_HEIGHT = 100;
export const MULTIPLE_CHOICE_OPTION_HEIGHT = 32;
export const LOGIC_NODE_HEIGHT = 80;
