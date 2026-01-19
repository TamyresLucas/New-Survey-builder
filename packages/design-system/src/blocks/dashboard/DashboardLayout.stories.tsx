import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
    DashboardLayout,
    DashboardHeader,
    DashboardSidebar,
    DashboardContent,
} from "./DashboardLayout"
import { StatsCard } from "./StatsCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Home,
    FileText,
    Users,
    Settings,
    BarChart3,
    Bell,
    Search,
    Plus,
    Filter,
    Calendar,
    ChevronDown,
} from "../../components/ui/icons"
import { cn } from "@/lib/utils"

const meta: Meta<typeof DashboardLayout> = {
    title: "Blocks/Dashboard UI/Page Layouts",
    component: DashboardLayout,
    parameters: {
        layout: "fullscreen",
    },
}

export default meta
type Story = StoryObj<typeof DashboardLayout>

// ============================================================================
// Helper Components for Stories
// ============================================================================

function NavItem({
    icon: Icon,
    label,
    active,
    collapsed,
}: {
    icon: React.ElementType
    label: string
    active?: boolean
    collapsed?: boolean
}) {
    return (
        <button
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
        </button>
    )
}

function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
    return (
        <div className="space-y-1">
            <NavItem icon={Home} label="Dashboard" active collapsed={collapsed} />
            <NavItem icon={FileText} label="Surveys" collapsed={collapsed} />
            <NavItem icon={BarChart3} label="Analytics" collapsed={collapsed} />
            <NavItem icon={Users} label="Respondents" collapsed={collapsed} />
            <Separator className="my-4" />
            <NavItem icon={Settings} label="Settings" collapsed={collapsed} />
        </div>
    )
}

function FilterPanel() {
    return (
        <div className="space-y-4">
            <h3 className="font-medium">Filters</h3>
            <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Date Range</label>
                <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 30 days
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Status</label>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="outline">Draft</Badge>
                    <Badge variant="outline">Completed</Badge>
                </div>
            </div>
            <Separator />
            <Button variant="ghost" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
            </Button>
        </div>
    )
}

function DashboardGridContent() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Responses"
                    value="12,380"
                    trend={{ value: 15.1, type: "positive" }}
                    comparison="vs. last month"
                />
                <StatsCard
                    title="Active Surveys"
                    value="24"
                    trend={{ value: 3, type: "positive" }}
                    comparison="vs. last month"
                />
                <StatsCard
                    title="Completion Rate"
                    value="78.5%"
                    trend={{ value: 2.1, type: "positive" }}
                    comparison="vs. last month"
                />
                <StatsCard
                    title="Avg. Response Time"
                    value="4m 32s"
                    trend={{ value: 0.5, type: "negative" }}
                    comparison="vs. last month"
                />
            </div>
            <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-medium">Recent Surveys</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div>
                                <p className="font-medium">Customer Satisfaction Q{i}</p>
                                <p className="text-sm text-muted-foreground">
                                    {100 + i * 50} responses
                                </p>
                            </div>
                            <Badge variant={i === 1 ? "default" : "secondary"}>
                                {i === 1 ? "Active" : "Draft"}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Story: Left Sidebar Layout
// ============================================================================

/**
 * Standard dashboard layout with navigation on the left.
 * Most common pattern for admin dashboards.
 */
export const LeftSidebarLayout: Story = {
    render: () => (
        <DashboardLayout
            variant="left-sidebar"
            sidebar={
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <div className="h-8 w-8 rounded-lg bg-primary" />
                        <span className="font-semibold">Voxco</span>
                    </div>
                    <Separator />
                    <SidebarNav />
                </div>
            }
            header={
                <DashboardHeader
                    title="Dashboard"
                    subtitle="Overview of your surveys"
                    actions={
                        <>
                            <Button variant="ghost" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Survey
                            </Button>
                        </>
                    }
                />
            }
        >
            <DashboardGridContent />
        </DashboardLayout>
    ),
}

