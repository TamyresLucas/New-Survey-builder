import { useState, useEffect } from "react"
import { ColorPicker } from "../components/ui/color-picker"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import Color from "color"

// Define the tokens we want to manage
const SEMANTIC_TOKENS = [
    { name: "primary", label: "Primary", default: "222.2 47.4% 11.2%" },
    { name: "secondary", label: "Secondary", default: "210 40% 96.1%" },
    { name: "success", label: "Success", default: "142 76% 36%" },
    { name: "warning", label: "Warning", default: "38 92% 50%" },
    { name: "destructive", label: "Destructive", default: "0 84.2% 60.2%" },
    { name: "muted", label: "Muted", default: "210 40% 96.1%" },
    { name: "accent", label: "Accent", default: "210 40% 96.1%" },
] as const

type TokenName = typeof SEMANTIC_TOKENS[number]["name"]

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
        // Tailwind usually expects just numbers without "deg" or units if using variables in hsl() function wrappers
        // but the shadcn format is H S% L%
        return `${hsl.hue().toFixed(1)} ${hsl.saturationl().toFixed(1)}% ${hsl.lightness().toFixed(1)}%`
    } catch (e) {
        return "0 0% 0%"
    }
}

export function ColorPaletteEditor() {
    const [colors, setColors] = useState<Record<string, string>>({})

    // Initialize state from local storage or defaults
    useEffect(() => {
        const savedColorsStr = localStorage.getItem("global-colors")
        let initialColors: Record<string, string> = {}

        if (savedColorsStr) {
            initialColors = JSON.parse(savedColorsStr)

            // Clean up 'info' if it exists, as it should leverage CSS variable inheritance from 'primary'
            if (initialColors.info) {
                delete initialColors.info
                localStorage.setItem("global-colors", JSON.stringify(initialColors))
                document.documentElement.style.removeProperty('--info')
            }
        }

        // We want the internal state to be HEX for the picker
        const hexState: Record<string, string> = {}
        SEMANTIC_TOKENS.forEach(token => {
            // If we have a saved HSL value, use it, otherwise use default
            const hslValue = initialColors[token.name] || token.default
            hexState[token.name] = hslStringToHex(hslValue)
        })
        setColors(hexState)
    }, [])

    const handleColorChange = (token: TokenName, newHex: string) => {
        // 1. Update component state (Hex)
        setColors(prev => ({ ...prev, [token]: newHex }))

        // 2. Convert to HSL string
        const newHsl = hexToHslString(newHex)

        // 3. Update Local Storage
        const savedColors = JSON.parse(localStorage.getItem("global-colors") || "{}")
        savedColors[token] = newHsl
        localStorage.setItem("global-colors", JSON.stringify(savedColors))

        // 4. Update CSS Variable immediately on document
        document.documentElement.style.setProperty(`--${token}`, newHsl)

        // Also update foreground colors if needed (simple black/white contrast check could be added here)
        // For now we assume manually setting it or leaving default

        // 5. Build event detail
        const eventDetail = {
            [token]: newHsl
        }

        // 6. Dispatch event for globally synced decorator
        window.dispatchEvent(new CustomEvent('color-changed', {
            detail: savedColors // Send all currents
        }))
    }

    const handleReset = (token: TokenName) => {
        const def = SEMANTIC_TOKENS.find(t => t.name === token)?.default
        if (!def) return

        const defaultHex = hslStringToHex(def)
        handleColorChange(token, defaultHex)
    }

    const resetAll = () => {
        SEMANTIC_TOKENS.forEach(token => {
            const defaultHex = hslStringToHex(token.default)
            handleColorChange(token.name, defaultHex)
        })
        localStorage.removeItem("global-colors") // clearer to remove
    }

    return (
        <div className="space-y-8 p-6 max-w-4xl bg-card rounded-xl border shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Brand Color Palette</h2>
                    <p className="text-muted-foreground mt-1">
                        Customize the semantic color tokens for the design system. Changes are applied globally.
                    </p>
                </div>
                <Button variant="outline" onClick={resetAll}>Reset All to Defaults</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {SEMANTIC_TOKENS.map((token) => (
                    <div key={token.name} className="p-4 rounded-lg border bg-background/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold capitalize">{token.label}</Label>
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
                ))}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <h3 className="font-semibold text-sm mb-2">Live Preview</h3>
                <div className="flex flex-wrap gap-4">
                    <Button variant="default">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="destructive">Destructive Button</Button>
                    <Button variant="outline">Outline Button</Button>
                </div>
                <div className="mt-4 flex gap-4">
                    <div className="p-4 bg-primary text-primary-foreground rounded">Primary Box</div>
                    <div className="p-4 bg-secondary text-secondary-foreground rounded">Secondary Box</div>
                    <div className="p-4 bg-warning text-warning-foreground rounded">Warning Box</div>
                </div>
            </div>
        </div>
    )
}
