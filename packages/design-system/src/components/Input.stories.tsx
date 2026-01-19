import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './ui/input';
import { Label } from './ui/label';

const meta = {
    title: 'Components/Form Elements/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'text',
        placeholder: 'Email',
    },
};

export const WithLabel: Story = {
    render: (args) => (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email-2">Email</Label>
            <Input type="email" id="email-2" placeholder="Email" {...args} />
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Disabled input',
    },
};

// === ERROR STATES ===

export const Error: Story = {
    render: () => (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email-error">Email</Label>
            <Input
                type="email"
                id="email-error"
                placeholder="Email"
                className="border-destructive focus-visible:ring-destructive"
                aria-invalid="true"
                defaultValue="invalid-email"
            />
            <p className="text-sm text-destructive">Please enter a valid email address.</p>
        </div>
    ),
};

export const ErrorVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-6 w-full max-w-sm">
            <div className="grid gap-1.5">
                <Label htmlFor="required-error">Required Field</Label>
                <Input
                    id="required-error"
                    placeholder="This field is required"
                    className="border-destructive focus-visible:ring-destructive"
                    aria-invalid="true"
                />
                <p className="text-sm text-destructive">This field is required.</p>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="format-error">Phone Number</Label>
                <Input
                    id="format-error"
                    placeholder="(000) 000-0000"
                    className="border-destructive focus-visible:ring-destructive"
                    aria-invalid="true"
                    defaultValue="123"
                />
                <p className="text-sm text-destructive">Please enter a valid phone number.</p>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="length-error">Username</Label>
                <Input
                    id="length-error"
                    placeholder="At least 3 characters"
                    className="border-destructive focus-visible:ring-destructive"
                    aria-invalid="true"
                    defaultValue="ab"
                />
                <p className="text-sm text-destructive">Username must be at least 3 characters.</p>
            </div>
        </div>
    ),
};

// === WITH ICON ===

export const WithIcon: Story = {
    render: () => (
        <div className="relative w-full max-w-sm">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
                type="search"
                placeholder="Search..."
                className="pl-9"
            />
        </div>
    ),
};

export const WithIconVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-4 w-full max-w-sm">
            {/* Search Input */}
            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                    type="search"
                    placeholder="Search surveys..."
                    className="pl-9"
                />
            </div>

            {/* Email Input */}
            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <Input
                    type="email"
                    placeholder="Email address"
                    className="pl-9"
                />
            </div>

            {/* User Input */}
            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <Input
                    type="text"
                    placeholder="Username"
                    className="pl-9"
                />
            </div>

            {/* Password Input with trailing icon */}
            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <Input
                    type="password"
                    placeholder="Password"
                    className="pl-9 pr-9"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>
        </div>
    ),
};
