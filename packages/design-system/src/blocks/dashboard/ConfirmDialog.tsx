import * as React from "react"
import { cn } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info } from "../../components/ui/icons"

// ============================================================================
// Types
// ============================================================================

export type ConfirmDialogType = "destructive" | "informational" | "default"

export interface ConfirmDialogProps {
    /** Type of dialog determines styling and icon */
    type?: ConfirmDialogType
    /** Dialog title */
    title: string
    /** Dialog description/message */
    description: string
    /** Label for the confirm/action button */
    confirmLabel?: string
    /** Label for the cancel button */
    cancelLabel?: string
    /** Whether the dialog is open (controlled mode) */
    open?: boolean
    /** Callback when open state changes */
    onOpenChange?: (open: boolean) => void
    /** Callback when confirm is clicked */
    onConfirm?: () => void
    /** Callback when cancel is clicked */
    onCancel?: () => void
    /** Trigger element to open the dialog */
    trigger?: React.ReactNode
    /** Additional content (e.g., form fields) */
    children?: React.ReactNode
    /** Additional CSS classes for the dialog content */
    className?: string
}

// ============================================================================
// Icon Component
// ============================================================================

function DialogIcon({ type }: { type: ConfirmDialogType }) {
    const iconConfig = {
        destructive: {
            Icon: AlertTriangle,
            className: "text-destructive",
            bgClassName: "bg-destructive/10",
        },
        informational: {
            Icon: CheckCircle,
            className: "text-success",
            bgClassName: "bg-success/10",
        },
        default: {
            Icon: Info,
            className: "text-primary",
            bgClassName: "bg-primary/10",
        },
    }

    const config = iconConfig[type]
    const { Icon } = config

    return (
        <div
            className={cn(
                "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
                config.bgClassName
            )}
        >
            <Icon className={cn("h-6 w-6", config.className)} />
        </div>
    )
}

// ============================================================================
// Destructive Dialog (uses AlertDialog for better a11y)
// ============================================================================

function DestructiveDialog({
    title,
    description,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    trigger,
    className,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
            <AlertDialogContent className={cn("sm:max-w-md", className)}>
                <AlertDialogHeader className="sm:text-center">
                    <DialogIcon type="destructive" />
                    <AlertDialogTitle className="mt-4">{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ============================================================================
// Informational Dialog
// ============================================================================

function InformationalDialog({
    title,
    description,
    confirmLabel = "Got it",
    open,
    onOpenChange,
    onConfirm,
    trigger,
    className,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={cn("sm:max-w-md", className)}>
                <DialogHeader className="sm:text-center">
                    <DialogIcon type="informational" />
                    <DialogTitle className="mt-4">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={onConfirm}>{confirmLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ============================================================================
// Form Dialog (with custom content)
// ============================================================================

function FormDialog({
    title,
    description,
    confirmLabel = "Save",
    cancelLabel = "Cancel",
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    trigger,
    children,
    className,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={cn("sm:max-w-md", className)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children && <div className="py-4">{children}</div>}
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button onClick={onConfirm}>{confirmLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ConfirmDialog - Reusable confirmation dialog component
 *
 * Variants:
 * - **destructive**: Red action button with warning icon (for delete actions)
 * - **informational**: Success icon with single action (for success messages)
 * - **default**: Standard dialog with form support
 */
export function ConfirmDialog({
    type = "default",
    children,
    ...props
}: ConfirmDialogProps) {
    if (type === "destructive") {
        return <DestructiveDialog {...props} />
    }

    if (type === "informational") {
        return <InformationalDialog {...props} />
    }

    return <FormDialog {...props}>{children}</FormDialog>
}

export default ConfirmDialog
