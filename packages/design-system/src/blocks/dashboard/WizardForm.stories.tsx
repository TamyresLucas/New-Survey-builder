import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { WizardForm, type WizardStep } from "./WizardForm"
import { FormSection } from "./FormSection"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const meta: Meta<typeof WizardForm> = {
    title: "Blocks/Dashboard UI/Wizard Form",
    component: WizardForm,
    parameters: {
        layout: "padded",
    },
}

export default meta
type Story = StoryObj<typeof WizardForm>

// ============================================================================
// Survey Creation Wizard
// ============================================================================

const surveySteps: WizardStep[] = [
    {
        id: "info",
        label: "Information",
        description: "Basic survey data",
    },
    {
        id: "questions",
        label: "Questions",
        description: "Configure the questions",
    },
    {
        id: "distribution",
        label: "Distribution",
        description: "Define delivery channels",
    },
    {
        id: "review",
        label: "Review",
        description: "Confirm the data",
    },
]

/**
 * Full wizard for creating a new survey.
 * Demonstrates step progression and content switching.
 */
export const SurveyCreationWizard: Story = {
    render: function Render() {
        const [currentStep, setCurrentStep] = useState(0)

        const stepContent = [
            // Step 1: Info
            <FormSection key="info" columns={2}>
                <div className="space-y-2">
                    <Label htmlFor="name">Survey Name *</Label>
                    <Input id="name" placeholder="e.g., Customer Satisfaction" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="satisfaction">Satisfaction</SelectItem>
                            <SelectItem value="research">Research</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-full space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the objective..." />
                </div>
            </FormSection>,

            // Step 2: Questions
            <FormSection key="questions">
                <div className="space-y-4">
                    <Label>Initial Question Type</Label>
                    <RadioGroup defaultValue="blank">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="blank" id="blank" />
                            <Label htmlFor="blank" className="font-normal">
                                Start from scratch
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="template" id="template" />
                            <Label htmlFor="template" className="font-normal">
                                Use template
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="import" id="import" />
                            <Label htmlFor="import" className="font-normal">
                                Import questions
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </FormSection>,

            // Step 3: Distribution
            <FormSection key="distribution" columns={2}>
                <div className="space-y-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input id="start" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input id="end" type="date" />
                </div>
                <div className="col-span-full space-y-2">
                    <Label>Distribution Channels</Label>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox id="email" defaultChecked />
                            <Label htmlFor="email" className="font-normal">Email</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="sms" />
                            <Label htmlFor="sms" className="font-normal">SMS</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="link" defaultChecked />
                            <Label htmlFor="link" className="font-normal">Public Link</Label>
                        </div>
                    </div>
                </div>
            </FormSection>,

            // Step 4: Review
            <div key="review" className="space-y-4 rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium">Survey Summary</h4>
                <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Name:</dt>
                        <dd>Customer Satisfaction</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Category:</dt>
                        <dd>Satisfaction</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Distribution:</dt>
                        <dd>Email, Public Link</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Period:</dt>
                        <dd>02/01/2026 - 02/28/2026</dd>
                    </div>
                </dl>
            </div>,
        ]

        const handleNext = () => {
            if (currentStep < surveySteps.length - 1) {
                setCurrentStep((prev) => prev + 1)
            } else {
                alert("Survey created successfully!")
                setCurrentStep(0)
            }
        }

        const handleBack = () => {
            setCurrentStep((prev) => Math.max(0, prev - 1))
        }

        return (
            <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
                <WizardForm
                    steps={surveySteps}
                    currentStep={currentStep}
                    onNext={handleNext}
                    onBack={handleBack}
                    submitLabel="Create Survey"
                >
                    {stepContent[currentStep]}
                </WizardForm>
            </div>
        )
    },
}

// ============================================================================
// Three Step Wizard
// ============================================================================

const threeSteps: WizardStep[] = [
    { id: "step1", label: "Step 1" },
    { id: "step2", label: "Step 2" },
    { id: "step3", label: "Step 3" },
]

/**
 * Simple three-step wizard demonstration.
 */
export const ThreeStepWizard: Story = {
    render: function Render() {
        const [currentStep, setCurrentStep] = useState(0)

        return (
            <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
                <WizardForm
                    steps={threeSteps}
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                >
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">
                            Step {currentStep + 1} Content
                        </p>
                    </div>
                </WizardForm>
            </div>
        )
    },
}

// ============================================================================
// With Loading State
// ============================================================================

/**
 * Wizard with loading state for async operations.
 */
export const WithLoadingState: Story = {
    render: function Render() {
        const [currentStep, setCurrentStep] = useState(0)
        const [isLoading, setIsLoading] = useState(false)

        const handleNext = () => {
            setIsLoading(true)
            setTimeout(() => {
                setIsLoading(false)
                setCurrentStep((prev) => Math.min(threeSteps.length - 1, prev + 1))
            }, 1500)
        }

        return (
            <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
                <WizardForm
                    steps={threeSteps}
                    currentStep={currentStep}
                    onNext={handleNext}
                    onBack={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    isLoading={isLoading}
                >
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">
                            Click "Next" to simulate loading
                        </p>
                    </div>
                </WizardForm>
            </div>
        )
    },
}
