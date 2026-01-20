import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

// ============================================
// Sidebar Component
// A container shell for sidebar layouts
// ============================================

export interface SidebarProps {
    /** Header content (logo, title, etc.) */
    header?: React.ReactNode
    /** Footer content (settings, user profile, etc.) */
    footer?: React.ReactNode
    /** Main content (usually SidebarMenu) */
    children?: React.ReactNode
    /** Additional class names */
    className?: string
    /** Width of the sidebar */
    width?: number | string
    /** Height of the sidebar */
    height?: number | string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
    (
        {
            header,
            footer,
            children,
            className,
            width = 250,
            height = "100%",
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col border-r border-r-primary/20 bg-card text-card-foreground",
                    className
                )}
                style={{ width, height }}
            >
                {/* Header */}
                {header && (
                    <div className="p-4 border-b border-b-primary/20">{header}</div>
                )}

                {/* Main Content */}
                <ScrollArea className="flex-1">
                    {children}
                </ScrollArea>

                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t border-t-primary/20">{footer}</div>
                )}
            </div>
        )
    }
)

Sidebar.displayName = "Sidebar"

export { Sidebar }
