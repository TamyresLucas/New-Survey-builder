import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary/50",
        destructive:
          "bg-destructive-background text-foreground border-destructive-border",
        success:
          "bg-success-background text-foreground border-success-border",
        warning:
          "bg-warning-background text-foreground border-warning-border",
        info:
          "bg-info-background text-foreground border-info-border",
        outline: "bg-background text-foreground border-input",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
