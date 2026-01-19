import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './ui/button';
import { fn } from '@storybook/test';

const meta = {
    title: 'Components/Actions/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'success', 'outline', 'secondary', 'ghost', 'ghost-destructive', 'ghost-success', 'link'],
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
        },
        asChild: {
            control: 'boolean',
        },
    },
    args: {
        onClick: fn(),
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        variant: 'default',
        children: 'Button',
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



export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost',
    },
};

export const GhostDestructive: Story = {
    args: {
        variant: 'ghost-destructive',
        children: 'Ghost Destructive',
    },
};

export const GhostSuccess: Story = {
    args: {
        variant: 'ghost-success',
        children: 'Ghost Success',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        children: 'Link',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small Button',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large Button',
    },
};

export const Icon: Story = {
    args: {
        size: 'icon',
        children: <span className="material-symbols-rounded">add</span>,
    },
};

// === DISABLED STATES ===

export const Disabled: Story = {
    args: {
        variant: 'default',
        children: 'Disabled Button',
        disabled: true,
    },
};

export const DisabledAllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Button variant="default" disabled>Default</Button>
            <Button variant="destructive" disabled>Destructive</Button>
            <Button variant="success" disabled>Success</Button>
            <Button variant="outline" disabled>Outline</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="ghost" disabled>Ghost</Button>
            <Button variant="ghost-success" disabled>Ghost Success</Button>
            <Button variant="link" disabled>Link</Button>
        </div>
    ),
};

// === LOADING STATES ===

export const Loading: Story = {
    render: () => (
        <Button isLoading>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
        </Button>
    ),
};

export const LoadingAllVariants: Story = {
    render: () => {
        const Spinner = () => (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        );
        return (
            <div className="flex flex-wrap gap-4">
                <Button variant="default" isLoading><Spinner />Loading...</Button>
                <Button variant="destructive" isLoading><Spinner />Loading...</Button>
                <Button variant="success" isLoading><Spinner />Loading...</Button>
                <Button variant="outline" isLoading><Spinner />Loading...</Button>
                <Button variant="secondary" isLoading><Spinner />Loading...</Button>
                <Button variant="ghost-success" isLoading><Spinner />Loading...</Button>
            </div>
        );
    },
};