// ============================================================================
// Story: Right Sidebar Layout
// ============================================================================

/**
 * Layout with filters/details panel on the right.
 * Useful for dashboards with filter controls or detail views.
 */
export const RightSidebarLayout: Story = {
    render: () => (
        <DashboardLayout
            variant="right-sidebar"
            sidebarWidth="sm"
            sidebar={<FilterPanel />}
            header={
                <DashboardHeader
                    title="Analytics"
                    subtitle="Survey performance metrics"
                    actions={
                        <Button variant="outline">
                            Export Report
                        </Button>
                    }
                />
            }
        >
            <DashboardGridContent />
        </DashboardLayout>
    ),
}

// ============================================================================
// Story: Full Width Layout
// ============================================================================

/**
 * Layout without any sidebar.
 * Good for focused content views or smaller screens.
 */
export const FullWidthLayout: Story = {
    render: () => (
        <DashboardLayout
            variant="full-width"
            header={
                <DashboardHeader
                    title="Survey Builder"
                    subtitle="Create and edit your survey"
                    actions={
                        <>
                            <Button variant="outline">Preview</Button>
                            <Button>Publish</Button>
                        </>
                    }
                />
            }
        >
            <div className="mx-auto max-w-4xl">
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-xl font-semibold">Survey Content</h2>
                    <p className="text-muted-foreground">
                        Full-width layouts are ideal for content-focused pages
                        where you need maximum horizontal space.
                    </p>
                    <div className="mt-6 space-y-4">
                        <div className="rounded-lg border-2 border-dashed p-8 text-center">
                            <p className="text-muted-foreground">
                                Drop questions here or click to add
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    ),
}

// ============================================================================
// Story: Collapsible Sidebar
// ============================================================================

/**
 * Sidebar that can be collapsed to save space.
 * Toggle using the collapse button at the bottom.
 */
export const CollapsibleSidebar: Story = {
    render: function Render() {
        const [collapsed, setCollapsed] = useState(false)

        return (
            <div className="flex h-screen bg-background">
                <DashboardSidebar
                    width="md"
                    collapsed={collapsed}
                    onCollapsedChange={setCollapsed}
                    showCollapseButton
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary" />
                            {!collapsed && <span className="font-semibold">Voxco</span>}
                        </div>
                        <Separator />
                        <SidebarNav collapsed={collapsed} />
                    </div>
                </DashboardSidebar>
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DashboardHeader
                        title="Dashboard"
                        actions={
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Survey
                            </Button>
                        }
                    />
                    <DashboardContent>
                        <DashboardGridContent />
                    </DashboardContent>
                </div>
            </div>
        )
    },
}

// ============================================================================
// Story: Survey Dashboard Example
// ============================================================================

/**
 * Complete Voxco survey dashboard example.
 * Shows a realistic implementation with all components.
 */
export const SurveyDashboardExample: Story = {
    render: () => (
        <DashboardLayout
            variant="left-sidebar"
            collapsible
            sidebar={
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <div className="h-8 w-8 rounded-lg bg-primary" />
                        <span className="font-bold text-lg">Voxco</span>
                    </div>
                    <Separator />
                    <div className="px-2">
                        <Input placeholder="Search..." className="h-8" />
                    </div>
                    <SidebarNav />
                    <Separator />
                    <div className="px-2">
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                            Recent Surveys
                        </p>
                        <div className="space-y-1">
                            {["Customer NPS", "Product Feedback", "Exit Survey"].map(
                                (name) => (
                                    <button
                                        key={name}
                                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        {name}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            }
            header={
                <DashboardHeader
                    title="Survey Dashboard"
                    actions={
                        <>
                            <Button variant="ghost" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-4 w-4" />
                                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Survey
                            </Button>
                        </>
                    }
                />
            }
        >
            <DashboardGridContent />
        </DashboardLayout>
    ),
}
