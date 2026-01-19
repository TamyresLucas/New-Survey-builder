import type { Meta, StoryObj } from '@storybook/react';
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

// Stats Card Component
interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

const StatsCard = ({ title, value, description, icon, trend, className }: StatsCardProps) => {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {trend && (
                            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description && <span>{description}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Icons for stats
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
    </svg>
);

const meta = {
    title: 'Components/Data Display/StatsCard',
    component: StatsCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof StatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Total Responses",
        value: "2,350",
        description: "from last month",
    },
};

export const WithIcon: Story = {
    args: {
        title: "Total Responses",
        value: "2,350",
        description: "from last month",
        icon: <UsersIcon />,
    },
};

export const WithTrend: Story = {
    args: {
        title: "Response Rate",
        value: "72.5%",
        trend: { value: 12.5, isPositive: true },
        description: "from last month",
        icon: <ChartIcon />,
    },
};

export const NegativeTrend: Story = {
    args: {
        title: "Bounce Rate",
        value: "24.3%",
        trend: { value: 4.2, isPositive: false },
        description: "from last month",
        icon: <ChartIcon />,
    },
};

export const SurveyDashboard: Story = {
    render: () => (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
            <StatsCard
                title="Total Surveys"
                value="24"
                description="+2 this week"
                icon={<ClipboardIcon />}
            />
            <StatsCard
                title="Total Responses"
                value="12,543"
                trend={{ value: 18.2, isPositive: true }}
                description="from last month"
                icon={<UsersIcon />}
            />
            <StatsCard
                title="Avg. Completion Rate"
                value="87.3%"
                trend={{ value: 5.4, isPositive: true }}
                description="from last month"
                icon={<CheckCircleIcon />}
            />
            <StatsCard
                title="Avg. Response Time"
                value="4m 23s"
                trend={{ value: 8.1, isPositive: false }}
                description="slower than last month"
                icon={<ChartIcon />}
            />
        </div>
    ),
};

export const SurveyResultsOverview: Story = {
    render: () => (
        <div className="w-full max-w-4xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Customer Satisfaction Survey</h2>
                <p className="text-muted-foreground">Results overview for Q4 2025</p>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Responses"
                    value="1,234"
                    trend={{ value: 23, isPositive: true }}
                    description="vs last quarter"
                    icon={<UsersIcon />}
                />
                <StatsCard
                    title="Completion Rate"
                    value="92%"
                    trend={{ value: 4, isPositive: true }}
                    description="vs last quarter"
                    icon={<CheckCircleIcon />}
                />
                <StatsCard
                    title="Avg. Score"
                    value="4.2/5"
                    trend={{ value: 0.3, isPositive: true }}
                    description="vs last quarter"
                    icon={<ChartIcon />}
                />
                <StatsCard
                    title="NPS Score"
                    value="+45"
                    trend={{ value: 12, isPositive: true }}
                    description="vs last quarter"
                    icon={<ChartIcon />}
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Response Distribution</CardTitle>
                    <CardDescription>Breakdown by satisfaction level</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-24 text-sm">Very Satisfied</span>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }} />
                            </div>
                            <span className="w-12 text-sm text-right">45%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-24 text-sm">Satisfied</span>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full" style={{ width: '32%' }} />
                            </div>
                            <span className="w-12 text-sm text-right">32%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-24 text-sm">Neutral</span>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '15%' }} />
                            </div>
                            <span className="w-12 text-sm text-right">15%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-24 text-sm">Dissatisfied</span>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: '8%' }} />
                            </div>
                            <span className="w-12 text-sm text-right">8%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    ),
};

export const CompactStats: Story = {
    render: () => (
        <div className="flex gap-6 w-full max-w-2xl">
            <div className="text-center">
                <div className="text-3xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Active Surveys</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
                <div className="text-3xl font-bold text-primary">12.5k</div>
                <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
                <div className="text-3xl font-bold text-green-600">87%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.2</div>
                <div className="text-sm text-muted-foreground">Avg. Rating</div>
            </div>
        </div>
    ),
};
