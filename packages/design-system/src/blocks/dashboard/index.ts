// Dashboard Blocks
// Composite components for building dashboard interfaces

export { StatsCard } from "./StatsCard"
export type {
    StatsCardProps,
    StatsTrend,
    StatsListItem,
    StatsMetric,
    StatsProgressItem,
    TrendType,
} from "./StatsCard"

export { ConfirmDialog } from "./ConfirmDialog"
export type { ConfirmDialogProps, ConfirmDialogType } from "./ConfirmDialog"

export { FormSection, FormFieldGrid, FormActions, FormFieldWrapper } from "./FormSection"
export type { FormSectionProps, FormFieldGridProps, FormActionsProps, FormFieldWrapperProps } from "./FormSection"

export { WizardForm } from "./WizardForm"
export type { WizardFormProps, WizardStep } from "./WizardForm"

export {
    DashboardLayout,
    DashboardSidebar,
    DashboardHeader,
    DashboardContent,
} from "./DashboardLayout"
export type {
    DashboardLayoutProps,
    DashboardLayoutVariant,
    DashboardSidebarProps,
    DashboardHeaderProps,
    DashboardContentProps,
    SidebarWidth,
} from "./DashboardLayout"

