import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './ui/badge';

const meta = {
    title: 'Components/Feedback/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    args: {
        children: 'Badge',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'secondary', 'destructive', 'success', 'warning', 'outline'],
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        variant: 'default',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Destructive',
    },
};

export const Success: Story = {
    args: {
        variant: 'success',
        children: 'Success',
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        children: 'Warning',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline',
    },
};
