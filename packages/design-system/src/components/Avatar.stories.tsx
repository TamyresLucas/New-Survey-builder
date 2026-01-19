import type { Meta, StoryObj } from '@storybook/react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from './ui/avatar';

const meta = {
    title: 'Components/Data Display/Avatar',
    component: Avatar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    ),
};

export const Fallback: Story = {
    render: (args) => (
        <Avatar>
            <AvatarImage src="" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    ),
};
