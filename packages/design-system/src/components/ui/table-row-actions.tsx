import * as React from "react"
import { Icon } from "./icon"
import { Button } from "./button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "./dropdown-menu"
import { cn } from "@/lib/utils"

export interface TableRowAction {
    label: string
    onClick: () => void
    icon?: string
    /**
     * Action variant. Use 'destructive' for delete actions.
     */
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    className?: string
    disabled?: boolean
    /**
     * If true, adds a separator before this item in the dropdown
     */
    separatorBefore?: boolean
}

interface TableRowActionsProps {
    actions: TableRowAction[]
    className?: string
}

export function TableRowActions({ actions, className }: TableRowActionsProps) {
    if (!actions || actions.length === 0) return null

    // Single Action: Render a direct button (Ghost variant by default for tables)
    // If the user provided a variant, respect it.
    if (actions.length === 1) {
        const action = actions[0]
        return (
            <Button
                variant={action.variant || "ghost"}
                size="sm"
                className={cn("h-8 data-[state=open]:bg-muted", className, action.className)}
                onClick={(e) => {
                    e.stopPropagation() // Prevent row selection
                    action.onClick()
                }}
                disabled={action.disabled}
            >
                {action.icon && <Icon name={action.icon} className="mr-2 h-4 w-4" />}
                {action.label}
            </Button>
        )
    }

    // Multiple Actions: Render Dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn("flex h-8 w-8 p-0 data-[state=open]:bg-muted", className)}
                    onClick={(e) => e.stopPropagation()} // Prevent row selection
                >
                    <Icon name="more_vert" className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {actions.map((action, i) => (
                    <React.Fragment key={i}>
                        {action.separatorBefore && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                action.onClick()
                            }}
                            disabled={action.disabled}
                            className={action.className}
                            variant={action.variant === "destructive" ? "destructive" : "default"}
                        >
                            {action.icon && <Icon name={action.icon} className="mr-2 h-3.5 w-3.5" />}
                            {action.label}
                        </DropdownMenuItem>
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
