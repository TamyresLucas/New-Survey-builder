import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis
} from './ui/breadcrumb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronRight, Home, Slash } from './ui/icons';
import { Badge } from "./ui/badge";

const meta = {
    title: 'Components/Navigation/Breadcrumb',
    component: Breadcrumb,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === WITH HOME ICON ===

export const WithHomeIcon: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/surveys">Surveys</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Customer Satisfaction</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === COLLAPSED WITH DROPDOWN ===

export const Collapsed: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1">
                            <BreadcrumbEllipsis className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem>Documentation</DropdownMenuItem>
                            <DropdownMenuItem>Themes</DropdownMenuItem>
                            <DropdownMenuItem>GitHub</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
};

// === CUSTOM SEPARATOR ===

export const CustomSeparator: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <Slash className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <Slash className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Details</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === ARROW SEPARATOR ===

export const ArrowSeparator: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/library">Library</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Data</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === LONG PATH ===

export const LongPath: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">
                        <Home className="h-4 w-4" />
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1">
                            <BreadcrumbEllipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem>Workspace</DropdownMenuItem>
                            <DropdownMenuItem>Projects</DropdownMenuItem>
                            <DropdownMenuItem>Research</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/surveys">Surveys</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/surveys/active">Active</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Customer Satisfaction Q4</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === SURVEY BUILDER PATH (Voxco-specific) ===

export const SurveyBuilderPath: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/surveys">My Surveys</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/surveys/cs-2024">Customer Satisfaction 2024</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Edit</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === ANALYTICS PATH ===

export const AnalyticsPath: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">
                        <Home className="h-4 w-4" />
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/analytics">Analytics</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/analytics/reports">Reports</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Response Trends</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

// === WITH BADGE ===

export const WithBadge: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/surveys">Surveys</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2">
                        Customer Satisfaction
                        <Badge variant="secondary">Draft</Badge>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};
