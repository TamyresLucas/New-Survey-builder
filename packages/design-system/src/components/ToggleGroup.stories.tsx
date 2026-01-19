import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    ToggleGroup,
    ToggleGroupItem,
} from './ui/toggle-group';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Grid2X2,
    Grid3X3,
    LayoutGrid,
    Sun,
    Moon,
    Monitor,
} from './ui/icons';

const meta: Meta<typeof ToggleGroup> = {
    title: 'Components/Form Elements/ToggleGroup',
    component: ToggleGroup,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT (Multiple Selection) ===

export const Default: Story = {
    render: () => (
        <ToggleGroup type="multiple">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
                <Underline className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    ),
};

// === SINGLE SELECTION ===

export const Single: Story = {
    render: () => (
        <ToggleGroup type="single" defaultValue="center">
            <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="justify" aria-label="Align justify">
                <AlignJustify className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    ),
};

// === WITH LABELS ===

export const WithLabels: Story = {
    render: () => (
        <ToggleGroup type="single" defaultValue="list">
            <ToggleGroupItem value="list" aria-label="List view" className="gap-2">
                <List className="h-4 w-4" />
                <span className="text-sm">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="text-sm">Grid</span>
            </ToggleGroupItem>
        </ToggleGroup>
    ),
};

// === OUTLINE VARIANT ===

export const Outline: Story = {
    render: () => (
        <ToggleGroup type="single" variant="outline" defaultValue="2x2">
            <ToggleGroupItem value="2x2" aria-label="2x2 Grid">
                <Grid2X2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="3x3" aria-label="3x3 Grid">
                <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="full" aria-label="Full Grid">
                <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    ),
};

// === SIZES ===

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <span className="text-sm w-16">Small:</span>
                <ToggleGroup type="multiple" size="sm">
                    <ToggleGroupItem value="bold">
                        <Bold className="h-3 w-3" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic">
                        <Italic className="h-3 w-3" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline">
                        <Underline className="h-3 w-3" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm w-16">Default:</span>
                <ToggleGroup type="multiple" size="default">
                    <ToggleGroupItem value="bold">
                        <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic">
                        <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline">
                        <Underline className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm w-16">Large:</span>
                <ToggleGroup type="multiple" size="lg">
                    <ToggleGroupItem value="bold">
                        <Bold className="h-5 w-5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic">
                        <Italic className="h-5 w-5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline">
                        <Underline className="h-5 w-5" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </div>
    ),
};

// === DISABLED ===

export const Disabled: Story = {
    render: () => (
        <ToggleGroup type="multiple" disabled>
            <ToggleGroupItem value="bold">
                <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic">
                <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline">
                <Underline className="h-4 w-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    ),
};

// === THEME SWITCHER ===

export const ThemeSwitcher: Story = {
    render: () => {
        const [theme, setTheme] = React.useState("system");

        return (
            <div className="space-y-3">
                <ToggleGroup
                    type="single"
                    value={theme}
                    onValueChange={(value) => value && setTheme(value)}
                    className="border rounded-lg p-1"
                >
                    <ToggleGroupItem value="light" className="gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                    </ToggleGroupItem>
                    <ToggleGroupItem value="dark" className="gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                    </ToggleGroupItem>
                    <ToggleGroupItem value="system" className="gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                    </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-sm text-muted-foreground text-center">
                    Current theme: <span className="font-medium">{theme}</span>
                </p>
            </div>
        );
    },
};

// === SURVEY VIEW TOGGLE (Voxco-specific) ===

export const SurveyViewToggle: Story = {
    render: () => {
        const [view, setView] = React.useState("builder");

        return (
            <div className="space-y-3">
                <ToggleGroup
                    type="single"
                    value={view}
                    onValueChange={(value) => value && setView(value)}
                >
                    <ToggleGroupItem value="builder" className="gap-2 px-4">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Builder
                    </ToggleGroupItem>
                    <ToggleGroupItem value="preview" className="gap-2 px-4">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                    </ToggleGroupItem>
                    <ToggleGroupItem value="logic" className="gap-2 px-4">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Logic
                    </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-sm text-muted-foreground text-center">
                    View: <span className="font-medium capitalize">{view}</span>
                </p>
            </div>
        );
    },
};

// === QUESTION TYPE SELECTOR ===

export const QuestionTypeSelector: Story = {
    render: () => {
        const [type, setType] = React.useState("single");

        return (
            <div className="space-y-3">
                <p className="text-sm font-medium">Response Type</p>
                <ToggleGroup
                    type="single"
                    value={type}
                    onValueChange={(value) => value && setType(value)}
                    variant="outline"
                >
                    <ToggleGroupItem value="single" className="flex-col gap-1 h-auto py-2 px-4">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                        </svg>
                        <span className="text-xs">Single</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="multiple" className="flex-col gap-1 h-auto py-2 px-4">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        <span className="text-xs">Multiple</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="text" className="flex-col gap-1 h-auto py-2 px-4">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <span className="text-xs">Text</span>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        );
    },
};
