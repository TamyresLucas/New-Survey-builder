# Custom Node Handles

These components wrap the React Flow `Handle` primitive to provide consistent styling and alignment for the survey diagram.

## Components

### InputHandle

The standard entry point for connections, positioned on the **left** edge of a node.

-   **Type**: `target`
-   **Position**: `Position.Left`
-   **Offset**: `left: -5px` (Centered on border)
-   **Vertical Align**: `top: 50%`, `translateY(-50%)` (Centered on container height)

### OutputHandle

The generic exit point for connections, positioned on the **right** edge of a node (used by Start, Text Entry, Description).

-   **Type**: `source`
-   **Position**: `Position.Right`
-   **Offset**: `right: -5px` (Centered on border)
-   **Vertical Align**: `top: 50%`, `translateY(-50%)` (Centered on container height)

## Styling Specifications

Shared styles (`handleStyle`):

-   **Size**: `10px` x `10px`
-   **Background**: `bg-surface` (`var(--background--surface-bg-def)`) - Always hollow/filled with surface color.
-   **Border**: `2px solid`
-   **Z-Index**: `50` (Ensures handles sit above card borders)

## States

| State | Border Color |
| :--- | :--- |
| **Default** | `var(--diagram-edge-def)` (Grey) |
| **Highlighted** | `var(--semantic-pri)` (Blue) |

*Controlled via the `highlighted` prop.*

## Usage

Imported and used within custom node components. `InputHandle` usually goes in the node body/main area. `OutputHandle` goes in the node body or footer.
