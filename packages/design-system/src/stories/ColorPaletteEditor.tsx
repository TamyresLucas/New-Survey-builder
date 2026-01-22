import { useState, useEffect } from "react"
import { ColorPicker } from "../components/ui/color-picker"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import Color from "color"

// Define the tokens we want to manage
const BRAND_TOKENS = [
    { name: "primary", label: "Primary", default: "233 86% 64%" },
    { name: "success", label: "Success", default: "165 100% 26%" },
    { name: "destructive", label: "Destructive", default: "350 60% 54%" },
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
type Product = "Voxco" | "Ascribe" | "Discuss"

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
    const [selectedProduct, setSelectedProduct] = useState<Product>("Voxco")
    const [colors, setColors] = useState<Record<string, string>>({})

    const PRODUCT_SPECIFIC_TOKENS = ["primary"];
    const SHARED_STORAGE_KEY = "global-colors-shared";
    const getProductStorageKey = (product: Product) => `global-colors-${product}`;

    // Initialize state
    useEffect(() => {
        loadColorsForProduct(selectedProduct)
    }, [selectedProduct])

    const loadColorsForProduct = (product: Product) => {
        // 1. Load Shared Colors
        const sharedColorsStr = localStorage.getItem(SHARED_STORAGE_KEY);
        let sharedColors: Record<string, string> = {};
        if (sharedColorsStr) {
            try { sharedColors = JSON.parse(sharedColorsStr); } catch (e) { console.warn("Failed to parse shared colors", e); }
        }

        // 2. Load Product Specific Colors
        const productColorsStr = localStorage.getItem(getProductStorageKey(product));
        let productColors: Record<string, string> = {};
        if (productColorsStr) {
            try { productColors = JSON.parse(productColorsStr); } catch (e) { console.warn("Failed to parse product colors", e); }
        }

        // 3. Merge (Product overrides shared if collision, though we manage split keys)
        // Ensure defaults are present if not in storage
        const initialColors: Record<string, string> = {};

        ALL_TOKENS.forEach(token => {
            if (PRODUCT_SPECIFIC_TOKENS.includes(token.name)) {
                initialColors[token.name] = productColors[token.name] || token.default.split(' ')[0] // fallback if needed, but logic below handles it better
            } else {
                initialColors[token.name] = sharedColors[token.name] || token.default.split(' ')[0]
            }
        });

        // Convert HSL values from storage/defaults to HEX for the picker state
        const hexState: Record<string, string> = {}
        ALL_TOKENS.forEach(token => {
            // Priority: Product Storage > Shared Storage > Default
            // But strict logic: 
            // If product specific: check product storage -> default
            // If shared: check shared storage -> default

            let hslValue = token.default;

            if (PRODUCT_SPECIFIC_TOKENS.includes(token.name)) {
                if (productColors[token.name]) hslValue = productColors[token.name];
            } else {
                if (sharedColors[token.name]) hslValue = sharedColors[token.name];
            }

            hexState[token.name] = hslStringToHex(hslValue)
        })
        setColors(hexState)

        // Apply styles
        updateDynamicTheme(hexState);
    }

    const handleColorChange = (token: TokenName, newHex: string) => {
        const newColors = { ...colors, [token]: newHex };
        setColors(newColors); // Update UI immediately

        const newHsl = hexToHslString(newHex);
        const isProductSpecific = PRODUCT_SPECIFIC_TOKENS.includes(token);
        const storageKey = isProductSpecific ? getProductStorageKey(selectedProduct) : SHARED_STORAGE_KEY;

        const savedColors = JSON.parse(localStorage.getItem(storageKey) || "{}");
        savedColors[token] = newHsl;
        localStorage.setItem(storageKey, JSON.stringify(savedColors));

        // Update CSS via Style Tag
        updateDynamicTheme(newColors);

        // Dispatch event with merged colors (we might need to reconstruct full state from storage to be accurate, 
        // but for now responding with current full state `newColors` mapped to HSL is enough for live preview if listeners use it)
        // Re-constructing full HSL export:
        const fullHslState: Record<string, string> = {};
        Object.entries(newColors).forEach(([key, hex]) => {
            fullHslState[key] = hexToHslString(hex);
        });

        window.dispatchEvent(new CustomEvent('color-changed', {
            detail: fullHslState
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
        const sharedColorsToSave: Record<string, string> = {};
        const productColorsToSave: Record<string, string> = {}; // For current product

        ALL_TOKENS.forEach(token => {
            const defaultHex = hslStringToHex(token.default);
            startState[token.name] = defaultHex;

            if (PRODUCT_SPECIFIC_TOKENS.includes(token.name)) {
                // If we reset all, we are resetting for THIS product + Shared
                // We do NOT clear other products' data
                // We clear current product's specific overrides
                // Actually, if we just want to reset to defaults, we should probably clear the entries in storage.
            }
        })

        setColors(startState);

        // Reset Shared Storage
        // For shared tokens, remove them from shared storage effectively resetting to default
        const currentShared = JSON.parse(localStorage.getItem(SHARED_STORAGE_KEY) || "{}");
        // We only remove the tokens managed by this editor (ALL_TOKENS minus Primary)
        ALL_TOKENS.forEach(t => {
            if (!PRODUCT_SPECIFIC_TOKENS.includes(t.name)) {
                delete currentShared[t.name];
            }
        });
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(currentShared));

        // Reset Product Storage
        const currentProduct = JSON.parse(localStorage.getItem(getProductStorageKey(selectedProduct)) || "{}");
        PRODUCT_SPECIFIC_TOKENS.forEach(t => {
            delete currentProduct[t];
        });
        localStorage.setItem(getProductStorageKey(selectedProduct), JSON.stringify(currentProduct));

        updateDynamicTheme(startState);

        const defaultHslState: Record<string, string> = {};
        ALL_TOKENS.forEach(t => defaultHslState[t.name] = t.default);

        window.dispatchEvent(new CustomEvent('color-changed', { detail: defaultHslState }));
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
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Product Color Palette</h2>
                        <p className="text-muted-foreground mt-1">
                            Customize the color tokens for the selected product. Changes are saved per product.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-[200px]">
                            <Select value={selectedProduct} onValueChange={(val) => setSelectedProduct(val as Product)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Product" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Voxco">Voxco</SelectItem>
                                    <SelectItem value="Ascribe">Ascribe</SelectItem>
                                    <SelectItem value="Discuss">Discuss</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Button variant="outline" onClick={resetAll}>Reset All to Defaults</Button>
            </div>

            {/* Product Colors Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Product Colors</h3>
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
                        <p className="text-xs text-muted-foreground mb-2">Product Swatches</p>
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
