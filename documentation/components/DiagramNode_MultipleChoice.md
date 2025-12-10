# Multiple Choice Node Component

Renders a complex question node allowing distinct branching paths for each choice option (Radio or Checkbox).

## Structure

```tsx
<div className="w-80 bg-surface-container border rounded-lg shadow-lg ...">
  {/* Header */}
  <header className="p-3 border-b ...">
     <Icon /> <Variable> <QuestionText>
  </header>

  {/* Body */}
  <div className="relative">
      {/* Input Connection */}
      <InputHandle highlighted={highlightInputHandle} />

      {/* Choices List */}
      <ul className="p-3 space-y-2">
          {options.map(option => (
              <li className="relative flex items-center ...">
                  <Indicator />
                  <Text />
                  {/* Output Connection per Choice */}
                  <Handle type="source" ... />
              </li>
          ))}
      </ul>
  </div>
</div>
```

## Styling Specifications

-   **Width**: `w-80` (320px)
-   **Container**: `bg-surface-container`, `rounded-lg`
-   **Header**: `p-3 border-b border-outline-variant`
-   **List**: `p-3 space-y-2`
-   **List Item**:
    -   `relative flex items-center`
    -   `p-2 rounded`
    -   `bg-surface border border-outline-variant`

## Connections

-   **Input**: Single `InputHandle` (Left, vertically centered relative to the list container).
-   **Output**: Multiple source handles, one per option.
    -   **Position**: Right edge of each list item (`right: -17px`).
    -   **Style**: Matches generically styled handles but positioned specifically for list items.

## States

| State | Border | Shadow |
| :--- | :--- | :--- |
| **Default** | `border-outline-variant` | `shadow-lg` |
| **Selected** | `border-primary` | `shadow-2xl` |

## Highlights

Supports `data.highlightInputHandle` and `data.highlightSourceHandles` to visually trace active paths.

## Usage

Represents `Single Choice` (Radio) or `Multiple Choice` (Checkbox) questions in the diagram.
