import type React from 'react';

export enum QuestionType {
  Radio = 'Radio Button',
  Checkbox = 'Checkbox',
  Description = 'Description',
  TextEntry = 'Text Entry',
  PageBreak = 'Page Break',
  ChoiceGrid = 'Choice Grid',
  Autocomplete = 'Autocomplete',
  CardSort = 'Card Sort',
  CustomQuestion = 'Custom Question',
  DateTimeAnswer = 'Date Time Answer',
  DragAndDropRanking = 'Drag And Drop Ranking',
  DrillDown = 'Drill-Down',
  DropDownList = 'Drop-Down List',
  EmailAddressAnswer = 'Email Address Answer',
  FileUpload = 'File Upload',
  HybridGrid = 'Hybrid Grid',
  LookupTable = 'Lookup Table',
  NetPromoterNPS = 'Net Promoter (NPS)',
  NumericRanking = 'Numeric Ranking',
  NumericAnswer = 'Numeric Answer',
  RespondentEmail = 'Respondent Email',
  RespondentLanguage = 'Respondent Language',
  RespondentMetadata = 'Respondent Metadata',
  RespondentPhone = 'Respondent Phone',
  RespondentTimeZone = 'Respondent Time Zone',
  RunningTotal = 'Running Total',
  SecuredTemporaryVariable = 'Secured Temporary Variable',
  Signature = 'Signature',
  Slider = 'Slider',
  StarRating = 'Star Rating',
  TextHighlighter = 'Text Highlighter',
  Timer = 'Timer',
  // Fix: Add missing question types to resolve compilation errors.
  ImageSelector = 'Image Selector',
  ImageChoiceGrid = 'Image Choice Grid',
}

export interface Choice {
  id: string;
  text: string;
  visible?: boolean;
  color?: string | null;
  allowTextEntry?: boolean;
  description?: string;
}

// --- NEW DATA MODELS FOR BEHAVIOR TAB ---

export interface DisplayLogicCondition {
  id: string;
  questionId: string; // This is the QID, e.g., "Q1"
  // FIX: Allow empty string for operator to represent an unselected state. This resolves multiple TypeScript errors where new conditions are initialized with an empty operator.
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | '';
  value: string;
  isConfirmed?: boolean;
}

export interface DisplayLogic {
  operator: 'AND' | 'OR';
  conditions: DisplayLogicCondition[];
}

export interface SkipLogicRule {
  choiceId: string;
  skipTo: string; // 'next' | question ID (internal id) | 'end'
  isConfirmed?: boolean;
}

export type SkipLogic = {
  type: 'simple';
  skipTo: string; // 'next' | question ID (internal id) | 'end'
  isConfirmed?: boolean;
} | {
  type: 'per_choice';
  rules: SkipLogicRule[];
};

export type RandomizationMethod =
  | 'permutation'
  | 'random_reverse'
  | 'reverse_order'
  | 'rotation'
  | 'sort_by_code'
  | 'sort_by_text'
  | 'synchronized';

export interface AnswerBehavior {
  randomizeChoices?: boolean;
  randomizationMethod?: RandomizationMethod;
}

export interface CarryForwardLogic {
  sourceQuestionId: string; // This is the QID, e.g., "Q1"
  filter: 'selected' | 'not_selected' | 'displayed' | 'not_displayed' | 'all';
}

export interface BranchingCondition {
  id: string;
  questionId: string; // This is the QID, e.g., "Q1"
  // FIX: Allow empty string for operator to represent an unselected state. This resolves multiple TypeScript errors where new conditions are initialized with an empty operator.
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | '';
  value: string;
  isConfirmed?: boolean;
}

export interface Branch {
  id: string;
  operator: 'AND' | 'OR';
  conditions: BranchingCondition[];
  thenSkipTo: string; // 'next' | question ID (internal id) | 'end'
  thenSkipToIsConfirmed?: boolean;
}

export interface BranchingLogic {
  branches: Branch[];
  otherwiseSkipTo: string; // 'next' | question ID (internal id) | 'end'
  otherwiseIsConfirmed?: boolean;
}


export interface Question {
  id: string;
  qid: string;
  text: string;
  type: QuestionType;
  choices?: Choice[];
  isHidden?: boolean;
  hideBackButton?: boolean;
  forceResponse?: boolean;

  // New properties for Text Entry
  textEntrySettings?: {
    answerLength?: 'short' | 'paragraph' | 'essay';
    placeholder?: string;
    validation?: {
      contentType?: 'none' | 'email' | 'phone' | 'number' | 'url' | 'date' | 'postal_code' | 'custom_regex';
      customRegex?: string;
      minLength?: number | null;
      maxLength?: number | null;
    };
    advanced?: {
      showCharCounter?: boolean;
      counterType?: 'remaining' | 'used' | 'both';
      autoResize?: boolean;
      textBoxWidth?: 'full' | 'large' | 'medium' | 'small';
      customFontSize?: number | null;
      customBorderColor?: string | null;
    };
  };

  // New properties for detailed editing
  answerFormat?: 'list' | 'dropdown' | 'horizontal';
  advancedSettings?: {
    choiceOrientation?: 'vertical' | 'horizontal' | 'grid';
    numColumns?: number;
    choiceWidth?: 'auto' | 'full' | 'fixed';
  };
  styleOverrides?: {
    customColor?: string | null;
    customFont?: string | null;
    customFontSize?: number | null;
    customSpacing?: number | null;
  };
  
  // --- NEW BEHAVIOR PROPERTIES ---
  displayLogic?: DisplayLogic;
  skipLogic?: SkipLogic;
  answerBehavior?: AnswerBehavior;
  carryForwardStatements?: CarryForwardLogic;
  carryForwardScalePoints?: CarryForwardLogic;
  branchingLogic?: BranchingLogic;

  // --- NEW DRAFT LOGIC PROPERTIES ---
  draftDisplayLogic?: DisplayLogic;
  draftSkipLogic?: SkipLogic;
  draftBranchingLogic?: BranchingLogic;
}

export interface Block {
  id: string;
  bid?: string;
  title: string;
  questions: Question[];
}

export interface Survey {
  title: string;
  blocks: Block[];
}

export interface ToolboxItemData {
  name: string;
  icon: React.FC<{ className?: string }>;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- NEW DATA MODEL FOR LOGIC VALIDATION ---
export interface LogicIssue {
  questionId: string; // The question where the logic is defined
  type: 'display' | 'skip' | 'branching'; // Which logic editor it belongs to
  message: string; // The error message
  sourceId?: string; // The ID of the specific condition, rule, or branch that has the error
  field?: 'questionId' | 'value' | 'operator' | 'skipTo'; // The specific field with the issue
}