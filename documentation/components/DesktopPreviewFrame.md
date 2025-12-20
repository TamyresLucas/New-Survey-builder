# DesktopPreviewFrame

A container component that mimics a desktop browser window frame. It is used to wrap content (like survey previews) to give the appearance of being viewed on a desktop device.

## Structure

```tsx
<div className="flex flex-col border border-outline shadow-xl rounded-lg overflow-hidden bg-white dark:bg-neutral-900 w-full h-full max-w-5xl mx-auto">
  {/* Header/Toolbar */}
  <div className="bg-surface-container-high border-b border-outline px-4 py-2 flex items-center gap-4 flex-shrink-0">
    {/* Window Controls */}
    <div className="flex gap-1.5">...</div>
    {/* URL Bar */}
    <div className="flex-1 bg-surface ...">survey-preview.com</div>
  </div>

  {/* Content */}
  <div className="flex-1 overflow-y-auto bg-surface relative">
    {children}
  </div>
</div>
```

## Styling Specifications

- **Container**: `flex flex-col w-full h-full max-w-5xl mx-auto rounded-lg overflow-hidden border border-outline shadow-xl`
- **Header**: `bg-surface-container-high border-b border-outline px-4 py-2 h-[44px]` (implicit height via padding/content)
- **URL Bar**: `bg-surface text-on-surface-variant text-xs rounded px-3 py-1 opacity-70`
- **Content Area**: `bg-surface flex-1 overflow-y-auto relative`

## Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `children` | `React.ReactNode` | The content to display inside the frame. |
| `className` | `string` | Optional additional classes for the container. |
| `style` | `React.CSSProperties` | Optional inline styles. |

## Usage

```tsx
import { DesktopPreviewFrame } from './DesktopPreviewFrame';

<DesktopPreviewFrame>
  <SurveyPreviewContent />
</DesktopPreviewFrame>
```
