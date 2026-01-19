import type { Meta, StoryObj } from '@storybook/react';
import { ColorPaletteStressTest, PRESET_PALETTES } from './ColorPaletteStressTest';

/**
 * # Color Palette Stress Test
 * 
 * This story validates the design system's color token structure under extreme
 * palette configurations. It simulates scenarios that could break:
 * 
 * - **Primary-foreground visibility** on primary backgrounds
 * - **Muted colors** becoming too similar to background
 * - **Hover/active states** (e.g., `hover:bg-primary/10`) blending invisibly
 * - **Dark/light mode mismatches** during transitions
 * 
 * ## Preset Palettes
 * 
 * | Preset | Risk | Description |
 * |--------|------|-------------|
 * | `default` | ✓ Safe | Standard shadcn colors |
 * | `nearWhitePrimary` | ⚠️ High | Near-white primary breaks contrast on white bg |
 * | `nearBlackPrimary` | ⚠️ High | Near-black primary on near-black bg |
 * | `neonOnLight` | ⚠️ Medium | Neon green has poor text readability |
 * | `saturatedPastel` | ⚠️ Medium | Hot pink on lavender - low contrast |
 * | `invertedContrast` | ✓ Safe | White on black (high contrast) |
 * | `lowContrastMuted` | ⚠️ Critical | All mid-grays - nearly invisible |
 * 
 * ## WCAG Compliance
 * 
 * The contrast validation panel shows real-time WCAG 2.1 compliance:
 * - **AA** requires 4.5:1 for normal text
 * - **AAA** requires 7:1 for enhanced accessibility
 * - Large text (18px+) can use 3:1 for AA
 */
const meta: Meta<typeof ColorPaletteStressTest> = {
    title: 'Design Patterns/Color Palette Stress Test',
    component: ColorPaletteStressTest,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Visual stress testing for color palette configurations. Tests shadcn CSS variable structure under dynamic overrides.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        preset: {
            control: 'select',
            options: Object.keys(PRESET_PALETTES),
            description: 'Initial palette preset to load',
            table: {
                defaultValue: { summary: 'default' },
            },
        },
        showContrastValidation: {
            control: 'boolean',
            description: 'Show WCAG contrast validation panel',
            table: {
                defaultValue: { summary: true },
            },
        },
        showMobileSimulation: {
            control: 'boolean',
            description: 'Show 320px mobile simulation card',
            table: {
                defaultValue: { summary: true },
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ColorPaletteStressTest>;

/**
 * Default palette with safe, accessible colors.
 * All contrast ratios meet WCAG AA requirements.
 */
export const Default: Story = {
    args: {
        preset: 'default',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
};

/**
 * ⚠️ **HIGH RISK**: Near-white primary on white background.
 * 
 * This preset demonstrates what happens when:
 * - Primary color is almost indistinguishable from background
 * - Primary buttons become nearly invisible
 * - Active/hover states may not be perceptible
 * 
 * Expected failures:
 * - Primary/BG contrast < 1.5:1
 * - Primary foreground may fail
 */
export const NearWhitePrimary: Story = {
    args: {
        preset: 'nearWhitePrimary',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
    parameters: {
        docs: {
            description: {
                story: '⚠️ Near-white primary (#FAFAFA) on white background - simulates broken contrast.',
            },
        },
    },
};

/**
 * ⚠️ **HIGH RISK**: Near-black colors on near-black background.
 * 
 * This preset simulates dark mode gone wrong:
 * - Primary and background both near-black
 * - Text may be invisible
 * - No visual hierarchy
 */
export const NearBlackPrimary: Story = {
    args: {
        preset: 'nearBlackPrimary',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
    parameters: {
        docs: {
            description: {
                story: '⚠️ Near-black primary (#0A0A0A) on near-black background (#0F0F0F).',
            },
        },
    },
};

/**
 * ⚠️ **MEDIUM RISK**: Neon green on white background.
 * 
 * While technically passing some contrast checks, neon colors:
 * - Cause eye strain
 * - May fail for colorblind users
 * - Text on neon backgrounds is hard to read
 */
export const NeonOnLight: Story = {
    args: {
        preset: 'neonOnLight',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
    parameters: {
        docs: {
            description: {
                story: '⚠️ Neon green (#00FF00) - high saturation, poor text readability.',
            },
        },
    },
};

/**
 * ⚠️ **MEDIUM RISK**: Saturated pastel combination.
 * 
 * Hot pink on lavender blush:
 * - Low contrast between similar hues
 * - Muted text may disappear
 * - Problematic for users with color vision deficiencies
 */
export const SaturatedPastel: Story = {
    args: {
        preset: 'saturatedPastel',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
    parameters: {
        docs: {
            description: {
                story: '⚠️ Hot pink (#FF69B4) on lavender blush (#FFF0F5) - similar hue, low contrast.',
            },
        },
    },
};

/**
 * ✓ **SAFE**: Inverted high-contrast scheme.
 * 
 * White on black provides excellent contrast:
 * - 21:1 contrast ratio (maximum)
 * - Good for accessibility
 * - Tests dark mode implementation
 */
export const InvertedContrast: Story = {
    args: {
        preset: 'invertedContrast',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
    parameters: {
        docs: {
            description: {
                story: '✓ White (#FFFFFF) on black (#000000) - maximum contrast (21:1).',
            },
        },
    },
};

/**
 * ⚠️ **CRITICAL RISK**: All mid-gray colors.
 * 
 * This is the worst-case scenario:
 * - All colors are similar mid-grays
 * - Nearly impossible to distinguish elements
 * - Complete accessibility failure
 * 
 * Expected: All contrast checks should fail.
 */
export const LowContrastMuted: Story = {
    args: {
        preset: 'lowContrastMuted',
        showContrastValidation: true,
        showMobileSimulation: true,
    },
    parameters: {
        docs: {
            description: {
                story: '⚠️ CRITICAL: All mid-grays (#888888, #999999, #777777) - complete contrast failure.',
            },
        },
    },
};

/**
 * Minimal view without validation panels.
 * Useful for focused component testing.
 */
export const MinimalView: Story = {
    args: {
        preset: 'default',
        showContrastValidation: false,
        showMobileSimulation: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Minimal view without contrast validation or mobile simulation panels.',
            },
        },
    },
};
