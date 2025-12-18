# Description Node Component

Renders a static text or information block. It connects linearly in the flow (Input -> Output).

## Structure

```tsx
<div className="relative w-80 bg-surface-container border rounded-lg shadow-lg ...">
  {/* Header */}
  <header className="p-3 border-b ...">
     <DescriptionIcon /> Title
  </header>

  {/* Body */}
  <main className="p-3 relative">
      <InputHandle highlighted={highlightInputHandle} />
      <div className="bg-surface ... max-h-24 overflow-y-auto">
         {questionText}
      </div>
      <OutputHandle highlighted={highlightSourceHandles} />
  </main>
</div>
```

## Styling Specifications

-   **Width**: `w-80`
-   **Content**: Scrollable area (`max-h-24 overflow-y-auto`) for potentially long description text.

## Connections

-   **Input**: Single `InputHandle` (Left).
-   **Output**: Single `OutputHandle` (Right).

## States

Matches other question nodes (Default/Selected).

## Usage

Represents `Description` or `Static Text` nodes in the survey flow.
