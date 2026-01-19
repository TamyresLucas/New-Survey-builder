import type { Meta, StoryObj } from '@storybook/react';
import { AssistantSidebar } from './assistant-sidebar';
import { Thread } from './thread';
import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';
import { Composer } from './composer';
import type { Message } from './thread';

// Sample messages for demos
const sampleMessages: Message[] = [
    {
        id: '1',
        role: 'assistant',
        content: 'Hi! How can I help you build your survey today?',
    },
    {
        id: '2',
        role: 'user',
        content: 'Can you add a satisfaction question?',
    },
    {
        id: '3',
        role: 'assistant',
        content: 'Of course! I\'ve added a satisfaction question with a 5-point scale. It asks "How satisfied are you with our service?" with options from "Very Dissatisfied" to "Very Satisfied".',
    },
    {
        id: '4',
        role: 'user',
        content: 'Great! Now add skip logic so dissatisfied respondents go to a follow-up question.',
    },
    {
        id: '5',
        role: 'assistant',
        content: 'Done! I\'ve set up skip logic so that respondents who select "Dissatisfied" or "Very Dissatisfied" will be directed to a follow-up question asking about their concerns.',
    },
];

// ============================================
// AssistantSidebar Stories
// ============================================

const sidebarMeta: Meta<typeof AssistantSidebar> = {
    title: 'Components/AssistantSidebar',
    component: AssistantSidebar,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
A complete AI assistant sidebar panel with header, message thread, and input composer.

## Features
- Header with title and close button
- Message list with auto-scroll
- User and assistant message bubbles
- Input composer with send button
- Loading state with animated dots

## Tokens Used
- \`--card\` for background
- \`--border\` for borders
- \`--primary\` for accents
- \`--foreground\` for text
        `,
            },
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: '400px', height: '600px' }}>
                <Story />
            </div>
        ),
    ],
};

export default sidebarMeta;
type SidebarStory = StoryObj<typeof AssistantSidebar>;

/**
 * Default sidebar with sample conversation.
 */
export const Default: SidebarStory = {
    args: {
        title: 'AI Assistant',
        messages: sampleMessages,
        isLoading: false,
        placeholder: 'Ask AI to add questions or change logic...',
        welcomeMessage: 'How can I help you today?',
        onClose: () => console.log('Close clicked'),
        onSubmit: (message) => console.log('Submitted:', message),
    },
};

/**
 * Empty state showing welcome message.
 */
export const Empty: SidebarStory = {
    args: {
        title: 'AI Assistant',
        messages: [],
        isLoading: false,
        welcomeMessage: 'How can I help you build your survey?',
        onClose: () => console.log('Close clicked'),
        onSubmit: (message) => console.log('Submitted:', message),
    },
};

/**
 * Loading state with animated dots.
 */
export const Loading: SidebarStory = {
    args: {
        ...Default.args,
        messages: [
            ...sampleMessages,
            { id: '6', role: 'user', content: 'Can you add branching logic?' },
        ],
        isLoading: true,
    },
};

// ============================================
// Individual Component Stories
// ============================================

export const UserMessageStory: StoryObj<typeof UserMessage> = {
    name: 'UserMessage',
    render: () => (
        <div className="p-4 bg-background space-y-4">
            <UserMessage content="Can you add a satisfaction question?" />
            <UserMessage content="This is a longer message that demonstrates how the bubble handles multiple lines of text. It should wrap nicely within the container." />
        </div>
    ),
};

export const AssistantMessageStory: StoryObj<typeof AssistantMessage> = {
    name: 'AssistantMessage',
    render: () => (
        <div className="p-4 bg-background space-y-4">
            <AssistantMessage content="Hi! How can I help you build your survey today?" />
            <AssistantMessage content="I've added a satisfaction question with a 5-point scale. It asks 'How satisfied are you with our service?' with options from 'Very Dissatisfied' to 'Very Satisfied'." />
            <AssistantMessage content="" isLoading />
        </div>
    ),
};

export const ComposerStory: StoryObj<typeof Composer> = {
    name: 'Composer',
    render: () => (
        <div className="w-full max-w-md">
            <Composer
                placeholder="Ask AI to add questions or change logic..."
                onSubmit={(message) => console.log('Submitted:', message)}
            />
        </div>
    ),
};

export const ThreadStory: StoryObj<typeof Thread> = {
    name: 'Thread',
    decorators: [
        (Story) => (
            <div style={{ width: '400px', height: '500px' }}>
                <Story />
            </div>
        ),
    ],
    render: () => (
        <Thread
            messages={sampleMessages}
            placeholder="Type a message..."
            onSubmit={(message) => console.log('Submitted:', message)}
        />
    ),
};
