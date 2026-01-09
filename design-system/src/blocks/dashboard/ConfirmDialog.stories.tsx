import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { ConfirmDialog } from "./ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta: Meta<typeof ConfirmDialog> = {
    title: "Blocks/Dashboard UI/Confirm Dialogs",
    component: ConfirmDialog,
    parameters: {
        layout: "centered",
    },
    argTypes: {
        type: {
            control: "select",
            options: ["destructive", "informational", "default"],
            description: "Type of dialog that determines styling",
        },
        onConfirm: { action: "confirmed" },
        onCancel: { action: "cancelled" },
    },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

// ============================================================================
// Variant 1: Destructive Confirmation
// ============================================================================

/**
 * Destructive dialog for dangerous actions like deleting items.
 * Features a red confirm button and warning icon.
 */
export const Destructive: Story = {
    args: {
        type: "destructive",
        title: "Delete Survey?",
        description:
            "This action cannot be undone. All survey data will be permanently removed.",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
    },
    render: (args) => {
        const [open, setOpen] = useState(false)
        return (
            <ConfirmDialog
                {...args}
                open={open}
                onOpenChange={setOpen}
                trigger={<Button variant="destructive">Delete Survey</Button>}
            />
        )
    },
}

// ============================================================================
// Variant 2: Informational / Success
// ============================================================================

/**
 * Informational dialog for success messages or confirmations.
 * Features a green checkmark icon and single action button.
 */
export const Informational: Story = {
    args: {
        type: "informational",
        title: "Survey Published!",
        description:
            "Your survey has been published successfully and is now available to respondents.",
        confirmLabel: "Continue",
    },
    render: (args) => {
        const [open, setOpen] = useState(false)
        return (
            <ConfirmDialog
                {...args}
                open={open}
                onOpenChange={setOpen}
                trigger={<Button variant="success">Publish Survey</Button>}
            />
        )
    },
}

// ============================================================================
// Variant 3: Form Dialog
// ============================================================================

/**
 * Dialog with form fields for collecting user input.
 * Useful for quick edits or adding new items without navigating away.
 */
export const WithForm: Story = {
    args: {
        type: "default",
        title: "Add Question",
        description: "Fill in the fields below to add a new question.",
        confirmLabel: "Add",
        cancelLabel: "Cancel",
    },
    render: (args) => {
        const [open, setOpen] = useState(false)
        return (
            <ConfirmDialog
                {...args}
                open={open}
                onOpenChange={setOpen}
                trigger={<Button>Add Question</Button>}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question">Question Text</Label>
                        <Input id="question" placeholder="Enter your question..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Question Type</Label>
                        <Input id="type" placeholder="e.g., Multiple Choice" />
                    </div>
                </div>
            </ConfirmDialog>
        )
    },
}

// ============================================================================
// Variant 4: Remove Logic Confirmation
// ============================================================================

/**
 * Specific use case: Confirming removal of survey logic.
 */
export const RemoveLogic: Story = {
    args: {
        type: "destructive",
        title: "Remove Logic?",
        description:
            "The branching logic for this question will be removed. Affected questions will return to the default flow.",
        confirmLabel: "Remove Logic",
        cancelLabel: "Keep",
    },
    render: (args) => {
        const [open, setOpen] = useState(false)
        return (
            <ConfirmDialog
                {...args}
                open={open}
                onOpenChange={setOpen}
                trigger={<Button variant="outline">Remove Logic</Button>}
            />
        )
    },
}

// ============================================================================
// Variant 5: Export Complete
// ============================================================================

/**
 * Specific use case: Export completion confirmation.
 */
export const ExportComplete: Story = {
    args: {
        type: "informational",
        title: "Export Complete!",
        description:
            "Your file has been exported successfully. The download will start automatically.",
        confirmLabel: "OK",
    },
    render: (args) => {
        const [open, setOpen] = useState(false)
        return (
            <ConfirmDialog
                {...args}
                open={open}
                onOpenChange={setOpen}
                trigger={<Button variant="outline">Simulate Export</Button>}
            />
        )
    },
}

// ============================================================================
// Showcase: All Variants
// ============================================================================

/**
 * Showcase of all dialog variants side by side.
 */
export const AllVariants: Story = {
    parameters: {
        layout: "padded",
    },
    render: () => {
        const [destructiveOpen, setDestructiveOpen] = useState(false)
        const [infoOpen, setInfoOpen] = useState(false)
        const [formOpen, setFormOpen] = useState(false)

        return (
            <div className="flex flex-wrap gap-4">
                <ConfirmDialog
                    type="destructive"
                    title="Delete Survey?"
                    description="This action cannot be undone."
                    open={destructiveOpen}
                    onOpenChange={setDestructiveOpen}
                    trigger={<Button variant="destructive">Destructive</Button>}
                />
                <ConfirmDialog
                    type="informational"
                    title="Success!"
                    description="Operation completed successfully."
                    open={infoOpen}
                    onOpenChange={setInfoOpen}
                    trigger={<Button variant="success">Informational</Button>}
                />
                <ConfirmDialog
                    type="default"
                    title="Add Item"
                    description="Fill out the form."
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    trigger={<Button>Form Dialog</Button>}
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Item name" />
                    </div>
                </ConfirmDialog>
            </div>
        )
    },
}
