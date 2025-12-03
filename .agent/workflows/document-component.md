---
description: Standard workflow for documenting a new or existing component
---

1.  **Review Prerequisites**:
    *   **CRITICAL**: Read `documentation/DesignSystemChecklist.md`.
    *   Ensure you understand the required States, Color Tokens, and Dimensions.

2.  **Check Implementation**: Verify if the component exists in `components/[ComponentName].tsx`.
    *   If it exists, read it to understand its current state.
    *   If it does *not* exist, create it following the standards in the Checklist (using `Button`, `TextField` as references).

3.  **Create Documentation**: Create or update `documentation/components/[ComponentName].md`.
    *   Include **Structure** (HTML/JSX structure).
    *   Include **Styling Specifications** (Tailwind classes, dimensions, colors).
    *   Include **States** (Default, Hover, Focused, Disabled, Error).
    *   Include **Usage Guidelines**.
    *   **Verify against Checklist**: Ensure all tokens and sizes match `DesignSystemChecklist.md`.

3.  **Update Changelog**: Open `changelogs/changelogData.ts`.
    *   Add a new entry.
    *   **CRITICAL**: Set `date` to current date and `time` to current local time.
    *   Log the creation/documentation of the component.

4.  **Verify**: Ensure the implementation and documentation match exactly (e.g., class names, props).
