import { useState } from 'react';
import { COLOR_TOKENS, isStaticToken, isDynamicToken } from '@/tokens/colors';
import { cn } from '@/lib/utils';
import { getComputedColorRGB, formatRGB } from '@/lib/color-utils';

export const ColorExportButton = () => {
    const [copied, setCopied] = useState(false);

    const exportToJSON = () => {
        // Build export with computed values for dynamic tokens
        const exportData: Record<string, unknown> = {
            metadata: {
                name: 'Voxco Design System Colors',
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                note: 'Dynamic tokens show computed RGB values at export time',
            },
            tokens: {},
        };

        Object.entries(COLOR_TOKENS).forEach(([key, token]) => {
            if (isStaticToken(token)) {
                (exportData.tokens as Record<string, unknown>)[key] = {
                    type: 'static',
                    variable: token.variable,
                    light: token.light,
                    dark: token.dark,
                    usage: token.usage,
                    category: token.category,
                };
            } else if (isDynamicToken(token)) {
                const computedRGB = getComputedColorRGB(token.variable);
                (exportData.tokens as Record<string, unknown>)[key] = {
                    type: 'dynamic',
                    variable: token.variable,
                    formula: token.formula,
                    derivedFrom: token.derivedFrom,
                    computedValue: computedRGB ? formatRGB(computedRGB) : 'Unable to compute',
                    usage: token.usage,
                    category: token.category,
                };
            }
        });

        const json = JSON.stringify(exportData, null, 2);

        // Copy to clipboard
        navigator.clipboard.writeText(json).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });

        // Trigger download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-tokens.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={exportToJSON}
            className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
        >
            {copied ? '✓ Copied & Downloaded!' : '📥 Export Tokens'}
        </button>
    );
};
