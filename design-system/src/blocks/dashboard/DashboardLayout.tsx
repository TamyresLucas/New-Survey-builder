import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type DashboardLayoutVariant = "left-sidebar" | "right-sidebar" | "full-width"
export type SidebarWidth = "sm" | "md" | "lg"

const layoutVariants = cva("flex h-screen bg-background", {
    variants: {
        variant: {
            "left-sidebar": "flex-row",
            "right-sidebar": "flex-row-reverse",
            "full-width": "flex-col",
        },
    },
    defaultVariants: {
        variant: "left-sidebar",
    },
})

export interface DashboardLayoutProps {
    /** Layout variant */
    variant?: DashboardLayoutVariant
    /** Sidebar content (ignored for full-width) */
    sidebar?: React.ReactNode
    /** Optional header content */
    header?: React.ReactNode
    /** Main content */
    children: React.ReactNode
    /** Sidebar width preset */
    sidebarWidth?: SidebarWidth
    /** Allow sidebar to collapse */
    collapsible?: boolean
    /** Default collapsed state */
    defaultCollapsed?: boolean
    /** Additional CSS classes */
    className?: string
}

export interface DashboardSidebarProps {
    /** Sidebar content */
    children: React.ReactNode
    /** Width preset */
    width?: SidebarWidth
    /** Whether sidebar is collapsed */
    collapsed?: boolean
    /** Callback when collapse state changes */
    onCollapsedChange?: (collapsed: boolean) => void
    /** Show collapse toggle button */
    showCollapseButton?: boolean
    /** Additional CSS classes */
    className?: string
}

export interface DashboardHeaderProps {
    /** Page title */
    title?: string
    /** Breadcrumb or subtitle */
    subtitle?: React.ReactNode
    /** Actions on the right side */
    actions?: React.ReactNode
    /** Toggle button for mobile sidebar */
    onMenuClick?: () => void
    /** Show menu toggle (for mobile) */
    showMenuToggle?: boolean
    /** Additional CSS classes */
    className?: string
}

export interface DashboardContentProps {
    /** Content */
    children: React.ReactNode
    /** Add padding */
    padded?: boolean
    /** Additional CSS classes */
    className?: string
}

// ============================================================================
// Width Constants
// ============================================================================

const SIDEBAR_WIDTHS: Record<SidebarWidth, { expanded: string; collapsed: string }> = {
    sm: { expanded: "w-56", collapsed: "w-16" },   // 224px / 64px
    md: { expanded: "w-64", collapsed: "w-16" },   // 256px / 64px
    lg: { expanded: "w-72", collapsed: "w-20" },   // 288px / 80px
}

// ============================================================================
// DashboardSidebar Component
// ============================================================================

const DashboardSidebar = React.forwardRef<
    HTMLElement,
    DashboardSidebarProps
>(({
    children,
    width = "md",
    collapsed = false,
    onCollapsedChange,
    showCollapseButton = true,
    className,
}, ref) => {
    const widthClasses = SIDEBAR_WIDTHS[width]

    return (
        <aside
            ref={ref}
            role="navigation"
            aria-label="Main navigation"
            className={cn(
                "flex h-full flex-col bg-card transition-all duration-300",
                collapsed ? widthClasses.collapsed : widthClasses.expanded,
                className
            )}
        >
            <ScrollArea className="flex-1">
                <div className={cn("p-4", collapsed && "px-2")}>
                    {children}
                </div>
            </ScrollArea>

            {showCollapseButton && onCollapsedChange && (
                <>
                    <Separator />
                    <div className="p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center"
                            onClick={() => onCollapsedChange(!collapsed)}
                        >
                            {collapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                            {!collapsed && <span className="ml-2">Collapse</span>}
                        </Button>
                    </div>
                </>
            )}
        </aside>
    )
})
DashboardSidebar.displayName = "DashboardSidebar"

// ============================================================================
// DashboardHeader Component
// ============================================================================

const DashboardHeader = React.forwardRef<
    HTMLElement,
    DashboardHeaderProps
>(({
    title,
    subtitle,
    actions,
    onMenuClick,
    showMenuToggle = false,
    className,
}, ref) => {
    return (
        <header
            ref={ref}
            className={cn(
                "flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6",
                className
            )}
        >
            <div className="flex items-center gap-4">
                {showMenuToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                )}
                <div>
                    {title && (
                        <h1 className="text-lg font-semibold">{title}</h1>
                    )}
                    {subtitle && (
                        <div className="text-sm text-muted-foreground">
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    )
})
DashboardHeader.displayName = "DashboardHeader"

// ============================================================================
// DashboardContent Component
// ============================================================================

const DashboardContent = React.forwardRef<
    HTMLElement,
    DashboardContentProps
>(({
    children,
    padded = true,
    className,
}, ref) => {
    return (
        <main
            ref={ref}
            className={cn(
                "flex-1 overflow-auto",
                padded && "p-4 lg:p-6",
                className
            )}
        >
            {children}
        </main>
    )
})
DashboardContent.displayName = "DashboardContent"

// ============================================================================
// DashboardLayout Component
// ============================================================================

/**
 * DashboardLayout - Flexible page layout for dashboard interfaces
 *
 * Variants:
 * - **left-sidebar**: Navigation on left, content on right
 * - **right-sidebar**: Content on left, filters/details on right
 * - **full-width**: No sidebar, content spans full width
 */
const DashboardLayout = React.forwardRef<
    HTMLDivElement,
    DashboardLayoutProps
>(({
    variant = "left-sidebar",
    sidebar,
    header,
    children,
    sidebarWidth = "md",
    collapsible = false,
    defaultCollapsed = false,
    className,
}, ref) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

    const showSidebar = variant !== "full-width" && sidebar
    const sidebarBorderClass = variant === "right-sidebar" ? "border-l border-r-0" : "border-r"

    return (
        <div
            ref={ref}
            className={cn(layoutVariants({ variant }), className)}
        >
            {showSidebar && (
                <DashboardSidebar
                    width={sidebarWidth}
                    collapsed={collapsible ? collapsed : false}
                    onCollapsedChange={collapsible ? setCollapsed : undefined}
                    showCollapseButton={collapsible}
                    className={sidebarBorderClass}
                >
                    {sidebar}
                </DashboardSidebar>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                {header}
                <DashboardContent>{children}</DashboardContent>
            </div>
        </div>
    )
})
DashboardLayout.displayName = "DashboardLayout"

export { DashboardLayout, DashboardSidebar, DashboardHeader, DashboardContent }
export default DashboardLayout
