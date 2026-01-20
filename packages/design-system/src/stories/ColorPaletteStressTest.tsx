/**
 * Color Palette Stress Test Component
 * 
 * Tests the design system's color token structure under extreme palette configurations.
 * Validates that shadcn CSS variables maintain proper contrast and visual stability
 * when dynamically overridden with custom colors.
 */

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ColorPicker } from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    getComputedColorRGB,
    calculateContrastRatio,
    checkWCAGCompliance,
    parseRGB,
} from '@/lib/color-utils';

// =============================================================================
// Types
// =============================================================================

interface PaletteConfig {
    primary: string;
    background: string;
    foreground: string;
    secondary: string;
    muted: string;
    accent: string;
    destructive: string;
    success: string;
    warning: string;
}

interface ContrastResult {
    ratio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
}

// =============================================================================
// Preset Palettes (Extreme Test Cases)
// =============================================================================

export const PRESET_PALETTES: Record<string, PaletteConfig> = {
    default: {
        primary: '#0066FF',
        background: '#FFFFFF',
        foreground: '#0A0A0A',
        secondary: '#F5F5F5',
        muted: '#F5F5F5',
        accent: '#F5F5F5',
        destructive: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
    },
    nearWhitePrimary: {
        primary: '#FAFAFA', // Near-white - will break contrast with white bg
        background: '#FFFFFF',
        foreground: '#0A0A0A',
        secondary: '#F0F0F0',
        muted: '#F5F5F5',
        accent: '#EEEEEE',
        destructive: '#FEE2E2',
        success: '#DCFCE7',
        warning: '#FEF3C7',
    },
    nearBlackPrimary: {
        primary: '#0A0A0A', // Near-black
        background: '#0F0F0F', // Also near-black - will break contrast
        foreground: '#FAFAFA',
        secondary: '#1A1A1A',
        muted: '#262626',
        accent: '#1F1F1F',
        destructive: '#7F1D1D',
        success: '#14532D',
        warning: '#78350F',
    },
    neonOnLight: {
        primary: '#00FF00', // Neon green - poor readability
        background: '#FFFFFF',
        foreground: '#000000',
        secondary: '#CCFFCC',
        muted: '#E6FFE6',
        accent: '#99FF99',
        destructive: '#FF0000',
        success: '#00FF00',
        warning: '#FFFF00',
    },
    saturatedPastel: {
        primary: '#FF69B4', // Hot pink
        background: '#FFF0F5', // Lavender blush - low contrast with pink
        foreground: '#1A1A1A',
        secondary: '#FFE4E1',
        muted: '#FFD1DC',
        accent: '#FFB6C1',
        destructive: '#FF1493',
        success: '#98FB98',
        warning: '#FFD700',
    },
    invertedContrast: {
        primary: '#FFFFFF',
        background: '#000000',
        foreground: '#FFFFFF',
        secondary: '#1A1A1A',
        muted: '#333333',
        accent: '#2A2A2A',
        destructive: '#FF6B6B',
        success: '#4ADE80',
        warning: '#FBBF24',
    },
    lowContrastMuted: {
        primary: '#888888', // Mid gray
        background: '#999999', // Similar mid gray - terrible contrast
        foreground: '#777777', // Also mid gray
        secondary: '#8A8A8A',
        muted: '#909090',
        accent: '#858585',
        destructive: '#AA6666',
        success: '#66AA66',
        warning: '#AAAA66',
    },
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert hex color to HSL string format for CSS variables
 */
function hexToHSL(hex: string): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Calculate contrast between two hex colors
 */
function calculateHexContrast(hex1: string, hex2: string): ContrastResult {
    const parseHex = (hex: string) => {
        hex = hex.replace(/^#/, '');
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
        };
    };

    const rgb1 = parseHex(hex1);
    const rgb2 = parseHex(hex2);
    const ratio = calculateContrastRatio(rgb1, rgb2);
    const compliance = checkWCAGCompliance(ratio);

    return {
        ratio,
        wcagAA: compliance.aa,
        wcagAAA: compliance.aaa,
    };
}

// =============================================================================
// Sub-Components
// =============================================================================

interface ContrastIndicatorProps {
    label: string;
    color1: string;
    color2: string;
}

const ContrastIndicator = ({ label, color1, color2 }: ContrastIndicatorProps) => {
    const [contrast, setContrast] = useState<ContrastResult | null>(null);

    useEffect(() => {
        try {
            setContrast(calculateHexContrast(color1, color2));
        } catch {
            setContrast(null);
        }
    }, [color1, color2]);

    if (!contrast) return null;

    return (
        <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground">{label}:</span>
            <span className={cn(
                'font-bold',
                contrast.wcagAA ? 'text-success' : 'text-destructive'
            )}>
                {contrast.ratio.toFixed(2)}:1
            </span>
            <Badge variant={contrast.wcagAA ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                {contrast.wcagAA ? '✓ AA' : '✗ AA'}
            </Badge>
            <Badge variant={contrast.wcagAAA ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                {contrast.wcagAAA ? '✓ AAA' : '✗ AAA'}
            </Badge>
        </div>
    );
};

interface PaletteControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    description?: string;
}

const PaletteControl = ({ label, value, onChange, description }: PaletteControlProps) => {
    return (
        <div className="space-y-1">
            <Label className="text-xs font-medium">{label}</Label>
            <ColorPicker
                value={value}
                onChange={onChange}
                className="w-full"
            />
            {description && (
                <p className="text-[10px] text-muted-foreground">{description}</p>
            )}
        </div>
    );
};

// =============================================================================
// Main Component
// =============================================================================

export interface ColorPaletteStressTestProps {
    /** Initial palette preset */
    preset?: keyof typeof PRESET_PALETTES;
    /** Show contrast validation panel */
    showContrastValidation?: boolean;
    /** Enable mobile simulation */
    showMobileSimulation?: boolean;
}

export const ColorPaletteStressTest = ({
    preset = 'default',
    showContrastValidation = true,
    showMobileSimulation = true,
}: ColorPaletteStressTestProps) => {
    const [palette, setPalette] = useState<PaletteConfig>(PRESET_PALETTES[preset]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activePreset, setActivePreset] = useState<string>(preset);
    const [customDefault, setCustomDefault] = useState<PaletteConfig | null>(null);
    const { toast } = useToast();
    const [isDirty, setIsDirty] = useState(false);

    // Apply palette to CSS variables
    const applyPalette = useCallback((p: PaletteConfig) => {
        const root = document.documentElement;

        root.style.setProperty('--primary', hexToHSL(p.primary));
        root.style.setProperty('--background', hexToHSL(p.background));
        root.style.setProperty('--foreground', hexToHSL(p.foreground));

        // Also set primary-foreground based on contrast
        const primaryContrast = calculateHexContrast(p.primary, '#FFFFFF');
        const primaryFg = primaryContrast.ratio > 3 ? '#FFFFFF' : '#000000';
        root.style.setProperty('--primary-foreground', hexToHSL(primaryFg));

        // Set other tokens
        root.style.setProperty('--destructive', hexToHSL(p.destructive));
        root.style.setProperty('--success', hexToHSL(p.success));
        root.style.setProperty('--warning', hexToHSL(p.warning));
    }, []);

    // Apply palette on change
    useEffect(() => {
        applyPalette(palette);
    }, [palette, applyPalette]);

    // Toggle dark mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Handle preset selection
    const handlePresetChange = (presetKey: string) => {
        setActivePreset(presetKey);
        if (presetKey === 'default' && customDefault) {
            setPalette(customDefault);
        } else {
            setPalette(PRESET_PALETTES[presetKey as keyof typeof PRESET_PALETTES]);
        }
        setIsDirty(false);
    };

    // Handle individual color change
    const handleColorChange = (key: keyof PaletteConfig, value: string) => {
        setPalette(prev => ({ ...prev, [key]: value }));
        setActivePreset('custom');
        setIsDirty(true);
    };

    // Reset to default
    const handleReset = () => {
        setActivePreset('default');
        setPalette(customDefault || PRESET_PALETTES.default);
        setIsDarkMode(false);
        setIsDirty(false);
    };

    const handleSave = () => {
        // Here we would save to localStorage
        // For this story, we just simulate it by updating the custom default state
        setCustomDefault(palette);
        setIsDirty(false);
        toast({
            title: "Palette saved successfully!",
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">🧪 Color Palette Stress Test</h1>
                    <p className="text-muted-foreground">
                        Test the design system's resilience under extreme color configurations.
                        Validates WCAG contrast compliance and visual stability.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Control Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Control Panel</CardTitle>
                                <CardDescription>Select extreme presets or customize colors</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Preset Selector */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Preset Palettes</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(PRESET_PALETTES).map((key) => (
                                            <Button
                                                key={key}
                                                variant={activePreset === key ? 'default' : 'outline'}
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => handlePresetChange(key)}
                                            >
                                                {key === 'default' ? '✓ Default' :
                                                    key === 'nearWhitePrimary' ? '⚠️ White Primary' :
                                                        key === 'nearBlackPrimary' ? '⚠️ Black on Black' :
                                                            key === 'neonOnLight' ? '⚠️ Neon Green' :
                                                                key === 'saturatedPastel' ? '⚠️ Hot Pink' :
                                                                    key === 'invertedContrast' ? '⚫ Inverted' :
                                                                        key === 'lowContrastMuted' ? '⚠️ Low Contrast' :
                                                                            key}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Custom Color Controls */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Custom Colors</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <PaletteControl
                                            label="Primary"
                                            value={palette.primary}
                                            onChange={(v) => handleColorChange('primary', v)}
                                        />
                                        <PaletteControl
                                            label="Background"
                                            value={palette.background}
                                            onChange={(v) => handleColorChange('background', v)}
                                        />
                                        <PaletteControl
                                            label="Foreground"
                                            value={palette.foreground}
                                            onChange={(v) => handleColorChange('foreground', v)}
                                        />
                                        <PaletteControl
                                            label="Destructive"
                                            value={palette.destructive}
                                            onChange={(v) => handleColorChange('destructive', v)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Mode Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Dark Mode</Label>
                                    <Switch
                                        checked={isDarkMode}
                                        onCheckedChange={setIsDarkMode}
                                    />
                                </div>

                                {/* Reset Button */}
                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-full" onClick={handleReset}>
                                        Reset All to Defaults
                                    </Button>
                                    <Button variant="default" className="w-full" onClick={handleSave} disabled={!isDirty}>
                                        Save Palette
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contrast Validation Panel */}
                        {showContrastValidation && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Contrast Validation</CardTitle>
                                    <CardDescription>WCAG 2.1 compliance check</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ContrastIndicator
                                        label="Primary/BG"
                                        color1={palette.primary}
                                        color2={palette.background}
                                    />
                                    <ContrastIndicator
                                        label="FG/BG"
                                        color1={palette.foreground}
                                        color2={palette.background}
                                    />
                                    <ContrastIndicator
                                        label="Primary FG"
                                        color1={calculateHexContrast(palette.primary, '#FFFFFF').ratio > 3 ? '#FFFFFF' : '#000000'}
                                        color2={palette.primary}
                                    />
                                    <ContrastIndicator
                                        label="Destructive/BG"
                                        color1={palette.destructive}
                                        color2={palette.background}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Test UI Scenarios */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Scenario A: Standard Width */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Scenario A: Standard Survey Card</CardTitle>
                                        <CardDescription>Full-width component with all interactive states</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="font-mono">Full Width</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Question Header */}
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                                        Question 14 of 25
                                    </span>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        How likely are you to recommend our platform with dynamic color palettes?
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Test <strong className="text-foreground">primary text emphasis</strong> on custom{' '}
                                        <em>backgrounds</em>. Muted content should remain legible.
                                    </p>
                                </div>

                                {/* Interactive Elements */}
                                <div className="space-y-3">
                                    <Button className="w-full h-12">
                                        Primary Button (hover me)
                                    </Button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="secondary" className="h-10">
                                            Secondary
                                        </Button>
                                        <Button variant="outline" className="h-10">
                                            Outline
                                        </Button>
                                    </div>

                                    <Button variant="destructive" className="w-full">
                                        Destructive Action
                                    </Button>
                                </div>

                                {/* Form Elements */}
                                <div className="space-y-3">
                                    <Input placeholder="Type something to test input states..." />

                                    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                        <Checkbox id="option1" className="mt-1" />
                                        <div className="space-y-1">
                                            <Label htmlFor="option1" className="text-sm font-medium cursor-pointer">
                                                Long wrapping label that tests accent hover state visibility
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                This is helper text that should remain visible
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                        <Checkbox id="option2" className="mt-1" />
                                        <div className="space-y-1">
                                            <Label htmlFor="option2" className="text-sm font-medium cursor-pointer">
                                                Another option with different content length
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Muted text visibility check
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <Badge>Default</Badge>
                                    <Badge variant="secondary">Secondary</Badge>
                                    <Badge variant="outline">Outline</Badge>
                                    <Badge variant="destructive">Destructive</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scenario B: Mobile Simulation */}
                        {showMobileSimulation && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Scenario B: Mobile Simulation</CardTitle>
                                            <CardDescription>Constrained width (320px) stress test</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="font-mono">320px</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-[320px] mx-auto p-4 border rounded-xl shadow-sm bg-card space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                                                Mobile Question
                                            </span>
                                            <h3 className="text-lg font-semibold">
                                                Does this text remain legible?
                                            </h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Constrained container tests overflow and contrast.
                                        </p>

                                        <Input placeholder="Mobile input..." className="text-sm" />

                                        <div className="space-y-2">
                                            <Button className="w-full text-sm" size="sm">
                                                Submit Answer
                                            </Button>
                                            <Button variant="destructive" className="w-full text-sm" size="sm">
                                                Skip Question
                                            </Button>
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            <Badge variant="outline" className="text-[10px]">Q14</Badge>
                                            <Badge variant="secondary" className="text-[10px]">Required</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Scenario C: Semantic States */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Scenario C: Semantic State Colors</CardTitle>
                                <CardDescription>Success, warning, destructive, and info states</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-background-success border border-success">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-2 w-2 rounded-full bg-success" />
                                            <span className="text-sm font-medium text-success">Success</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Operation completed successfully</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-background-warning border border-warning">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-2 w-2 rounded-full bg-warning" />
                                            <span className="text-sm font-medium text-warning">Warning</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Review before proceeding</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-background-destructive border border-destructive">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-2 w-2 rounded-full bg-destructive" />
                                            <span className="text-sm font-medium text-destructive">Error</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Something went wrong</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-background-info border border-info">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-2 w-2 rounded-full bg-info" />
                                            <span className="text-sm font-medium text-info">Info</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Additional information</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPaletteStressTest;
