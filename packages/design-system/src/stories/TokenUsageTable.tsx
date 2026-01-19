import { useEffect, useState, useMemo } from 'react';
import {
    COLOR_TOKENS,
    isStaticToken,
    isDynamicToken,
    type ColorTokenKey,
} from '@/tokens/colors';
import {
    getComputedColorRGB,
    formatRGB,
    getContrastRatioBetweenVariables,
    checkWCAGCompliance,
} from '@/lib/color-utils';

interface TokenRowProps {
    tokenKey: ColorTokenKey;
}

const TokenRow = ({ tokenKey }: TokenRowProps) => {
    const token = COLOR_TOKENS[tokenKey];
    const [computedValue, setComputedValue] = useState<string>('');
    const [contrastInfo, setContrastInfo] = useState<{
        ratio: number;
        wcagAA: boolean;
        wcagAAA: boolean;
    } | null>(null);

    useEffect(() => {
        // Get computed value
        const rgb = getComputedColorRGB(token.variable);
        if (rgb) {
            setComputedValue(formatRGB(rgb));
        }

        // Calculate contrast for foreground tokens
        if (tokenKey.includes('foreground')) {
            const bgKey = tokenKey.replace('-foreground', '') as ColorTokenKey;
            if (COLOR_TOKENS[bgKey]) {
                const ratio = getContrastRatioBetweenVariables(
                    COLOR_TOKENS[bgKey].variable,
                    token.variable
                );
                if (ratio) {
                    const compliance = checkWCAGCompliance(ratio);
                    setContrastInfo({
                        ratio,
                        wcagAA: compliance.aa,
                        wcagAAA: compliance.aaa,
                    });
                }
            }
        }
    }, [tokenKey, token.variable]);

    return (
        <tr className="table-body-row">
            <td className="p-3 font-mono text-sm font-bold">{tokenKey}</td>
            <td className="p-3 font-mono text-xs">
                {isStaticToken(token) ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border flex-shrink-0"
                            style={{ backgroundColor: `hsl(${token.light})` }}
                        />
                        <span className="text-muted-foreground">{token.light}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground italic">dynamic</span>
                )}
            </td>
            <td className="p-3 font-mono text-xs">
                {isStaticToken(token) ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border flex-shrink-0"
                            style={{ backgroundColor: `hsl(${token.dark})` }}
                        />
                        <span className="text-muted-foreground">{token.dark}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground italic">dynamic</span>
                )}
            </td>
            <td className="p-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded border flex-shrink-0"
                        style={{ backgroundColor: `var(${token.variable})` }}
                    />
                    <span className="text-muted-foreground">{computedValue}</span>
                </div>
            </td>
            <td className="p-3 text-sm text-muted-foreground max-w-xs">
                {token.usage}
                {isDynamicToken(token) && (
                    <div className="text-xs mt-1 opacity-70">
                        Derived from: {token.derivedFrom.join(', ')}
                    </div>
                )}
            </td>
            <td className="p-3 text-xs text-center">
                {contrastInfo ? (
                    <div className="flex flex-col gap-1">
                        <span className="font-mono">{contrastInfo.ratio.toFixed(2)}:1</span>
                        <div className="flex gap-1 justify-center">
                            <span className={contrastInfo.wcagAA ? 'text-success' : 'text-destructive'}>
                                {contrastInfo.wcagAA ? '✓ AA' : '✗ AA'}
                            </span>
                            <span className={contrastInfo.wcagAAA ? 'text-success' : 'text-muted-foreground'}>
                                {contrastInfo.wcagAAA ? '✓ AAA' : '✗ AAA'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </td>
        </tr>
    );
};

export const TokenUsageTable = () => {
    const tokenKeys = useMemo(
        () => Object.keys(COLOR_TOKENS) as ColorTokenKey[],
        []
    );

    return (
        <div className="w-full overflow-auto my-8 rounded-lg border">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="table-header-row">
                        <th className="p-3 font-medium sticky left-0 bg-muted/50">Token</th>
                        <th className="p-3 font-medium">Light (HSL)</th>
                        <th className="p-3 font-medium">Dark (HSL)</th>
                        <th className="p-3 font-medium">Current (RGB)</th>
                        <th className="p-3 font-medium">Usage</th>
                        <th className="p-3 font-medium text-center">Contrast</th>
                    </tr>
                </thead>
                <tbody>
                    {tokenKeys.map((key) => (
                        <TokenRow key={key} tokenKey={key} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
