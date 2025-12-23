---
description: Update Diagram Canvas implementation to match the Diagram Specs
---

# Update Diagram from Specs

This workflow ensures that `DiagramCanvas.tsx` and related components adhere strictly to the rules defined in `diagram_specs.md`.

1.  **Read the Specs**:
    - Read the content of `diagram_specs.md` to understand the current rules for layout, node dimensions, and behavior. (Path: `/Users/tamyreslucas/.gemini/antigravity/brain/4c7c9c3a-d479-47dc-93ef-54f8689b2890/diagram_specs.md`)

2.  **Read the Implementation**:
    - Read `components/DiagramCanvas.tsx` to see the current implementation.

3.  **Analyze & Plan**:
    - Compare the specs against the code.
    - Identify any discrepancies in:
        - Constants (`X_SPACING`, `NODE_WIDTH`, etc.)
        - Layout Logic (Column calculation, sorting, etc.)
        - Visual Styles (Colors, stroke widths, markers)
    - If differences are found, plan the code changes required to align the code with the specs.

4.  **Apply Changes**:
    - Modify `DiagramCanvas.tsx` (or other relevant files) to implement the specs.
    - Ensure no regressions (e.g., maintain `TypeError` fixes).

5.  **Verify**:
    - Verify that the code compiles.
    - Verify that the logic logically follows the specs.

6.  **Complete**:
    - Notify the user that the diagram has been updated to match the specs.
