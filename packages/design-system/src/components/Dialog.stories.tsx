import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertCircle, Trash2, CreditCard } from './ui/icons';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

const meta = {
    title: 'Components/Overlay/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
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
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};

// === SIMPLE ===

export const Simple: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Simple Dialog</DialogTitle>
                    <DialogDescription>
                        This is a simple dialog with just text content.
                    </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    You can add any content here. Dialogs are great for displaying important information
                    or collecting user input without navigating away from the current page.
                </p>
            </DialogContent>
        </Dialog>
    ),
};

// === CONFIRMATION ===

export const Confirmation: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Delete Account
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete your account? This action cannot be undone
                        and all your data will be permanently removed.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};

// === WITH FORM ===

export const WithForm: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create Survey</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Survey</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new survey.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="survey-name">Survey Name</Label>
                        <Input id="survey-name" placeholder="Customer Satisfaction Survey" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="survey-desc">Description</Label>
                        <Textarea
                            id="survey-desc"
                            placeholder="Describe the purpose of this survey..."
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input id="start-date" type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date">End Date</Label>
                            <Input id="end-date" type="date" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Survey</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};

// === DELETE SURVEY (Voxco-specific) ===

export const DeleteSurvey: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Survey
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-destructive">Delete Survey</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "Customer Satisfaction Q4 2025"?
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-destructive-background border border-destructive-border rounded-md p-3 text-sm">
                    <p className="font-medium text-destructive">This will permanently delete:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• All 15 questions in this survey</li>
                        <li>• 342 collected responses</li>
                        <li>• Survey logic and settings</li>
                    </ul>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive">Delete Permanently</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};

// === SHARE SURVEY (Voxco-specific) ===

const ShareSurveyDialog = () => {
    const [copied, setCopied] = React.useState(false);
    const surveyUrl = "https://survey.voxco.com/s/csat-q4-2025";

    const handleCopy = () => {
        navigator.clipboard.writeText(surveyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Share Survey</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Share Survey</DialogTitle>
                    <DialogDescription>
                        Share this survey link with your respondents.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Input value={surveyUrl} readOnly className="flex-1" />
                        <Button onClick={handleCopy} variant="outline">
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="flex-col h-auto py-3">
                            <svg className="h-5 w-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            Email
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                            <svg className="h-5 w-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            </svg>
                            WhatsApp
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                            <svg className="h-5 w-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
                            </svg>
                            LinkedIn
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const ShareSurvey: Story = {
    render: () => <ShareSurveyDialog />,
};

// === SCROLLABLE CONTENT ===

export const ScrollableContent: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">View Terms</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                    <DialogDescription>
                        Please read the following terms carefully.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[300px] overflow-y-auto pr-4 text-sm text-muted-foreground space-y-4">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                        quis nostrud exercitation ullamco laboris.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                        eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                    </p>
                    <p>
                        Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut
                        perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                        laudantium, totam rem aperiam.
                    </p>
                    <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                        sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                    </p>
                    <p>
                        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
                        adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
                        dolore magnam aliquam quaerat voluptatem.
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Decline</Button>
                    </DialogClose>
                    <Button>Accept</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};

// === PAYMENT METHOD ===

export const PaymentMethod: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Update Payment Method</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Payment Method</DialogTitle>
                    <DialogDescription>
                        Add a new payment method to your account.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border-2 border-primary rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 bg-accent/20">
                            <CreditCard className="h-6 w-6 mb-2 text-primary" />
                            <span className="text-xs font-medium">Card</span>
                        </div>
                        <div className="border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent hover:border-muted-foreground/50">
                            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 mb-2">
                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h4.606a.641.641 0 0 1 .633.74l-3.109 19.696a1.07 1.07 0 0 1-1.052.901zM12.607 0h2.831c1.455 0 2.569 1.127 2.569 2.583 0 1.455-1.114 2.583-2.569 2.583h-2.831V0zm0 6.666h2.831c1.455 0 2.569 1.127 2.569 2.583 0 1.455-1.114 2.583-2.569 2.583h-2.831V6.666zm0 6.667h2.831c1.455 0 2.569 1.127 2.569 2.583 0 1.455-1.114 2.583-2.569 2.583h-2.831v-5.166z" fill="currentColor" />
                            </svg>
                            <span className="text-xs font-medium">Paypal</span>
                        </div>
                        <div className="border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent hover:border-muted-foreground/50">
                            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 mb-2">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.8 19.5v-1.8h-3.6v-1.8H9V12.9h1.2v1.2h4.5v-1.2h1.2v3H13.8v1.8h3.6v1.8h-3.6zM12 4.5c2.475 0 4.5 2.025 4.5 4.5S14.475 13.5 12 13.5 7.5 11.475 7.5 9s2.025-4.5 4.5-4.5z" fill="currentColor" />
                            </svg>
                            <span className="text-xs font-medium">Apple</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name on card</Label>
                        <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Card number</Label>
                        <Input id="number" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="month">Month</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">January</SelectItem>
                                    <SelectItem value="2">February</SelectItem>
                                    <SelectItem value="3">March</SelectItem>
                                    <SelectItem value="4">April</SelectItem>
                                    <SelectItem value="5">May</SelectItem>
                                    <SelectItem value="6">June</SelectItem>
                                    <SelectItem value="7">July</SelectItem>
                                    <SelectItem value="8">August</SelectItem>
                                    <SelectItem value="9">September</SelectItem>
                                    <SelectItem value="10">October</SelectItem>
                                    <SelectItem value="11">November</SelectItem>
                                    <SelectItem value="12">December</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                    <SelectItem value="2027">2027</SelectItem>
                                    <SelectItem value="2028">2028</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="CVC" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full">Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};
