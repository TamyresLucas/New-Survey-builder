import { useState, useEffect } from "react"
import { ColorPicker } from "../components/ui/color-picker"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import Color from "color"

// Define the tokens we want to manage
const BRAND_TOKENS = [
    { name: "primary", label: "Primary", default: "220 100% 50%" },
    { name: "success", label: "Success", default: "142 76% 36%" },
    { name: "destructive", label: "Destructive", default: "0 84.2% 60.2%" },
    { name: "warning", label: "Warning", default: "38 92% 50%" },
] as const

const CHART_TOKENS = [
    { name: "chart-1", label: "Chart 1", default: "221 83% 53%" },   // Vibrant Blue
    { name: "chart-2", label: "Chart 2", default: "142 71% 45%" },   // Emerald Green
    { name: "chart-3", label: "Chart 3", default: "262 83% 58%" },   // Purple
    { name: "chart-4", label: "Chart 4", default: "25 95% 53%" },    // Orange
    { name: "chart-5", label: "Chart 5", default: "339 90% 51%" },   // Rose/Pink
] as const

const ALL_TOKENS = [...BRAND_TOKENS, ...CHART_TOKENS]

type TokenName = typeof ALL_TOKENS[number]["name"]

// Helper: Convert "H S L%" string to Hex
const hslStringToHex = (hslString: string): string => {
    try {
        const [h, s, l] = hslString.split(" ").map((v) => parseFloat(v))
        return Color.hsl(h, s, l).hex()
    } catch (e) {
        return "#000000"
    }
}

// Helper: Convert Hex to "H S L%" string
const hexToHslString = (hex: string): string => {
    try {
        const hsl = Color(hex).hsl()
        return `${hsl.hue().toFixed(1)} ${hsl.saturationl().toFixed(1)}% ${hsl.lightness().toFixed(1)}%`
    } catch (e) {
        return "0 0% 0%"
    }
}

// Helper: Generate Dark Mode variant
// Logic: Ensure sufficient lightness (L >= 80%) AND desaturate (S <= 50%) to reduce vibration
const generateDarkVariant = (hex: string): string => {
    try {
        let base = Color(hex);

        // 1. Ensure Lightness (Readability) 
        // Material Design recommendation for dark theme is often tone 80 (L~80%)
        if (base.lightness() < 80) {
            base = base.lightness(80);
        }

        // 2. Reduce Saturation (Intensity)
        // High saturation causes visual vibration on dark backgrounds. Cap at 50%.
        if (base.saturationl() > 50) {
            base = base.saturationl(50);
        }

        return hexToHslString(base.hex());
    } catch (e) {
        return "0 0% 100%";
    }
}

// Helper: Determine appropriate foreground color (black or white) based on background lightness
const getContrastForeground = (hexBg: string): string => {
    try {
        const bg = Color(hexBg);
        // If background is light, use dark text. If background is dark, use light text.
        // Using a threshold of L=60 to decide.
        // Standard nice dark text: Dark Navy (222.2 47.4% 11.2%) -> #0f172a
        // Standard nice light text: White (210 40% 98%) -> #f8fafc
        return bg.lightness() > 60 ? "222.2 47.4% 11.2%" : "210 40% 98%";
    } catch (e) {
        return "0 0% 100%";
    }
}

// Helper: Update the dynamic stylesheet
const updateDynamicTheme = (currentColors: Record<string, string>) => {
    const styleId = 'dynamic-theme-styles';
    let styleEl = document.getElementById(styleId);

    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    // 1. Generate Light Mode Rules
    const lightRules = ALL_TOKENS.map(token => {
        const hex = currentColors[token.name] || hslStringToHex(token.default);
        const hsl = hexToHslString(hex);

        let rule = `--${token.name}: ${hsl};`;

        // Generate foreground for brand tokens
        if (BRAND_TOKENS.some(bt => bt.name === token.name)) {
            const fgHsl = getContrastForeground(hex);
            rule += `\n        --${token.name}-foreground: ${fgHsl};`;
        }

        return rule;
    }).join('\n        ');

    // 2. Generate Dark Mode Rules
    const darkRules = ALL_TOKENS.map(token => {
        const hex = currentColors[token.name] || hslStringToHex(token.default);
        // Generate variant
        const darkHslStr = generateDarkVariant(hex);
        const darkHex = hslStringToHex(darkHslStr);

        let rule = `--${token.name}: ${darkHslStr};`;

        // Generate foreground for brand tokens (check contrast against the NEW dark variant)
        if (BRAND_TOKENS.some(bt => bt.name === token.name)) {
            const fgHsl = getContrastForeground(darkHex);
            rule += `\n        --${token.name}-foreground: ${fgHsl};`;
        }

        return rule;
    }).join('\n        ');

    // 3. Construct CSS with !important to override @layer base defaults
    styleEl.textContent = `
            :root {
                ${lightRules}
            }
            .dark {
                ${darkRules}
            }
        `.replace(/: ([^;]+);/g, ': $1 !important;');
}

