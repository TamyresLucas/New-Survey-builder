# Changelog

All notable changes to the Voxco Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Foresight Storybook Home Page (2026-01-21)
- Created `Welcome.mdx` with Foresight Design System branding
- Replaced "Quick Start" and "Documentation" list with interactive navigation cards
- Modern gradient styling with dark mode support
- Updated `preview.ts` storySort to show Foresight first
- Updated "Built for discuss's values" section to use Card components in a 3-column grid layout
- Removed explicit "Documentation" header for a cleaner flow

#### FileUpload (Dropzone) Token Standardization (2026-01-21)
- Replaced hardcoded `text-white` with `text-destructive-foreground` in remove button
- Changed default border from `border-muted-foreground/25` to `border-primary/20`
- Updated drag active background from `bg-primary/5` to `bg-primary/10` for consistency

#### Design Tokens Colors Page UX Improvements (2026-01-21)
- **DynamicColorPalette.tsx**:
  - Redesigned color swatches with card layout and larger previews (h-20)
  - Added click-to-copy functionality with visual feedback
  - Added "Dynamic" badge for color-mix derived tokens
  - Added category icons (Material Symbols) for visual hierarchy
  - Improved hover effects with scale and shadow transitions
  - Responsive grid: 2→3→4→5 columns based on viewport
- **Colors.mdx**:
  - Added hero section with gradient background
  - Redesigned Quick Reference as interactive cards
  - Added Material Symbols icons to section headers
  - Improved visual hierarchy with consistent spacing

#### HSL Tokens for Shadcn Compatibility (2026-01-20)
- **tokens.css HSL Layer**:
  - Added HSL format tokens parallel to existing HEX semantic tokens
  - Light mode: `--semantic-pri-hsl: 233 86% 64%`, `--semantic-suc-hsl`, `--semantic-err-hsl`, `--semantic-warn-hsl`, `--semantic-info-hsl`
  - Dark mode: `--semantic-pri-hsl: 235 100% 86%` with appropriate dark mode HSL values
  - Surface HSL tokens: `--surface-hsl`, `--surface-dim-hsl`, `--surface-container-hsl`
  - Text HSL tokens: `--text-pri-hsl`, `--text-on-primary-hsl`
- **index.css HSL Migration**:
  - Updated Shadcn variables to reference HSL tokens (e.g., `--primary: var(--semantic-pri-hsl)`)
  - Enables Tailwind opacity utilities like `text-primary/40`, `bg-primary/10`
- **tailwind.config.js HSL Wrappers**:
  - Wrapped all color definitions with `hsl()` function (e.g., `hsl(var(--primary))`)
  - Required for Tailwind to apply opacity modifiers correctly

### Fixed

#### Sidebar Section Text Style Consistency (2026-01-20)
- Updated sidebar section headings (`h3`) to use the same text style tokens as the settings card header
- Changed from `text-sm font-semibold` to `font-semibold leading-none tracking-tight`
- Maintains `text-muted-foreground` color for visual hierarchy distinction
- Ensures typography consistency across patterns

#### NavigationMenu Hover and Selected State Refactor (2026-01-20)
- **Default state**: Unchanged (`bg-background`)
- **Hover state**: Now only changes text color to `accent-foreground` (removed background color change)
- **Selected state** (`data-[state=open]`): Changed background to `bg-accent` (was using color-mix)
- **Selected + Hover**: Text color changes to `accent-foreground`
- Simplified styling by removing complex color-mix calculations for cleaner, token-based approach

#### Restoration of Default Tabs Styling with Refinements (2026-01-20)
- Reverted `Tabs` component to default Shadcn UI styling
- `TabsList`: Changed to `bg-primary/10` rounded pill style (tinted background)
- `TabsTrigger`: Changed to card-style, added `hover:text-accent-foreground` for consistent interaction feedback (even on active state)


#### DataGrid Styling Alignment (2026-01-20)
- Updated `lytenyte-grid.css` to match `Table` component styling exactly
- **Header**: Transparent background, `muted-foreground` text, medium weight
- **Selection**: Removed background color, added `primary` text color and inset box-shadow
- **Cells**: Removed vertical borders for cleaner look
- Disabled alternating row colors to match Table default
- **Refinement**: Updated hover opacity to 10% (was 20%) for both Table and DataGrid
- **Refinement**: Removed background color from Table and DataGrid headers (now transparent)
- **Refinement**: Added opaque background (`bg-background`) to Table and DataGrid components
- **Fix**: Updated `--surface-hsl` (mapped to `--background`) to pure white `0 0% 100%` in light mode (was tinted blue)
- **Refinement**: Removed `bg-muted/50` from `TableFooter` (now transparent) to match row styling
- **Refinement**: Updated DataGrid header hover text to remain `muted-foreground` (was changing to `accent-foreground`)
- **Fix**: Updated `TableRowActions` to correctly apply `destructive` styling (red hover) to Delete actions by using `DropdownMenuItem`'s variant prop
- **Refinement**: Updated `--accent-foreground` to use `var(--primary)` (primary 100%) instead of white, ensuring better visibility on accent backgrounds
- **Refinement**: Updated DataGrid header hover text to use `hsl(var(--accent-foreground))` (primary color) instead of `muted-foreground`

#### Editable Cell Hover Styling (2026-01-20)
- Added `data-ln-editable` attribute to `Grid.Cell` in `LyteNyteGrid.tsx`
- Added hover style `color: hsl(var(--accent-foreground))` for editable cells in `lytenyte-grid.css`

