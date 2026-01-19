import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from './ui/menubar';

const meta = {
    title: 'Components/Overlay/Menubar',
    component: Menubar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        New Window <MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>New Incognito Window</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Share</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>Email link</MenubarItem>
                            <MenubarItem>Messages</MenubarItem>
                            <MenubarItem>Notes</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>
                        Print... <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Find</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>Search the web</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Find...</MenubarItem>
                            <MenubarItem>Find Next</MenubarItem>
                            <MenubarItem>Find Previous</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>Cut</MenubarItem>
                    <MenubarItem>Copy</MenubarItem>
                    <MenubarItem>Paste</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    ),
};

// === WITH VIEW OPTIONS ===

export const WithViewOptions: Story = {
    render: () => {
        const [showBookmarks, setShowBookmarks] = React.useState(true);
        const [showFullUrls, setShowFullUrls] = React.useState(false);

        return (
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                        <MenubarCheckboxItem
                            checked={showBookmarks}
                            onCheckedChange={setShowBookmarks}
                        >
                            Always Show Bookmarks Bar
                        </MenubarCheckboxItem>
                        <MenubarCheckboxItem
                            checked={showFullUrls}
                            onCheckedChange={setShowFullUrls}
                        >
                            Always Show Full URLs
                        </MenubarCheckboxItem>
                        <MenubarSeparator />
                        <MenubarItem>
                            Reload <MenubarShortcut>⌘R</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem disabled>
                            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Toggle Fullscreen</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Hide Sidebar</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        );
    },
};

// === WITH RADIO GROUP ===

export const WithProfiles: Story = {
    render: () => {
        const [profile, setProfile] = React.useState("benoit");

        return (
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>Profiles</MenubarTrigger>
                    <MenubarContent>
                        <MenubarRadioGroup value={profile} onValueChange={setProfile}>
                            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                            <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
                        </MenubarRadioGroup>
                        <MenubarSeparator />
                        <MenubarItem>Edit...</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Add Profile...</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        );
    },
};

// === SURVEY BUILDER MENUBAR (Voxco-specific) ===

export const SurveyBuilderMenubar: Story = {
    render: () => (
        <Menubar className="w-full max-w-2xl">
            <MenubarMenu>
                <MenubarTrigger>Survey</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New Survey <MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Open Survey <MenubarShortcut>⌘O</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Save <MenubarShortcut>⌘S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>Save As...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Export</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>PDF</MenubarItem>
                            <MenubarItem>Word Document</MenubarItem>
                            <MenubarItem>Print Preview</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem>Settings</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>
                        Cut <MenubarShortcut>⌘X</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Copy <MenubarShortcut>⌘C</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>
                        Paste <MenubarShortcut>⌘V</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Select All</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Insert</MenubarTrigger>
                <MenubarContent>
                    <MenubarSub>
                        <MenubarSubTrigger>Question</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>Multiple Choice</MenubarItem>
                            <MenubarItem>Text Input</MenubarItem>
                            <MenubarItem>Rating Scale</MenubarItem>
                            <MenubarItem>Matrix</MenubarItem>
                            <MenubarItem>Date/Time</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarItem>Page Break</MenubarItem>
                    <MenubarItem>Section Header</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Image</MenubarItem>
                    <MenubarItem>Video</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Logic</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Skip Logic</MenubarItem>
                    <MenubarItem>Display Logic</MenubarItem>
                    <MenubarItem>Piping</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Randomization</MenubarItem>
                    <MenubarItem>Quotas</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Preview</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        Desktop Preview <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>Mobile Preview</MenubarItem>
                    <MenubarItem>Tablet Preview</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Test Survey</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    ),
};

// === SIMPLE ===

export const Simple: Story = {
    render: () => (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>New</MenubarItem>
                    <MenubarItem>Open</MenubarItem>
                    <MenubarItem>Save</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Undo</MenubarItem>
                    <MenubarItem>Redo</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Documentation</MenubarItem>
                    <MenubarItem>About</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    ),
};
