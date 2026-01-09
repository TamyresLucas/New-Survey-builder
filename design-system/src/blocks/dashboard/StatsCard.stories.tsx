import type { Meta, StoryObj } from "@storybook/react"
import { StatsCard } from "./StatsCard"

const meta: Meta<typeof StatsCard> = {
    title: "Blocks/Dashboard UI/Stats Cards",
    component: StatsCard,
    parameters: {
        layout: "padded",
    },
    argTypes: {
        trend: {
            control: "object",
            description: "Trend indicator showing change percentage and direction",
        },
    },
}

export default meta
type Story = StoryObj<typeof StatsCard>

// ============================================================================
// Variant 1: Simple with Positive Trend
// ============================================================================

/**
 * Basic stats card showing a value with a positive trend indicator.
 * Ideal for metrics showing growth, like "Total Responses" or "Active Users".
 */
export const SimpleWithPositiveTrend: Story = {
    args: {
        title: "Total Responses",
        value: "122,380",
        trend: { value: 15.1, type: "positive" },
        comparison: "vs. last month 105,922",
    },
}

// ============================================================================
// Variant 2: Simple with Negative Trend
// ============================================================================

/**
 * Stats card showing a negative trend.
 * Use for metrics where a decrease is notable, like "Abandonment Rate".
 */
export const SimpleWithNegativeTrend: Story = {
    args: {
        title: "Abandonment Rate",
        value: "1.9M",
        trend: { value: 2, type: "negative" },
        comparison: "vs. last month 2.0M",
    },
}

// ============================================================================
// Variant 3: Monetary Value
// ============================================================================

/**
 * Stats card for displaying monetary/currency values.
 * Includes currency formatting in the value.
 */
export const MonetaryValue: Story = {
    args: {
        title: "Survey Revenue",
        value: "$98.1M",
        trend: { value: 0.4, type: "positive" },
        comparison: "vs. last month $97.8M",
    },
}

// ============================================================================
// Variant 4: Large Number Counter
// ============================================================================

/**
 * Stats card for large counters/totals.
 * Great for "Active Surveys", "Total Users", etc.
 */
export const LargeNumber: Story = {
    args: {
        title: "Active Surveys",
        value: "48,210",
        trend: { value: 3.7, type: "positive" },
        comparison: "vs. last month 46,480",
    },
}

// ============================================================================
// Variant 5: Neutral Trend
// ============================================================================

/**
 * Stats card showing a neutral/unchanged trend.
 * For metrics that are stable.
 */
export const NeutralTrend: Story = {
    args: {
        title: "Conversion Rate",
        value: "24.5%",
        trend: { value: 0, type: "neutral" },
        comparison: "No change since last month",
    },
}

// ============================================================================
// Variant 6: With List of Items
// ============================================================================

/**
 * Stats card with a list of items showing distribution.
 * Perfect for "Survey Status" or "Category Breakdown".
 */
export const WithList: Story = {
    args: {
        title: "Survey Status",
        items: [
            { label: "Qualified", value: "24%", amount: "$267,800", color: "success" },
            { label: "Proposal", value: "18%", amount: "$192,400", color: "primary" },
            { label: "Negotiation", value: "12%", amount: "$129,600", color: "warning" },
            { label: "Closed Won", value: "8%", amount: "$87,200", color: "secondary" },
        ],
    },
}

// ============================================================================
// Variant 7: With Multiple Metrics
// ============================================================================

/**
 * Stats card with a grid of multiple metrics.
 * Ideal for "Website Analytics" or "Performance Overview".
 */
export const WithMultipleMetrics: Story = {
    args: {
        title: "Website Analytics",
        subtitle: "Total conversion rate: 28.5%",
        metrics: [
            { label: "Direct", value: "432" },
            { label: "Organic", value: "216" },
            { label: "Sessions", value: "29%" },
            { label: "Page Views", value: "2.3K" },
            { label: "Leads", value: "1.6K" },
            { label: "Conversions", value: "8%" },
        ],
    },
}

// ============================================================================
// Variant 8: With Progress Bar
// ============================================================================

/**
 * Stats card with stacked progress bar showing distribution.
 * Great for "Goal Tracking" or "Response Quota".
 */
export const WithProgressBar: Story = {
    args: {
        title: "Response Goal",
        value: "$42.5k",
        subtitle: "+20.1% from last month",
        progress: [
            { label: "Orders", percentage: 62.2, color: "success" },
            { label: "Visits", percentage: 25.5, color: "primary" },
            { label: "Other", percentage: 12.3, color: "secondary" },
        ],
    },
}

// ============================================================================
// Showcase: All Variants in Grid
// ============================================================================

/**
 * Showcase of all StatsCard variants in a responsive grid.
 * Demonstrates how cards look together in a dashboard layout.
 */
export const AllVariations: Story = {
    parameters: {
        layout: "fullscreen",
    },
    render: () => (
        <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold">Dashboard Stats Cards</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <StatsCard
                    title="Total Responses"
                    value="122,380"
                    trend={{ value: 15.1, type: "positive" }}
                    comparison="vs. last month 105,922"
                />
                <StatsCard
                    title="Abandonment Rate"
                    value="1.9M"
                    trend={{ value: 2, type: "negative" }}
                    comparison="vs. last month 2.0M"
                />
                <StatsCard
                    title="Survey Revenue"
                    value="$98.1M"
                    trend={{ value: 0.4, type: "positive" }}
                    comparison="vs. last month $97.8M"
                />
                <StatsCard
                    title="Active Surveys"
                    value="48,210"
                    trend={{ value: 3.7, type: "positive" }}
                    comparison="vs. last month 46,480"
                />
                <StatsCard
                    title="Survey Status"
                    items={[
                        { label: "Qualified", value: "24%", amount: "$267,800", color: "success" },
                        { label: "Proposal", value: "18%", amount: "$192,400", color: "primary" },
                        { label: "Negotiation", value: "12%", amount: "$129,600", color: "warning" },
                    ]}
                />
                <StatsCard
                    title="Website Analytics"
                    subtitle="Total conversion rate: 28.5%"
                    metrics={[
                        { label: "Direct", value: "432" },
                        { label: "Organic", value: "216" },
                        { label: "Sessions", value: "29%" },
                        { label: "Page Views", value: "2.3K" },
                    ]}
                />
                <StatsCard
                    title="Response Goal"
                    value="$42.5k"
                    subtitle="+20.1% from last month"
                    progress={[
                        { label: "Orders", percentage: 62.2, color: "success" },
                        { label: "Visits", percentage: 25.5, color: "primary" },
                    ]}
                />
                <StatsCard
                    title="Conversion Rate"
                    value="24.5%"
                    trend={{ value: 0, type: "neutral" }}
                    comparison="No change since last month"
                />
            </div>
        </div>
    ),
}
