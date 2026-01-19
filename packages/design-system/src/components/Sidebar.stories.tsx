import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    List,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    Plus,
    FileText,
    BarChart,
    PieChart,
    ChevronDown,
    Search,
    Bell,
    PanelLeftClose
} from './ui/icons';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

// Mocking a Sidebar container since it's a layout pattern
const SidebarContainer = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("flex h-[600px] w-[250px] flex-col border-r bg-card text-card-foreground", className)}>
        {children}
    </div>
);

const meta = {
    title: 'Patterns/Sidebar',
    component: SidebarContainer, // This is just a placeholder component for the story
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof SidebarContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

// === SIMPLE SIDEBAR ===

export const Simple: Story = {
    render: () => (
        <SidebarContainer>
            <div className="p-4 flex items-center gap-2 font-bold text-lg">
                <div className="h-6 w-6 rounded bg-primary" />
                <span>Acme Inc.</span>
            </div>
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1">
                    <Button variant="secondary" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <List className="mr-2 h-4 w-4" />
                        Projects
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Team
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics
                    </Button>
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
            </div>
        </SidebarContainer>
    ),
};

// === WITH DIVIDERS & SECTIONS ===

export const WithSections: Story = {
    render: () => (
        <SidebarContainer className="w-[280px]">
            <div className="p-4">
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                    Survey Builder
                </h2>
                <div className="space-y-1">
                    <Button variant="secondary" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        All Surveys
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        New Survey
                    </Button>
                </div>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
                <div className="p-4 pt-4">
                    <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                        Manage
                    </h3>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Respondents
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <BarChart className="mr-2 h-4 w-4" />
                            Results
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <PieChart className="mr-2 h-4 w-4" />
                            Reports
                        </Button>
                    </div>
                </div>
                <div className="p-4 pt-0">
                    <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                        Configuration
                    </h3>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            General Settings
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </SidebarContainer>
    ),
};

// === WITH USER PROFILE ===

export const WithUserProfile: Story = {
    render: () => (
        <SidebarContainer>
            <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        V
                    </div>
                    <span className="font-semibold">Voxco Cloud</span>
                </div>
            </div>
            <ScrollArea className="flex-1 p-2">
                <nav className="grid gap-1">
                    <Button variant="ghost" className="justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Overview
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Documents
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                        <Badge className="ml-auto" variant="secondary">12</Badge>
                    </Button>
                </nav>
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">John Doe</span>
                        <span className="text-xs text-muted-foreground">john@example.com</span>
                    </div>
                </div>
            </div>
        </SidebarContainer>
    ),
};

// === COLLAPSIBLE (Mock) ===

export const CollapsibleMock: Story = {
    render: () => (
        <div className="flex">
            <SidebarContainer className="w-[60px] items-center py-4">
                <div className="h-8 w-8 rounded bg-primary mb-8" />
                <div className="space-y-4 flex flex-col items-center w-full">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <LayoutDashboard className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-accent text-accent-foreground">
                        <List className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Users className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
                <div className="mt-auto flex flex-col items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                </div>
            </SidebarContainer>
            <div className="p-8 bg-background border rounded-r-lg flex-1 h-[600px]">
                <h1 className="text-2xl font-bold">Main Content</h1>
                <p className="text-muted-foreground mt-2">This sidebar is collapsed.</p>
            </div>
        </div>
    ),
};
