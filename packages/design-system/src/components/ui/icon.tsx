import { cn } from "@/lib/utils"
import React from "react"

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name: string
    size?: number | string
    fill?: boolean
}

// Helper to extract size from Tailwind classes (h-4, h-5, etc.)
const extractTailwindSize = (className?: string): string | undefined => {
    if (!className) return undefined;
    // Match h-3, h-4, h-5, etc. and convert to rem (Tailwind uses 0.25rem per unit)
    const match = className.match(/\bh-(\d+)\b/);
    if (match) {
        const size = parseInt(match[1], 10);
        return `${size * 0.25}rem`;
    }
    return undefined;
};

// Helper to remove h-X and w-X classes since we handle sizing via font-size
const filterSizeClasses = (className?: string): string | undefined => {
    if (!className) return undefined;
    return className.replace(/\b[hw]-\d+\b/g, '').trim();
};

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
    ({ name, className, size, fill = true, style, ...props }, ref) => {
        const tailwindSize = extractTailwindSize(className);
        const computedSize = size ?? tailwindSize;
        const filteredClassName = filterSizeClasses(className);

        return (
            <span
                ref={ref}
                className={cn("material-symbols-rounded inline-flex items-center justify-center", filteredClassName)}
                style={{
                    fontSize: computedSize ? (typeof computedSize === 'number' ? `${computedSize}px` : computedSize) : undefined,
                    lineHeight: 1,
                    fontVariationSettings: fill === false ? "'FILL' 0" : undefined,
                    ...style
                }}
                {...props}
            >
                {name}
            </span>
        )
    }
)
Icon.displayName = "Icon"