#### Disabled Label Colors (2026-01-20)
- Standardized `Label` component disabled state to match `Button` and inputs
- Updated `peer-disabled` styles to use `text-primary/40` token and `opacity-50` opacity (was `opacity-70`)

#### Focus Ring Token (2026-01-20)
- Updated `--ring` variable in `index.css` to use `var(--semantic-pri-hsl)`
- Fixes issue where focus rings were not appearing because Tailwind ring utilities require HSL values

#### Accent Token Refinement (2026-01-20)
- **tokens.css**: Added `--surface-accent-hsl` token for Light (95% lightness) and Dark (20% lightness) modes.
- **index.css**:
  - Updated `--accent` to use `var(--surface-accent-hsl)` for lighter background on hover/active states.
  - Updated `--accent-foreground` to use `var(--text-pri-hsl)` to ensure contrasting text color on accent backgrounds.

#### Button Outline Hover Text Color (2026-01-20)
- Fixed outline button text changing to white on hover
- Added explicit `text-primary` to maintain primary text color
- Replaced complex `color-mix` hover background with `hover:bg-primary/10`
- Removed `hover:text-accent-foreground` that was causing the issue

#### Fase 0 - Design System Consolidation (2026-01-20)
- **Token Connection Architecture**:
  - Updated `index.css` `:root` and `.dark` to use semantic tokens from `tokens.css`
  - Connected `--primary` to `var(--semantic-pri)`, `--destructive` to `var(--semantic-err)`, etc.
  - Connected `--background` to `var(--md-sys-color-surface)` for Material Design 3 compatibility
- **Tailwind Configuration**:
  - Removed `hsl()` wrappers from all color definitions in `tailwind.config.js`
  - Colors now use direct `var(--token-name)` since tokens contain full color values
  - Charts retain `hsl()` wrapper as they use HSL channel values
- **Root Project Configuration**:
  - Created `tailwind.config.js` in project root with DS paths in `content` array
  - Added React dedupe to `vite.config.ts` to prevent multiple React instances
- **Governance**:
  - Created `eslint.config.js` with `no-restricted-imports` rule for DS import enforcement
  - Created `scripts/audit-colors.sh` for hardcoded color detection
  - Created `scripts/measure-adoption.sh` for DS adoption metrics tracking

#### TypeScript Build Fixes (2026-01-20)
- Fixed `ChoiceEliminationEditor.tsx` to use `QuestionType` enum instead of string literals
- Added `MoreIcon` export as alias to `MoreVertIcon` in `icons.tsx`
- Added `MoreIcon` import in `SidebarCard.tsx`
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
- Updated `switch.tsx` to use `primary` for the active state background and `primary/20` for the inactive state background to ensure WCAG compliance.

- Design Tokens/Colors page now shows static vs dynamic token distinction
- Token reference table includes WCAG AA/AAA compliance indicators

### Fixed

#### Badge and Toast Soft Aesthetic Standardization (2026-01-19)
- Refactored `badge.tsx` semantic variants (`destructive`, `success`, `warning`, `secondary`) to use soft styling pattern
- Refactored `toast.tsx` semantic variants (`destructive`, `success`, `warning`, `info`) to use soft styling pattern
- Applied consistent opacity-based class pattern:
  - Border: `border-{color}/50` (50% opacity)
  - Background: `bg-{color}/10` (10% opacity)
  - Text: `text-foreground` (solid foreground color for readability)
- Badge `secondary` variant now uses `info` color tokens as per design spec
- Replaced legacy `variant-*` custom utility classes with explicit Tailwind classes for better maintainability

#### Alert Soft Aesthetic Standardization (2026-01-19)
- Refactored `alert.tsx` semantic variants (`destructive`, `success`, `warning`, `info`) to use soft styling pattern
- Applied consistent opacity-based class pattern:
  - Border: `border-{color}/50` (50% opacity)
  - Background: `bg-{color}/10` (10% opacity)
  - Text: `text-foreground` (solid foreground color for readability)
  - Icons: `[&>svg]:text-{color}` (colored icons)

#### Badge, Toast, and Alert Icon Color Integration (2026-01-19)
- Updated `badge.tsx`, `toast.tsx`, and `alert.tsx` variants to include `[&>svg]:text-{color}` AND `[&>.material-symbols-rounded]:text-{color}`
- Solves issue where Material Symbols icons appeared black because `[&>svg]` selector did not target them
- Ensures uniform icon coloring across all component types (SVG and Font Icons)
- completes the Soft Aesthetic Standardization across Alert, Badge, and Toast components

#### Opaque Background Standardization (2026-01-19)
- Updated `badge.tsx`, `toast.tsx`, and `alert.tsx` to use solid color-mix backgrounds instead of transparency
- New pattern: `bg-[color-mix(in_oklab,hsl(var(--{color})),hsl(var(--background))_90%)]`
- Solves visual glitches when components are placed on non-white backgrounds while maintaining the tinted aesthetic

#### Table Stories Badge Tokens (2026-01-19)
- Fixed hardcoded `bg-green-500` color in Table.stories.tsx badges
- Replaced `variant="default" className="bg-green-500"` with `variant="success"` in `getStatusBadge()` function
- Updated SurveyResponses story "Complete" badges to use `variant="success"` instead of hardcoded color override
- Now properly uses design system tokens (`bg-success-background`, `border-success-border`) for theme compliance

## [0.1.0] - 2026-01-01

### Added
- Initial design system setup with shadcn/ui components
- Storybook documentation framework
- Core UI components (Button, Input, Card, etc.)
- Design token system with CSS variables
