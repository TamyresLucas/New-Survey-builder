"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:text-primary/40 disabled:data-[state=on]:bg-[color-mix(in_oklab,hsl(var(--primary)),hsl(var(--background))_90%)] data-[state=on]:bg-[color-mix(in_oklab,hsl(var(--primary)),hsl(var(--background))_90%)] data-[state=on]:text-accent-foreground data-[state=on]:hover:text-primary [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_.material-symbols-rounded]:pointer-events-none [&_.material-symbols-rounded]:text-[1rem] [&_.material-symbols-rounded]:leading-none gap-2",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:text-primary",
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-9 px-2.5 min-w-9",
        lg: "h-11 px-5 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
