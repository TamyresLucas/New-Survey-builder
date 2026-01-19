import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const meta = {
    title: 'Components/Navigation/Tabs',
    component: Tabs,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Tabs defaultValue="account" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                            Make changes to your account here. Click save when you're done.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue="Pedro Duarte" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" defaultValue="@peduarte" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Save changes</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                            Change your password here. After saving, you'll be logged out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="current">Current password</Label>
                            <Input id="current" type="password" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="new">New password</Label>
                            <Input id="new" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Save password</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    ),
};

// === SIMPLE ===

export const Simple: Story = {
    render: () => (
        <Tabs defaultValue="overview" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-4">
                <p className="text-sm text-muted-foreground">Overview content goes here.</p>
            </TabsContent>
            <TabsContent value="analytics" className="p-4">
                <p className="text-sm text-muted-foreground">Analytics content goes here.</p>
            </TabsContent>
            <TabsContent value="reports" className="p-4">
                <p className="text-sm text-muted-foreground">Reports content goes here.</p>
            </TabsContent>
            <TabsContent value="notifications" className="p-4">
                <p className="text-sm text-muted-foreground">Notifications content goes here.</p>
            </TabsContent>
        </Tabs>
    ),
};

// === WITH ICONS ===

export const WithIcons: Story = {
    render: () => (
        <Tabs defaultValue="music" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="music" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Music
                </TabsTrigger>
                <TabsTrigger value="podcasts" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Podcasts
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    Live
                </TabsTrigger>
            </TabsList>
            <TabsContent value="music" className="p-4">
                <p className="text-sm text-muted-foreground">Your music library.</p>
            </TabsContent>
            <TabsContent value="podcasts" className="p-4">
                <p className="text-sm text-muted-foreground">Your podcast subscriptions.</p>
            </TabsContent>
            <TabsContent value="live" className="p-4">
                <p className="text-sm text-muted-foreground">Live radio stations.</p>
            </TabsContent>
        </Tabs>
    ),
};

// === WITH BADGE ===

export const WithBadge: Story = {
    render: () => (
        <Tabs defaultValue="all" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center gap-2">
                    Unread
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">12</Badge>
                </TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-4">
                <p className="text-sm text-muted-foreground">All messages.</p>
            </TabsContent>
            <TabsContent value="unread" className="p-4">
                <p className="text-sm text-muted-foreground">12 unread messages.</p>
            </TabsContent>
            <TabsContent value="archived" className="p-4">
                <p className="text-sm text-muted-foreground">Archived messages.</p>
            </TabsContent>
        </Tabs>
    ),
};

// === DISABLED TAB ===

export const DisabledTab: Story = {
    render: () => (
        <Tabs defaultValue="active" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" disabled>Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="p-4">
                <p className="text-sm text-muted-foreground">Active surveys.</p>
            </TabsContent>
            <TabsContent value="draft" className="p-4">
                <p className="text-sm text-muted-foreground">Draft surveys.</p>
            </TabsContent>
        </Tabs>
    ),
};

// === VERTICAL TABS ===

export const VerticalTabs: Story = {
    render: () => (
        <div className="flex gap-4 w-[500px]">
            <Tabs defaultValue="general" orientation="vertical" className="flex gap-4 w-full">
                <TabsList className="flex flex-col h-auto">
                    <TabsTrigger value="general" className="justify-start">General</TabsTrigger>
                    <TabsTrigger value="security" className="justify-start">Security</TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start">Notifications</TabsTrigger>
                    <TabsTrigger value="billing" className="justify-start">Billing</TabsTrigger>
                </TabsList>
                <div className="flex-1">
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Configure general settings here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Configure security settings here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Configure notification settings here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="billing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Manage billing information here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    ),
};

// === SURVEY TABS (Voxco-specific) ===

export const SurveyTabs: Story = {
    render: () => (
        <Tabs defaultValue="build" className="w-[500px]">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="build" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Build
                </TabsTrigger>
                <TabsTrigger value="logic" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Logic
                </TabsTrigger>
                <TabsTrigger value="distribute" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Distribute
                </TabsTrigger>
                <TabsTrigger value="analyze" className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analyze
                </TabsTrigger>
            </TabsList>
            <TabsContent value="build">
                <Card>
                    <CardHeader>
                        <CardTitle>Survey Builder</CardTitle>
                        <CardDescription>
                            Add and configure questions for your survey.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Drag and drop questions to build your survey.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="logic">
                <Card>
                    <CardHeader>
                        <CardTitle>Survey Logic</CardTitle>
                        <CardDescription>
                            Configure skip logic and branching rules.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Set up conditional paths based on responses.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="distribute">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution</CardTitle>
                        <CardDescription>
                            Share your survey with respondents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Choose how to distribute your survey.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="analyze">
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis</CardTitle>
                        <CardDescription>
                            View and analyze survey responses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Explore charts and insights from your data.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    ),
};

// === UNDERLINE STYLE ===

export const UnderlineStyle: Story = {
    render: () => (
        <Tabs defaultValue="profile" className="w-[400px]">
            <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-4 p-0">
                <TabsTrigger
                    value="profile"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
                >
                    Profile
                </TabsTrigger>
                <TabsTrigger
                    value="settings"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
                >
                    Settings
                </TabsTrigger>
                <TabsTrigger
                    value="team"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
                >
                    Team
                </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="pt-4">
                <p className="text-sm text-muted-foreground">Profile content.</p>
            </TabsContent>
            <TabsContent value="settings" className="pt-4">
                <p className="text-sm text-muted-foreground">Settings content.</p>
            </TabsContent>
            <TabsContent value="team" className="pt-4">
                <p className="text-sm text-muted-foreground">Team content.</p>
            </TabsContent>
        </Tabs>
    ),
};
