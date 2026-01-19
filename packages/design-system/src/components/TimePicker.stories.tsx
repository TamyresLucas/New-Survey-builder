import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from './ui/time-picker';
import { Label } from './ui/label';
import { useState } from 'react';

const meta: Meta<typeof TimePicker> = {
    title: 'Components/Form Elements/TimePicker',
    id: 'specific-timepicker', // Preserve legacy ID for backward compatibility
    component: TimePicker,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: 'Custom Time Picker using 2 Select components (Hours 00-23, Minutes 00-59).',
            },
        },
    },
    argTypes: {
        value: {
            control: 'text',
            description: 'Time value in "HH:MM" format',
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the component',
        },
    },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
    render: () => {
        const [time, setTime] = useState('');
        return (
            <div className="space-y-4">
                <TimePicker value={time} onChange={setTime} />
                <p className="text-sm text-muted-foreground">
                    Selected time: {time || 'None'}
                </p>
            </div>
        );
    },
};

export const WithValue: Story = {
    render: () => {
        const [time, setTime] = useState('14:30');
        return (
            <div className="space-y-4">
                <TimePicker value={time} onChange={setTime} />
                <p className="text-sm text-muted-foreground">
                    Selected time: {time}
                </p>
            </div>
        );
    },
};

export const WithLabel: Story = {
    render: () => {
        const [time, setTime] = useState('09:00');
        return (
            <div className="space-y-2">
                <Label>Start Time</Label>
                <TimePicker value={time} onChange={setTime} />
            </div>
        );
    },
};

export const Disabled: Story = {
    args: {
        value: "12:00",
        disabled: true
    }
};

export const MultipleInstances: Story = {
    render: () => {
        const [startTime, setStartTime] = useState('09:00');
        const [endTime, setEndTime] = useState('17:00');

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Start Time</Label>
                    <TimePicker value={startTime} onChange={setStartTime} />
                </div>
                <div className="space-y-2">
                    <Label>End Time</Label>
                    <TimePicker value={endTime} onChange={setEndTime} />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Selected Period:</p>
                    <p className="text-sm text-muted-foreground">
                        {startTime} - {endTime}
                    </p>
                </div>
            </div>
        );
    },
};
