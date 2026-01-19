import type { Meta, StoryObj } from '@storybook/react';
import { FontPreview } from './FontPreview';

const meta = {
    title: 'Branding/Typography',
    component: FontPreview,
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof FontPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveValues: Story = {
    name: 'Font Selector'
};
