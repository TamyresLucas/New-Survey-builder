import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './ui/toggle';
import { Bold } from 'lucide-react';

const meta = {
    title: 'Components/Toggle',
    component: Toggle,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <Toggle aria-label="Toggle bold" {...args}>
            <Bold className="h-4 w-4" />
        </Toggle>
    ),
};
