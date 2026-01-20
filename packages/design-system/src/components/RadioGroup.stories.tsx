import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

const meta: Meta<typeof RadioGroup> = {
    title: 'Components/Form Elements/RadioGroup',
    component: RadioGroup,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <RadioGroup defaultValue="option-one" {...args}>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Option One</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Option Two</Label>
            </div>
        </RadioGroup>
    ),
};

// === DISABLED STATES ===

export const Disabled: Story = {
    render: () => (
        <RadioGroup defaultValue="option-one" disabled>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="disabled-one" />
                <Label htmlFor="disabled-one" className="text-muted-foreground">Option One (selected)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="disabled-two" />
                <Label htmlFor="disabled-two" className="text-muted-foreground">Option Two</Label>
            </div>
        </RadioGroup>
    ),
};

export const WithDisabledOptions: Story = {
    render: () => (
        <RadioGroup defaultValue="standard">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="plan-standard" />
                <Label htmlFor="plan-standard">Standard Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="pro" id="plan-pro" />
                <Label htmlFor="plan-pro">Pro Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="enterprise" id="plan-enterprise" disabled />
                <Label htmlFor="plan-enterprise" className="text-muted-foreground">Enterprise (Contact Sales)</Label>
            </div>
        </RadioGroup>
    ),
};

// === WITH DESCRIPTION ===

export const WithDescription: Story = {
    render: () => (
        <RadioGroup defaultValue="comfortable">
            <div className="flex items-start space-x-2">
                <RadioGroupItem value="compact" id="r-compact" className="mt-1" />
                <div className="grid gap-1 leading-none">
                    <Label htmlFor="r-compact">Compact</Label>
                    <p className="text-sm text-muted-foreground">
                        Show more items in less space.
                    </p>
                </div>
            </div>
            <div className="flex items-start space-x-2">
                <RadioGroupItem value="comfortable" id="r-comfortable" className="mt-1" />
                <div className="grid gap-1 leading-none">
                    <Label htmlFor="r-comfortable">Comfortable</Label>
                    <p className="text-sm text-muted-foreground">
                        Balanced view with comfortable spacing.
                    </p>
                </div>
            </div>
            <div className="flex items-start space-x-2">
                <RadioGroupItem value="spacious" id="r-spacious" className="mt-1" />
                <div className="grid gap-1 leading-none">
                    <Label htmlFor="r-spacious">Spacious</Label>
                    <p className="text-sm text-muted-foreground">
                        Maximum space between items.
                    </p>
                </div>
            </div>
        </RadioGroup>
    ),
};

// === SURVEY QUESTION EXAMPLE ===

export const SurveyQuestion: Story = {
    render: () => (
        <div className="w-full max-w-md p-4 border rounded-lg">
            <h3 className="font-medium mb-2">How satisfied are you with our service?</h3>
            <p className="text-sm text-muted-foreground mb-4">Please select one option.</p>
            <RadioGroup>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-primary/10">
                    <RadioGroupItem value="very-satisfied" id="q-vs" className="mt-0.5" />
                    <div className="grid gap-0.5 leading-none">
                        <Label htmlFor="q-vs">Very Satisfied</Label>
                        <p className="text-xs text-muted-foreground">Exceeded my expectations</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-primary/10">
                    <RadioGroupItem value="satisfied" id="q-s" className="mt-0.5" />
                    <div className="grid gap-0.5 leading-none">
                        <Label htmlFor="q-s">Satisfied</Label>
                        <p className="text-xs text-muted-foreground">Met my expectations</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-primary/10">
                    <RadioGroupItem value="neutral" id="q-n" className="mt-0.5" />
                    <div className="grid gap-0.5 leading-none">
                        <Label htmlFor="q-n">Neutral</Label>
                        <p className="text-xs text-muted-foreground">Neither satisfied nor dissatisfied</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-primary/10">
                    <RadioGroupItem value="dissatisfied" id="q-d" className="mt-0.5" />
                    <div className="grid gap-0.5 leading-none">
                        <Label htmlFor="q-d">Dissatisfied</Label>
                        <p className="text-xs text-muted-foreground">Did not meet my expectations</p>
                    </div>
                </div>
            </RadioGroup>
        </div>
    ),
};

// === CARD STYLE (Visual Selection) ===

export const CardStyle: Story = {
    render: () => (
        <div className="w-full max-w-lg">
            <h3 className="font-medium mb-2">Select your preferred plan</h3>
            <RadioGroup defaultValue="standard" className="grid gap-3">
                <Label
                    htmlFor="card-free"
                    className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-popover p-4 hover:bg-primary/10 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/20 [&:has([data-state=checked])]:text-foreground"
                >
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="free" id="card-free" />
                        <div>
                            <p className="font-medium">Free</p>
                            <p className="text-sm text-muted-foreground">Best for trying out</p>
                        </div>
                    </div>
                    <span className="font-semibold">$0/mo</span>
                </Label>
                <Label
                    htmlFor="card-standard"
                    className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-popover p-4 hover:bg-primary/10 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/20 [&:has([data-state=checked])]:text-foreground"
                >
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" id="card-standard" />
                        <div>
                            <p className="font-medium">Standard</p>
                            <p className="text-sm text-muted-foreground">Perfect for small teams</p>
                        </div>
                    </div>
                    <span className="font-semibold">$29/mo</span>
                </Label>
                <Label
                    htmlFor="card-pro"
                    className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-popover p-4 hover:bg-primary/10 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/20 [&:has([data-state=checked])]:text-foreground"
                >
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="pro" id="card-pro" />
                        <div>
                            <p className="font-medium">Pro</p>
                            <p className="text-sm text-muted-foreground">For growing businesses</p>
                        </div>
                    </div>
                    <span className="font-semibold">$99/mo</span>
                </Label>
            </RadioGroup>
        </div>
    ),
};

export const CardStyleWithIcons: Story = {
    render: () => (
        <div className="w-full max-w-lg">
            <h3 className="font-medium mb-2">How would you prefer to be contacted?</h3>
            <p className="text-sm text-muted-foreground mb-4">Select your preferred communication method.</p>
            <RadioGroup defaultValue="email" className="grid grid-cols-3 gap-3">
                <Label
                    htmlFor="contact-email"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-primary/20 bg-popover p-4 hover:bg-primary/10 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/20 [&:has([data-state=checked])]:text-foreground"
                >
                    <RadioGroupItem value="email" id="contact-email" className="sr-only" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-sm">Email</span>
                </Label>
                <Label
                    htmlFor="contact-phone"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-primary/20 bg-popover p-4 hover:bg-primary/10 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/20 [&:has([data-state=checked])]:text-foreground"
                >
                    <RadioGroupItem value="phone" id="contact-phone" className="sr-only" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium text-sm">Phone</span>
                </Label>
                <Label
                    htmlFor="contact-sms"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-primary/20 bg-popover p-4 hover:bg-primary/10 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/20 [&:has([data-state=checked])]:text-foreground"
                >
                    <RadioGroupItem value="sms" id="contact-sms" className="sr-only" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-medium text-sm">SMS</span>
                </Label>
            </RadioGroup>
        </div>
    ),
};
