# Changelog

All notable changes to the Voxco Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
