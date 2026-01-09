import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// ============================================================================
// Types
// ============================================================================

export interface FormSectionProps {
    /** Title of the form section */
    title?: string
    /** Description or help text for the section */
    description?: string
    /** Whether to show a separator above this section */
    showSeparator?: boolean
    /** Layout mode: single column or two columns */
    columns?: 1 | 2
    /** Form fields/content */
    children: React.ReactNode
    /** Additional CSS classes */
    className?: string
}

export interface FormFieldGridProps {
    /** Number of columns (responsive) */
    columns?: 1 | 2 | 3 | 4
    /** Gap between items */
    gap?: "sm" | "md" | "lg"
    /** Form fields */
    children: React.ReactNode
    /** Additional CSS classes */
    className?: string
}

export interface FormActionsProps {
    /** Alignment of action buttons */
    align?: "left" | "center" | "right" | "between"
    /** Action buttons */
    children: React.ReactNode
    /** Additional CSS classes */
    className?: string
}

// ============================================================================
// FormSection Component
// ============================================================================

/**
 * FormSection - Groups related form fields with optional title and description
 *
 * Features:
 * - Optional section title and description
 * - Two-column layout support (responsive)
 * - Visual separator between sections
 */
export function FormSection({
    title,
    description,
    showSeparator = false,
    columns = 1,
    children,
    className,
}: FormSectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {showSeparator && <Separator className="my-6" />}

            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="text-lg font-medium leading-6">{title}</h3>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            )}

            <div
                className={cn(
                    "grid gap-4",
                    columns === 2 && "md:grid-cols-2"
                )}
            >
                {children}
            </div>
        </div>
    )
}

// ============================================================================
// FormFieldGrid Component
// ============================================================================

/**
 * FormFieldGrid - Responsive grid layout for form fields
 *
 * Use for organizing fields in a grid that adapts to screen size.
 */
export function FormFieldGrid({
    columns = 2,
    gap = "md",
    children,
    className,
}: FormFieldGridProps) {
    const gapClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    }

    const columnClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    }

    return (
        <div
            className={cn(
                "grid",
                gapClasses[gap],
                columnClasses[columns],
                className
            )}
        >
            {children}
        </div>
    )
}

// ============================================================================
// FormActions Component
// ============================================================================

/**
 * FormActions - Container for form action buttons
 *
 * Provides consistent spacing and alignment for Cancel/Submit buttons.
 */
export function FormActions({
    align = "right",
    children,
    className,
}: FormActionsProps) {
    const alignClasses = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between",
    }

    return (
        <div
            className={cn(
                "flex flex-col-reverse gap-2 pt-6 sm:flex-row",
                alignClasses[align],
                className
            )}
        >
            {children}
        </div>
    )
}

// ============================================================================
// FormField Component (wrapper with span support)
// ============================================================================

export interface FormFieldWrapperProps {
    /** Span full width (2 columns) */
    fullWidth?: boolean
    /** Form field content */
    children: React.ReactNode
    /** Additional CSS classes */
    className?: string
}

/**
 * FormFieldWrapper - Wraps a form field with optional column spanning
 */
export function FormFieldWrapper({
    fullWidth = false,
    children,
    className,
}: FormFieldWrapperProps) {
    return (
        <div className={cn(fullWidth && "col-span-full", className)}>
            {children}
        </div>
    )
}

export default FormSection
