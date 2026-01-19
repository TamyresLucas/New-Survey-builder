import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
    Terminal,
    AlertCircle,
    CheckCircle2,
    Info as InfoIcon,
    AlertTriangle,
    XCircle,
    Lightbulb,
    Bell
} from './ui/icons';
import { Button } from './ui/button';

const meta = {
    title: 'Components/Feedback/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Alert className="w-[450px]">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                You can add components to your app using the cli.
            </AlertDescription>
        </Alert>
    ),
};

// === DESTRUCTIVE ===

export const Destructive: Story = {
    render: () => (
        <Alert variant="destructive" className="w-[450px]">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Your session has expired. Please log in again.
            </AlertDescription>
        </Alert>
    ),
};

// === SUCCESS ===

export const Success: Story = {
    render: () => (
        <Alert variant="success" className="w-[450px]">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
                Your survey has been published successfully.
            </AlertDescription>
        </Alert>
    ),
};

// === WARNING ===

export const Warning: Story = {
    render: () => (
        <Alert variant="warning" className="w-[450px]">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
                Your survey has unsaved changes. Save before leaving.
            </AlertDescription>
        </Alert>
    ),
};

// === INFO ===

export const Info: Story = {
    render: () => (
        <Alert variant="info" className="w-[450px]">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
                Your subscription will renew on January 15, 2026.
            </AlertDescription>
        </Alert>
    ),
};

// === WITH ACTION ===

export const WithAction: Story = {
    render: () => (
        <Alert className="w-[450px]">
            <Bell className="h-4 w-4" />
            <AlertTitle>New features available</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
                <span>Check out the new survey templates and analytics dashboard.</span>
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost">Learn More</Button>
                    <Button size="sm" variant="ghost">Dismiss</Button>
                </div>
            </AlertDescription>
        </Alert>
    ),
};

// === SURVEY VALIDATION ERROR (Voxco-specific) ===

export const SurveyValidationError: Story = {
    render: () => (
        <Alert variant="destructive" className="w-[450px]">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Survey Validation Failed</AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Question 3 requires at least 2 answer options</li>
                    <li>Skip logic on Question 7 references deleted question</li>
                    <li>Thank you page message is required</li>
                </ul>
            </AlertDescription>
        </Alert>
    ),
};

// === SURVEY TIPS (Voxco-specific) ===

export const SurveyTip: Story = {
    render: () => (
        <Alert className="w-[450px] border-primary/50 bg-primary/5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Pro Tip</AlertTitle>
            <AlertDescription>
                Keep your surveys under 10 questions for a 40% higher completion rate.
                Consider using skip logic to personalize the experience.
            </AlertDescription>
        </Alert>
    ),
};

// === ALL VARIANTS ===

export const AllVariants: Story = {
    render: () => (
        <div className="w-[450px] space-y-4">
            <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>
                    This is the default alert style.
                </AlertDescription>
            </Alert>

            <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success Alert</AlertTitle>
                <AlertDescription>
                    Action completed successfully.
                </AlertDescription>
            </Alert>

            <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning Alert</AlertTitle>
                <AlertDescription>
                    Please review before proceeding.
                </AlertDescription>
            </Alert>

            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Alert</AlertTitle>
                <AlertDescription>
                    Something went wrong.
                </AlertDescription>
            </Alert>
        </div>
    ),
};

// === COMPACT ===

export const Compact: Story = {
    render: () => (
        <Alert className="w-[350px] py-2">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
                Survey saved as draft.
            </AlertDescription>
        </Alert>
    ),
};
