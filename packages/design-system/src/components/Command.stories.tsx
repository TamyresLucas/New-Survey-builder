import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
    CommandDialog
} from './ui/command';
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Mail,
    Rocket,
    LayoutDashboard,
    Plus,
    FileText,
    Trash,
    Laptop,
    Moon,
    Sun,
    Search
} from "./ui/icons";
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';

const meta: Meta<typeof Command> = {
    title: 'Components/Actions/Command',
    component: Command,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: (args) => (
        <Command className="rounded-lg border shadow-md md:min-w-[450px]" {...args}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                        <Smile className="mr-2 h-4 w-4" />
                        <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem>
                        <Calculator className="mr-2 h-4 w-4" />
                        <span>Calculator</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};

// === GLOBAL SEARCH (Spotlight style) ===

export const GlobalSearch: Story = {
    render: () => {
        const [open, setOpen] = React.useState(false);

        React.useEffect(() => {
            const down = (e: KeyboardEvent) => {
                if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    setOpen((open) => !open);
                }
            };
            document.addEventListener("keydown", down);
            return () => document.removeEventListener("keydown", down);
        }, []);

        return (
            <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">
                    Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd> to open the command menu
                </p>
                <Button variant="outline" onClick={() => setOpen(true)} className="w-[250px] justify-between text-muted-foreground">
                    <span>Search...</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd>
                </Button>

                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            <CommandItem onSelect={() => setOpen(false)}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => setOpen(false)}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Surveys</span>
                            </CommandItem>
                            <CommandItem onSelect={() => setOpen(false)}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span>New Project</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Settings">
                            <CommandItem onSelect={() => setOpen(false)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </CommandItem>
                            <CommandItem onSelect={() => setOpen(false)}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email Settings</span>
                            </CommandItem>
                            <CommandItem onSelect={() => setOpen(false)}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Theme">
                            <CommandItem onSelect={() => setOpen(false)}>
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Light</span>
                            </CommandItem>
                            <CommandItem onSelect={() => setOpen(false)}>
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Dark</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </div>
        );
    },
};

// === WITH SUB-SECTIONS ===

export const WithSubSections: Story = {
    render: () => (
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <CommandInput placeholder="Search documentation..." />
            <CommandList className="h-[300px]">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Getting Started">
                    <CommandItem>
                        <Rocket className="mr-2 h-4 w-4" />
                        <span>Introduction</span>
                    </CommandItem>
                    <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Installation</span>
                    </CommandItem>
                    <CommandItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Project Structure</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Components">
                    <CommandItem>
                        <div className="mr-2 h-4 w-4" />
                        <span>Button</span>
                    </CommandItem>
                    <CommandItem>
                        <div className="mr-2 h-4 w-4" />
                        <span>Card</span>
                    </CommandItem>
                    <CommandItem>
                        <div className="mr-2 h-4 w-4" />
                        <span>Dialog</span>
                    </CommandItem>
                    <CommandItem>
                        <div className="mr-2 h-4 w-4" />
                        <span>Dropdown Menu</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="API Reference">
                    <CommandItem>
                        <div className="mr-2 h-4 w-4" />
                        <span>props</span>
                    </CommandItem>
                    <CommandItem>
                        <div className="mr-2 h-4 w-4" />
                        <span>hooks</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};

// === SURVEY ACTIONS COMMAND ===

export const SurveyActions: Story = {
    render: () => (
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <CommandInput placeholder="Search survey actions..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Edit">
                    <CommandItem>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Add Question</span>
                        <CommandShortcut>⌘J</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Add Page</span>
                        <CommandShortcut>⌘Enter</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Manage">
                    <CommandItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete Survey</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};
