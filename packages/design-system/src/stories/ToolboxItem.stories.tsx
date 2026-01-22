import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import React from 'react';
import { ToolboxItem } from '../components/ui/toolbox-item';
import {
  Square,
  Grid2X2,
  RadioButtonChecked,
  FormatParagraph,
  ArrowDropDown,
  Mail,
  CloudUpload,
  Image,
  Star,
  Tune,
  Event,
  Pin,
  MoveUp,
  FormatListNumbered,
  SentimentSatisfied,
  TableChart,
  Square as SquareIcon,
  GripVertical,
  TouchApp,
  ChatBubbleOutline,
  Code,
  Timer,
  Security,
  Draw,
  FormatInkHighlighter,
  EditNote,
  ViewCarousel,
  AdsClick,
  Style,
  DashboardCustomize,
  InsertPageBreak,
  DarkMode,
  Globe,
  Clock,
  Phone,
  Settings,
  Check,
} from '../components/ui/icons';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/ToolboxItem',
  component: ToolboxItem,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    // Define control types for props
    label: { control: 'text' },
    isEnabled: { control: 'boolean' },
    isDragging: { control: 'boolean' },
    isDraggable: { control: 'boolean' },
    className: { control: 'text' },
  },
  // Use `fn` to spy on the onClick/onDragStart/onDragEnd events
  args: { 
    onDragStart: fn(),
    onDragEnd: fn(),
    onClick: fn(),
  },
} satisfies Meta<typeof ToolboxItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const Default: Story = {
  args: {
    icon: Square,
    label: 'Check Box',
    isEnabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <ToolboxItem
        icon={Check}
        label="Enabled"
        isEnabled={true}
      />
      <ToolboxItem
        icon={Check}
        label="Disabled"
        isEnabled={false}
      />
      <ToolboxItem
        icon={Check}
        label="Dragging"
        isDragging={true}
        isEnabled={true}
      />
      <ToolboxItem
        icon={Check}
        label="Non-Draggable"
        isDraggable={false}
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    icon: Square,
    label: 'Check Box',
    isEnabled: false,
  },
};

export const Dragging: Story = {
  args: {
    icon: Square,
    label: 'Check Box',
    isDragging: true,
  },
};

export const WithEndAction: Story = {
  args: {
    icon: Square,
    label: 'Check Box',
    isEnabled: true,
    endAction: (
      <button className="p-1 rounded hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
      </button>
    ),
  },
};

// Define sample toolbox items for the stories
const sampleToolboxItems = [
  { name: 'Block', icon: Square },
  { name: 'Auto Complete Dropdown', icon: ArrowDropDown },
  { name: 'Card Sort', icon: Style },
  { name: 'Carousel', icon: ViewCarousel },
  { name: 'Cascading Dropdown', icon: ArrowDropDown },
  { name: 'Check Box', icon: Square },
  { name: 'Choice Grid', icon: Grid2X2 },
  { name: 'Click Map', icon: TouchApp },
  { name: 'Comment Box', icon: ChatBubbleOutline },
  { name: 'Custom Grid', icon: DashboardCustomize },
  { name: 'Custom Scripting', icon: Code },
  { name: 'Date & Time', icon: Event },
  { name: 'Description', icon: FormatParagraph },
  { name: 'Drag and Drop Ranking', icon: MoveUp },
  { name: 'Dropdown', icon: ArrowDropDown },
  { name: 'Email Address', icon: Mail },
  { name: 'Email Collector', icon: Mail },
  { name: 'File Upload', icon: CloudUpload },
  { name: 'Hot Spot', icon: AdsClick },
  { name: 'Image Grid', icon: Image },
  { name: 'Image Select', icon: Image },
  { name: 'Language Preference', icon: Globe },
  { name: 'Lookup Table', icon: TableChart },
  { name: 'Metadata Collector', icon: Settings },
  { name: 'NPS', icon: SentimentSatisfied },
  { name: 'Numeric Input', icon: Pin },
  { name: 'Numeric Ranking', icon: FormatListNumbered },
  { name: 'Page Break', icon: InsertPageBreak },
  { name: 'Phone Number', icon: Phone },
  { name: 'Radio Button', icon: RadioButtonChecked },
  { name: 'Running Total', icon: Grid2X2 },
  { name: 'Secured Temporary Variable', icon: Security },
  { name: 'Signature', icon: Draw },
  { name: 'Slider', icon: Tune },
  { name: 'Star Rating', icon: Star },
  { name: 'Text Highlighter', icon: FormatInkHighlighter },
  { name: 'Text Input', icon: EditNote },
  { name: 'Time Zone', icon: Clock },
  { name: 'Timer', icon: Timer },
];

// Define the question groups
const sampleQuestionGroups: Record<string, string[]> = {
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

export const AllQuestionTypes: Story = {
  render: () => (
    <div className="w-80 max-h-[500px] overflow-y-auto">
      {sampleToolboxItems.map((item, index) => (
        <ToolboxItem
          key={index}
          icon={item.icon}
          label={item.name}
          isEnabled={true}
        />
      ))}
    </div>
  ),
};

export const GroupedByCategory: Story = {
  render: () => (
    <div className="w-80 max-h-[600px] overflow-y-auto">
      {Object.entries(sampleQuestionGroups).map(([groupName, items], groupIndex) => (
        <div key={groupIndex}>
          <h3 className="text-sm font-semibold px-4 pt-3 pb-1">{groupName}</h3>
          {items.map((itemName, itemIndex) => {
            const item = sampleToolboxItems.find(i => i.name === itemName);
            if (!item) return null;

            return (
              <ToolboxItem
                key={itemIndex}
                icon={item.icon}
                label={item.name}
                isEnabled={true}
              />
            );
          })}
        </div>
      ))}
    </div>
  ),
};

export const InteractiveDemo: Story = {
  args: {
    icon: Square,
    label: 'Check Box',
    isEnabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This demo shows how the component responds to user interactions. Check the Actions tab to see events logged.'
      }
    }
  }
};

export const DarkModePreview: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'ToolboxItem component in dark mode. Note: The actual appearance depends on the theme implementation.'
      }
    }
  },
  render: () => (
    <div className="dark bg-gray-900 p-4 rounded w-80">
      <ToolboxItem
        icon={Square}
        label="Check Box"
        isEnabled={true}
      />
      <ToolboxItem
        icon={RadioButtonChecked}
        label="Radio Button"
        isEnabled={false}
      />
      <ToolboxItem
        icon={Grid2X2}
        label="Choice Grid"
        isDragging={true}
      />
    </div>
  ),
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ToolboxItem with custom theming applied via CSS variables or utility classes.'
      }
    }
  },
  render: () => (
    <div className="p-4 rounded w-80" style={{
      '--custom-bg': '#f0f0f0',
      '--custom-hover-bg': '#e0e0e0',
      '--custom-border': '#cccccc',
    } as React.CSSProperties}>
      <ToolboxItem
        icon={Star}
        label="Star Rating"
        isEnabled={true}
        className="bg-[--custom-bg] hover:bg-[--custom-hover-bg] border-b-[--custom-border]"
      />
      <ToolboxItem
        icon={Tune}
        label="Slider"
        isEnabled={true}
        className="bg-[--custom-bg] hover:bg-[--custom-hover-bg] border-b-[--custom-border]"
      />
    </div>
  ),
};