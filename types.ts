

import type React from 'react';

export enum QuestionType {
  Radio = 'Radio Button',
  Checkbox = 'Checkbox',
  Description = 'Description',
  Text = 'Text Answer',
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
  ImageAreaEvaluator = 'Image Area Evaluator',
  ImageAreaSelector = 'Image Area Selector',
  ImageChoiceGrid = 'Image Choice Grid',
  ImageSelector = 'Image Selector',
  LookupTable = 'Lookup Table',
  NetPromoterNPS = 'Net Promoter (NPS)',
  NumericRanking = 'Numeric Ranking',
  NumericAnswer = 'Numeric Answer',
  OpenEndAnswer = 'Open-End Answer',
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
  Heatmap = 'Heatmap',
  Carrousel = 'Carrousel',
}

export interface Choice {
  id: string;
  text: string;
  visible?: boolean;
  fixed?: boolean;
  color?: string | null;
  image?: string | null;
  allowTextEntry?: boolean;
  description?: string;
}

export enum RandomizationType {
  None = 'none',
  Permutation = 'permutation',
  RandomReverse = 'random_reverse',
  ReverseOrder = 'reverse_order',
  Rotation = 'rotation',
  SortByCode = 'sort_by_code',
  SortByText = 'sort_by_text',
  Synchronized = 'synchronized',
}

export interface ChoiceBehaviorRule {
  id: string;
  type: 'eliminate' | 'exclude';
  targetChoiceId: string;
  sourceQuestionId: string;
  sourceChoiceId: string;
}

export interface Question {
  id: string;
  qid: string;
  text: string;
  type: QuestionType;
  choices?: Choice[];
  skipLogic?: string;
  isHidden?: boolean;
  hideBackButton?: boolean;
  forceResponse?: boolean;

  // New properties for detailed editing
  answerFormat?: 'list' | 'dropdown' | 'horizontal' | 'image';
  advancedSettings?: {
    choiceOrientation?: 'vertical' | 'horizontal' | 'grid';
    numColumns?: number;
    choiceWidth?: 'auto' | 'full' | 'fixed';
    imagePosition?: 'above' | 'left' | 'right' | 'hidden';
    imageSize?: 'small' | 'medium' | 'large' | 'custom';
  };
  styleOverrides?: {
    customColor?: string | null;
    customFont?: string | null;
    customFontSize?: number | null;
    customSpacing?: number | null;
  };
  behavior?: {
    displayLogic?: any[]; // Simplified for now
    skipLogicPerChoice?: Record<string, string>;
    randomizationType?: RandomizationType;
    carryForwardSource?: string;
    carryForwardType?: 'all' | 'selected' | 'unselected';
    defaultValue?: string;
    eliminateAnsweredIn?: string;
    eliminateNotAnsweredIn?: string;
    excludeFromElimination?: string[];
    choiceBehaviorRules?: ChoiceBehaviorRule[];
  };
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