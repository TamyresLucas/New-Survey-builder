# Avatar Component

Avatars are used to represent users, typically displaying their initials when an image is not available.

## Structure

The avatar is a circular element containing the user's initials.

```tsx
<div className="h-9 w-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-medium shadow-sm">
  TL
</div>
```

## Styling Specifications

-   **Dimensions**: `h-9 w-9` (36px x 36px)
-   **Shape**: `rounded-full`
-   **Background**: `bg-primary`
-   **Text Color**: `text-on-primary`
-   **Typography**: `text-sm font-medium`
-   **Alignment**: Flexbox centering (`flex items-center justify-center`)
-   **Shadow**: `shadow-sm`

## Usage

-   **User Menu Trigger**: Used in the Header to toggle the user menu.
-   **Initials**: Displays the first letter of the first name and the first letter of the last name (e.g., "Tamyres Lucas" -> "TL").

## Interactions

-   **Hover/Focus**: When used as a button trigger, it should have focus rings for accessibility: `focus:ring-2 focus:ring-offset-2 focus:ring-primary`.
