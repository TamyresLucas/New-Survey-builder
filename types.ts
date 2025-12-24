import type React from 'react';
// FIX: Import Position enum from @xyflow/react to resolve type incompatibility for handles.
import type { Position, XYPosition } from '@xyflow/react';


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
  gridValue?: string; // For ChoiceGrid, this will be the scale point's ID.
  isConfirmed?: boolean;
}

export interface PageInfo {
  pageNumber: number;
  pageName: string;
  source: 'block' | 'page_break';
  sourceId: string;
}

export interface LogicSet {
  id: string;
  operator: 'AND' | 'OR';
  conditions: DisplayLogicCondition[];
  isConfirmed?: boolean;
}

export interface DisplayLogic {
  operator: 'AND' | 'OR';
  conditions: DisplayLogicCondition[];
  logicSets?: LogicSet[];
}

export interface ChoiceDisplayCondition {
  id: string;
  targetChoiceId: string;
  sourceQuestionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | '';
  value: string;
  isConfirmed?: boolean;
}

export interface ChoiceDisplayLogic {
  showOperator: 'AND' | 'OR';
  showConditions: ChoiceDisplayCondition[];
  hideOperator: 'AND' | 'OR';
  hideConditions: ChoiceDisplayCondition[];
}

export interface SkipLogicRule {
  id: string; // A unique ID for the rule itself.
  choiceId: string; // For ChoiceGrid, this is the rowId. For Radio, the choiceId.
  skipTo: string;
  isConfirmed?: boolean;

  // Fields for advanced conditions, primarily for Choice Grids
  // Fields for advanced conditions, primarily for Choice Grids
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'is_answered_with' | 'is_not_answered_with' | 'is_answered_after' | 'is_answered_before' | 'is_answered' | 'is_not_answered';
  valueChoiceId?: string; // The ID of the scale point to compare against.
  conditions?: DisplayLogicCondition[]; // New: Support for multiple conditions (AND logic)
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

export interface ChoiceEliminationLogic {
  sourceQuestionId: string; // This is the QID, e.g., "Q1"
}

export interface BranchingLogicCondition {
  id: string;
  questionId: string; // This is the QID, e.g., "Q1"
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | '';
  value: string;
  gridValue?: string; // For ChoiceGrid, this will be the scale point's ID.
  isConfirmed?: boolean;
}

export interface BranchingLogicBranch {
  id: string;
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

export interface AdvancedLogic {
  id: string;
  wid: string;
  name: string;
  actions: ActionLogic[];
}


export interface Question {
  id: string;
  qid: string;
  label?: string; // Custom label for elements like Description
  text: string;
  type: QuestionType;
  choices?: Choice[];
  scalePoints?: Choice[];
  isHidden?: boolean;
  hideBackButton?: boolean;
  forceResponse?: boolean;
  softPrompt?: boolean;
  isAutomatic?: boolean; // For automatic page breaks
  pageName?: string; // For editable page names on PageBreak questions
  groupName?: string;
  autoAdvance?: boolean;

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
  hideLogic?: DisplayLogic;
  skipLogic?: SkipLogic;
  answerBehavior?: AnswerBehavior;
  choiceEliminationLogic?: ChoiceEliminationLogic;
  branchingLogic?: BranchingLogic;
  beforeAdvancedLogics?: AdvancedLogic[];
  afterAdvancedLogics?: AdvancedLogic[];
  choiceDisplayLogic?: ChoiceDisplayLogic;

  // --- NEW DRAFT LOGIC PROPERTIES ---
  draftDisplayLogic?: DisplayLogic;
  draftHideLogic?: DisplayLogic;
  draftSkipLogic?: SkipLogic;
  draftBranchingLogic?: BranchingLogic;
  draftBeforeAdvancedLogics?: AdvancedLogic[];
  draftAfterAdvancedLogics?: AdvancedLogic[];
  draftChoiceDisplayLogic?: ChoiceDisplayLogic;

