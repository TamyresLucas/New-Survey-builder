import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './ui/skeleton';

const meta = {
    title: 'Components/Feedback/Skeleton',
    component: Skeleton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    ),
};

export const CardExample: Story = {
    render: (args) => (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    )
}

// === SURVEY-SPECIFIC LOADING STATES ===

export const SurveyListItem: Story = {
    render: () => (
        <div className="flex items-center gap-4 p-4 border rounded-lg w-full max-w-md">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded" />
        </div>
    ),
};

export const SurveyList: Story = {
    render: () => (
        <div className="space-y-3 w-full max-w-md">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded" />
                </div>
            ))}
        </div>
    ),
};

export const StatsCards: Story = {
    render: () => (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    ),
};

export const TableRows: Story = {
    render: () => (
        <div className="w-full max-w-2xl border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 border-b">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            {/* Rows */}
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-6 rounded ml-auto" />
                </div>
            ))}
        </div>
    ),
};

export const FormFields: Story = {
    render: () => (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-24 w-full rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded" />
        </div>
    ),
};

export const SurveyQuestionCard: Story = {
    render: () => (
        <div className="w-full max-w-lg p-6 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>
        </div>
    ),
};

export const DashboardPage: Story = {
    render: () => (
        <div className="w-full max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32 rounded" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 border rounded-lg space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-muted/50 border-b">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-6 rounded ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    ),
};
