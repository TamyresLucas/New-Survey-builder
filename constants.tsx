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
  RespondentTimeZoneIcon,
  RunningTotalIcon,
  SecuredVariableIcon,
  SignatureIcon,
  SliderIcon,
  StarRatingIcon,
  TextHighlighterIcon,
  TimerIcon,
  // New imports
  CarouselIcon,
  ClickMapIcon,
  CommentBoxIcon,
  HotSpotIcon,
  ImageIcon,
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
  { name: 'Auto Complete Dropdown', icon: DropDownIcon },
  { name: 'Card Sort', icon: CardSortIcon },
  { name: 'Carousel', icon: CarouselIcon },
  { name: 'Cascading Dropdown', icon: DropDownIcon },
  { name: 'Check Box', icon: CheckboxToolboxIcon },
  { name: 'Choice Grid', icon: ChoiceGridIcon },
  { name: 'Click Map', icon: ClickMapIcon },
  { name: 'Comment Box', icon: CommentBoxIcon },
  { name: 'Custom Grid', icon: HybridGridIcon },
  { name: 'Custom Scripting', icon: CustomQuestionIcon },
  { name: 'Date & Time', icon: DateTimeIcon },
  { name: 'Description', icon: DescriptionToolboxIcon },
  { name: 'Drag and Drop Ranking', icon: DragDropIcon },
  { name: 'Dropdown', icon: DropDownIcon },
  { name: 'Email Address', icon: EmailIcon },
  { name: 'Email Collector', icon: RespondentEmailIcon },
  { name: 'File Upload', icon: FileUploadIcon },
  { name: 'Hot Spot', icon: HotSpotIcon },
  { name: 'Image Grid', icon: ImageIcon },
  { name: 'Image Select', icon: ImageIcon },
  { name: 'Language Preference', icon: RespondentLanguageIcon },
  { name: 'Lookup Table', icon: LookupTableIcon },
  { name: 'Metadata Collector', icon: RespondentMetadataIcon },
  { name: 'NPS', icon: NpsIcon },
  { name: 'Numeric Input', icon: NumericAnswerIcon },
  { name: 'Numeric Ranking', icon: NumericRankingIcon },
  { name: 'Page Break', icon: PageBreakIcon },
  { name: 'Phone Number', icon: RespondentPhoneIcon },
  { name: 'Radio Button', icon: RadioIcon },
  { name: 'Running Total', icon: RunningTotalIcon },
  { name: 'Secured Temporary Variable', icon: SecuredVariableIcon },
  { name: 'Signature', icon: SignatureIcon },
  { name: 'Slider', icon: SliderIcon },
  { name: 'Star Rating', icon: StarRatingIcon },
  { name: 'Text Highlighter', icon: TextHighlighterIcon },
  { name: 'Text Input', icon: TextEntryIcon },
  { name: 'Time Zone', icon: RespondentTimeZoneIcon },
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

export const questionGroups: Record<string, string[]> = {
  'Basic': ['Text Input', 'Check Box', 'Radio Button', 'Choice Grid', 'Description', 'Lookup Table'],
  'Input': ['Date & Time', 'Email Address', 'Numeric Input', 'Text Input'],
  'Multiple choices': ['Auto Complete Dropdown', 'Cascading Dropdown', 'Check Box', 'Dropdown', 'Image Select', 'Radio Button'],
  'Grid': ['Choice Grid', 'Custom Grid', 'Image Grid', 'Running Total'],
  'Rating & Scoring': ['Drag and Drop Ranking', 'NPS', 'Numeric Ranking', 'Slider', 'Star Rating'],
  'Advanced & Interactive': ['Card Sort', 'Carousel', 'Click Map', 'Comment Box', 'Custom Scripting', 'File Upload', 'Hot Spot', 'Signature', 'Text Highlighter', 'Timer'],
  'System Variable': ['Email Collector', 'Language Preference', 'Metadata Collector', 'Phone Number', 'Secured Temporary Variable', 'Time Zone']
};

