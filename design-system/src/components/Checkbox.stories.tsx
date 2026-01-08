import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Checkbox id="terms" {...args} />
            <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
    ),
};

export const Checked: Story = {
    args: {
        checked: true,
    },
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Checkbox id="terms2" {...args} />
            <Label htmlFor="terms2">Checked by default</Label>
        </div>
    ),
};
