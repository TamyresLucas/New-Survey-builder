import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

const meta: Meta<typeof Checkbox> = {
    title: 'Components/Form Elements/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Checkbox id="terms" {...args} />
            <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
    ),
};

export const Checked: Story = {
    args: {
        checked: true,
    },
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Checkbox id="terms2" {...args} />
            <Label htmlFor="terms2">Checked by default</Label>
        </div>
    ),
};

// === DISABLED STATES ===

export const Disabled: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="disabled1" disabled />
                <Label htmlFor="disabled1" className="text-muted-foreground">Disabled unchecked</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="disabled2" disabled checked />
                <Label htmlFor="disabled2" className="text-muted-foreground">Disabled checked</Label>
            </div>
        </div>
    ),
};

// === WITH DESCRIPTION ===

export const WithDescription: Story = {
    render: () => (
        <div className="items-top flex space-x-2">
            <Checkbox id="terms-desc" />
            <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms-desc">Accept terms and conditions</Label>
                <p className="text-sm text-muted-foreground">
                    You agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    ),
};

export const MultipleWithDescriptions: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="items-top flex space-x-2">
                <Checkbox id="notifications" defaultChecked />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive updates about new surveys and responses.
                    </p>
                </div>
            </div>
            <div className="items-top flex space-x-2">
                <Checkbox id="marketing" />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="marketing">Marketing emails</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive tips and product announcements.
                    </p>
                </div>
            </div>
            <div className="items-top flex space-x-2">
                <Checkbox id="partner" disabled />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="partner" className="text-muted-foreground">Partner offers</Label>
                    <p className="text-sm text-muted-foreground">
                        This option is currently unavailable.
                    </p>
                </div>
            </div>
        </div>
    ),
};
