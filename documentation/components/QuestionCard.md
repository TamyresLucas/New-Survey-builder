# QuestionCard

The `QuestionCard` component is the primary interface for viewing and editing individual survey questions. It supports various question types, drag-and-drop operations, and a specialized **Print View**.

## Props

The component accepts standard question data and callbacks, plus:

*   `printMode` (boolean): Optional. If `true`, renders the card in a simplified "Print View" state, hiding interactive controls. Defaults to `false`.

## Print View State

The Print View state is designed for generating static, printable representations of questions. It modifies the component structure as follows:

### Hidden Elements
In `printMode`, the following interactive elements are hidden to produce a clean output:

1.  **Question Type Selector**: The dropdown menu button in the header is removed.
2.  **Question Actions Menu**: The "More Actions" (three dots) button is removed.
3.  **Add/Remove Controls**:
    *   "Add row" / "Add column" buttons (Choice Grid).
    *   "Add choice" button (Radio/Checkbox).
    *   "Remove row" / "Remove column" / "Remove choice" buttons (X icons).
4.  **Drag Indicators**: Handles for reordering choices, rows, or questions are hidden.
5.  **Page Break Actions**: Interactive controls for Page Break questions are removed.

### Visual Changes
*   The overall card layout remains consistent (Grid based), maintaining visual parity with the editor but without "chrome".
*   The card border and spacing remain to distinguish questions in the printed list.
*   Field inputs (Text Entry areas) remain visible but static placeholders.

## Usage

```tsx
<QuestionCard
  question={questionData}
  survey={surveyData}
  // ... required callbacks
  printMode={true} // Enable Print View
/>
```

## Design Compliance

- [x] Supports `printMode` prop for static rendering.
- [x] Hides all non-essential UI elements (buttons, menus, drag handles) in Print View.
- [x] Preserves core layout and content visibility.
