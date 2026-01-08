import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';

const meta = {
    title: 'Components/Textarea',
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Type your message here.',
    },
};

export const WithLabel: Story = {
    render: (args) => (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your message</Label>
            <Textarea placeholder="Type your message here." id="message" {...args} />
        </div>
    ),
};

export const WithButton: Story = {
    render: (args) => (
        <div className="grid w-full gap-2">
            <Textarea placeholder="Type your message here." {...args} />
            <Button>Send message</Button>
        </div>
    ),
};
