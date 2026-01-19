# Changelog

All notable changes to the Voxco Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Typography Stress Test (2026-01-19)
- Added `TypographyStressTest.tsx` component for visual stress testing of typography configurations
- Added `TypographyStressTest.stories.tsx` with 4 story variants:
  - `Default` - Interactive font switching across all scenarios
  - `WithInter` - Baseline test with default Inter font
  - `WithRoboto` - Cross-font compatibility test
  - `WithPlayfairDisplay` - Serif font extreme stress test
- Includes 5 stress test scenarios:
  - Scenario A: Standard width question card with long wrapping text
  - Scenario B: Mobile width (320px) constrained layout
  - Scenario C: Nested typography with all heading levels (H1-H4)
  - Scenario D: All text sizes (xs to 4xl) side-by-side
  - Scenario E: Component integration (Alerts with typography)
- Real-time font family switching with instant DOM updates
- Validates line-height and vertical rhythm preservation

#### Typography Design Tokens Refactor (2026-01-19)
- Added typography tokens to `src/styles/tokens.css`:
  - Font family primitives: `--font-family-sans`, `--font-family-heading`, `--font-family-body`
  - Font size scale: `--font-size-xs` through `--font-size-4xl`
  - Line heights: `--line-height-none` through `--line-height-loose`
  - Font weights: `--font-weight-normal` through `--font-weight-extrabold`
  - Semantic tokens: `--typography-h1-size`, `--typography-body-size`
- Added Google Fonts Inter import in `src/index.css` for Ghost Font Prevention
- Added compatibility bridge: `--font-sans` now points to `var(--font-family-sans)`
- Updated `tailwind.config.js` with array syntax for fontSize (includes lineHeight)
- Refactored `FontPreview.tsx` to use direct DOM manipulation (no custom events)
- Refactored `TypeScale.tsx` to use Tailwind classes instead of inline styles
- Simplified `.storybook/preview.ts` decorator (removed event listeners)
- Updated `Typography.mdx` documentation with CSS Variable columns

#### Color Palette Stress Test (2026-01-19)
- Added `ColorPaletteStressTest.tsx` component for visual stress testing of color configurations
- Added `ColorPaletteStressTest.stories.tsx` with 8 preset stories for extreme palette testing
- Includes 7 extreme palette presets:
  - `default` - Standard safe colors
  - `nearWhitePrimary` - Near-white primary (#FAFAFA) on white background
  - `nearBlackPrimary` - Near-black primary on near-black background
  - `neonOnLight` - Neon green (#00FF00) for poor readability testing
  - `saturatedPastel` - Hot pink on lavender for low hue contrast
  - `invertedContrast` - White on black (maximum contrast)
  - `lowContrastMuted` - All mid-grays (accessibility failure simulation)
- Real-time WCAG 2.1 AA/AAA contrast validation
- Interactive color pickers for custom palette testing
- Mobile simulation (320px width) for constrained layout testing
- Dark mode toggle with palette persistence

#### Dynamic Color Palette System (2026-01-19)
- Added `src/tokens/colors.ts` with typed token definitions
  - `StaticColorToken` interface for fixed HSL values
  - `DynamicColorToken` interface for color-mix() derived tokens
  - Complete `COLOR_TOKENS` record with 40+ tokens grouped by category
  - Type guards: `isStaticToken()`, `isDynamicToken()`
  - Utility functions: `getTokensByCategory()`, `getToken()`
- Added `src/tokens/index.ts` for module exports
- Added `src/lib/color-utils.ts` with color utility functions:
  - HSL parsing and RGB conversion
  - WCAG contrast ratio calculations
  - `getComputedColorRGB()` for dynamic token value resolution
  - `checkWCAGCompliance()` for accessibility validation
- Added `ColorExportButton.tsx` for JSON export functionality
- Updated `DynamicColorPalette.tsx` with new token system
- Updated `TokenUsageTable.tsx` with WCAG contrast display
- Updated `Colors.mdx` documentation

### Changed
- Design Tokens/Colors page now shows static vs dynamic token distinction
- Token reference table includes WCAG AA/AAA compliance indicators

### Fixed
- N/A

## [0.1.0] - 2026-01-01

### Added
- Initial design system setup with shadcn/ui components
- Storybook documentation framework
- Core UI components (Button, Input, Card, etc.)
- Design token system with CSS variables
