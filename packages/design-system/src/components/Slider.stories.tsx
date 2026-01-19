import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

const meta: Meta<typeof Slider> = {
    title: 'Components/Form Elements/Slider',
    component: Slider,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            className="w-[300px]"
        />
    ),
};

// === WITH VALUE DISPLAY ===

const SliderWithValue = () => {
    const [value, setValue] = React.useState([50]);

    return (
        <div className="w-[300px] space-y-2">
            <div className="flex justify-between">
                <Label>Volume</Label>
                <span className="text-sm text-muted-foreground">{value[0]}%</span>
            </div>
            <Slider
                value={value}
                onValueChange={setValue}
                max={100}
                step={1}
            />
        </div>
    );
};

export const WithValue: Story = {
    render: () => <SliderWithValue />,
};

// === RANGE SLIDER ===

const RangeSlider = () => {
    const [value, setValue] = React.useState([25, 75]);

    return (
        <div className="w-[300px] space-y-2">
            <div className="flex justify-between">
                <Label>Price Range</Label>
                <span className="text-sm text-muted-foreground">
                    ${value[0]} - ${value[1]}
                </span>
            </div>
            <Slider
                value={value}
                onValueChange={setValue}
                max={100}
                step={1}
            />
        </div>
    );
};

export const Range: Story = {
    render: () => <RangeSlider />,
};

// === DISABLED ===

export const Disabled: Story = {
    render: () => (
        <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            disabled
            className="w-[300px]"
        />
    ),
};

// === STEPS ===

const StepSlider = () => {
    const [value, setValue] = React.useState([50]);

    return (
        <div className="w-[300px] space-y-4">
            <div className="flex justify-between">
                <Label>Quantity</Label>
                <span className="text-sm font-medium">{value[0]}</span>
            </div>
            <Slider
                value={value}
                onValueChange={setValue}
                max={100}
                step={10}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
            </div>
        </div>
    );
};

export const Steps: Story = {
    render: () => <StepSlider />,
};

// === SURVEY RATING SCALE (Voxco-specific) ===

const RatingSlider = () => {
    const [value, setValue] = React.useState([5]);
    const labels = ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"];

    return (
        <div className="w-[350px] space-y-4 p-4 border rounded-lg">
            <div>
                <h3 className="font-medium mb-1">How satisfied are you?</h3>
                <p className="text-sm text-muted-foreground">
                    Rate your experience from 1 to 10
                </p>
            </div>
            <Slider
                value={value}
                onValueChange={setValue}
                min={1}
                max={10}
                step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
            </div>
            <div className="text-center">
                <span className="text-2xl font-bold text-primary">{value[0]}</span>
                <p className="text-sm text-muted-foreground mt-1">
                    {value[0] <= 2 ? labels[0] :
                        value[0] <= 4 ? labels[1] :
                            value[0] <= 6 ? labels[2] :
                                value[0] <= 8 ? labels[3] : labels[4]}
                </p>
            </div>
        </div>
    );
};

export const SurveyRatingScale: Story = {
    render: () => <RatingSlider />,
};

// === NPS SLIDER ===

const NPSSlider = () => {
    const [value, setValue] = React.useState([8]);

    const getColor = () => {
        if (value[0] <= 6) return "text-red-500";
        if (value[0] <= 8) return "text-yellow-500";
        return "text-green-500";
    };

    const getLabel = () => {
        if (value[0] <= 6) return "Detractor";
        if (value[0] <= 8) return "Passive";
        return "Promoter";
    };

    return (
        <div className="w-[350px] space-y-4 p-4 border rounded-lg">
            <div>
                <h3 className="font-medium mb-1">Net Promoter Score</h3>
                <p className="text-sm text-muted-foreground">
                    How likely are you to recommend us?
                </p>
            </div>
            <Slider
                value={value}
                onValueChange={setValue}
                min={0}
                max={10}
                step={1}
            />
            <div className="flex justify-between text-xs">
                <span className="text-red-500">Not Likely</span>
                <span className="text-green-500">Very Likely</span>
            </div>
            <div className="text-center">
                <span className={cn("text-3xl font-bold", getColor())}>{value[0]}</span>
                <p className={cn("text-sm font-medium mt-1", getColor())}>{getLabel()}</p>
            </div>
        </div>
    );
};

export const NPSScale: Story = {
    render: () => <NPSSlider />,
};

// === MULTIPLE SLIDERS ===

export const MultipleSliders: Story = {
    render: () => {
        const [values, setValues] = React.useState({
            brightness: [75],
            contrast: [50],
            saturation: [60],
        });

        return (
            <div className="w-[300px] space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Brightness</Label>
                        <span className="text-sm text-muted-foreground">{values.brightness[0]}%</span>
                    </div>
                    <Slider
                        value={values.brightness}
                        onValueChange={(v) => setValues(prev => ({ ...prev, brightness: v }))}
                        max={100}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Contrast</Label>
                        <span className="text-sm text-muted-foreground">{values.contrast[0]}%</span>
                    </div>
                    <Slider
                        value={values.contrast}
                        onValueChange={(v) => setValues(prev => ({ ...prev, contrast: v }))}
                        max={100}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Saturation</Label>
                        <span className="text-sm text-muted-foreground">{values.saturation[0]}%</span>
                    </div>
                    <Slider
                        value={values.saturation}
                        onValueChange={(v) => setValues(prev => ({ ...prev, saturation: v }))}
                        max={100}
                    />
                </div>
            </div>
        );
    },
};
