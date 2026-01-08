import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './ui/aspect-ratio';
import { Card } from './ui/card';

const meta = {
    title: 'Components/AspectRatio',
    component: AspectRatio,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div className="w-[450px]">
            <AspectRatio ratio={16 / 9} {...args}>
                <img
                    src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                    alt="Photo by Drew Beamer"
                    className="rounded-md object-cover"
                />
            </AspectRatio>
        </div>
    ),
};
