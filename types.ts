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
  | 'sort_by_code'
  | 'sort_by_text'
  | 'synchronized';

export interface AnswerBehavior {
  randomizeChoices?: boolean;
  randomizationMethod?: RandomizationMethod;
  // New properties for Choice Grid
  randomizeRows?: boolean;
  rowRandomizationMethod?: RandomizationMethod;
  randomizeColumns?: boolean;
  columnRandomizationMethod?: RandomizationMethod;
}

export interface CarryForwardLogic {
  sourceQuestionId: string; // This is the QID, e.g., "Q1"
  filter: 'selected' | 'not_selected' | 'displayed' | 'not_displayed' | 'all';
}

export interface BranchingLogicCondition {
  id: string;
  questionId: string; // This is the QID, e.g., "Q1"
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | '';
  value: string;
  isConfirmed?: boolean;
}

export interface BranchingLogicBranch {
  id:string;
  operator: 'AND' | 'OR';
  conditions: BranchingLogicCondition[];
  thenSkipTo: string; // 'next' | question ID (internal id) | 'end'
  thenSkipToIsConfirmed?: boolean;
  pathName?: string;
}

export interface BranchingLogic {
  branches: BranchingLogicBranch[];
  otherwiseSkipTo: string; // 'next' | question ID (internal id) | 'end'
  otherwiseIsConfirmed?: boolean;
  otherwisePathName?: string;
}

export interface ActionLogic {
  id: string;
  type: string;
  isConfirmed?: boolean;
  params?: {
    [key: string]: any;
    // For Compute Variable
    variable?: string;
    valueType?: 'formula' | 'value';
    value?: string;
    // For Selection
    conditions?: { id: string; variable: string; operator: string; value: string; }[];
    row?: string;
    assignedVariables?: { id: string; variable: string; value: string; }[];
    selections?: { 
      id: string; 
      value: string; 
      inclusionFormula: string; 
      priority: string; 
      scoreFormula: string; 
    }[];
  };
}

export interface Workflow {
  id: string;
  wid: string;
  name: string;
  actions: ActionLogic[];
}


export interface Question {
  id: string;
  qid: string;
  text: string;
  type: QuestionType;
  choices?: Choice[];
  scalePoints?: Choice[];
  isHidden?: boolean;
  hideBackButton?: boolean;
  forceResponse?: boolean;
  isAutomatic?: boolean; // For automatic page breaks
  pageName?: string; // For editable page names on PageBreak questions

  // New property for choice-based validation
  choiceValidation?: {
    minSelections?: number | null;
    maxSelections?: number | null;
  };

  // New properties for Text Entry
  textEntrySettings?: {
    answerLength?: 'short' | 'long';
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
  answerFormat?: 'list' | 'grid';
  advancedSettings?: {
    choiceOrientation?: 'vertical' | 'horizontal' | 'grid';
    numColumns?: number;
    choiceWidth?: 'auto' | 'full' | 'fixed';
    enableMobileLayout?: boolean;
    mobile?: {
      choiceOrientation?: 'vertical' | 'horizontal' | 'grid';
      choiceWidth?: 'auto' | 'full' | 'fixed';
    }
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
  beforeWorkflows?: Workflow[];
  afterWorkflows?: Workflow[];

  // --- NEW DRAFT LOGIC PROPERTIES ---
  draftDisplayLogic?: DisplayLogic;
  draftSkipLogic?: SkipLogic;
  draftBranchingLogic?: BranchingLogic;
  draftBeforeWorkflows?: Workflow[];
  draftAfterWorkflows?: Workflow[];
}

export interface Block {
  id: string;
  bid?: string;
  title: string;
  questions: Question[];
  branchName?: string;
  pageName?: string; // For editable page names on implicit pages
}

export interface Survey {
  title: string;
  blocks: Block[];
  pagingMode: 'one-per-page' | 'multi-per-page';
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

// --- NEW TYPES FOR DIAGRAM CANVAS ---

export interface Position {
  x: number;
  y: number;
}

export interface ViewTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface Option {
  id: string;
  text: string;
  variableName: string;
}

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export interface Condition {
  id: string;
  variable: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'greater_than' | 'less_than';
  value: string;
}

/**
 * Base interface for all nodes in the diagram.
 */
export interface BaseNode {
  id: string;
  type: string;
  position: Position;
  width: number;
  height: number;
  data: unknown;
  selected?: boolean; // Add selected property for React Flow
}

/**
 * Represents the entry point of the survey logic.
 */
export interface StartNode extends BaseNode {
  type: 'start';
  data: { label: string };
}

/**
 * Represents the end point of the survey logic.
 */
export interface EndNode extends BaseNode {
  type: 'end';
  data: { label: string };
}

/**
 * Represents an open-text question.
 */
export interface TextEntryNode extends BaseNode {
  type: 'text_entry';
  data: { variableName: string; question: string; validationType?: string };
}

/**
 * Represents a description/info block.
 */
export interface DescriptionNode extends BaseNode {
  type: 'description_node';
  data: { question: string; };
}

/**
 * Represents a multiple choice (radio or checkbox) question.
 */
export interface MultipleChoiceNode extends BaseNode {
  type: 'multiple_choice';
  data: { variableName: string; question: string; subtype: 'radio' | 'checkbox'; options: Option[] };
}

/**
 * A discriminated union of all possible node types for the diagram.
 */
export type Node = StartNode | EndNode | TextEntryNode | MultipleChoiceNode | DescriptionNode;


export interface Edge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle: string;
  label?: string | React.ReactNode;
  data?: {
    condition?: string;
    logicType?: 'branch' | 'skip' | 'display';
  };
  markerEnd?: any;
  selected?: boolean;
  className?: string;
}

export interface PathAnalysisResult {
  id: string;
  name: string;
  questionCount: number;
  completionTimeString: string;
  pageCount: number;
}


// --- TYPE GUARDS FOR DIAGRAM NODES ---

export const isStartNode = (node: Node): node is StartNode => node.type === 'start';
export const isEndNode = (node: Node): node is EndNode => node.type === 'end';
export const isMultipleChoiceNode = (node: Node): node is MultipleChoiceNode => node.type === 'multiple_choice';
export const isTextEntryNode = (node: Node): node is TextEntryNode => node.type === 'text_entry';
export const isDescriptionNode = (node: Node): node is DescriptionNode => node.type === 'description_node';