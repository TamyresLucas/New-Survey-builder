import type { Meta, StoryObj } from '@storybook/react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

const meta = {
    title: 'Components/Overlay/Sheet',
    component: Sheet,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT (Right) ===

export const Default: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
};

// === SIDES ===

export const Left: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Left</Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>
                        Access your workspace and settings.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <Button variant="ghost" className="w-full justify-start">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Surveys
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    ),
};

export const Top: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Top</Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[300px]">
                <SheetHeader>
                    <SheetTitle>Search</SheetTitle>
                    <SheetDescription>
                        Search for surveys, questions, or responses.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <Input placeholder="Type to search..." className="w-full" />
                </div>
            </SheetContent>
        </Sheet>
    ),
};

export const Bottom: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Bottom</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px]">
                <SheetHeader>
                    <SheetTitle>Quick Actions</SheetTitle>
                    <SheetDescription>
                        Choose an action to perform.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-4 py-4 max-w-md mx-auto">
                    <Button variant="outline" className="flex flex-col h-20">
                        <span className="text-2xl mb-1">📝</span>
                        <span className="text-xs">New Survey</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20">
                        <span className="text-2xl mb-1">📊</span>
                        <span className="text-xs">Analytics</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-20">
                        <span className="text-2xl mb-1">👥</span>
                        <span className="text-xs">Share</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    ),
};

// === ALL SIDES DEMO ===

export const AllSides: Story = {
    render: () => (
        <div className="flex gap-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Left</Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Left Sheet</SheetTitle>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Right</Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Right Sheet</SheetTitle>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Top</Button>
                </SheetTrigger>
                <SheetContent side="top">
                    <SheetHeader>
                        <SheetTitle>Top Sheet</SheetTitle>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Bottom</Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                    <SheetHeader>
                        <SheetTitle>Bottom Sheet</SheetTitle>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    ),
};

// === SURVEY SETTINGS PANEL (Voxco-specific) ===

export const SurveySettingsPanel: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Survey Settings
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Survey Settings</SheetTitle>
                    <SheetDescription>
                        Configure your survey preferences and distribution options.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">General</h4>
                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="survey-title">Survey Title</Label>
                                <Input id="survey-title" defaultValue="Customer Satisfaction Survey" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" placeholder="Optional description..." />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Responses</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="anonymous">Anonymous responses</Label>
                                <input type="checkbox" id="anonymous" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="multiple">Allow multiple responses</Label>
                                <input type="checkbox" id="multiple" className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Schedule</h4>
                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input id="start-date" type="date" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input id="end-date" type="date" />
                            </div>
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button>Save Settings</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
};

// === QUESTION EDITOR PANEL ===

export const QuestionEditorPanel: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Edit Question</Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Edit Question</SheetTitle>
                    <SheetDescription>
                        Configure question settings and validation.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="grid gap-3">
                        <Label htmlFor="question-text">Question Text</Label>
                        <Input id="question-text" defaultValue="How satisfied are you with our service?" />
                    </div>
                    <div className="grid gap-3">
                        <Label>Question Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start">
                                <span className="mr-2">📝</span> Text
                            </Button>
                            <Button variant="outline" className="justify-start border-primary">
                                <span className="mr-2">☑️</span> Multiple Choice
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <span className="mr-2">⭐</span> Rating
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <span className="mr-2">📊</span> Matrix
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label>Options</Label>
                        <div className="space-y-2">
                            <Input defaultValue="Very Satisfied" />
                            <Input defaultValue="Satisfied" />
                            <Input defaultValue="Neutral" />
                            <Input defaultValue="Dissatisfied" />
                            <Button variant="ghost" size="sm" className="w-full">
                                + Add Option
                            </Button>
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button>Save Question</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
};
