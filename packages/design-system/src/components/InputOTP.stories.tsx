import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from './ui/input-otp';
import { Label } from './ui/label';

const meta: Meta<typeof InputOTP> = {
    title: 'Components/Form Elements/Input OTP',
    component: InputOTP,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT (6 digits with separator) ===

export const Default: Story = {
    render: () => (
        <InputOTP maxLength={6}>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    ),
};

// === 4 DIGITS ===

export const FourDigits: Story = {
    render: () => (
        <InputOTP maxLength={4}>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
            </InputOTPGroup>
        </InputOTP>
    ),
};

// === WITH LABEL ===

export const WithLabel: Story = {
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <InputOTP maxLength={6} id="otp">
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground">
                Enter the code sent to your email.
            </p>
        </div>
    ),
};

// === DISABLED ===

export const Disabled: Story = {
    render: () => (
        <InputOTP maxLength={6} disabled>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    ),
};

// === CONTROLLED ===

const ControlledOTP = () => {
    const [value, setValue] = React.useState("");

    return (
        <div className="space-y-4">
            <InputOTP
                maxLength={6}
                value={value}
                onChange={setValue}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground">
                Value: <code className="bg-muted px-1 rounded">{value || "(empty)"}</code>
            </p>
        </div>
    );
};

export const Controlled: Story = {
    render: () => <ControlledOTP />,
};

// === VERIFICATION FLOW ===

const VerificationFlow = () => {
    const [value, setValue] = React.useState("");
    const [status, setStatus] = React.useState<"idle" | "verifying" | "success" | "error">("idle");

    const handleComplete = (val: string) => {
        setStatus("verifying");
        // Simulate API call
        setTimeout(() => {
            if (val === "123456") {
                setStatus("success");
            } else {
                setStatus("error");
                setValue("");
            }
        }, 1500);
    };

    React.useEffect(() => {
        if (value.length === 6) {
            handleComplete(value);
        }
    }, [value]);

    return (
        <div className="space-y-4 text-center w-full max-w-sm">
            <div>
                <h3 className="text-lg font-medium">Verify your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    We've sent a verification code to your email.
                </p>
            </div>

            <div className="flex justify-center">
                <InputOTP
                    maxLength={6}
                    value={value}
                    onChange={setValue}
                    disabled={status === "verifying" || status === "success"}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {status === "verifying" && (
                <p className="text-sm text-muted-foreground">Verifying...</p>
            )}
            {status === "success" && (
                <p className="text-sm text-green-600">✓ Verified successfully!</p>
            )}
            {status === "error" && (
                <p className="text-sm text-destructive">Invalid code. Please try again.</p>
            )}

            <p className="text-xs text-muted-foreground">
                Hint: Try "123456" for success
            </p>
        </div>
    );
};

export const VerificationFlowDemo: Story = {
    render: () => <VerificationFlow />,
};

// === SURVEY ACCESS CODE ===

export const SurveyAccessCode: Story = {
    render: () => (
        <div className="space-y-4 text-center w-full max-w-sm p-6 border rounded-lg">
            <div>
                <h3 className="text-lg font-medium">Enter Survey Access Code</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter the 6-digit code provided by your administrator.
                </p>
            </div>

            <div className="flex justify-center">
                <InputOTP maxLength={6}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Access Survey
            </button>
        </div>
    ),
};

// === ALPHANUMERIC ===

export const Alphanumeric: Story = {
    render: () => (
        <div className="space-y-2">
            <Label>License Key</Label>
            <InputOTP maxLength={16} inputMode="text">
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={8} />
                    <InputOTPSlot index={9} />
                    <InputOTPSlot index={10} />
                    <InputOTPSlot index={11} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={12} />
                    <InputOTPSlot index={13} />
                    <InputOTPSlot index={14} />
                    <InputOTPSlot index={15} />
                </InputOTPGroup>
            </InputOTP>
        </div>
    ),
};
