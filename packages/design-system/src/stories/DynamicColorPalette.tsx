import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
    COLOR_TOKENS,
    getTokensByCategory,
    isDynamicToken,
    type ColorTokenKey,
    type ColorToken,
} from '@/tokens/colors';
import {
    getComputedColorRGB,
    formatRGB,
    getContrastRatioBetweenVariables,
    checkWCAGCompliance,
} from '@/lib/color-utils';

interface ColorSwatchProps {
    tokenKey: ColorTokenKey;
    token: ColorToken;
    showContrast?: boolean;
}

const ColorSwatch = ({ tokenKey, token, showContrast = false }: ColorSwatchProps) => {
    const [computedValue, setComputedValue] = useState<string>('');
    const [contrastInfo, setContrastInfo] = useState<{
        ratio: number;
        passes: boolean;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const updateValues = useCallback(() => {
        const rgb = getComputedColorRGB(token.variable);
        if (rgb) {
            setComputedValue(formatRGB(rgb));
        }

        if (showContrast && tokenKey.includes('foreground')) {
            const bgKey = tokenKey.replace('-foreground', '') as ColorTokenKey;
            if (COLOR_TOKENS[bgKey]) {
                const ratio = getContrastRatioBetweenVariables(
                    COLOR_TOKENS[bgKey].variable,
                    token.variable
                );
                if (ratio) {
                    const compliance = checkWCAGCompliance(ratio);
                    setContrastInfo({ ratio, passes: compliance.aa });
                }
            }
        }
    }, [token.variable, tokenKey, showContrast]);

    useEffect(() => {
        updateValues();
        const observer = new MutationObserver(updateValues);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style'],
        });
        return () => observer.disconnect();
    }, [updateValues]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(token.variable);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div
            className="group relative flex flex-col gap-3 p-4 rounded-xl border border-primary/20 bg-background hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
            onClick={handleCopy}
            title={`Click to copy: ${token.variable}`}
        >
            {/* Color Preview */}
            <div className="relative">
                <div
                    className="h-20 w-full rounded-lg border border-primary/10 shadow-inner transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: `var(${token.variable})` }}
                />
                {isDynamicToken(token) && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium bg-background/90 backdrop-blur-sm rounded-md border border-primary/20 text-primary">
                        Dynamic
                    </span>
                )}
                {copied && (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg text-sm font-medium text-success">
                        ✓ Copied!
                    </span>
                )}
            </div>

            {/* Token Info */}
            <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm text-foreground truncate">{tokenKey}</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate">
                    {token.variable}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                    {computedValue}
                </span>
            </div>

            {/* Contrast Badge */}
            {contrastInfo && (
                <div className={cn(
                    'absolute bottom-14 right-4 px-2 py-1 rounded-md text-[10px] font-mono font-medium',
                    contrastInfo.passes
                        ? 'bg-success/10 text-success border border-success/30'
                        : 'bg-warning/10 text-warning border border-warning/30'
                )}>
                    {contrastInfo.passes ? '✓' : '⚠'} {contrastInfo.ratio.toFixed(1)}:1
                </div>
            )}
        </div>
    );
};

interface DynamicColorPaletteProps {
    showContrast?: boolean;
}

export const DynamicColorPalette = ({ showContrast = false }: DynamicColorPaletteProps) => {
    const groupedTokens = getTokensByCategory();

    return (
        <div className="flex flex-col gap-10">
            {Object.entries(groupedTokens).map(([category, tokens]) => (
                <div key={category} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">{category}</h3>
                            <p className="text-xs text-muted-foreground">
                                {tokens.length} token{tokens.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {tokens.map((token) => {
                            const key = Object.keys(COLOR_TOKENS).find(
                                (k) => COLOR_TOKENS[k as ColorTokenKey] === token
                            ) as ColorTokenKey;

                            return (
                                <ColorSwatch
                                    key={key}
                                    tokenKey={key}
                                    token={token}
                                    showContrast={showContrast}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
