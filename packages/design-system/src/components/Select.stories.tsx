import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator
} from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    Clock,
    Calendar,
    User,
    CreditCard,
    Globe,
    Laptop,
    Smartphone,
    LayoutGrid,
    List,
    AlignLeft,
    Check
} from './ui/icons';
import { Badge } from './ui/badge';

const meta: Meta<typeof Select> = {
    title: 'Components/Form Elements/Select',
    component: Select,
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
        <Select {...args}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
};

// === DISABLED STATE ===

export const Disabled: Story = {
    render: () => (
        <Select disabled>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
            </SelectContent>
        </Select>
    ),
};

// === WITH ICONS ===

export const WithIcons: Story = {
    render: () => (
        <Select defaultValue="utc">
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Timezone" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Timezones</SelectLabel>
                    <SelectItem value="utc">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span>UTC (Coordinated Universal Time)</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="est">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>EST (Eastern Standard Time)</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="pst">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>PST (Pacific Standard Time)</span>
                        </div>
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
};

// === WITH AVATARS (Team Member Select) ===

export const WithAvatars: Story = {
    render: () => (
        <Select>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Team Members</SelectLabel>
                    <SelectItem value="pedro">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">Pedro Duarte</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="sofia">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src="https://github.com/vercel.png" />
                                <AvatarFallback>VC</AvatarFallback>
                            </Avatar>
                            <span>Sofia Davis</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="isabella">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">IJ</AvatarFallback>
                            </Avatar>
                            <span>Isabella Jones</span>
                        </div>
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
};

// === WITH STATUS INDICATORS ===

export const WithStatus: Story = {
    render: () => (
        <Select defaultValue="online">
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="online">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Online</span>
                    </div>
                </SelectItem>
                <SelectItem value="busy">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span>Busy</span>
                    </div>
                </SelectItem>
                <SelectItem value="away">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span>Away</span>
                    </div>
                </SelectItem>
                <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                        <span>Offline</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    ),
};

// === QUESTION TYPE SELECTOR (Voxco-specific) ===

export const QuestionTypeSelector: Story = {
    render: () => (
        <Select defaultValue="single">
            <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select Question Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Choice Questions</SelectLabel>
                    <SelectItem value="single">
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-primary/10">
                                <AlignLeft className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-medium">Single Choice</span>
                                <span className="text-xs text-muted-foreground">Select one option</span>
                            </div>
                        </div>
                    </SelectItem>
                    <SelectItem value="multiple">
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-primary/10">
                                <List className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-medium">Multiple Choice</span>
                                <span className="text-xs text-muted-foreground">Select multiple options</span>
                            </div>
                        </div>
                    </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                    <SelectLabel>Text Questions</SelectLabel>
                    <SelectItem value="text">
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-orange-500/10">
                                <AlignLeft className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-medium">Short Text</span>
                                <span className="text-xs text-muted-foreground">One line input</span>
                            </div>
                        </div>
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
};

// === DEVICE SELECT (Bundui-ish) ===

export const DeviceSelect: Story = {
    render: () => (
        <Select defaultValue="desktop">
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="desktop">
                    <div className="flex items-center justify-between w-full min-w-[120px]">
                        <div className="flex items-center gap-2">
                            <Laptop className="h-4 w-4" />
                            <span>Desktop</span>
                        </div>
                        <Check className="h-4 w-4 opacity-100" />
                    </div>
                </SelectItem>
                <SelectItem value="mobile">
                    <div className="flex items-center justify-between w-full min-w-[120px]">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Mobile</span>
                        </div>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    ),
};

// === SCROLLABLE ===

export const Scrollable: Story = {
    render: () => (
        <Select>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
                <SelectGroup>
                    <SelectLabel>North America</SelectLabel>
                    <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                    <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                    <SelectItem value="hst">Hawaii-Aleutian Standard Time (HST)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Europe & Africa</SelectLabel>
                    <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="cet">Central European Time (CET)</SelectItem>
                    <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
                    <SelectItem value="west">Western European Summer Time (WEST)</SelectItem>
                    <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
                    <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Asia</SelectLabel>
                    <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
                    <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                    <SelectItem value="cst_china">China Standard Time (CST)</SelectItem>
                    <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
                    <SelectItem value="kst">Korea Standard Time (KST)</SelectItem>
                    <SelectItem value="ist_indonesia">Indonesia Central Standard Time (WITA)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Australia & Pacific</SelectLabel>
                    <SelectItem value="awst">Australian Western Standard Time (AWST)</SelectItem>
                    <SelectItem value="acst">Australian Central Standard Time (ACST)</SelectItem>
                    <SelectItem value="aest">Australian Eastern Standard Time (AEST)</SelectItem>
                    <SelectItem value="nzst">New Zealand Standard Time (NZST)</SelectItem>
                    <SelectItem value="fjt">Fiji Time (FJT)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>South America</SelectLabel>
                    <SelectItem value="art">Argentina Time (ART)</SelectItem>
                    <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
                    <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
                    <SelectItem value="clt">Chile Standard Time (CLT)</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
};
