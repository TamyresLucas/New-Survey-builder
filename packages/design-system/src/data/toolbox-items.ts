import type { ReactElement } from 'react';
import {
  // Icons for ToolboxItem
  RadioButtonChecked,
  Square,
  Grid2X2,
  TouchApp,
  ChatBubbleOutline,
  Event,
  FormatParagraph,
  MoveUp,
  ArrowDropDown,
  Mail,
  AttachMoney,
  CloudUpload,
  AdsClick,
  Image,
  Code,
  Pin,
  FormatListNumbered,
  InsertPageBreak,
  Security,
  Draw,
  Tune,
  Star,
  FormatInkHighlighter,
  EditNote,
  Timer,
  TableChart,
  Style,
  DashboardCustomize,
  ViewCarousel,
  DarkMode,
  SentimentSatisfied,
  Code as CodeIcon,
  TouchApp as TouchAppIcon,
  DashboardCustomize as DashboardCustomizeIcon,
  ViewCarousel as ViewCarouselIcon,
  AdsClick as AdsClickIcon,
  Style as StyleIcon,
  DarkMode as DarkModeIcon,
} from '../components/ui/icons';

// Define the ToolboxItem type
export interface ToolboxItemData {
  name: string;
  icon: React.ElementType;
}

// Define the icon mapping
const iconMap: Record<string, React.ElementType> = {
  'Auto Complete Dropdown': ArrowDropDown,
  'Block': Square,
  'Card Sort': StyleIcon,
  'Carousel': ViewCarouselIcon,
  'Cascading Dropdown': ArrowDropDown,
  'Check Box': Square,
  'Choice Grid': Grid2X2,
  'Click Map': AdsClickIcon,
  'Comment Box': ChatBubbleOutline,
  'Custom Grid': DashboardCustomizeIcon,
  'Custom Scripting': CodeIcon,
  'Date & Time': Event,
  'Description': FormatParagraph,
  'Drag and Drop Ranking': MoveUp,
  'Dropdown': ArrowDropDown,
  'Email Address': Mail,
  'Email Collector': AttachMoney,
  'File Upload': CloudUpload,
  'Hot Spot': AdsClickIcon,
  'Image Grid': Image,
  'Image Select': Image,
  'Language Preference': AttachMoney,
  'Lookup Table': TableChart,
  'Metadata Collector': AttachMoney,
  'NPS': SentimentSatisfied,
  'Numeric Input': Pin,
  'Numeric Ranking': FormatListNumbered,
  'Page Break': InsertPageBreak,
  'Phone Number': AttachMoney,
  'Radio Button': RadioButtonChecked,
  'Running Total': Grid2X2,
  'Secured Temporary Variable': Security,
  'Signature': Draw,
  'Slider': Tune,
  'Star Rating': Star,
  'Text Highlighter': FormatInkHighlighter,
  'Text Input': EditNote,
  'Time Zone': AttachMoney,
  'Timer': Timer,
};

// Define the question groups
export const questionGroups: Record<string, string[]> = {
  'Advanced & Interactive': [
    'Card Sort',
    'Carousel',
    'Click Map',
    'Comment Box',
    'Custom Scripting',
    'File Upload',
    'Hot Spot',
    'Signature',
    'Text Highlighter',
    'Timer'
  ],
  'Grid': [
    'Choice Grid',
    'Custom Grid',
    'Image Grid',
    'Running Total'
  ],
  'Input': [
    'Date & Time',
    'Email Address',
    'Numeric Input',
    'Text Input'
  ],
  'Multiple choices': [
    'Auto Complete Dropdown',
    'Cascading Dropdown',
    'Check Box',
    'Dropdown',
    'Image Select',
    'Radio Button'
  ],
  'Rating & Scoring': [
    'Drag and Drop Ranking',
    'NPS',
    'Numeric Ranking',
    'Slider',
    'Star Rating'
  ],
  'Structural': [
    'Block',
    'Description',
    'Lookup Table',
    'Page Break'
  ],
  'System Variable': [
    'Email Collector',
    'Language Preference',
    'Metadata Collector',
    'Phone Number',
    'Secured Temporary Variable',
    'Time Zone'
  ]
};

// Create the toolbox items array
export const toolboxItems: ToolboxItemData[] = Object.keys(iconMap).map(name => ({
  name,
  icon: iconMap[name]
}));

// Export the icon mapping
export { iconMap };