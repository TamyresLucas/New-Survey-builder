import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Progress } from './ui/progress';

const meta = {
    title: 'Components/Feedback/Progress',
    component: Progress,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => {
        const [progress, setProgress] = React.useState(13)

        React.useEffect(() => {
            const timer = setTimeout(() => setProgress(66), 500)
            return () => clearTimeout(timer)
        }, [])

        return <Progress value={progress} className="w-[300px]" />
    },
};

// === STATIC VALUES ===

export const StaticValues: Story = {
    render: () => (
        <div className="w-[300px] space-y-4">
            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">0%</span>
                <Progress value={0} />
            </div>
            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">25%</span>
                <Progress value={25} />
            </div>
            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">50%</span>
                <Progress value={50} />
            </div>
            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">75%</span>
                <Progress value={75} />
            </div>
            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">100%</span>
                <Progress value={100} />
            </div>
        </div>
    ),
};

// === WITH LABEL ===

const ProgressWithLabel = () => {
    const [progress, setProgress] = React.useState(45);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 1;
            });
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-[300px] space-y-2">
            <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
        </div>
    );
};

export const WithLabel: Story = {
    render: () => <ProgressWithLabel />,
};

// === INDETERMINATE (loading) ===

export const Indeterminate: Story = {
    render: () => (
        <div className="w-[300px] space-y-2">
            <span className="text-sm text-muted-foreground">Loading...</span>
            <Progress className="animate-pulse" />
        </div>
    ),
};

// === SURVEY PROGRESS (Voxco-specific) ===

const SurveyProgress = () => {
    const totalQuestions = 15;
    const answeredQuestions = 7;
    const progress = Math.round((answeredQuestions / totalQuestions) * 100);

    return (
        <div className="w-[350px] p-4 border rounded-lg space-y-3 bg-card">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Survey Progress</span>
                <span className="text-sm text-muted-foreground">
                    {answeredQuestions} of {totalQuestions} questions
                </span>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
                {progress}% complete • Estimated time remaining: 3 min
            </p>
        </div>
    );
};

export const SurveyProgressBar: Story = {
    render: () => <SurveyProgress />,
};

// === STEP PROGRESS ===

const StepProgress = () => {
    const [currentStep, setCurrentStep] = React.useState(2);
    const totalSteps = 5;
    const steps = ["Details", "Questions", "Logic", "Distribute", "Publish"];

    return (
        <div className="w-[400px] space-y-4">
            <div className="flex justify-between">
                {steps.map((step, index) => (
                    <div
                        key={step}
                        className={`flex flex-col items-center ${index <= currentStep ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${index < currentStep
                                    ? "bg-primary text-primary-foreground"
                                    : index === currentStep
                                        ? "border-2 border-primary"
                                        : "border border-muted-foreground"
                                }`}
                        >
                            {index < currentStep ? "✓" : index + 1}
                        </div>
                        <span className="text-xs mt-1">{step}</span>
                    </div>
                ))}
            </div>
            <Progress value={(currentStep / (totalSteps - 1)) * 100} />
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                    disabled={currentStep === 0}
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                    disabled={currentStep === totalSteps - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export const StepProgressBar: Story = {
    render: () => <StepProgress />,
};

// === RESPONSE GOAL ===

const ResponseGoalProgress = () => {
    const goal = 500;
    const current = 342;
    const progress = (current / goal) * 100;

    return (
        <div className="w-[350px] p-4 border rounded-lg space-y-3 bg-card">
            <div className="flex justify-between items-center">
                <span className="font-medium">Response Goal</span>
                <span className="text-2xl font-bold text-primary">{current}</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(progress)}% of goal</span>
                <span>{goal - current} more needed</span>
            </div>
        </div>
    );
};

export const ResponseGoal: Story = {
    render: () => <ResponseGoalProgress />,
};

// === MULTI-PROGRESS ===

export const MultiProgress: Story = {
    render: () => (
        <div className="w-[350px] space-y-4">
            <h3 className="font-medium">Survey Completion Rates</h3>
            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Customer Satisfaction</span>
                        <span className="text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Employee Engagement</span>
                        <span className="text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Product Feedback</span>
                        <span className="text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Market Research</span>
                        <span className="text-muted-foreground">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                </div>
            </div>
        </div>
    ),
};
