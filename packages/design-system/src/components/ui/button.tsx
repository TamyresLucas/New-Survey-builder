import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:[&:not([data-loading=true])]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_.material-symbols-rounded]:pointer-events-none [&_.material-symbols-rounded]:text-[1rem] [&_.material-symbols-rounded]:leading-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:[&:not([data-loading=true])]:bg-muted disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:[&:not([data-loading=true])]:bg-muted disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        success: "bg-success text-success-foreground hover:bg-success/90 disabled:[&:not([data-loading=true])]:bg-muted disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:[&:not([data-loading=true])]:bg-background disabled:[&:not([data-loading=true])]:text-disabled-foreground disabled:[&:not([data-loading=true])]:border-muted-foreground/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover disabled:[&:not([data-loading=true])]:bg-transparent disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        "ghost-destructive":
          "text-destructive hover:bg-destructive/10 hover:text-destructive disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        "ghost-success":
          "text-success hover:bg-success/10 hover:text-success disabled:[&:not([data-loading=true])]:text-disabled-foreground",
        link: "text-primary underline-offset-4 hover:underline disabled:[&:not([data-loading=true])]:text-disabled-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        data-loading={isLoading}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
