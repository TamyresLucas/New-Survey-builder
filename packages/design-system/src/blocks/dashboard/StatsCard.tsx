import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "../../components/ui/icons"

// ============================================================================
// Types
// ============================================================================

export type TrendType = "positive" | "negative" | "neutral"

export interface StatsTrend {
    /** The percentage or numeric change value */
    value: number
    /** Indicates the direction of change */
    type: TrendType
}

export type SemanticColor = "primary" | "secondary" | "success" | "warning" | "destructive" | "muted"

const statsColorVariants = cva("", {
    variants: {
        color: {
            primary: "bg-primary",
            secondary: "bg-secondary",
            success: "bg-success",
            warning: "bg-warning",
            destructive: "bg-destructive",
            muted: "bg-muted",
        },
    },
    defaultVariants: {
        color: "primary",
    },
})

export interface StatsListItem {
    /** Label for the item */
    label: string
    /** Value or percentage to display */
    value: string
    /** Optional secondary value (e.g., amount) */
    amount?: string
    /** Optional semantic color for visual distinction */
    color?: SemanticColor
}

export interface StatsMetric {
    /** Label for the metric */
    label: string
    /** Value to display */
    value: string
}

export interface StatsProgressItem {
    /** Label for the progress segment */
    label: string
    /** Percentage value (0-100) */
    percentage: number
    /** Color for the segment */
    color?: SemanticColor
}

export interface StatsCardProps {
    /** Title displayed at the top of the card */
    title: string
    /** Main value to display prominently */
    value?: string | number
    /** Trend indicator showing change */
    trend?: StatsTrend
    /** Comparison text (e.g., "vs last month") */
    comparison?: string
    /** Subtitle or additional description */
    subtitle?: string
    /** List of items with values (for list variant) */
    items?: StatsListItem[]
    /** Grid of metrics (for multi-metric variant) */
    metrics?: StatsMetric[]
    /** Progress segments (for progress bar variant) */
    progress?: StatsProgressItem[]
    /** Additional CSS classes */
    className?: string
}

// ============================================================================
// Helper Components
// ============================================================================

function TrendIndicator({ trend }: { trend: StatsTrend }) {
    const Icon = trend.type === "positive"
        ? TrendingUp
        : trend.type === "negative"
            ? TrendingDown
            : Minus

    const variant = trend.type === "positive"
        ? "success"
        : trend.type === "negative"
            ? "destructive"
            : "secondary"

    const prefix = trend.type === "positive" ? "+" : ""

    const ariaLabel = trend.type === "positive"
        ? `Increase of ${trend.value} percent`
        : trend.type === "negative"
            ? `Decrease of ${trend.value} percent`
            : `No change, ${trend.value} percent`

    return (
        <Badge variant={variant as any} className="gap-1" aria-label={ariaLabel}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span aria-hidden="true">{prefix}{trend.value}%</span>
        </Badge>
    )
}


function MetricsGrid({ metrics }: { metrics: StatsMetric[] }) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {metrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
            ))}
        </div>
    )
}

function ItemsList({ items }: { items: StatsListItem[] }) {
    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {item.color && (
                            <div
                                className={cn(
                                    "h-2 w-2 rounded-full",
                                    statsColorVariants({ color: item.color })
                                )}
                            />
                        )}
                        <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                        {item.amount && (
                            <span className="text-sm font-medium">{item.amount}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function ProgressStack({ segments }: { segments: StatsProgressItem[] }) {
    return (
        <div className="space-y-3">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
                {segments.map((segment, index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-full transition-all",
                            statsColorVariants({ color: segment.color || "primary" })
                        )}
                        style={{ width: `${segment.percentage}%` }}
                    />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                {segments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                        <div
                            className={cn(
                                "h-2 w-2 rounded-full",
                                statsColorVariants({ color: segment.color || "primary" })
                            )}
                        />
                        <span className="text-muted-foreground">{segment.label}</span>
                        <span className="font-medium">{segment.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * StatsCard - A versatile statistics card for dashboards
 * 
 * Supports multiple variants:
 * - Simple with trend indicator
 * - With list of items
 * - With metrics grid
 * - With progress bar
 */
const StatsCard = React.forwardRef<
    HTMLDivElement,
    StatsCardProps
>(({
    title,
    value,
    trend,
    comparison,
    subtitle,
    items,
    metrics,
    progress,
    className,
    ...props
}, ref) => {
    const cardVariant = trend?.type === 'negative' ? 'destructive' :
        trend?.type === 'positive' ? 'success' :
            'default' as any;

    return (
        <Card ref={ref} variant={cardVariant} className={cn("w-full", className)} {...props}>
            <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium">
                    {title}
                </CardDescription>
                {subtitle && (
                    <CardTitle className="text-xs font-normal text-muted-foreground">
                        {subtitle}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Main Value */}
                {value !== undefined && (
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight">{value}</span>
                        {trend && <TrendIndicator trend={trend} />}
                    </div>
                )}

                {/* Comparison Text */}
                {comparison && (
                    <p className="text-xs text-muted-foreground">{comparison}</p>
                )}

                {/* Metrics Grid */}
                {metrics && metrics.length > 0 && <MetricsGrid metrics={metrics} />}

                {/* Items List */}
                {items && items.length > 0 && <ItemsList items={items} />}

                {/* Progress Bar */}
                {progress && progress.length > 0 && <ProgressStack segments={progress} />}
            </CardContent>
        </Card>
    )
})
StatsCard.displayName = "StatsCard"

export { StatsCard }
export default StatsCard
