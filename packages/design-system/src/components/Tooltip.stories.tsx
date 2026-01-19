import type { Meta, StoryObj } from '@storybook/react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';
import { Button } from './ui/button';

const meta = {
    title: 'Components/Overlay/Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <TooltipProvider>
                <Story />
            </TooltipProvider>
        ),
    ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <Tooltip {...args}>
            <TooltipTrigger asChild>
                <Button variant="outline">Hover</Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Add to library</p>
            </TooltipContent>
        </Tooltip>
    ),
};
