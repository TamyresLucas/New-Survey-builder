import * as React from "react"

import { cn } from "@/lib/utils"

import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-lg border border-primary/20",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm",
        destructive: "border-destructive/40 text-foreground [&>svg]:text-destructive [&>.material-symbols-rounded]:text-destructive bg-[color-mix(in_oklab,hsl(var(--destructive)),hsl(var(--background))_90%)]",
        success: "border-success/40 text-foreground [&>svg]:text-success [&>.material-symbols-rounded]:text-success bg-[color-mix(in_oklab,hsl(var(--success)),hsl(var(--background))_90%)]",
        warning: "border-warning/40 text-foreground [&>svg]:text-warning [&>.material-symbols-rounded]:text-warning bg-[color-mix(in_oklab,hsl(var(--warning)),hsl(var(--background))_90%)]",
        info: "border-primary/40 text-foreground [&>svg]:text-info [&>.material-symbols-rounded]:text-info bg-[color-mix(in_oklab,hsl(var(--info)),hsl(var(--background))_90%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant }), className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
