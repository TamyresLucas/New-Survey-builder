import type { Meta, StoryObj } from '@storybook/react';
import { DarkModeStressTest } from './DarkModeStressTest';

const meta: Meta<typeof DarkModeStressTest> = {
    title: 'Design Patterns/Dark Mode Stress Test',
    component: DarkModeStressTest,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Validates the dark mode implementation against WCAG standards and the corrected specifications.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DarkModeStressTest>;

export const Default: Story = {};
