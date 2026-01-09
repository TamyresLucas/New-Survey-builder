import type { Meta, StoryObj } from "@storybook/react"
import { FormSection, FormFieldGrid, FormActions, FormFieldWrapper } from "./FormSection"
import { Button } from "@/components/ui/button"
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

const meta: Meta<typeof FormSection> = {
    title: "Blocks/Dashboard UI/Form Layouts",
    component: FormSection,
    parameters: {
        layout: "padded",
    },
}

export default meta
type Story = StoryObj<typeof FormSection>

// ============================================================================
// Basic Two-Column Form
// ============================================================================

/**
 * Two-column form layout with responsive grid.
 * Perfect for "Create Survey" or "User Settings" forms.
 */
export const TwoColumnForm: Story = {
    render: () => (
        <div className="max-w-3xl rounded-lg border bg-card p-6">
            <FormSection
                title="Create New Survey"
                description="Fill in the basic information for your survey"
                columns={2}
            >
                <div className="space-y-2">
                    <Label htmlFor="name">Survey Name *</Label>
                    <Input id="name" placeholder="e.g., Customer Satisfaction 2026" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="satisfaction">Satisfaction</SelectItem>
                            <SelectItem value="research">Market Research</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <FormFieldWrapper fullWidth>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the survey objective..."
                            className="min-h-[100px]"
                        />
                    </div>
                </FormFieldWrapper>

                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="target">Response Goal</Label>
                    <Input id="target" type="number" placeholder="e.g., 500" />
                </div>
            </FormSection>

            <FormActions>
                <Button variant="outline">Cancel</Button>
                <Button>Create Survey</Button>
            </FormActions>
        </div>
    ),
}

// ============================================================================
// Multi-Section Form
// ============================================================================

/**
 * Form with multiple sections separated visually.
 * Ideal for longer configuration forms.
 */
export const MultiSectionForm: Story = {
    render: () => (
        <div className="max-w-3xl rounded-lg border bg-card p-6">
            <FormSection
                title="Basic Information"
                description="General survey data"
                columns={2}
            >
                <div className="space-y-2">
                    <Label htmlFor="survey-name">Survey Name</Label>
                    <Input id="survey-name" defaultValue="Customer Satisfaction" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="survey-id">Survey ID</Label>
                    <Input id="survey-id" defaultValue="survey-001" disabled />
                </div>
            </FormSection>

            <FormSection
                title="Distribution Settings"
                description="Define how the survey will be sent"
                showSeparator
                columns={2}
            >
                <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                </div>
                <FormFieldWrapper fullWidth>
                    <div className="flex items-center gap-2">
                        <Checkbox id="anonymous" />
                        <Label htmlFor="anonymous" className="font-normal">
                            Keep responses anonymous
                        </Label>
                    </div>
                </FormFieldWrapper>
            </FormSection>

            <FormSection
                title="Notifications"
                description="Configure email alerts"
                showSeparator
            >
                <div className="flex items-center gap-2">
                    <Checkbox id="notify-complete" defaultChecked />
                    <Label htmlFor="notify-complete" className="font-normal">
                        Notify when goal is reached
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="notify-daily" />
                    <Label htmlFor="notify-daily" className="font-normal">
                        Daily response summary
                    </Label>
                </div>
            </FormSection>

            <FormActions>
                <Button variant="outline">Cancel</Button>
                <Button>Save Settings</Button>
            </FormActions>
        </div>
    ),
}

// ============================================================================
// Settings Form (Single Column)
// ============================================================================

/**
 * Single-column settings form.
 * Good for simpler configuration panels.
 */
export const SettingsForm: Story = {
    render: () => (
        <div className="max-w-xl rounded-lg border bg-card p-6">
            <FormSection
                title="Account Settings"
                description="Manage your preferences"
            >
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="user@voxco.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="america-ny">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="america-ny">America/New_York (GMT-5)</SelectItem>
                            <SelectItem value="america-la">America/Los_Angeles (GMT-8)</SelectItem>
                            <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language-pref">Interface Language</Label>
                    <Select defaultValue="en">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </FormSection>

            <FormActions align="between">
                <Button variant="ghost-destructive">Delete Account</Button>
                <Button>Save</Button>
            </FormActions>
        </div>
    ),
}

// ============================================================================
// FormFieldGrid Examples
// ============================================================================

/**
 * Responsive grid for multiple field columns.
 */
export const FieldGridExample: Story = {
    render: () => (
        <div className="max-w-4xl rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-medium">4 Column Grid (Responsive)</h3>
            <FormFieldGrid columns={4}>
                <div className="space-y-2">
                    <Label htmlFor="field1">Field 1</Label>
                    <Input id="field1" placeholder="Value" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="field2">Field 2</Label>
                    <Input id="field2" placeholder="Value" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="field3">Field 3</Label>
                    <Input id="field3" placeholder="Value" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="field4">Field 4</Label>
                    <Input id="field4" placeholder="Value" />
                </div>
            </FormFieldGrid>
        </div>
    ),
}
