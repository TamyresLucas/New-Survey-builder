import type { Meta, StoryObj } from '@storybook/react';
import * as React from "react";
import { Button } from "./ui/button";

// Empty State Component
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick?: () => void;
    };
}

const EmptyState = ({ icon, title, description, action, secondaryAction }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
            {icon && (
                <div className="mb-4 text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
            )}
            {(action || secondaryAction) && (
                <div className="flex gap-3">
                    {secondaryAction && (
                        <Button variant="outline" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </Button>
                    )}
                    {action && (
                        <Button onClick={action.onClick}>
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

// Icons
const SurveyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M9 14h6" />
        <path d="M9 18h6" />
    </svg>
);

const ResponsesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

const InboxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
);

const meta = {
    title: 'Components/Feedback/EmptyState',
    component: EmptyState,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "No items found",
        description: "There are no items to display at this time.",
    },
};

export const WithIcon: Story = {
    args: {
        icon: <InboxIcon />,
        title: "Your inbox is empty",
        description: "You don't have any messages yet. Check back later.",
    },
};

export const WithAction: Story = {
    args: {
        icon: <SurveyIcon />,
        title: "No surveys yet",
        description: "Create your first survey to start collecting responses.",
        action: {
            label: "Create Survey",
        },
    },
};

export const NoSurveys: Story = {
    args: {
        icon: <SurveyIcon />,
        title: "No surveys yet",
        description: "Get started by creating your first survey. It only takes a few minutes to set up.",
        action: {
            label: "Create Survey",
        },
        secondaryAction: {
            label: "Import Survey",
        },
    },
};

export const NoResponses: Story = {
    args: {
        icon: <ResponsesIcon />,
        title: "No responses yet",
        description: "Share your survey to start collecting responses. Once you receive responses, they'll appear here.",
        action: {
            label: "Share Survey",
        },
        secondaryAction: {
            label: "Preview Survey",
        },
    },
};

export const NoSearchResults: Story = {
    args: {
        icon: <SearchIcon />,
        title: "No results found",
        description: "We couldn't find any surveys matching your search. Try different keywords or clear your filters.",
        action: {
            label: "Clear Search",
        },
    },
};

export const Error: Story = {
    args: {
        icon: <div className="flex items-center justify-center rounded-full bg-destructive/10 p-4 text-destructive"><ErrorIcon /></div>,
        title: "Something went wrong",
        description: "We couldn't load your data. Please try again or contact support if the problem persists.",
        action: {
            label: "Try Again",
        },
        secondaryAction: {
            label: "Contact Support",
        },
    },
};

export const InCard: Story = {
    render: () => (
        <div className="w-full max-w-2xl border border-primary/20 rounded-lg bg-card">
            <EmptyState
                icon={<ResponsesIcon />}
                title="No responses yet"
                description="This survey hasn't received any responses yet. Share the survey link to start collecting data."
                action={{ label: "Copy Link" }}
            />
        </div>
    ),
};

export const Minimal: Story = {
    render: () => (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
            <p className="text-sm text-muted-foreground">No questions added yet</p>
            <Button variant="link" className="mt-2">Add your first question</Button>
        </div>
    ),
};
