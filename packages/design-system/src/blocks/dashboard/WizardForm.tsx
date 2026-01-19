import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check } from "../../components/ui/icons"

// ============================================================================
// Types
// ============================================================================

export interface WizardStep {
    /** Step identifier */
    id: string
    /** Display label for the step */
    label: string
    /** Optional description */
    description?: string
    /** Whether step validation passed */
    isComplete?: boolean
    /** Whether step has validation errors */
    hasError?: boolean
}

export interface WizardFormProps {
    /** Array of step definitions */
    steps: WizardStep[]
    /** Currently active step index (0-based) */
    currentStep: number
    /** Callback when step changes */
    onStepChange?: (stepIndex: number) => void
    /** Callback when back button is clicked */
    onBack?: () => void
    /** Callback when next/submit button is clicked */
    onNext?: () => void
    /** Label for the back button */
    backLabel?: string
    /** Label for the next button */
    nextLabel?: string
    /** Label for the final submit button */
    submitLabel?: string
    /** Disable navigation */
    isLoading?: boolean
    /** Step content */
    children: React.ReactNode
    /** Additional CSS classes */
    className?: string
}

// ============================================================================
// Step Indicator Component
// ============================================================================

interface StepIndicatorProps {
    step: WizardStep
    index: number
    isActive: boolean
    isCompleted: boolean
    isLast: boolean
}

function StepIndicator({
    step,
    index,
    isActive,
    isCompleted,
    isLast,
}: StepIndicatorProps) {
    return (
        <div
            className="flex items-center"
            aria-current={isActive ? "step" : undefined}
        >
            {/* Step circle */}
            <div className="flex flex-col items-center">
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                        isCompleted && "border-success bg-success text-success-foreground",
                        isActive && !isCompleted && "border-primary bg-primary text-primary-foreground",
                        !isActive && !isCompleted && "border-muted bg-background text-muted-foreground"
                    )}
                    aria-label={isCompleted ? `Step ${index + 1}: ${step.label} - Completed` : `Step ${index + 1}: ${step.label}`}
                >
                    {isCompleted ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        index + 1
                    )}
                </div>
                <span
                    className={cn(
                        "mt-2 text-xs font-medium",
                        isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    {step.label}
                </span>
            </div>

            {/* Connector line */}
            {!isLast && (
                <div
                    className={cn(
                        "mx-2 h-0.5 w-12 sm:w-20 lg:w-32",
                        isCompleted ? "bg-success" : "bg-muted"
                    )}
                    aria-hidden="true"
                />
            )}
        </div>
    )
}

// ============================================================================
// WizardForm Component
// ============================================================================

/**
 * WizardForm - Multi-step form with progress indicator
 *
 * Features:
 * - Visual step indicator with completion status
 * - Previous/Next navigation
 * - Customizable button labels
 * - Loading state support
 */
export function WizardForm({
    steps,
    currentStep,
    onStepChange,
    onBack,
    onNext,
    backLabel = "Previous",
    nextLabel = "Next",
    submitLabel = "Finish",
    isLoading = false,
    children,
    className,
}: WizardFormProps) {
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1

    const handleBack = () => {
        if (!isFirstStep && onBack) {
            onBack()
        } else if (!isFirstStep && onStepChange) {
            onStepChange(currentStep - 1)
        }
    }

    const handleNext = () => {
        if (onNext) {
            onNext()
        } else if (!isLastStep && onStepChange) {
            onStepChange(currentStep + 1)
        }
    }

    return (
        <div className={cn("space-y-8", className)}>
            {/* Step Progress Indicator */}
            <nav aria-label="Progress" className="flex justify-center">
                <ol className="flex items-center">
                    {steps.map((step, index) => (
                        <li key={step.id}>
                            <StepIndicator
                                step={step}
                                index={index}
                                isActive={index === currentStep}
                                isCompleted={index < currentStep || step.isComplete === true}
                                isLast={index === steps.length - 1}
                            />
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Current Step Info */}
            <div className="text-center">
                {/* Screen reader announcement */}
                <span className="sr-only" aria-live="polite">
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
                </span>
                <h2 className="text-xl font-semibold">
                    {steps[currentStep]?.label}
                </h2>
                {steps[currentStep]?.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {steps[currentStep].description}
                    </p>
                )}
            </div>

            {/* Step Content */}
            <div className="min-h-[200px]">{children}</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isFirstStep || isLoading}
                >
                    {backLabel}
                </Button>

                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : isLastStep ? submitLabel : nextLabel}
                </Button>
            </div>
        </div>
    )
}

export default WizardForm