export function ColorPaletteEditor() {
    const [colors, setColors] = useState<Record<string, string>>({})

    // Initialize state
    useEffect(() => {
        const savedColorsStr = localStorage.getItem("global-colors")
        let initialColors: Record<string, string> = {}

        if (savedColorsStr) {
            try {
                initialColors = JSON.parse(savedColorsStr)

                // Clean up legacy 'info' if exists
                if (initialColors.info) {
                    delete initialColors.info
                    localStorage.setItem("global-colors", JSON.stringify(initialColors))
                }
            } catch (e) {
                console.warn("Failed to parse saved colors, using defaults", e)
                localStorage.removeItem("global-colors")
            }
        }

        // Convert HSL values from storage to HEX for the picker state
        const hexState: Record<string, string> = {}
        ALL_TOKENS.forEach(token => {
            const hslValue = initialColors[token.name] || token.default
            hexState[token.name] = hslStringToHex(hslValue)
        })
        setColors(hexState)

        // Initial application of styles
        updateDynamicTheme(hexState);
    }, [])

    const handleColorChange = (token: TokenName, newHex: string) => {
        const newColors = { ...colors, [token]: newHex };
        setColors(newColors);

        // Update Storage (Store HSL as before for consistency, though we use HEX state internally)
        const savedColors = JSON.parse(localStorage.getItem("global-colors") || "{}");
        const newHsl = hexToHslString(newHex);
        savedColors[token] = newHsl;

        localStorage.setItem("global-colors", JSON.stringify(savedColors))

        // Update CSS via Style Tag
        updateDynamicTheme(newColors);

        window.dispatchEvent(new CustomEvent('color-changed', {
            detail: savedColors
        }))
    }

    const handleReset = (token: TokenName) => {
        const def = ALL_TOKENS.find(t => t.name === token)?.default
        if (!def) return
        const defaultHex = hslStringToHex(def)
        handleColorChange(token, defaultHex)
    }

    const resetAll = () => {
        const startState: Record<string, string> = {};
        const savedColors: Record<string, string> = {};

        ALL_TOKENS.forEach(token => {
            const defaultHex = hslStringToHex(token.default);
            startState[token.name] = defaultHex;
            savedColors[token.name] = token.default;
        })

        setColors(startState);
        localStorage.removeItem("global-colors");
        updateDynamicTheme(startState);

        window.dispatchEvent(new CustomEvent('color-changed', { detail: savedColors }));
    }

    const ColorCard = ({ token }: { token: typeof ALL_TOKENS[number] }) => (
        <div className="p-4 rounded-lg border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{token.label}</Label>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleReset(token.name)}
                >
                    Reset
                </Button>
            </div>

            <ColorPicker
                value={colors[token.name] || "#000000"}
                onChange={(val) => handleColorChange(token.name, val)}
                format="hex"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                <span>--{token.name}</span>
                <span className="truncate max-w-[120px]" title={hexToHslString(colors[token.name] || "")}>
                    {hexToHslString(colors[token.name] || "")}
                </span>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 p-6 max-w-5xl bg-card rounded-xl border shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Brand Color Palette</h2>
                    <p className="text-muted-foreground mt-1">
                        Customize the color tokens for the design system. Changes are applied globally.
                    </p>
                </div>
                <Button variant="outline" onClick={resetAll}>Reset All to Defaults</Button>
            </div>

            {/* Brand Colors Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {BRAND_TOKENS.map((token) => (
                        <ColorCard key={token.name} token={token} />
                    ))}
                </div>
            </div>

            {/* Chart Colors Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Chart Colors</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    {CHART_TOKENS.map((token) => (
                        <ColorCard key={token.name} token={token} />
                    ))}
                </div>
            </div>

            {/* Live Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <h3 className="font-semibold text-sm mb-4">Live Preview</h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Buttons</p>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="default">Primary</Button>
                            <Button variant="success">Success</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Brand Swatches</p>
                        <div className="flex gap-2">
                            <div className="w-12 h-12 bg-primary rounded" title="Primary" />
                            <div className="w-12 h-12 bg-success rounded" title="Success" />
                            <div className="w-12 h-12 bg-destructive rounded" title="Destructive" />
                            <div className="w-12 h-12 bg-warning rounded" title="Warning" />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Chart Swatches</p>
                        <div className="flex gap-2">
                            <div className="w-12 h-12 bg-chart-1 rounded" title="Chart 1" />
                            <div className="w-12 h-12 bg-chart-2 rounded" title="Chart 2" />
                            <div className="w-12 h-12 bg-chart-3 rounded" title="Chart 3" />
                            <div className="w-12 h-12 bg-chart-4 rounded" title="Chart 4" />
                            <div className="w-12 h-12 bg-chart-5 rounded" title="Chart 5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
