import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './ui/progress';
import { useEffect, useState } from 'react';

const meta = {
    title: 'Components/Progress',
    component: Progress,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => {
        const [progress, setProgress] = useState(13)

        useEffect(() => {
            const timer = setTimeout(() => setProgress(66), 500)
            return () => clearTimeout(timer)
        }, [])

        return <Progress value={progress} className="w-[60%]" {...args} />
    },
};
