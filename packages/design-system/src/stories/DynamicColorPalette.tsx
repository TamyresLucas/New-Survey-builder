import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
    COLOR_TOKENS,
    getTokensByCategory,
    isStaticToken,
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

    useEffect(() => {
        const updateValues = () => {
            // Get computed RGB (works for both static and dynamic tokens)
            const rgb = getComputedColorRGB(token.variable);
            if (rgb) {
                setComputedValue(formatRGB(rgb));
            }

            // Calculate contrast if it's a foreground token
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
        };

        updateValues();

        // Watch for theme changes
        const observer = new MutationObserver(updateValues);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [token.variable, tokenKey, showContrast]);

    return (
        <div className="flex flex-col gap-2">
            <div
                className={cn('h-16 w-full rounded-md border shadow-sm', token.className)}
                title={token.usage}
            />
            <div className="flex flex-col text-xs">
                <span className="font-semibold">{tokenKey}</span>
                <span className="text-muted-foreground font-mono text-[10px]">
                    {token.variable}
                </span>
                {isDynamicToken(token) && (
                    <span className="text-muted-foreground font-mono text-[10px] italic">
                        (dynamic)
                    </span>
                )}
                <span className="text-muted-foreground font-mono opacity-75 text-[10px]">
                    {computedValue}
                </span>
                {contrastInfo && (
                    <span
                        className={cn(
                            'font-mono text-[10px] mt-1',
                            contrastInfo.passes ? 'text-success' : 'text-warning'
                        )}
                    >
                        {contrastInfo.passes ? '✓' : '⚠'} {contrastInfo.ratio.toFixed(2)}:1
                    </span>
                )}
            </div>
        </div>
    );
};

interface DynamicColorPaletteProps {
    showContrast?: boolean;
}

export const DynamicColorPalette = ({ showContrast = false }: DynamicColorPaletteProps) => {
    const groupedTokens = getTokensByCategory();

    return (
        <div className="flex flex-col gap-8">
            {Object.entries(groupedTokens).map(([category, tokens]) => (
                <div key={category}>
                    <h3 className="text-lg font-medium mb-4">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
