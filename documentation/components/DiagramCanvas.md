# DiagramCanvas Logic Visualization Rules

This document outlines the specific rules and logic used to render the survey flow diagram in `DiagramCanvas.tsx`.

## 1. Visual Edge Types

The diagram uses distinct edge styles to represent different types of logic flow:

| Logic Type | Condition | Visual Style | Notes |
| :--- | :--- | :--- | :--- |
| **Simple Sequence** | Flow from Question A to Question B with NO logic (Fallthrough) | **Solid Line** | Represents the natural flow of the survey. |
| **Implicit Next** | Logic says "Otherwise -> Next" (Default) | **Solid Line** | Treated as a sequence flow. |
| **Explicit Branch** | "Branch to [Specific Question/End]" | **Dashed Line** | Visualizes a jump or conditional path. |
| **Skip Logic** | "Skip to [Question]" | **Dashed Line** | Visualizes a skip. |
| **Divergent Otherwise** | "Otherwise -> [Specific Target]" (where target != Next) | **Dashed Line** | Represents a strict logic deviation. |

## 2. Swimlane Assignment (Generic Dynamic Algorithm)

The diagram dynamically organizes nodes into "Swimlanes" to visualize parallel logic paths without hardcoded IDs or path names.

### Algorithm Overview

1.  **Fork Point Detection**:
    *   The system scans the graph to identify **Fork Points**: any node with more than one outgoing edge (e.g., a Question with confirmed Branching Logic).

2.  **Branch Identity Propagation (Reachable Sets)**:
    *   For every child of a Fork Point, the system assigns a unique **Branch ID** (usually the child's ID or a generated ID).
    *   Using BFS, this Branch ID is propagated to all downstream descendants.
    *   Each node maintains a set of `reachableFrom` Branch IDs.

3.  **Convergence Detection**:
    *   **Convergence Nodes** are identified as nodes that are reachable from **more than one** distinct branch (or from a branch and the main path).
    *   These nodes represent the point where parallel paths merge back together.

4.  **Swimlane Assignment Rules**:
    *   **Shared Lane (Center)**: 
        *   The Start Node and End Node are always Shared.
        *   **Convergence Nodes** are forced into the Shared Lane.
        *   **Descendants** of Shared nodes inherit the Shared status (unless they themselves are new Fork Points).
    *   **Branch Lanes**:
        *   Nodes that are *uniquely* reachable from a specific Branch ID are assigned to that branch's specific Swimlane.
        *   Lanes are named dynamically (e.g., `branch-[ForkID]-[ChildID]`).

5.  **Layout Calculation**:
    *   **Shared Lane**: Y = 0.
    *   **Branch Lanes**: Offset alternately above and below the center (e.g., -400, +400, -800, +800) based on the order of discovery.
    *   **End Node**: Always positioned in the Shared Lane at the end of the graph.

## 3. Node Positioning

*   **X-Axis (Columns)**: Nodes are assigned to columns based on the longest path from the start node (DAG Layering).
*   **Y-Axis**: Nodes are grouped by their Swimlane within their column.
    *   Nodes in the **Shared Lane** are centered at Y=0.
    *   Nodes in **Branch Lanes** are centered at their lane's Y-offset.
    *   Within a lane group, nodes are stacked vertically based on their original survey order.
