/**
 * Color utility functions for the design system
 * Handles both static HSL values and dynamic color-mix() computed values
 */

import { COLOR_TOKENS, isStaticToken, type ColorTokenKey } from '@/tokens/colors';

/**
 * Parse HSL string to components (ONLY for static tokens)
 * @throws Error if HSL format is invalid
 */
export function parseHSL(hsl: string): { h: number; s: number; l: number } {
    const match = hsl.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);

    if (!match) {
        throw new Error(`Invalid HSL format: ${hsl}. Expected format: "H S% L%"`);
    }

    return {
        h: parseFloat(match[1]),
        s: parseFloat(match[2]),
        l: parseFloat(match[3]),
    };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

/**
 * Parse RGB string (from computed styles) to components
 * Handles: "rgb(255, 255, 255)" or "rgba(255, 255, 255, 1)"
 */
export function parseRGB(rgb: string): { r: number; g: number; b: number } | null {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;

    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
    };
}

/**
 * Calculate relative luminance (for contrast ratio)
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two RGB colors
 */
export function calculateContrastRatio(
    rgb1: { r: number; g: number; b: number },
    rgb2: { r: number; g: number; b: number }
): number {
    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function checkWCAGCompliance(contrastRatio: number): {
    aa: boolean;
    aaa: boolean;
    aaLarge: boolean;
    aaaLarge: boolean;
} {
    return {
        aa: contrastRatio >= 4.5,
        aaa: contrastRatio >= 7,
        aaLarge: contrastRatio >= 3,
        aaaLarge: contrastRatio >= 4.5,
    };
}

/**
 * Get CSS variable raw value from document
 * Returns the raw string (could be HSL or color-mix)
 */
export function getCSSVariableRaw(variable: string): string {
    if (typeof document === 'undefined') return '';
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
}

/**
 * Get COMPUTED color value for any token (works with color-mix!)
 * This resolves color-mix() to actual RGB values
 */
export function getComputedColorRGB(variable: string): { r: number; g: number; b: number } | null {
    if (typeof document === 'undefined') return null;

    const temp = document.createElement('div');
    temp.style.display = 'none';
    temp.style.backgroundColor = `var(${variable})`;
    document.body.appendChild(temp);

    const computed = getComputedStyle(temp).backgroundColor;
    document.body.removeChild(temp);

    return parseRGB(computed);
}

/**
 * Get contrast ratio between two CSS variables
 * Works with BOTH static and dynamic tokens!
 */
export function getContrastRatioBetweenVariables(
    variable1: string,
    variable2: string
): number | null {
    const rgb1 = getComputedColorRGB(variable1);
    const rgb2 = getComputedColorRGB(variable2);

    if (!rgb1 || !rgb2) return null;

    return calculateContrastRatio(rgb1, rgb2);
}

/**
 * Format RGB for display
 */
export function formatRGB(rgb: { r: number; g: number; b: number }): string {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Get static token HSL value safely
 */
export function getStaticTokenValue(
    tokenKey: ColorTokenKey,
    theme: 'light' | 'dark'
): string | null {
    const token = COLOR_TOKENS[tokenKey];
    if (isStaticToken(token)) {
        return token[theme];
    }
    return null;
}
