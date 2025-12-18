# Text Entry Node Component

Renders an open-ended question node where the respondent provides a text answer. It has a single output path.

## Structure

```tsx
<div className="relative w-80 bg-surface-container border rounded-lg shadow-lg ...">
  {/* Header */}
  <header className="p-3 border-b ...">
     <Icon /> <Variable> <QuestionText>
  </header>

  {/* Body */}
  <main className="p-3 relative">
      <InputHandle highlighted={highlightInputHandle} />
      <div className="bg-surface rounded p-2 ...">
         Respondent provides a text-based answer.
      </div>
      <OutputHandle highlighted={highlightSourceHandles} />
  </main>
</div>
```

## Styling Specifications

-   **Width**: `w-80`
-   **Container**: `bg-surface-container`, `rounded-lg`
-   **Body**: `p-3 relative`
-   **Content Box**: `bg-surface`, `italic` text placeholder.

## Connections

-   **Input**: Single `InputHandle` (Left, vertically centered on body).
-   **Output**: Single `OutputHandle` (Right, vertically centered on body).

## States

| State | Border | Shadow |
| :--- | :--- | :--- |
| **Default** | `border-outline-variant` | `shadow-lg` |
| **Selected** | `border-primary` | `shadow-2xl` |

## Usage

Represents `Text Entry`, `Numeric`, or other open-ended question types.
