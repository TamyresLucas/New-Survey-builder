import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from './ui/color-picker';
import { Label } from './ui/label';
import { useState } from 'react';

const meta: Meta<typeof ColorPicker> = {
    title: 'Components/Form Elements/ColorPicker',
    id: 'specific-colorpicker',
    component: ColorPicker,
    // tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Seletor de cores interativo com drag, sliders, EyeDropper e múltiplos formatos (HEX, RGB, HSL, CSS).',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
    render: () => {
        const [color, setColor] = useState('#FF0000');
        return (
            <div className="space-y-4">
                <ColorPicker value={color} onChange={setColor} />
                <div className="flex items-center gap-4">
                    <div
                        className="w-20 h-20 rounded border"
                        style={{ backgroundColor: color }}
                    />
                    <div>
                        <p className="text-sm font-medium">Cor selecionada:</p>
                        <p className="text-sm text-muted-foreground">{color}</p>
                    </div>
                </div>
            </div>
        );
    },
};

export const WithLabel: Story = {
    render: () => {
        const [color, setColor] = useState('#3B82F6');
        return (
            <div className="space-y-2">
                <Label>Cor do Tema</Label>
                <ColorPicker value={color} onChange={setColor} />
            </div>
        );
    },
};

export const MultipleFormats: Story = {
    render: () => {
        const [hexColor, setHexColor] = useState('#10B981');
        const [rgbColor, setRgbColor] = useState('rgb(239, 68, 68)');
        const [hslColor, setHslColor] = useState('hsl(262, 83%, 58%)');

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>HEX</Label>
                    <ColorPicker value={hexColor} onChange={setHexColor} format="hex" />
                </div>
                <div className="space-y-2">
                    <Label>RGB</Label>
                    <ColorPicker value={rgbColor} onChange={setRgbColor} format="rgb" />
                </div>
                <div className="space-y-2">
                    <Label>HSL</Label>
                    <ColorPicker value={hslColor} onChange={setHslColor} format="hsl" />
                </div>
            </div>
        );
    },
};
