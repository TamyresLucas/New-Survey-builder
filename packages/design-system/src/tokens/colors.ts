/**
 * Color Token Definitions
 * Supports both static HSL values and dynamic color-mix() derived tokens
 */

// Static token - has fixed HSL values
export interface StaticColorToken {
    type: 'static';
    variable: string;
    className: string;
    light: string;
    dark: string;
    usage: string;
    category: string;
}

// Dynamic token - computed via color-mix() at runtime
export interface DynamicColorToken {
    type: 'dynamic';
    variable: string;
    className: string;
    derivedFrom: string[];
    formula: string;
    usage: string;
    category: string;
}

export type ColorToken = StaticColorToken | DynamicColorToken;

export const COLOR_TOKENS: Record<string, ColorToken> = {
    // ============================================
    // BASE COLORS (Static)
    // ============================================
    background: {
        type: 'static',
        variable: '--background',
        className: 'bg-background',
        light: '0 0% 100%',
        dark: '222.2 84% 4.9%',
        usage: 'Main page background color',
        category: 'Base Colors'
    },
    foreground: {
        type: 'static',
        variable: '--foreground',
        className: 'text-foreground',
        light: '222.2 84% 4.9%',
        dark: '210 40% 98%',
        usage: 'Main text color for body content',
        category: 'Base Colors'
    },

    // ============================================
    // PRIMARY (Static)
    // ============================================
    primary: {
        type: 'static',
        variable: '--primary',
        className: 'bg-primary',
        light: '220 100% 50%',
        dark: '210 40% 98%',
        usage: 'Primary action buttons and main interactive elements',
        category: 'Primary'
    },
    'primary-foreground': {
        type: 'static',
        variable: '--primary-foreground',
        className: 'text-primary-foreground',
        light: '210 40% 98%',
        dark: '222.2 47.4% 11.2%',
        usage: 'Text color on primary-colored backgrounds',
        category: 'Primary'
    },

    // ============================================
    // SECONDARY (Dynamic - derived from primary)
    // ============================================
    secondary: {
        type: 'dynamic',
        variable: '--secondary',
        className: 'bg-secondary',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--primary)) 5%, hsl(var(--background)))',
        usage: 'Secondary buttons and less prominent interactive elements',
        category: 'Secondary'
    },
    'secondary-hover': {
        type: 'dynamic',
        variable: '--secondary-hover',
        className: 'hover:bg-secondary-hover',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--primary)) 15%, hsl(var(--background)))',
        usage: 'Hover state for secondary elements',
        category: 'Secondary'
    },
    'secondary-foreground': {
        type: 'static',
        variable: '--secondary-foreground',
        className: 'text-secondary-foreground',
        light: '222.2 47.4% 11.2%',
        dark: '210 40% 98%',
        usage: 'Text color on secondary-colored backgrounds',
        category: 'Secondary'
    },

    // ============================================
    // MUTED (Dynamic)
    // ============================================
    muted: {
        type: 'dynamic',
        variable: '--muted',
        className: 'bg-muted',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--primary)) 5%, hsl(var(--background)))',
        usage: 'Subtle backgrounds for muted content and disabled states',
        category: 'Muted'
    },
    'muted-foreground': {
        type: 'dynamic',
        variable: '--muted-foreground',
        className: 'text-muted-foreground',
        derivedFrom: ['--primary', '--foreground'],
        formula: 'color-mix(in oklab, hsl(var(--primary)) 30%, hsl(var(--foreground)))',
        usage: 'Text color for muted, de-emphasized, or secondary content',
        category: 'Muted'
    },
    'disabled-foreground': {
        type: 'dynamic',
        variable: '--disabled-foreground',
        className: 'text-disabled-foreground',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--primary)) 40%, hsl(var(--background)))',
        usage: 'Text color for disabled elements',
        category: 'Muted'
    },
    'placeholder-foreground': {
        type: 'static',
        variable: '--placeholder-foreground',
        className: 'placeholder-foreground',
        light: 'rgba(0, 0, 0, 0.6)',
        dark: 'rgba(255, 255, 255, 0.6)',
        usage: 'Placeholder text in input fields',
        category: 'Muted'
    },

    // ============================================
    // ACCENT (Dynamic)
    // ============================================
    accent: {
        type: 'dynamic',
        variable: '--accent',
        className: 'bg-accent',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--primary)) 10%, hsl(var(--background)))',
        usage: 'Accent backgrounds for highlights and hover states',
        category: 'Accent'
    },
    'accent-foreground': {
        type: 'static',
        variable: '--accent-foreground',
        className: 'text-accent-foreground',
        light: '222.2 47.4% 11.2%',
        dark: '210 40% 98%',
        usage: 'Text color on accent-colored backgrounds',
        category: 'Accent'
    },

    // ============================================
    // DESTRUCTIVE (Static + Dynamic variants)
    // ============================================
    destructive: {
        type: 'static',
        variable: '--destructive',
        className: 'bg-destructive',
        light: '0 84.2% 60.2%',
        dark: '0 62.8% 30.6%',
        usage: 'Error states, delete buttons, and dangerous actions',
        category: 'Destructive'
    },
    'destructive-foreground': {
        type: 'static',
        variable: '--destructive-foreground',
        className: 'text-destructive-foreground',
        light: '210 40% 98%',
        dark: '210 40% 98%',
        usage: 'Text color on destructive-colored backgrounds',
        category: 'Destructive'
    },
    'background-destructive': {
        type: 'dynamic',
        variable: '--background-destructive',
        className: 'bg-background-destructive',
        derivedFrom: ['--destructive', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--destructive)) 10%, hsl(var(--background)))',
        usage: 'Subtle background for error/destructive contexts',
        category: 'Destructive'
    },
    'border-destructive': {
        type: 'dynamic',
        variable: '--border-destructive',
        className: 'border-destructive',
        derivedFrom: ['--destructive', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--destructive)) 50%, hsl(var(--background)))',
        usage: 'Border color for error/destructive contexts',
        category: 'Destructive'
    },

    // ============================================
    // SUCCESS (Static + Dynamic variants)
    // ============================================
    success: {
        type: 'static',
        variable: '--success',
        className: 'bg-success',
        light: '142 76% 36%',
        dark: '142 70% 45%',
        usage: 'Success states and positive actions',
        category: 'Semantic States'
    },
    'success-foreground': {
        type: 'static',
        variable: '--success-foreground',
        className: 'text-success-foreground',
        light: '210 40% 98%',
        dark: '144 61% 20%',
        usage: 'Text color on success backgrounds',
        category: 'Semantic States'
    },
    'background-success': {
        type: 'dynamic',
        variable: '--background-success',
        className: 'bg-background-success',
        derivedFrom: ['--success', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--success)) 10%, hsl(var(--background)))',
        usage: 'Subtle background for success contexts',
        category: 'Semantic States'
    },
    'border-success': {
        type: 'dynamic',
        variable: '--border-success',
        className: 'border-success',
        derivedFrom: ['--success', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--success)) 50%, hsl(var(--background)))',
        usage: 'Border color for success contexts',
        category: 'Semantic States'
    },

    // ============================================
    // WARNING (Static + Dynamic variants)
    // ============================================
    warning: {
        type: 'static',
        variable: '--warning',
        className: 'bg-warning',
        light: '38 92% 50%',
        dark: '38 92% 50%',
        usage: 'Warning states and caution messages',
        category: 'Semantic States'
    },
    'warning-foreground': {
        type: 'static',
        variable: '--warning-foreground',
        className: 'text-warning-foreground',
        light: '210 40% 98%',
        dark: '48 96% 89%',
        usage: 'Text color on warning backgrounds',
        category: 'Semantic States'
    },
    'background-warning': {
        type: 'dynamic',
        variable: '--background-warning',
        className: 'bg-background-warning',
        derivedFrom: ['--warning', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--warning)) 10%, hsl(var(--background)))',
        usage: 'Subtle background for warning contexts',
        category: 'Semantic States'
    },
    'border-warning': {
        type: 'dynamic',
        variable: '--border-warning',
        className: 'border-warning',
        derivedFrom: ['--warning', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--warning)) 50%, hsl(var(--background)))',
        usage: 'Border color for warning contexts',
        category: 'Semantic States'
    },

    // ============================================
    // INFO (Dynamic - uses primary)
    // ============================================
    info: {
        type: 'dynamic',
        variable: '--info',
        className: 'bg-info',
        derivedFrom: ['--primary'],
        formula: 'var(--primary)',
        usage: 'Informational messages',
        category: 'Semantic States'
    },
    'info-foreground': {
        type: 'dynamic',
        variable: '--info-foreground',
        className: 'text-info-foreground',
        derivedFrom: ['--primary-foreground'],
        formula: 'var(--primary-foreground)',
        usage: 'Text color on info backgrounds',
        category: 'Semantic States'
    },
    'background-info': {
        type: 'dynamic',
        variable: '--background-info',
        className: 'bg-background-info',
        derivedFrom: ['--info', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--info)) 10%, hsl(var(--background)))',
        usage: 'Subtle background for info contexts',
        category: 'Semantic States'
    },
    'border-info': {
        type: 'dynamic',
        variable: '--border-info',
        className: 'border-info',
        derivedFrom: ['--info', '--background'],
        formula: 'color-mix(in oklab, hsl(var(--info)) 50%, hsl(var(--background)))',
        usage: 'Border color for info contexts',
        category: 'Semantic States'
    },

    // ============================================
    // BORDERS & INPUTS (Dynamic)
    // ============================================
    border: {
        type: 'dynamic',
        variable: '--border',
        className: 'border-border',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, color-mix(in oklab, hsl(var(--primary)), hsl(0 0% 70%) 40%) 50%, hsl(var(--background)))',
        usage: 'Border color for dividers and component outlines',
        category: 'Borders & Inputs'
    },
    input: {
        type: 'dynamic',
        variable: '--input',
        className: 'border-input',
        derivedFrom: ['--primary', '--background'],
        formula: 'color-mix(in oklab, color-mix(in oklab, hsl(var(--primary)), hsl(0 0% 70%) 40%) 50%, hsl(var(--background)))',
        usage: 'Border color specifically for input fields',
        category: 'Borders & Inputs'
    },
    ring: {
        type: 'static',
        variable: '--ring',
        className: 'ring-ring',
        light: '222.2 84% 4.9%',
        dark: '212.7 26.8% 83.9%',
        usage: 'Focus ring color for keyboard navigation and accessibility',
        category: 'Borders & Inputs'
    },

    // ============================================
    // POPOVERS & CARDS (Static)
    // ============================================
    popover: {
        type: 'static',
        variable: '--popover',
        className: 'bg-popover',
        light: '0 0% 100%',
        dark: '222.2 84% 4.9%',
        usage: 'Background for popovers, dropdowns, and floating menus',
        category: 'Popovers & Cards'
    },
    'popover-foreground': {
        type: 'static',
        variable: '--popover-foreground',
        className: 'text-popover-foreground',
        light: '222.2 84% 4.9%',
        dark: '210 40% 98%',
        usage: 'Text color for content inside popovers',
        category: 'Popovers & Cards'
    },
    card: {
        type: 'static',
        variable: '--card',
        className: 'bg-card',
        light: '0 0% 100%',
        dark: '222.2 84% 4.9%',
        usage: 'Background for card containers and elevated surfaces',
        category: 'Popovers & Cards'
    },
    'card-foreground': {
        type: 'static',
        variable: '--card-foreground',
        className: 'text-card-foreground',
        light: '222.2 84% 4.9%',
        dark: '210 40% 98%',
        usage: 'Text color for content inside cards',
        category: 'Popovers & Cards'
    },

    // ============================================
    // CHARTS (Static)
    // ============================================
    'chart-1': {
        type: 'static',
        variable: '--chart-1',
        className: 'bg-chart-1',
        light: '12 76% 61%',
        dark: '220 70% 50%',
        usage: 'First chart color in data visualizations',
        category: 'Charts'
    },
    'chart-2': {
        type: 'static',
        variable: '--chart-2',
        className: 'bg-chart-2',
        light: '173 58% 39%',
        dark: '160 60% 45%',
        usage: 'Second chart color in data visualizations',
        category: 'Charts'
    },
    'chart-3': {
        type: 'static',
        variable: '--chart-3',
        className: 'bg-chart-3',
        light: '197 37% 24%',
        dark: '30 80% 55%',
        usage: 'Third chart color in data visualizations',
        category: 'Charts'
    },
    'chart-4': {
        type: 'static',
        variable: '--chart-4',
        className: 'bg-chart-4',
        light: '43 74% 66%',
        dark: '280 65% 60%',
        usage: 'Fourth chart color in data visualizations',
        category: 'Charts'
    },
    'chart-5': {
        type: 'static',
        variable: '--chart-5',
        className: 'bg-chart-5',
        light: '27 87% 67%',
        dark: '340 75% 55%',
        usage: 'Fifth chart color in data visualizations',
        category: 'Charts'
    },
} as const;

export type ColorTokenKey = keyof typeof COLOR_TOKENS;

// Type guards
export function isStaticToken(token: ColorToken): token is StaticColorToken {
    return token.type === 'static';
}

export function isDynamicToken(token: ColorToken): token is DynamicColorToken {
    return token.type === 'dynamic';
}

/**
 * Get all tokens grouped by category
 */
export function getTokensByCategory(): Record<string, ColorToken[]> {
    const grouped: Record<string, ColorToken[]> = {};

    Object.values(COLOR_TOKENS).forEach((token) => {
        if (!grouped[token.category]) {
            grouped[token.category] = [];
        }
        grouped[token.category].push(token);
    });

    return grouped;
}

/**
 * Get token by key with type safety
 */
export function getToken(key: ColorTokenKey): ColorToken {
    return COLOR_TOKENS[key];
}
