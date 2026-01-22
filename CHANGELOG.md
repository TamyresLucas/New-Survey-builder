# Changelog

## [Unreleased]

### Changed
- Removed unused stories (`DarkModePreview`, `InteractiveDemo`, `CustomTheme`, `WithEndAction`) from `ToolboxItem` component documentation in Storybook.
- Refactored `ColorPaletteEditor` to "Product Color Palette" with dropdown support for multiple products (Voxco, Ascribe, Discuss).
- Updated synchronization logic: **Primary color** is unique per product, while all other colors (Success, Warning, Charts) are shared globally across products using local storage.
- Standardized Typography storage to `global-typography-shared` to enforce global consistency across all products.
