import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import {
    LayoutDashboard,
    List,
    Users,
    Settings,
    HelpCircle,
    Plus,
    FileText,
    BarChart,
    PieChart,
    Bell,
} from './ui/icons';
import { Badge } from './ui/badge';

// Mocking a Sidebar container since it's a layout pattern
const SidebarContainer = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("flex h-[600px] w-[217px] flex-col border-r border-r-primary/20 bg-card text-card-foreground", className)}>
        {children}
    </div>
);

const meta = {
    title: 'Patterns/Sidebar',
    component: SidebarContainer,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof SidebarContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

// === SIDEBAR NAV ITEM ===
// Reusable vertical navigation item component
const SidebarNavItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
        icon?: React.ReactNode;
        isActive?: boolean;
        badge?: React.ReactNode;
    }
>(({ className, children, icon, isActive, badge, ...props }, ref) => (
    <NavigationMenuLink asChild>
        <a
            ref={ref}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                "hover:bg-primary/10 hover:text-accent-foreground",
                "focus:bg-primary/10 focus:text-accent-foreground focus:outline-none",
                isActive && "bg-primary/10 text-primary",
                className
            )}
            {...props}
        >
            {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
            <span className="flex-1">{children}</span>
            {badge}
        </a>
    </NavigationMenuLink>
));
SidebarNavItem.displayName = "SidebarNavItem";

// === SIMPLE SIDEBAR ===

export const Simple: Story = {
    render: () => (
        <SidebarContainer>
            <div className="p-4 flex items-center gap-2 font-bold text-lg">
                <span>Acme Inc.</span>
            </div>
            <ScrollArea className="flex-1 px-2">
                <NavigationMenu orientation="vertical" className="w-full max-w-none">
                    <NavigationMenuList className="flex-col items-stretch space-x-0 space-y-1">
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<LayoutDashboard className="h-4 w-4" />} isActive>
                                Dashboard
                            </SidebarNavItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<List className="h-4 w-4" />}>
                                Projects
                            </SidebarNavItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<Users className="h-4 w-4" />}>
                                Team
                            </SidebarNavItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<BarChart className="h-4 w-4" />}>
                                Analytics
                            </SidebarNavItem>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </ScrollArea>
            <div className="p-4 border-t border-t-primary/20">
                <NavigationMenu orientation="vertical" className="w-full max-w-none">
                    <NavigationMenuList className="flex-col items-stretch space-x-0">
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<Settings className="h-4 w-4" />}>
                                Settings
                            </SidebarNavItem>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
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
                <NavigationMenu orientation="vertical" className="w-full max-w-none">
                    <NavigationMenuList className="flex-col items-stretch space-x-0 space-y-1">
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<FileText className="h-4 w-4" />} isActive>
                                All Surveys
                            </SidebarNavItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<Plus className="h-4 w-4" />}>
                                New Survey
                            </SidebarNavItem>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <Separator className="bg-primary/20" />
            <ScrollArea className="flex-1">
                <div className="p-4 pt-4">
                    <h3 className="mb-2 px-2 font-semibold leading-none tracking-tight text-muted-foreground">
                        Manage
                    </h3>
                    <NavigationMenu orientation="vertical" className="w-full max-w-none">
                        <NavigationMenuList className="flex-col items-stretch space-x-0 space-y-1">
                            <NavigationMenuItem className="w-full">
                                <SidebarNavItem icon={<Users className="h-4 w-4" />}>
                                    Respondents
                                </SidebarNavItem>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <SidebarNavItem icon={<BarChart className="h-4 w-4" />}>
                                    Results
                                </SidebarNavItem>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="w-full">
                                <SidebarNavItem icon={<PieChart className="h-4 w-4" />}>
                                    Reports
                                </SidebarNavItem>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="p-4 pt-0">
                    <h3 className="mb-2 px-2 font-semibold leading-none tracking-tight text-muted-foreground">
                        Configuration
                    </h3>
                    <NavigationMenu orientation="vertical" className="w-full max-w-none">
                        <NavigationMenuList className="flex-col items-stretch space-x-0 space-y-1">
                            <NavigationMenuItem className="w-full">
                                <SidebarNavItem icon={<Settings className="h-4 w-4" />}>
                                    General Settings
                                </SidebarNavItem>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </ScrollArea>
        </SidebarContainer>
    ),
};

// === WITH USER PROFILE ===

export const WithUserProfile: Story = {
    render: () => (
        <SidebarContainer>
            <div className="p-4 border-b border-b-primary/20">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        V
                    </div>
                    <span className="font-semibold">Voxco Cloud</span>
                </div>
            </div>
            <ScrollArea className="flex-1 p-2">
                <NavigationMenu orientation="vertical" className="w-full max-w-none">
                    <NavigationMenuList className="flex-col items-stretch space-x-0 space-y-1">
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<LayoutDashboard className="h-4 w-4" />}>
                                Overview
                            </SidebarNavItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem icon={<FileText className="h-4 w-4" />}>
                                Documents
                            </SidebarNavItem>
                        </NavigationMenuItem>
                        <NavigationMenuItem className="w-full">
                            <SidebarNavItem
                                icon={<Bell className="h-4 w-4" />}
                                badge={<Badge className="ml-auto" variant="secondary">12</Badge>}
                            >
                                Notifications
                            </SidebarNavItem>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </ScrollArea>
            <div className="p-4 border-t border-t-primary/20">
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
                <NavigationMenu orientation="vertical" className="w-full max-w-none">
                    <NavigationMenuList className="flex-col items-center space-x-0 space-y-4 w-full">
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <LayoutDashboard className="h-5 w-5" />
                                </Button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 bg-accent text-accent-foreground">
                                    <List className="h-5 w-5" />
                                </Button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Users className="h-5 w-5" />
                                </Button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="mt-auto flex flex-col items-center gap-4">
                    <NavigationMenu orientation="vertical">
                        <NavigationMenuList className="flex-col items-center space-x-0 space-y-4">
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <HelpCircle className="h-5 w-5" />
                                    </Button>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                </div>
            </SidebarContainer>
            <div className="p-8 bg-background border border-primary/20 rounded-r-lg flex-1 h-[600px]">
                <h1 className="text-2xl font-bold">Main Content</h1>
                <p className="text-muted-foreground mt-2">This sidebar is collapsed.</p>
            </div>
        </div>
    ),
};
