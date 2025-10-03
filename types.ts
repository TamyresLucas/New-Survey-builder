

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