  // --- NEW FEATURE ---
  linkedChoicesSource?: string; // ID of the question this one's choices are linked to
}

export type RandomizationPattern = 'rotation' | 'permutation' | 'synchronized' | 'reverse_order';

export interface QuestionRandomizationRule {
  id: string;
  startQuestionId: string;
  endQuestionId: string;
  pattern: RandomizationPattern;
  questionGroupId?: string;
  isConfirmed?: boolean;
}

export interface Block {
  id: string;
  bid?: string;
  title: string;
  questions: Question[];
  branchName?: string;
  pageName?: string; // For editable page names on implicit pages
  isSurveySection?: boolean;
  sectionName?: string;
  loopingEnabled?: boolean;
  maxLoopSize?: number;
  questionRandomization?: QuestionRandomizationRule[];
  branchingLogic?: BranchingLogic;
  draftBranchingLogic?: BranchingLogic;
  displayLogic?: DisplayLogic;
  draftDisplayLogic?: DisplayLogic;
  continueTo?: string; // 'next', 'end', or 'block:<id>'
  autoAdvance?: boolean;
  automaticPageBreaks?: boolean;
  hideBackButton?: boolean;
  sharedConvergence?: boolean;
}

export interface Survey {
  title: string;
  blocks: Block[];
  pagingMode: 'one-per-page' | 'multi-per-page';
  globalAutoAdvance?: boolean;
  lastLogicValidationMessage?: string;
  lastSaved?: string;
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
  type: 'display' | 'skip' | 'branching' | 'hide'; // Which logic editor it belongs to
  message: string; // The error message
  sourceId?: string; // The ID of the specific condition, rule, or branch that has the error
  field?: 'questionId' | 'value' | 'operator' | 'skipTo'; // The specific field with the issue
}

// --- NEW TYPES FOR DIAGRAM CANVAS ---

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

// FIX: Change HandlePosition to be an alias for the imported Position enum.
export type HandlePosition = Position;

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
  // FIX: Use XYPosition for node position to match @xyflow/react's expected type.
  position: XYPosition;
  // FIX: Make width and height optional to match @xyflow/react's expected node prop types.
  width?: number;
  height?: number;
  // FIX: Changed data property from `unknown` to `any` to ensure compatibility with @xyflow/react's Node type, which expects `data: any`.
  data: any;
  selected?: boolean; // Add selected property for React Flow
  // FIX: Add optional properties to match react-flow's Node type and resolve type errors.
  sourcePosition?: HandlePosition;
  targetPosition?: HandlePosition;
  dragHandle?: string;
  parentId?: string;
}

/**
 * Represents the entry point of the survey logic.
 */
export interface StartNode extends BaseNode {
  type: 'start';
  data: { label: string; highlightSourceHandles?: boolean; highlightInputHandle?: boolean; };
}

/**
 * Represents the end point of the survey logic.
 */
export interface EndNode extends BaseNode {
  type: 'end';
  data: { label: string; highlightSourceHandles?: boolean; highlightInputHandle?: boolean; };
}

/**
 * Represents an open-text question.
 */
export interface TextEntryNode extends BaseNode {
  type: 'text_entry';
  data: { variableName: string; question: string; validationType?: string; highlightSourceHandles?: boolean; highlightInputHandle?: boolean; };
}

/**
 * Represents a description/info block.
 */
export interface DescriptionNode extends BaseNode {
  type: 'description_node';
  data: { question: string; highlightSourceHandles?: boolean; highlightInputHandle?: boolean; };
}

/**
 * Represents a multiple choice (radio or checkbox) question.
 */
export interface MultipleChoiceNode extends BaseNode {
  type: 'multiple_choice';
  data: { variableName: string; question: string; subtype: 'radio' | 'checkbox'; options: Option[]; highlightSourceHandles?: boolean; highlightInputHandle?: boolean; };
}

/**
 * Represents a choice grid matrix question.
 */
export interface ChoiceGridNode extends BaseNode {
  type: 'choice_grid';
  data: {
    variableName: string;
    question: string;
    description?: string;
    rows: Option[];
    columns: Option[];
    highlightSourceHandles?: boolean;
    highlightInputHandle?: boolean;
  };
}

/**
 * A discriminated union of all possible node types for the diagram.
 */
export type Node = StartNode | EndNode | TextEntryNode | MultipleChoiceNode | DescriptionNode | ChoiceGridNode;

export const isChoiceGridNode = (node: Node): node is ChoiceGridNode => node.type === 'choice_grid';


export interface Edge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  // FIX: Make targetHandle optional to match @xyflow/react's Edge type.
  targetHandle?: string;
  label?: string | React.ReactNode;
  data?: {
    condition?: string;
    logicType?: 'branch' | 'skip' | 'display';
    edgeType?: 'branch' | 'sequence' | 'conditional';
  };
  markerEnd?: any;
  selected?: boolean;
  className?: string;
  type?: string;
  pathOptions?: any;
  style?: React.CSSProperties;
}

export interface PathAnalysisResult {
  id: string;
  name: string;
  questionCount: number;
  completionTimeString: string;
  pageCount: number;
  blockIds: string[];
}


// --- TYPE GUARDS FOR DIAGRAM NODES ---

export const isStartNode = (node: Node): node is StartNode => node.type === 'start';
export const isEndNode = (node: Node): node is EndNode => node.type === 'end';
export const isMultipleChoiceNode = (node: Node): node is MultipleChoiceNode => node.type === 'multiple_choice';
export const isTextEntryNode = (node: Node): node is TextEntryNode => node.type === 'text_entry';
export const isDescriptionNode = (node: Node): node is DescriptionNode => node.type === 'description_node';

export type SurveyStatus = 'draft' | 'active' | 'stopped';