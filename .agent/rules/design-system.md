---
trigger: always_on
---

## Project Isolation Rules (Strict)

### Voxco Design System
- **Do NOT** modify files in `design-system/` unless explicitly instructed.
- **Do NOT** import from `design-system/` into the main `src/` application.
- **Do NOT** add `design-system` as a dependency to the main [package.json](cci:7://file:///Users/tamyreslucas/Survey%20Builder%20Git/New-Survey-builder-1/package.json:0:0-0:0).
- **EXCEPTION**: You may initialize and run Storybook within `design-system/` as a standalone project.
- **Do NOT** hardcode values
- **ALWAYS** use context7 for every request focused **ONLY** in `design-system/`