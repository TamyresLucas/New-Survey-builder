import type { Meta, StoryObj } from '@storybook/react';
import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";

// Stepper Component
interface StepperProps {
    steps: { title: string; description?: string }[];
    currentStep: number;
    orientation?: 'horizontal' | 'vertical';
}

const Stepper = ({ steps, currentStep, orientation = 'horizontal' }: StepperProps) => {
    if (orientation === 'vertical') {
        return (
            <div className="flex flex-col">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full border font-semibold text-sm leading-none transition-colors",
                                index < currentStep
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : index === currentStep
                                        ? "border-primary text-primary"
                                        : "border-primary/40 text-muted-foreground"
                            )}>
                                {index < currentStep ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={cn(
                                    "w-[1px] h-12 my-2",
                                    index < currentStep ? "bg-primary" : "bg-border"
                                )} />
                            )}
                        </div>
                        <div className="ml-3 pt-2">
                            <p className={cn(
                                "text-sm font-medium",
                                index <= currentStep ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {step.title}
                            </p>
                            {step.description && (
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Horizontal orientation
    return (
        <div className="flex flex-row items-start w-full">
            {steps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center flex-1">
                    {/* Connector Line - Placed behind the circle */}
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "absolute top-5 left-1/2 w-full h-[1px] -z-10",
                                index < currentStep ? "bg-primary" : "bg-border"
                            )}
                        />
                    )}

                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border font-semibold text-sm leading-none transition-colors z-10",
                        index < currentStep
                            ? "bg-primary border-primary text-primary-foreground"
                            : index === currentStep
                                ? "bg-background border-primary text-primary" // Added bg-background
                                : "bg-background border-primary/40 text-muted-foreground" // Added bg-background
                    )}>
                        {index < currentStep ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <span>{index + 1}</span>
                        )}
                    </div>

                    <div className="mt-2 text-center px-2">
                        <p className={cn(
                            "text-sm font-medium",
                            index <= currentStep ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {step.title}
                        </p>
                        {step.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Reusable Plan Selection Cards Component
// This demonstrates reusing the card-style pattern from RadioGroup.CardStyle
interface PlanSelectionCardsProps {
    value: string;
    onValueChange: (value: string) => void;
}

const plans = [
    { value: 'free', label: 'Free', description: 'Best for trying out', price: '$0/mo' },
    { value: 'standard', label: 'Standard', description: 'Perfect for small teams', price: '$29/mo' },
    { value: 'pro', label: 'Pro', description: 'For growing businesses', price: '$99/mo' },
];

const PlanSelectionCards = ({ value, onValueChange }: PlanSelectionCardsProps) => (
    <RadioGroup value={value} onValueChange={onValueChange} className="grid gap-3">
        {plans.map((plan) => (
            <Label
                key={plan.value}
                htmlFor={`plan-${plan.value}`}
                className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-primary/20 [&:has([data-state=checked])]:border-primary"
            >
                <div className="flex items-center gap-3">
                    <RadioGroupItem value={plan.value} id={`plan-${plan.value}`} />
                    <div>
                        <p className="font-medium">{plan.label}</p>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                </div>
                <span className="font-semibold">{plan.price}</span>
            </Label>
        ))}
    </RadioGroup>
);

// Wizard Demo Component
const WizardDemo = () => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        plan: 'standard',
    });

    const steps = [
        { title: "Personal Info", description: "Your details" },
        { title: "Choose Plan", description: "Select a plan" },
        { title: "Confirmation", description: "Review & submit" },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="w-full max-w-2xl space-y-8">
            <Stepper steps={steps} currentStep={currentStep} />

            <div className="min-h-[200px] p-6 border border-primary/20 rounded-lg">
                {currentStep === 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Choose Your Plan</h3>
                        {/* 
                         * Note: This uses the same card-style pattern as RadioGroup.CardStyle
                         * See: Components/RadioGroup/CardStyle for the reusable pattern
                         */}
                        <PlanSelectionCards
                            value={formData.plan}
                            onValueChange={value => setFormData(prev => ({ ...prev, plan: value }))}
                        />
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Confirm Your Details</h3>
                        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{formData.name || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{formData.email || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-medium capitalize">{formData.plan}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                >
                    Back
                </Button>
                <Button onClick={handleNext}>
                    {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

const meta = {
    title: 'Components/Navigation/Stepper',
    component: WizardDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof WizardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <WizardDemo />,
};

export const StepperOnly: Story = {
    render: () => (
        <div className="w-full max-w-2xl space-y-8">
            <div>
                <h4 className="text-sm font-medium mb-4">Step 1 of 4</h4>
                <Stepper
                    steps={[
                        { title: "Details" },
                        { title: "Questions" },
                        { title: "Logic" },
                        { title: "Publish" },
                    ]}
                    currentStep={0}
                />
            </div>
            <div>
                <h4 className="text-sm font-medium mb-4">Step 2 of 4</h4>
                <Stepper
                    steps={[
                        { title: "Details" },
                        { title: "Questions" },
                        { title: "Logic" },
                        { title: "Publish" },
                    ]}
                    currentStep={1}
                />
            </div>
            <div>
                <h4 className="text-sm font-medium mb-4">Step 4 of 4 (Complete)</h4>
                <Stepper
                    steps={[
                        { title: "Details" },
                        { title: "Questions" },
                        { title: "Logic" },
                        { title: "Publish" },
                    ]}
                    currentStep={3}
                />
            </div>
        </div>
    ),
};

export const VerticalStepper: Story = {
    render: () => (
        <div className="w-full max-w-md">
            <Stepper
                steps={[
                    { title: "Create Survey", description: "Set up your survey details" },
                    { title: "Add Questions", description: "Build your questionnaire" },
                    { title: "Configure Logic", description: "Set up skip patterns" },
                    { title: "Review & Publish", description: "Finalize and go live" },
                ]}
                currentStep={1}
                orientation="vertical"
            />
        </div>
    ),
};

export const SurveyWizard: Story = {
    render: () => {
        const [currentStep, setCurrentStep] = React.useState(0);

        const steps = [
            { title: "Survey Info", description: "Basic details" },
            { title: "Questions", description: "Add content" },
            { title: "Distribution", description: "Share survey" },
        ];

        return (
            <div className="w-full max-w-2xl space-y-6">
                <Stepper steps={steps} currentStep={currentStep} />

                <div className="p-6 border border-primary/20 rounded-lg min-h-[150px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                        Step {currentStep + 1}: {steps[currentStep].title}
                    </p>
                </div>

                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost-success">Save Draft</Button>
                        <Button
                            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                        >
                            {currentStep === steps.length - 1 ? 'Publish Survey' : 'Continue'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
};
