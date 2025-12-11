# GeminiMessage

The `GeminiMessage` component renders a single message within the AI Assistant chat interface. It handles styling for both user queries and AI responses (Model), including markdown rendering for the latter.

## Structure

```tsx
<div className="flex justify-end|justify-start">
  <div className="max-w-[85%] p-3 rounded-2xl...">
    {/* Content (Text or Markdown) */}
  </div>
</div>
```

## Styling Specifications

| Element | Style | Token |
| :--- | :--- | :--- |
| **User Bubble Info** | `bg-primary` `text-on-primary` | Primary Brand |
| **Model Bubble Info** | `bg-surface-container` `text-on-surface` `border` `border-outline` | Surface Container / Outline |
| **Border Radius** | `rounded-2xl` | 16px (Special case for chat bubbles) |
| **Padding** | `p-3` | 12px (Special case for chat bubbles) |
| **Shadow** | `shadow-sm` | Small shadow depth |

### States

*   **User Message**: Aligned right, Primary background, no border, bottom-right corner square.
*   **Model Message**: Aligned left, Surface background, Outline border, bottom-left corner square. Renders Markdown.

## Usage

```tsx
import { GeminiMessage } from './GeminiMessage';

// Inside a map of messages
<GeminiMessage message={msg} />
```

## Design Compliance

- [x] Uses semantic color tokens (`bg-primary`, `bg-surface`, `border-outline`).
- [x] Uses consistent typography (`text-sm`).
- [x] Supports Markdown content for AI responses.
