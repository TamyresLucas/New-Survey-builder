import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * COMPONENT IMPLEMENTATION
 * 
 * Ideally, this would be in a separate file like `src/components/patterns/SurveySettingsCard.tsx`,
 * but for this demonstration, we are defining it within the story file.
 */

const SurveySettingsCard = () => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <Card className="w-full border-primary/20 bg-card text-card-foreground shadow-sm transition-all duration-200">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold leading-none tracking-tight">
                            Speeding Detection
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Flags responses completed significantly faster than expected.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Visual toggle */}
                    <Switch
                        checked={isOpen}
                        onCheckedChange={setIsOpen}
                        aria-label="Toggle Speeding Detection"
                    />
                </div>
            </CardHeader>

            {isOpen && (
                <CardContent className="border-t border-primary/20 bg-muted/5 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-6">
                        <div className="grid gap-3">
                            <Label htmlFor="setting-name">Setting Name</Label>
                            <Input id="setting-name" placeholder="Enter setting name" />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="setting-type">Setting Type</Label>
                            <Select>
                                <SelectTrigger id="setting-type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="option-1">Option 1</SelectItem>
                                    <SelectItem value="option-2">Option 2</SelectItem>
                                    <SelectItem value="option-3">Option 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Enter description" />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="advanced-mode" className="scale-75 origin-left" />
                            <Label htmlFor="advanced-mode">Enable advanced configuration</Label>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

const meta = {
    title: "Patterns/SettingsCard",
    component: SurveySettingsCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SurveySettingsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
