import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const popularFonts = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Oswald",
    "Raleway",
    "Nunito",
    "Merriweather",
    "Playfair Display",
    "Rubik",
    "Work Sans",
    "Kanit",
    "Fira Sans"
];

/**
 * TypographyStressTest Component
 * 
 * A visual stress test for the dynamic typography system. This component
 * renders complex, text-heavy UI patterns to verify that line-heights,
 * font weights, and font families are correctly applied across all scenarios.
 * 
 * Use this to catch "squashed text" issues when switching fonts.
 */
export const TypographyStressTest = () => {
    const [font, setFont] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('global-font') || 'Inter';
        }
        return 'Inter';
    });

    const handleFontChange = (newFont: string) => {
        setFont(newFont);
        localStorage.setItem('global-font', newFont);

        // ATOMIC UPDATE: Directly set CSS variables
        const fontValue = `"${newFont}", system-ui, sans-serif`;
        document.documentElement.style.setProperty('--font-family-sans', fontValue);
        document.documentElement.style.setProperty('--font-family-heading', fontValue);
        document.documentElement.style.setProperty('--font-family-body', fontValue);
    };

    useEffect(() => {
        const link = document.createElement("link");
        link.id = `font-stress-test-${font}`;
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;
        link.rel = "stylesheet";

        const existing = document.getElementById(`font-stress-test-${font}`);
        if (!existing) {
            document.head.appendChild(link);
        }
    }, [font]);

    return (
        <div className="space-y-8 p-8 bg-background min-h-screen">

            {/* 1. Control Panel */}
            <div className="p-6 border rounded-lg bg-card shadow-sm">
                <h2 className="text-lg font-semibold mb-4 font-heading">1. Stress Test Controls</h2>
                <div className="flex flex-col gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                        Select a Font Family to test dynamic switching
                    </Label>
                    <div className="flex gap-4 items-center">
                        <div className="w-[300px]">
                            <Select onValueChange={handleFontChange} value={font}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {popularFonts.map(f => (
                                        <SelectItem key={f} value={f}>{f}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Current: <strong className="text-foreground">{font}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Critical Component Simulations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Scenario A: Standard Width - Question Card */}
                <div className="space-y-4">
                    <h3 className="text-muted-foreground text-sm font-mono">Scenario A: Standard Width Question Card</h3>
                    <div className="p-6 border rounded-xl shadow-sm bg-card space-y-6">
                        {/* Header Stress */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-primary tracking-wider uppercase">Question 14</span>
                            <h2 className="text-2xl font-bold text-foreground font-heading leading-tight">
                                How likely are you to recommend our comprehensive, AI-driven survey platform to a colleague, friend, or family member who works in the enterprise sector?
                            </h2>
                        </div>

                        {/* Body Stress */}
                        <p className="text-muted-foreground leading-relaxed font-body">
                            Please consider all features including the <strong>dynamic typography system</strong>, <em>vibe coding capabilities</em>, and the automated extensive changelogs. We value your honest feedback to improve our vertical rhythm.
                        </p>

                        {/* List Stress */}
                        <div className="space-y-3">
                            {[
                                "Option 1: This is a fairly long option text that serves to test the line-height of small text when it wraps to a second line.",
                                "Option 2: Another comprehensive option that demonstrates how radio button labels should maintain proper vertical spacing.",
                                "Option 3: A third choice with sufficient length to verify consistent text rendering across different font families."
                            ].map((option, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-primary shrink-0" />
                                    <span className="text-sm font-medium leading-normal font-body">
                                        {option}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Button Row */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button variant="default">Continue</Button>
                            <Button variant="secondary">Skip</Button>
                        </div>
                    </div>
                </div>

                {/* Scenario B: Constrained Width (Mobile Sim) */}
                <div className="space-y-4">
                    <h3 className="text-muted-foreground text-sm font-mono">Scenario B: Mobile Width (320px)</h3>
                    <div className="w-[320px] p-4 border rounded-xl shadow-sm bg-card space-y-4">
                        <span className="text-xs font-bold text-primary tracking-wider uppercase">Question 7</span>
                        <h2 className="text-xl font-bold text-foreground font-heading leading-tight">
                            Short title test with wrapping on mobile
                        </h2>
                        <p className="text-sm text-muted-foreground leading-normal font-body">
                            This column simulates a mobile device. Check if the text feels too cramped or if the line height overrides are working correctly.
                        </p>

                        {/* Form Elements Stress */}
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Your Email Address</Label>
                                <Input placeholder="name@example.com" className="text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Comments (Optional)</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Share your thoughts..."
                                />
                            </div>
                        </div>

                        <Button className="w-full" size="sm">Submit</Button>
                    </div>
                </div>
            </div>

            {/* 3. Nested Typography Stress */}
            <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-mono">Scenario C: Nested Typography (All Heading Levels)</h3>
                <div className="p-6 border rounded-xl shadow-sm bg-card space-y-6 max-w-3xl">
                    <h1 className="text-4xl font-extrabold tracking-tight font-heading">H1: Primary Headline</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed font-body">
                        This is a lead paragraph that introduces the section. It should have comfortable spacing and be easy to read.
                    </p>

                    <h2 className="text-3xl font-semibold tracking-tight font-heading">H2: Section Header</h2>
                    <p className="text-base text-foreground leading-relaxed font-body">
                        Regular body text follows the section header. The transition between heading and body should feel natural, not jarring. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>

                    <h3 className="text-2xl font-semibold tracking-tight font-heading">H3: Subsection Header</h3>
                    <p className="text-base text-foreground leading-relaxed font-body">
                        More body content with <strong>bold text inline</strong> and <em>italic emphasis</em>. The line height should accommodate these variations without overlap.
                    </p>

                    <h4 className="text-xl font-semibold tracking-tight font-heading">H4: Minor Heading</h4>
                    <ul className="list-disc list-inside space-y-2 text-foreground font-body">
                        <li>First bullet point with sufficient text to potentially wrap to a second line on narrower viewports</li>
                        <li>Second item demonstrating consistent spacing</li>
                        <li>Third point to verify list rhythm</li>
                    </ul>

                    <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground leading-relaxed font-body">
                            <strong className="text-foreground">Note:</strong> This is a callout box with smaller text. It tests that text-sm maintains proper line-height even in nested containers with backgrounds.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Utility Text Sizes */}
            <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-mono">Scenario D: All Text Sizes (xs to 4xl)</h3>
                <div className="p-6 border rounded-xl shadow-sm bg-card space-y-4 max-w-3xl">
                    <div className="space-y-3">
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-xs</code>
                            <span className="text-xs font-body">The quick brown fox jumps over the lazy dog. (0.75rem / 12px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-sm</code>
                            <span className="text-sm font-body">The quick brown fox jumps over the lazy dog. (0.875rem / 14px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-base</code>
                            <span className="text-base font-body">The quick brown fox jumps over the lazy dog. (1rem / 16px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-lg</code>
                            <span className="text-lg font-body">The quick brown fox jumps over the lazy dog. (1.125rem / 18px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-xl</code>
                            <span className="text-xl font-body">The quick brown fox jumps over the lazy dog. (1.25rem / 20px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-2xl</code>
                            <span className="text-2xl font-heading">The quick brown fox jumps. (1.5rem / 24px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-3xl</code>
                            <span className="text-3xl font-heading">The quick brown fox. (1.875rem / 30px)</span>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <code className="text-xs font-mono text-muted-foreground w-20">text-4xl</code>
                            <span className="text-4xl font-heading">Quick brown fox. (2.25rem / 36px)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Real Component Stress: Alert, Badge, and Card */}
            <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-mono">Scenario E: Component Integration Test</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                    {/* Alert-like Component */}
                    <div className="p-4 border rounded-lg bg-destructive/10 border-destructive/50 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-destructive">error</span>
                            <h4 className="text-sm font-semibold text-destructive">Error Alert</h4>
                        </div>
                        <p className="text-sm text-destructive/90 leading-relaxed">
                            This alert tests how error states render with the dynamic typography system.
                        </p>
                    </div>

                    {/* Success Alert */}
                    <div className="p-4 border rounded-lg bg-success/10 border-success/50 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-success">check_circle</span>
                            <h4 className="text-sm font-semibold text-success">Success Message</h4>
                        </div>
                        <p className="text-sm text-success/90 leading-relaxed">
                            Your typography tokens have been successfully applied across the system.
                        </p>
                    </div>

                    {/* Info Alert */}
                    <div className="p-4 border rounded-lg bg-info/10 border-info/50 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-info">info</span>
                            <h4 className="text-sm font-semibold text-info">Information</h4>
                        </div>
                        <p className="text-sm text-info/90 leading-relaxed">
                            Switch fonts using the control panel to verify dynamic updates.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};
