import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';

const meta: Meta<typeof Textarea> = {
    title: 'Components/Form Elements/Textarea',
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    // tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// === DEFAULT ===

export const Default: Story = {
    args: {
        placeholder: 'Type your message here.',
    },
};

// === WITH LABEL ===

export const WithLabel: Story = {
    render: () => (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your message</Label>
            <Textarea placeholder="Type your message here." id="message" />
        </div>
    ),
};

// === WITH BUTTON ===

export const WithButton: Story = {
    render: () => (
        <div className="grid w-full gap-2">
            <Textarea placeholder="Type your message here." />
            <Button>Send message</Button>
        </div>
    ),
};

// === DISABLED ===

export const Disabled: Story = {
    render: () => (
        <Textarea placeholder="This is disabled..." disabled />
    ),
};

// === WITH CHARACTER COUNT ===

const TextareaWithCount = () => {
    const [value, setValue] = React.useState("");
    const maxLength = 280;

    return (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={value}
                onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
                className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground text-right">
                {value.length}/{maxLength} characters
            </p>
        </div>
    );
};

export const WithCharacterCount: Story = {
    render: () => <TextareaWithCount />,
};

// === WITH HELPER TEXT ===

export const WithHelperText: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
                id="description"
                placeholder="Describe your survey..."
                className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
                This will appear as the survey description to respondents.
            </p>
        </div>
    ),
};

// === ERROR STATE ===

export const WithError: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="required" className="text-destructive">
                Required Field
            </Label>
            <Textarea
                id="required"
                placeholder="This field is required..."
                className="border-destructive focus-visible:ring-destructive"
            />
            <p className="text-sm text-destructive">
                This field is required.
            </p>
        </div>
    ),
};

// === DIFFERENT SIZES ===

export const Sizes: Story = {
    render: () => (
        <div className="w-[350px] space-y-4">
            <div className="space-y-2">
                <Label>Small (2 rows)</Label>
                <Textarea placeholder="Small textarea..." rows={2} />
            </div>
            <div className="space-y-2">
                <Label>Medium (4 rows - default)</Label>
                <Textarea placeholder="Medium textarea..." rows={4} />
            </div>
            <div className="space-y-2">
                <Label>Large (8 rows)</Label>
                <Textarea placeholder="Large textarea..." rows={8} />
            </div>
        </div>
    ),
};

// === SURVEY OPEN-ENDED QUESTION (Voxco-specific) ===

const OpenEndedQuestion = () => {
    const [value, setValue] = React.useState("");

    return (
        <div className="w-[400px] p-4 border rounded-lg space-y-4">
            <div>
                <h3 className="font-medium">Q5. Additional Comments</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Please share any additional feedback about your experience.
                </p>
            </div>
            <Textarea
                placeholder="Enter your response here..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="min-h-[120px]"
            />
            <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                    Optional • {value.length} characters
                </p>
                <Button size="sm" variant="outline">
                    Skip Question
                </Button>
            </div>
        </div>
    );
};

export const SurveyOpenEnded: Story = {
    render: () => <OpenEndedQuestion />,
};

// === RESIZABLE ===

export const Resizable: Story = {
    render: () => (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="resizable">Resizable Textarea</Label>
            <Textarea
                id="resizable"
                placeholder="You can resize this textarea..."
                className="resize min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
                Drag the corner to resize.
            </p>
        </div>
    ),
};

// === AUTO-GROWING ===

const AutoGrowTextarea = () => {
    const [value, setValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value]);

    return (
        <div className="w-[350px] space-y-2">
            <Label htmlFor="autogrow">Auto-growing Textarea</Label>
            <Textarea
                ref={textareaRef}
                id="autogrow"
                placeholder="This will grow as you type..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="min-h-[60px] resize-none overflow-hidden"
            />
        </div>
    );
};

export const AutoGrow: Story = {
    render: () => <AutoGrowTextarea />,
};
