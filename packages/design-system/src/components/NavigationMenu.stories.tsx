import type { Meta, StoryObj } from '@storybook/react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import React from 'react';
import { cn } from '@/lib/utils';

const meta = {
    title: 'Components/Navigation/NavigationMenu',
    component: NavigationMenu,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
});
ListItem.displayName = "ListItem";

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <a
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                        href="/"
                                    >
                                        <div className="mb-2 mt-4 text-lg font-medium">
                                            Survey Builder
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                            Create beautiful surveys with an intuitive drag-and-drop builder.
                                        </p>
                                    </a>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/docs" title="Introduction">
                                Learn the basics of creating surveys.
                            </ListItem>
                            <ListItem href="/docs/installation" title="Quick Start">
                                Create your first survey in 5 minutes.
                            </ListItem>
                            <ListItem href="/docs/primitives/typography" title="Templates">
                                Pre-built survey templates for common use cases.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Documentation
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
};

// === WITH COMPONENTS ===

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Multiple Choice",
        href: "/docs/questions/multiple-choice",
        description: "Single or multi-select options for respondents.",
    },
    {
        title: "Text Input",
        href: "/docs/questions/text",
        description: "Open-ended text responses, short or long form.",
    },
    {
        title: "Rating Scale",
        href: "/docs/questions/rating",
        description: "Star ratings, NPS scores, and numerical scales.",
    },
    {
        title: "Matrix",
        href: "/docs/questions/matrix",
        description: "Grid of questions for analyzing multiple items.",
    },
    {
        title: "Date & Time",
        href: "/docs/questions/datetime",
        description: "Date pickers and time selection inputs.",
    },
    {
        title: "File Upload",
        href: "/docs/questions/upload",
        description: "Allow respondents to upload files and images.",
    },
];

export const WithComponents: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Question Types</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {components.map((component) => (
                                <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                >
                                    {component.description}
                                </ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
};

// === SIMPLE LINKS ===

export const SimpleLinks: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Home
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Surveys
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Analytics
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Settings
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
};

// === SURVEY PLATFORM NAVIGATION ===

export const SurveyPlatformNavigation: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <NavigationMenuLink asChild>
                                    <a
                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/5 p-6 no-underline outline-none focus:shadow-md"
                                        href="/"
                                    >
                                        <span className="text-3xl mb-2">📊</span>
                                        <div className="mb-2 text-lg font-medium">
                                            Survey Platform
                                        </div>
                                        <p className="text-sm leading-tight text-muted-foreground">
                                            Complete survey solution for enterprises.
                                        </p>
                                    </a>
                                </NavigationMenuLink>
                            </li>
                            <ListItem href="/survey-builder" title="Survey Builder">
                                Intuitive drag-and-drop survey creation.
                            </ListItem>
                            <ListItem href="/analytics" title="Analytics">
                                Real-time insights and reporting.
                            </ListItem>
                            <ListItem href="/distribution" title="Distribution">
                                Multi-channel survey distribution.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                            <ListItem href="/cx" title="Customer Experience">
                                Measure and improve customer satisfaction.
                            </ListItem>
                            <ListItem href="/employee" title="Employee Engagement">
                                Understand and empower your workforce.
                            </ListItem>
                            <ListItem href="/market" title="Market Research">
                                Gather insights for strategic decisions.
                            </ListItem>
                            <ListItem href="/product" title="Product Feedback">
                                Validate ideas and improve products.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Pricing
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Resources
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
};

// === WITH ICONS ===

const IconListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "flex gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        {icon}
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {children}
                        </p>
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    )
});
IconListItem.displayName = "IconListItem";

export const WithIcons: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-2 p-4 md:w-[500px]">
                            <IconListItem
                                href="/logic"
                                title="Skip Logic"
                                icon={<span className="text-lg">↪️</span>}
                            >
                                Create dynamic survey paths based on responses.
                            </IconListItem>
                            <IconListItem
                                href="/piping"
                                title="Answer Piping"
                                icon={<span className="text-lg">🔗</span>}
                            >
                                Personalize questions with previous answers.
                            </IconListItem>
                            <IconListItem
                                href="/randomization"
                                title="Randomization"
                                icon={<span className="text-lg">🔀</span>}
                            >
                                Reduce bias with randomized options.
                            </IconListItem>
                            <IconListItem
                                href="/validation"
                                title="Validation"
                                icon={<span className="text-lg">✅</span>}
                            >
                                Ensure data quality with input validation.
                            </IconListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
};
