import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 grid grid-cols-[auto_1fr] gap-x-3 items-start [&>svg]:shrink-0 [&>svg]:mt-0.5 [&>svg]:row-span-2 [&>.material-symbols-rounded]:shrink-0 [&>.material-symbols-rounded]:mt-0.5 [&>.material-symbols-rounded]:row-span-2",
  {
    variants: {
      variant: {
        default: "bg-info-background text-foreground border-info-border [&>svg]:text-info [&>.material-symbols-rounded]:text-info",
        destructive:
          "bg-destructive-background text-foreground border-destructive-border [&>svg]:text-destructive [&>.material-symbols-rounded]:text-destructive",
        success:
          "bg-success-background text-foreground border-success-border [&>svg]:text-success [&>.material-symbols-rounded]:text-success",
        warning:
          "bg-warning-background text-foreground border-warning-border [&>svg]:text-warning [&>.material-symbols-rounded]:text-warning",
        info:
          "bg-info-background text-foreground border-info-border [&>svg]:text-info [&>.material-symbols-rounded]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
