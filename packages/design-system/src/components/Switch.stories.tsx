import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const meta: Meta<typeof Switch> = {
    title: 'Components/Form Elements/Switch',
    component: Switch,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
    ),
};

// === DISABLED STATE ===

export const Disabled: Story = {
    render: () => (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="disabled-off" disabled />
                <Label htmlFor="disabled-off" className="text-muted-foreground">
                    Disabled (off)
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="disabled-on" disabled defaultChecked />
                <Label htmlFor="disabled-on" className="text-muted-foreground">
                    Disabled (on)
                </Label>
            </div>
        </div>
    ),
};

// === WITH DESCRIPTION ===

export const WithDescription: Story = {
    render: () => (
        <div className="flex items-start space-x-3">
            <Switch id="notifications" className="mt-1" />
            <div className="grid gap-1.5">
                <Label htmlFor="notifications">
                    Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                    Receive push notifications when someone responds to your survey.
                </p>
            </div>
        </div>
    ),
};

// === CONTROLLED ===

const ControlledSwitch = () => {
    const [checked, setChecked] = React.useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch
                    id="controlled"
                    checked={checked}
                    onCheckedChange={setChecked}
                />
                <Label htmlFor="controlled">
                    {checked ? 'Enabled' : 'Disabled'}
                </Label>
            </div>
            <p className="text-sm text-muted-foreground">
                Current state: <code className="bg-muted px-1 rounded">{checked.toString()}</code>
            </p>
        </div>
    );
};

export const Controlled: Story = {
    render: () => <ControlledSwitch />,
};

// === SETTINGS LIST ===

export const SettingsList: Story = {
    render: () => (
        <div className="w-full max-w-md border rounded-lg divide-y">
            <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive emails about your survey responses
                    </p>
                </div>
                <Switch id="email" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Get notified on your mobile device
                    </p>
                </div>
                <Switch id="push" />
            </div>
            <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive text messages for important updates
                    </p>
                </div>
                <Switch id="sms" disabled />
            </div>
        </div>
    ),
};

// === SURVEY SETTINGS (Voxco-specific) ===

export const SurveySettings: Story = {
    render: () => (
        <div className="w-full max-w-md space-y-6">
            <h3 className="text-lg font-medium">Survey Settings</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Anonymous Responses</Label>
                        <p className="text-sm text-muted-foreground">
                            Don't collect respondent information
                        </p>
                    </div>
                    <Switch id="anonymous" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Required Questions</Label>
                        <p className="text-sm text-muted-foreground">
                            Make all questions mandatory by default
                        </p>
                    </div>
                    <Switch id="required" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Progress Bar</Label>
                        <p className="text-sm text-muted-foreground">
                            Show completion percentage to respondents
                        </p>
                    </div>
                    <Switch id="progress" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Auto-advance</Label>
                        <p className="text-sm text-muted-foreground">
                            Automatically move to next question after selection
                        </p>
                    </div>
                    <Switch id="autoadvance" />
                </div>
            </div>
        </div>
    ),
};

// === SIZES ===

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-8">
            <div className="flex items-center space-x-2">
                <Switch id="small" className="scale-75" />
                <Label htmlFor="small">Small</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="default" />
                <Label htmlFor="default">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="large" className="scale-125" />
                <Label htmlFor="large">Large</Label>
            </div>
        </div>
    ),
};
