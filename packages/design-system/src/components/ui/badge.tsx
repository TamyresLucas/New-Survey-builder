import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "text-foreground border-primary/40 font-normal",
        destructive: "border-destructive/40 bg-[color-mix(in_oklab,hsl(var(--destructive)),hsl(var(--background))_90%)] text-foreground [&>svg]:text-destructive [&>.material-symbols-rounded]:text-destructive hover:bg-destructive/20 font-normal",
        success: "border-success/40 bg-[color-mix(in_oklab,hsl(var(--success)),hsl(var(--background))_90%)] text-foreground [&>svg]:text-success [&>.material-symbols-rounded]:text-success hover:bg-success/20 font-normal",
        warning: "border-warning/40 bg-[color-mix(in_oklab,hsl(var(--warning)),hsl(var(--background))_90%)] text-foreground [&>svg]:text-warning [&>.material-symbols-rounded]:text-warning hover:bg-warning/20 font-normal",
        secondary: "border-primary/40 bg-[color-mix(in_oklab,hsl(var(--info)),hsl(var(--background))_90%)] text-foreground [&>svg]:text-info [&>.material-symbols-rounded]:text-info hover:bg-info/20 font-normal",
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
