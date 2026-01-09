import type { Meta, StoryObj } from '@storybook/react';
import { ColorPaletteEditor } from './ColorPaletteEditor';

const meta: Meta<typeof ColorPaletteEditor> = {
    title: 'Branding/Color Palette',
    component: ColorPaletteEditor,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ColorPaletteEditor>;

export const Editor: Story = {
    name: 'Interactive Palette',
    render: () => <ColorPaletteEditor />,
};
