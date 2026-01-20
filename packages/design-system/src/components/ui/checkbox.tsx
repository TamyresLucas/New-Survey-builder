"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "./icons"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-current ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:text-primary/40 data-[disabled]:text-primary/40 data-[state=checked]:data-[disabled]:bg-[color-mix(in_oklab,hsl(var(--primary)),hsl(var(--background))_90%)] data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary aria-[invalid=true]:border-destructive/40",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-3.5 w-3.5 text-[0.875rem] leading-none" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
