# Diagram Canvas Component

The Diagram Canvas is the primary visualization area for the survey flow. It creates a node-link diagram representing the questions, logic, and paths within a survey using `React Flow`.

## Structure

It wraps the `ReactFlow` provider and component, rendering custom nodes and edges based on the survey data.

```tsx
<div className="w-full h-full bg-surface-container-low transition-colors duration-200">
  <ReactFlow
    nodes={nodes}
    edges={edges}
    nodeTypes={nodeTypes}
    edgeTypes={edgeTypes}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onNodeClick={...}
    onPaneClick={...}
    fitView
    minZoom={0.1}
    maxZoom={4}
  >
    <Background color="#71717a" gap={20} size={1} />
    <Controls className="bg-surface border-outline-variant fill-on-surface" />
    <DiagramToolbar onAddNode={...} />
  </ReactFlow>
</div>
```

## Styling Specifications

-   **Size**: `w-full h-full`
-   **Background**: `bg-surface-container-low` (Light grey/neutral background)
-   **Transition**: `transition-colors duration-200`
-   **Grid**:
    -   Color: `#71717a` (Zinc 500)
    -   Gap: `20px`
    -   Dot Size: `1px`

## Key Features

1.  **Survey Structure Visualization**: Converts the linear survey list into a graph structure (`Start -> Questions -> End`).
2.  **Interactive Selection**:
    -   Clicking a node selects the corresponding question in the Survey Editor.
    -   Clicking the background deselects items.
3.  **Dynamic Highlighting**:
    -   Highlights connected paths (Source handles, Edges, Input handles) when a node is selected.
4.  **Zoom & Pan**: Built-in navigation controls (`minZoom: 0.1`, `maxZoom: 4`).

## Components Used

-   **ReactFlow** (Library): Core diagramming engine.
-   **DiagramToolbar**: Floating action bar (currently hidden).
-   **Nodes**:
    -   `StartNodeComponent`
    -   `EndNodeComponent`
    -   `MultipleChoiceNodeComponent`
    -   `TextEntryNodeComponent`
    -   `DescriptionNodeComponent`

## Usage

Used as the main view in the `RightSidebar` (or central canvas area) when the "Survey Flow" or "Build" view is active. It requires a valid `Survey` object to generate the graph.
