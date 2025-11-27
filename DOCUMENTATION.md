# Survey Builder Documentation

This document outlines the brand guidelines, technology stack, design system, and established design patterns for the Survey Builder application. It is a living document and will be updated with each new feature and design decision.

## 1. Brand Book

### Color Palette

The brand's primary color palette is based on a trio of core colors, implemented using the HSL color model for flexibility.

-   **Periwinkle (Primary)**: Used for key actions, selections, and focus states.
    -   Light Mode: `hsl(235 100% 67%)`
    -   Dark Mode: `#6366f1`
-   **Green (Success)**: Used for confirmation messages, success states, and active status indicators.
    -   Light Mode: `hsl(162 100% 31%)`
    -   Dark Mode: `#72dab9`
-   **Tangerine (Warning)**: Used for non-critical warnings and states requiring user attention (e.g., pending updates).
    -   Light Mode: `hsl(26 80% 40%)`
    -   Dark Mode: `hsl(26 100% 80%)`
-   **Coral (Error)**: Used for critical validation errors and destructive actions.
    -   Light Mode: `hsl(353 84% 64%)`
    -   Dark Mode: `hsl(353 100% 84%)`

### Typography

The application uses Google Fonts for a clean and modern aesthetic.

-   **Headings & Branding**: **Outfit** (Weights: 300 Light, 500 Medium, 800 Extrabold)
-   **Body & UI Text**: **Open Sans** (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold)

## 2. Style Sheet

Styling is implemented using **Tailwind CSS**, a utility-first CSS framework. A custom configuration in `index.html` extends Tailwind's default theme to include the application's design tokens (colors, fonts). This allows for rapid, consistent styling directly within the component markup.

## 3. Technology Used

-   **Frontend Framework**: React 19
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Icons**: Google Material Symbols (Rounded, Filled)
-   **Fonts**: Google Fonts (Outfit, Open Sans)
-   **State Management**: React Hooks (`useReducer`, `useContext`)
-   **AI Integration**: Google Gemini API (`@google/genai`)

## 4. Design System

The application employs a custom design system heavily inspired by **Google's Material Design 3 (MD3)**. It focuses on clarity, responsiveness, and accessibility. The system is built upon:

-   **Design Tokens**: A set of named variables for colors, typography, and spacing to ensure consistency.
-   **Reusable Components**: A library of React components for UI elements like cards, buttons, menus, and side panels.
-   **Iconography**: Consistent use of Google's Material Symbols.

## 5. Light & Dark Mode

The application supports both light and dark themes, which can be toggled by the user. The theme is persisted in `localStorage`. The color system is built on a set of semantic tokens that adapt to the current theme.

### Light Mode Tokens

```css
:root {
  --semantic-pri: var(--foundation-periwinkle-dark);
  --semantic-suc: var(--foundation-green-dark);
  --semantic-err: var(--foundation-coral);
  --semantic-suc-hov: var(--foundation-green);
  --semantic-err-hov: var(--foundation-coral);
  --semantic-warn: var(--foundation-tangerine);
  --semantic-info: var(--foundation-periwinkle-dark);
  --semantic-shd: #232323;
  --background--surface-bg: var(--foundation-neutral-scale-primary-10);
  --background--surface-bg-def: var(--foundation-white);
  --background--surface-bg-sel: #dbdef9;
  --background--surface-bg-hov: var(--foundation-primary-gradients-primary-10);
  --background--surface-bg-dis: var(--foundation-primary-gradients-primary-10);
  --notification-err-bg: var(--foundation-coral-light);
  --notification-warn-bg: var(--foundation-tangerine-light);
  --notification-suc-bg: var(--foundation-green-light);
  --notification-info-bg: var(--foundation-primary-gradients-primary-20);
  --border-bd-def: var(--foundation-neutral-scale-primary-20);
  --border-bd-hov: var(--foundation-periwinkle);
  --border-bd-sel: var(--foundation-periwinkle-dark);
  --border-bd-dis: var(--foundation-primary-gradients-primary-40);
  --notification-err-bd: var(--foundation-coral);
  --notification-err-txt: var(--foundation-coral-dark);
  --notification-info-txt: var(--foundation-periwinkle-dark);
  --input-field-input-bd-def: #232323;
  --input-field-input-bd-sel: var(--foundation-periwinkle-dark);
  --input-field-input-txt: var(--text-txt-pri);
  --input-field-input-bd-dis: var(--background-&-surface-bg-dis);
  --input-field-input-bg-def: var(--foundation-white);
  --input-field-input-bd-hov: var(--foundation-periwinkle);
  --button-button-tertiary: var(--foundation-neutral-scale-primary-100);
  --button-button-secondary-alt: var(--foundation-neutral);
  --button-button-secondary: transparent;
  --button-button-secondary-hover: var(--background--surface-bg-hov);
  --text-txt-on-color: var(--foundation-white);
  --text-txt-on-primary: var(--foundation-white);
  --text-txt-on-success: var(--foundation-white);
  --button-button-tertiary-alt: var(--foundation-periwinkle-dark);
  --button-button-primary: var(--foundation-periwinkle-dark);
  --button-button-primary-hover: var(--foundation-primary-gradients-primary-100);
  --button-button-tertiary-hover: var(--foundation-periwinkle);
  --button-button-danger: var(--foundation-coral-dark);
  --button-button-success: var(--foundation-green-dark);
  --button-button-danger-hover: var(--foundation-coral);
  --button-button-success-hover: var(--foundation-green);
  --text-txt-on-color-disable: var(--foundation-primary-gradients-primary-40);
  --button-button-primary-disabled: var(--foundation-primary-gradients-primary-10);
  --button-button-secondary-disabled: var(--foundation-primary-gradients-primary-40);
  --text-txt-pri: var(--foundation-neutral);
  --text-txt-sec: var(--foundation-neutral-80%);
  --text-hyperlink-def: var(--foundation-neutral);
  --text-hyperlink-hov: var(--foundation-periwinkle);
  --thumbnail-thumbnail-bd-def: var(--foundation-primary-gradients-primary-40);
  --thumbnail-thumbnail-bd-sel: var(--foundation-periwinkle);
  --thumbnail-thumbnail-bd-hov: var(--foundation-periwinkle);
  --thumbnail-thumbnail-icon-def: var(--foundation-primary-gradients-primary-60);
  --thumbnail-thumbnail-icon-sel: var(--foundation-periwinkle-dark);
  --menu-menu-def: var(--foundation-neutral);
  --menu-menu-hov: var(--foundation-periwinkle);
  --menu-menu-sel: var(--foundation-periwinkle-dark);
  --semantic-pri-hov: var(--foundation-periwinkle);
  --login-login-err: #ef576b;
  --login-login-sec: #00a078;
  --login-login-pri: #5a6eff;
  --text-txt-sel: var(--foundation-periwinkle);
  --notification-suc-bd: var(--foundation-green);
  --notification-suc-txt: var(--foundation-green-dark);
  --foundation-periwinkle-dark: #5568f2;
  --foundation-primary-gradients-primary-100: var(--foundation-periwinkle);
  --foundation-primary-gradients-primary-60: #9ca8ff;
  --foundation-primary-gradients-primary-40: #bdc5ff;
  --foundation-primary-gradients-primary-20: #dee2ff;
  --foundation-primary-gradients-primary-10: #eff1ff;
  --foundation-primary-gradients-primary-5: #f6f7ff;
  --foundation-green-dark: #008563;
  --foundation-coral-dark: #cf455c;
  --foundation-neutral: #232323;
  --foundation-neutral-80: #4f4f4f;
  --foundation-tangerine: #ec6b09;
  --foundation-periwinkle: #5a6eff;
  --foundation-green: #00a078;
  --foundation-coral: #ef576b;
  --foundation-black: #191a1a;
  --foundation-white: #ffffff;
  --foundation-off-black: #232323;
  --foundation-tangerine-light: #fff6ef;
  --foundation-coral-light: #feeff1;
  --foundation-green-light: #e6f6f2;
  --notification-warn-txt: var(--foundation-tangerine);
  --notification-warn-bd: var(--foundation-tangerine);
  --notification-info-bd: var(--foundation-periwinkle);
  --foundation-periwinkle-light: #eff1ff;
  --background--surface-bg-sel-hov: var(--foundation-periwinkle);
  --table-bg-row-def: var(--background-&-surface-bg-def);
  --background--surface-bg-empty: var(--foundation-primary-gradients-primary-20);
  --background--surface-bg-filled: var(--foundation-periwinkle-dark);
  --thumbnail-thumbnail-bg-def: var(--foundation-primary-gradients-primary-5);
  --thumbnail-thumbnail-bg-sel: var(--foundation-primary-gradients-primary-10);
  --categories-cat-txt-1: var(--foundation-chart-grape);
  --categories-cat-bg-1: var(--foundation-chart-grape-20%);
  --categories-cat-bg-9: var(--foundation-chart-grey-20%);
  --categories-cat-bg--2: var(--foundation-chart-watermelon-10%);
  --categories-cat-txt-2: var(--foundation-chart-watermelon);
  --categories-cat-bg--3: var(--foundation-chart-blackberry-10%);
  --categories-cat-txt-3: var(--foundation-chart-blackberry);
  --categories-cat-bg--4: var(--foundation-chart-blueberry-20%);
  --categories-cat-txt-4: var(--foundation-chart-blueberry);
  --sentiment-sent-positive-txt: var(--foundation-chart-avocado);
  --nps-nps-10: var(--foundation-chart-avocado);
  --foundation-chart-grape: #8e25d0;
  --foundation-chart-watermelon: #ed4e94;
  --foundation-chart-blackberry: #4833eb;
  --foundation-chart-blueberry: var(--foundation-periwinkle);
  --foundation-chart-grey: #707d89;
  --foundation-chart-lime: #639933;
  --categories-cat-txt-9: var(--foundation-chart-grey);
  --tags-tag-bd-icon--1: var(--foundation-chart-grey);
  --foundation-chart-peach: #ef664e;
  --foundation-chart-mint: #00a39b;
  --foundation-chart-watermelon-10: #feeef5;
  --foundation-chart-grape-20: #e8daff;
  --foundation-chart-blackberry-10: #dad6fb;
  --foundation-chart-blueberry-20: #cce9f6;
  --foundation-chart-mint-20: #ccedeb;
  --foundation-chart-peach-20: #fce0dc;
  --foundation-chart-lime-20: #e0ebd6;
  --foundation-chart-grey-20: #e2e5e7;
  --foundation-chart-apple: var(--foundation-coral);
  --foundation-chart-apple-20: var(--foundation-coral-light);
  --foundation-chart-avocado: var(--foundation-green);
  --foundation-chart-avocado-10: #cef1e1;
  --categories-cat-bg--5: var(--foundation-chart-mint-20%);
  --categories-cat-txt-5: var(--foundation-chart-mint);
  --categories-cat-bg--6: var(--foundation-chart-peach-20%);
  --categories-cat-txt-6: var(--foundation-chart-peach);
  --categories-cat-bg--7: var(--foundation-chart-lime-20%);
  --categories-cat-txt-7: var(--foundation-chart-lime);
  --categories-cat-bg--8: var(--foundation-chart-avocado-10%);
  --categories-cat-txt-8: var(--foundation-chart-avocado);
  --sentiment-sent-negative-txt: var(--foundation-chart-apple);
  --sentiment-sent-negative-mix-txt: var(--foundation-chart-peach);
  --sentiment-sent-positive-mix-txt: var(--foundation-chart-lime);
  --sentiment-sent-no-data-txt: var(--foundation-chart-grey);
  --tags-tag-bg--1: var(--foundation-chart-grey-20%);
  --tags-tag-bg--2: var(--foundation-chart-apple-20%);
  --tags-tag-bd-icon--2: var(--foundation-chart-apple);
  --tags-tag-bg--3: var(--foundation-chart-watermelon-10%);
  --tags-tag-bd-icon--3: var(--foundation-chart-watermelon);
  --tags-tag-bg--4: var(--foundation-chart-grape-20%);
  --tags-tag-bd-icon--4: var(--foundation-chart-grape);
  --tags-tag-bg--5: var(--foundation-chart-blueberry);
  --tags-tag-bd-icon--5: var(--foundation-chart-blackberry);
  --tags-tag-bg--6: var(--foundation-chart-mint);
  --tags-tag-bd-icon--6: var(--foundation-chart-blueberry-20%);
  --tags-tag-bg--7: var(--foundation-chart-peach-20%);
  --tags-tag-bd-icon--7: var(--foundation-chart-peach);
  --tags-tag-bg--8: var(--foundation-chart-lime-20%);
  --tags-tag-bd-icon--8: var(--foundation-chart-lime);
  --tags-tag-bg--9: var(--foundation-chart-avocado-10%);
  --tags-tag-bd-icon--9: var(--foundation-chart-avocado);
  --tags-tag-bg--10: #d4e2ff;
  --tags-tag-bd-icon--10: var(--foundation-periwinkle-dark);
  --tags-tag-bd-icon--3: #ffffff;
  --sentiment-sent-positive-bg: var(--foundation-chart-avocado-10%);
  --sentiment-sent-negative-bg: var(--foundation-chart-apple-20%);
  --sentiment-sent-negative-mix-bg: var(--foundation-chart-peach-20%);
  --sentiment-sent-positive-mix-bg: var(--foundation-chart-lime-20%);
  --sentiment-sent-no-data-bg: var(--foundation-chart-grey-20%);
  --nps-nps-9: #64a86f;
  --nps-nps-8: #b6c94d;
  --nps-nps-7: #ddc63f;
  --nps-nps-6: #e9b341;
  --nps-nps-5: #e69d44;
  --nps-nps-4: #e28747;
  --nps-nps-3: #df714a;
  --nps-nps-2: #dc5a4d;
  --nps-nps-1: #d84650;
  --nps-nps-0: var(--foundation-coral-dark);
  --foundation-neutral-scale-primary-100: #232323;
  --foundation-neutral-scale-primary-90: #2d3047;
  --foundation-neutral-scale-primary-80: #404461;
  --foundation-neutral-scale-primary-70: #53577a;
  --foundation-neutral-scale-primary-60: #666b94;
  --foundation-neutral-scale-primary-50: #7a7eae;
  --foundation-neutral-scale-primary-40: #c9cfff;
  --foundation-neutral-scale-primary-30: #d4d9ff;
  --foundation-neutral-scale-primary-20: #e0e4ff;
  --foundation-neutral-scale-primary-10: #eff1ff;
  --foundation-chart-tangerine: var(--foundation-tangerine);
  --table-bd-row-def: var(--border-bd-def);
  --table-txt-row-def: var(--text-txt-pri);
  --table-txt-row-sel: var(--text-txt-sel-alt);
  --table-bd-row-sel: #ffffff;
  --table-bg-row-sel: var(--background-&-surface-bg-sel);
  --table-bg-row-hov: var(--background-&-surface-bg-hov);
  --table-txt-hdr-def: var(--text-txt-pri);
  --table-bd-hdr-def: var(--border-bd-def);
  --text-txt-sel-alt: var(--foundation-white);
  --table-bg-row-sel-hov: var(--foundation-neutral-scale-primary-60);
  --table-bd-hdr-def-alt: var(--foundation-neutral-scale-primary-40);
  --tags-tag-bd-icon--11: var(--foundation-chart-tangerine);
  --tags-tag-bg--11: #fffcf2;
  --button-button-tertiary-disabled: var(--foundation-primary-gradients-primary-40);
  --button-button-primary-active: var(--foundation-periwinkle-dark);
  --button-button-secondary-active: var(--foundation-primary-gradients-primary-100);
  --button-button-tertiary-active: var(--foundation-primary-gradients-primary-100);
  --button-button-danger-active: var(--notification-err-txt);
  --button-button-success-active: #007154;
  --border-bd-sel-alt: var(--foundation-white);
  --text-label-sel: var(--foundation-periwinkle-dark);
  --text-label-dang: var(--foundation-coral-dark);
  --text-label-suc: var(--foundation-green-dark);
  --text-highlight-lemon: #fff9b1;
  --text-highlight-lettuce: #d1f786;
  --text-highlight-highlight-tool: var(--foundation-periwinkle);
  --text-highlight-highlight-selection: var(--foundation-primary-gradients-primary-40);
  --foundation-primary-gradients-primary-80: #7b8bff;
}
```

### Dark Mode Tokens

```css
.dark {
  --semantic-pri: var(--foundation-periwinkle-dark);
  --semantic-suc: var(--foundation-green-dark);
  --semantic-err: var(--foundation-coral);
  --semantic-suc-hov: var(--foundation-green);
  --semantic-err-hov: var(--foundation-coral);
  --semantic-warn: var(--foundation-tangerine);
  --semantic-info: var(--foundation-periwinkle-dark);
  --semantic-shd: #000000;
  --background--surface-bg: hsl(240 6% 10%);
  --background--surface-bg-def: hsl(230 5% 13%);
  --background--surface-bg-sel: hsl(225 5% 23%);
  --background--surface-bg-hov: hsl(228 5% 18%);
  --background--surface-bg-dis: var(--foundation-primary-gradients-primary-100);
  --notification-err-bg: var(--foundation-coral-light);
  --notification-warn-bg: var(--foundation-tangerine-light);
  --notification-suc-bg: var(--foundation-green-light);
  --notification-info-bg: var(--foundation-primary-gradients-primary-20);
  --border-bd-def: hsl(223 6% 59%);
  --border-bd-hov: var(--foundation-periwinkle);
  --border-bd-sel: var(--foundation-periwinkle-dark);
  --border-bd-dis: hsl(221 7% 28%);
  --notification-err-bd: var(--foundation-coral);
  --notification-err-txt: var(--foundation-coral-dark);
  --notification-info-txt: var(--foundation-periwinkle-dark);
  --input-field-input-bd-def: var(--foundation-neutral);
  --input-field-input-bd-sel: var(--foundation-periwinkle-dark);
  --input-field-input-txt: var(--text-txt-pri);
  --input-field-input-bd-dis: var(--background-&-surface-bg-dis);
  --input-field-input-bg-def: var(--foundation-off-black);
  --input-field-input-bd-hov: var(--foundation-periwinkle);
  --button-button-tertiary: var(--foundation-neutral);
  --button-button-secondary-alt: var(--foundation-neutral);
  --button-button-secondary: transparent;
  --button-button-secondary-hover: var(--background--surface-bg-hov);
  --text-txt-on-color: var(--foundation-white);
  --text-txt-on-primary: #1b1f50;
  --text-txt-on-success: #1b1f50;
  --button-button-tertiary-alt: var(--foundation-periwinkle-dark);
  --button-button-primary: var(--foundation-periwinkle-dark);
  --button-button-primary-hover: var(--foundation-primary-gradients-primary-100);
  --button-button-tertiary-hover: var(--foundation-periwinkle);
  --button-button-danger: var(--foundation-coral-dark);
  --button-button-success: var(--foundation-green-dark);
  --button-button-danger-hover: var(--foundation-coral);
  --button-button-success-hover: var(--foundation-green);
  --text-txt-on-color-disable: var(--foundation-neutral-scale-primary-50);
  --button-button-primary-disabled: var(--foundation-neutral-scale-primary-90);
  --button-button-secondary-disabled: var(--foundation-neutral-scale-primary-60);
  --text-txt-pri: var(--foundation-white);
  --text-txt-sec: #ffffff;
  --text-hyperlink-def: var(--foundation-white);
  --text-hyperlink-hov: var(--foundation-periwinkle);
  --thumbnail-thumbnail-bd-def: var(--foundation-primary-gradients-primary-40);
  --thumbnail-thumbnail-bd-sel: var(--foundation-periwinkle);
  --thumbnail-thumbnail-bd-hov: var(--foundation-periwinkle);
  --thumbnail-thumbnail-icon-def: var(--foundation-primary-gradients-primary-60);
  --thumbnail-thumbnail-icon-sel: var(--foundation-periwinkle-dark);
  --menu-menu-def: var(--foundation-neutral);
  --menu-menu-hov: var(--foundation-periwinkle);
  --menu-menu-sel: var(--foundation-periwinkle-dark);
  --semantic-pri-hov: var(--foundation-periwinkle);
  --login-login-err: #ef576b;
  --login-login-sec: #00a078;
  --login-login-pri: #5a6eff;
  --text-txt-sel: var(--foundation-periwinkle);
  --notification-suc-bd: var(--foundation-green);
  --notification-suc-txt: var(--foundation-green-dark);
  --foundation-periwinkle-dark: #5a6eff;
  --foundation-primary-gradients-primary-100: var(--foundation-periwinkle);
  --foundation-primary-gradients-primary-60: #364299;
  --foundation-primary-gradients-primary-40: #242c66;
  --foundation-primary-gradients-primary-20: #1a1f3d;
  --foundation-primary-gradients-primary-10: #121633;
  --foundation-primary-gradients-primary-5: #101223;
  --foundation-green-dark: #72dab9;
  --foundation-coral-dark: #ef576b;
  --foundation-neutral: #ffffff;
  --foundation-neutral-80: #ffffff;
  --foundation-tangerine: #f9a05b;
  --foundation-periwinkle: #5a6eff;
  --foundation-green: #00a078;
  --foundation-coral: #ef576b;
  --foundation-black: #191a1a;
  --foundation-white: #ffffff;
  --foundation-off-black: #232323;
  --foundation-tangerine-light: #393029;
  --foundation-coral-light: #38292b;
  --foundation-green-light: #20302c;
  --notification-warn-txt: var(--foundation-tangerine);
  --notification-warn-bd: var(--foundation-tangerine);
  --notification-info-bd: var(--foundation-periwinkle);
  --foundation-periwinkle-light: #292b39;
  --background--surface-bg-sel-hov: var(--foundation-neutral-scale-primary-70);
  --table-bg-row-def: var(--foundation-off-black);
  --background--surface-bg-empty: var(--foundation-primary-gradients-primary-20);
  --background--surface-bg-filled: var(--foundation-periwinkle-dark);
  --thumbnail-thumbnail-bg-def: var(--foundation-primary-gradients-primary-5);
  --thumbnail-thumbnail-bg-sel: var(--foundation-primary-gradients-primary-10);
  --categories-cat-txt-1: var(--foundation-chart-grape);
  --categories-cat-bg-1: var(--foundation-chart-grape);
  --categories-cat-bg-9: var(--foundation-chart-grey-20%);
  --categories-cat-bg--2: var(--foundation-chart-watermelon-10%);
  --categories-cat-txt-2: var(--foundation-chart-watermelon);
  --categories-cat-bg--3: var(--foundation-chart-blackberry-10%);
  --categories-cat-txt-3: var(--foundation-chart-blackberry);
  --categories-cat-bg--4: var(--foundation-chart-blueberry-20%);
  --categories-cat-txt-4: var(--foundation-chart-blueberry);
  --sentiment-sent-positive-txt: var(--foundation-chart-avocado);
  --nps-nps-10: var(--foundation-chart-avocado);
  --foundation-chart-grape: #b24ac3;
  --foundation-chart-watermelon: #ed4e94;
  --foundation-chart-blackberry: #744ec6;
  --foundation-chart-blueberry: var(--foundation-periwinkle);
  --foundation-chart-grey: #707d89;
  --foundation-chart-lime: #86c54f;
  --categories-cat-txt-9: var(--foundation-chart-grey);
  --tags-tag-bd-icon--1: var(--foundation-chart-grey);
  --foundation-chart-peach: #ef6e57;
  --foundation-chart-mint: #00c3b8;
  --foundation-chart-watermelon-10: #38282f;
  --foundation-chart-grape-20: #382346;
  --foundation-chart-blackberry-10: #2a264b;
  --foundation-chart-blueberry-20: #1c3946;
  --foundation-chart-mint-20: #1c3d3b;
  --foundation-chart-peach-20: #4c302c;
  --foundation-chart-lime-20: #37432c;
  --foundation-chart-grey-20: #323537;
  --foundation-chart-apple: var(--foundation-coral);
  --foundation-chart-apple-20: var(--foundation-coral-light);
  --foundation-chart-avocado: var(--foundation-green);
  --foundation-chart-avocado-10: #1c3730;
  --categories-cat-bg--5: var(--foundation-chart-mint-20%);
  --categories-cat-txt-5: var(--foundation-chart-mint);
  --categories-cat-bg--6: var(--foundation-chart-peach-20%);
  --categories-cat-txt-6: var(--foundation-chart-peach);
  --categories-cat-bg--7: var(--foundation-chart-lime-20%);
  --categories-cat-txt-7: var(--foundation-chart-lime);
  --categories-cat-bg--8: var(--foundation-chart-avocado-10%);
  --categories-cat-txt-8: var(--foundation-chart-avocado);
  --sentiment-sent-negative-txt: var(--foundation-chart-apple);
  --sentiment-sent-negative-mix-txt: var(--foundation-chart-peach);
  --sentiment-sent-positive-mix-txt: var(--foundation-chart-lime);
  --sentiment-sent-no-data-txt: var(--foundation-chart-grey);
  --tags-tag-bg--1: var(--foundation-chart-grey-20%);
  --tags-tag-bg--2: var(--foundation-chart-apple-20%);
  --tags-tag-bd-icon--2: var(--foundation-chart-apple);
  --tags-tag-bg--3: var(--foundation-chart-watermelon-10%);
  --tags-tag-bd-icon--3: var(--foundation-chart-watermelon);
  --tags-tag-bg--4: var(--foundation-chart-grape-20%);
  --tags-tag-bd-icon--4: var(--foundation-chart-grape);
  --tags-tag-bg--5: var(--foundation-chart-blueberry);
  --tags-tag-bd-icon--5: var(--foundation-chart-blackberry-10%);
  --tags-tag-bg--6: var(--foundation-chart-mint-20%);
  --tags-tag-bd-icon--6: var(--foundation-chart-blueberry-20%);
  --tags-tag-bg--7: var(--foundation-chart-peach-20%);
  --tags-tag-bd-icon--7: var(--foundation-chart-peach);
  --tags-tag-bg--8: var(--foundation-chart-lime-20%);
  --tags-tag-bd-icon--8: var(--foundation-chart-lime);
  --tags-tag-bg--9: var(--foundation-chart-avocado-10%);
  --tags-tag-bd-icon--9: var(--foundation-chart-avocado);
  --tags-tag-bg--10: var(--foundation-periwinkle-light);
  --tags-tag-bd-icon--10: var(--foundation-periwinkle-dark);
  --tags-tag-bd-icon--3: #ffffff;
  --sentiment-sent-positive-bg: var(--foundation-chart-avocado-10%);
  --sentiment-sent-negative-bg: var(--foundation-chart-apple-20%);
  --sentiment-sent-negative-mix-bg: var(--foundation-chart-peach-20%);
  --sentiment-sent-positive-mix-bg: var(--foundation-chart-lime-20%);
  --sentiment-sent-no-data-bg: var(--foundation-chart-grey-20%);
  --nps-nps-9: #5eb888;
  --nps-nps-8: #bbd262;
  --nps-nps-7: #e3d954;
  --nps-nps-6: #fad352;
  --nps-nps-5: #f8bd55;
  --nps-nps-4: #f6a65a;
  --nps-nps-3: #f48f5e;
  --nps-nps-2: #f27763;
  --nps-nps-1: #f05e68;
  --nps-nps-0: var(--foundation-coral-dark);
  --foundation-neutral-scale-primary-100: #0d0e1a;
  --foundation-neutral-scale-primary-90: #151729;
  --foundation-neutral-scale-primary-80: #1d203c;
  --foundation-neutral-scale-primary-70: #262a4a;
  --foundation-neutral-scale-primary-60: #363d65;
  --foundation-neutral-scale-primary-50: #4f5780;
  --foundation-neutral-scale-primary-40: #6a73a6;
  --foundation-neutral-scale-primary-30: #8e96c2;
  --foundation-neutral-scale-primary-20: #b8bdde;
  --foundation-neutral-scale-primary-10: #e0e2f0;
  --foundation-chart-tangerine: var(--foundation-tangerine);
  --table-bd-row-def: var(--border-bd-def);
  --table-txt-row-def: var(--text-txt-pri);
  --table-txt-row-sel: var(--text-txt-sel-alt);
  --table-bd-row-sel: var(--foundation-off-black);
  --table-bg-row-sel: var(--background-&-surface-bg-sel);
  --table-bg-row-hov: var(--background-&-surface-bg-hov);
  --table-txt-hdr-def: var(--text-txt-pri);
  --table-bd-hdr-def: var(--border-bd-def);
  --text-txt-sel-alt: var(--foundation-white);
  --table-bg-row-sel-hov: var(--foundation-neutral-scale-primary-60);
  --table-bd-hdr-def-alt: var(--foundation-neutral-scale-primary-40);
  --tags-tag-bd-icon--11: var(--foundation-chart-tangerine);
  --tags-tag-bg--11: var(--foundation-tangerine-light);
  --button-button-tertiary-disabled: var(--foundation-primary-gradients-primary-40);
  --button-button-primary-active: var(--foundation-neutral-scale-primary-70);
  --button-button-secondary-active: var(--foundation-neutral-scale-primary-70);
  --button-button-tertiary-active: var(--foundation-neutral-scale-primary-70);
  --button-button-danger-active: #cf455c;
  --button-button-success-active: #007154;
  --border-bd-sel-alt: var(--foundation-off-black);
  --text-label-sel: var(--foundation-periwinkle);
  --text-label-dang: var(--foundation-coral);
  --text-label-suc: var(--foundation-green);
  --text-highlight-lemon: #fff9b1;
  --text-highlight-lettuce: #d1f786;
  --text-highlight-highlight-tool: var(--foundation-periwinkle);
  --text-highlight-highlight-selection: var(--foundation-primary-gradients-primary-40);
  --foundation-primary-gradients-primary-80: #4858cc;
}
```

## 6. Design Patterns

Several key design patterns have been established to ensure a consistent and intuitive user experience, especially within the logic-building features.

-   **Smart Filtering**: Dropdown options for logic conditions are dynamically filtered based on the current context. For example, "Display Logic" only shows preceding questions, while "Branching Logic" and "Skip Logic" only show following questions for destinations.
-   **Progressive Disclosure**: Advanced or secondary options (like "Copy and paste" logic) are hidden from the initial view and are only revealed after the primary action has been taken, reducing initial cognitive load.
-   **Context-Aware Inputs**: UI controls adapt based on user selections. For instance, a free-text value field transforms into a dropdown of pre-filled choices when the user selects a multiple-choice question in a logic condition.
-   **Draft & Confirm Workflow**: Changes to complex logic are not applied to the survey immediately. They are stored in a temporary "draft" state. The original, confirmed logic remains active on the canvas until the user explicitly confirms the new changes, preventing errors from incomplete or accidental edits.
-   **Consistent Actions**: UI controls for similar actions are standardized. For example, adding a new logic condition is always labeled "+ Add condition" and is placed consistently in the UI.
-   **Logical Grouping**: Related features are grouped. All advanced survey features, including complex branching and workflows, are consolidated under a single "Branching Logic" section within the "Branching Logic" tab, creating a predictable location for power-user functionality.

## 7. MD3 Design Tokens & Components

### 7.1 Design Tokens

The application uses a token-based color system inspired by MD3. Key tokens include:

-   `primary`: The main accent color.
-   `on-primary`: Text/icons on top of the primary color.
-   `primary-container`: A lighter/toned-down version of the primary color for backgrounds.
-   `surface`: The main app background color.
-   `surface-container`: The background for components like cards, sidebars, and modals.
-   `on-surface`: The primary text color.
-   `on-surface-variant`: The secondary text color.
-   `outline`: For borders and dividers.
-   `warning`/`on-warning`: For non-critical user attention states.
-   `error`/`success`: For feedback states.

### 7.2 Component Library (based on MD3 concepts)

-   **Top App Bar**: Implemented as `Header.tsx` and `SubHeader.tsx`.
-   **Navigation Rail**: Implemented as `LeftSidebar.tsx`.
-   **Side Sheet / Panel**: Implemented as `RightSidebar.tsx`, `BuildPanel.tsx`, and `GeminiPanel.tsx`.
-   **Cards**: The main component for questions, `QuestionCard.tsx`.
-   **Dialogs**: Implemented as `PasteChoicesModal.tsx`.
-   **Menus**: Dropdown menus for actions, implemented in `ActionMenus.tsx`.
-   **Buttons, Toggles, Selects**: Standard form elements styled with Tailwind CSS according to the design system.
-   **Expansion Panels (Accordions)**: Implemented as `CollapsibleSection` within components.

## 8. Google Icons & Fonts

-   **Icons**: The project uses **Material Symbols Rounded**. A global style is applied to make all icons **Filled** (`font-variation-settings: 'FILL' 1`) for a consistent and bold appearance.
-   **Fonts**: The project uses **Outfit** for headings and **Open Sans** for body copy and UI elements, both served from Google Fonts.

## 9. Component Documentation

This section provides detailed documentation for key reusable components within the application.

### 9.1 BlockActionsMenu

-   **File Location**: `components/ActionMenus.tsx`
-   **Component Name**: `BlockActionsMenu`

#### Purpose

The `BlockActionsMenu` is a unified, context-aware dropdown component that provides users with a consistent set of actions for a survey block. It is designed to be highly reusable and adaptable, showing only the actions that are relevant to the context in which it's used.

#### Usage

This component is triggered by clicking the "three-dots" icon on a block and is used in two primary locations:

1.  **Build Panel > Content Tab (`BuildPanel.tsx`)**: In this context, the menu provides a comprehensive set of actions, including editing, reordering, duplicating, and deleting blocks.
2.  **Survey Canvas (`SurveyBlock.tsx`)**: On the main canvas, the menu provides a slightly reduced set of actions. For example, "Move up/down" is omitted because reordering is handled via drag-and-drop in this view.

The component's flexibility comes from its props-driven rendering. An action is only displayed in the menu if its corresponding `on...` callback function is passed as a prop.

#### Design & UX

-   **Appearance**: Styled as an MD3-style menu, appearing as an absolutely positioned floating panel.
-   **Grouping**: Actions are logically grouped and separated by dotted dividers for improved scannability:
    -   Primary actions (Edit)
    -   Movement (Move up/down)
    -   Creation (Duplicate, Add question/block)
    -   Selection (Select/Unselect all)
    -   State changes (Collapse/Expand)
    -   Destructive actions (Delete)
-   **Contextual Disabling**: The menu accepts boolean `can...` props (e.g., `canMoveUp`) which control the `disabled` state of menu items, providing clear visual feedback to the user about which actions are currently available.

#### Props (API)

| Prop              | Type                | Description                                                                  |
| ----------------- | ------------------- | ---------------------------------------------------------------------------- |
| `onEdit`          | `() => void`        | Triggers opening the block editor sidebar.                                   |
| `onMoveUp`        | `() => void`        | Moves the block one position up in the survey.                               |
| `canMoveUp`       | `boolean`           | If `false`, the "Move up" option is disabled.                                |
| `onMoveDown`      | `() => void`        | Moves the block one position down in the survey.                             |
| `canMoveDown`     | `boolean`           | If `false`, the "Move down" option is disabled.                              |
| `onDuplicate`     | `() => void`        | Creates a copy of the block immediately below the original.                  |
| `onAddSimpleQuestion` | `() => void`    | Adds a new, default question to the end of the block.                        |
| `onAddFromLibrary` | `() => void`       | (Not implemented) Triggers opening the content library to add items.         |
| `onAddBlockAbove` | `() => void`        | Adds a new, empty block directly above the current one.                      |
| `onAddBlockBelow` | `() => void`        | Adds a new, empty block directly below the current one.                      |
| `onSelectAll`     | `() => void`        | Checks all questions within the block for bulk editing.                      |
| `canSelectAll`    | `boolean`           | If `false`, the "Select All" option is disabled.                             |
| `onUnselectAll`   | `() => void`        | Unchecks all questions within the block.                                     |
| `canUnselectAll`  | `boolean`           | If `false`, the "Unselect All" option is disabled.                           |
| `onExpand`        | `() => void`        | Expands a collapsed block to show its questions.                             |
| `canExpand`       | `boolean`           | If `false`, the "Expand block" option is disabled.                           |
| `onCollapse`      | `() => void`        | Collapses an expanded block to hide its questions.                           |
| `canCollapse`     | `boolean`           | If `false`, the "Collapse block" option is disabled.                         |
| `onDelete`        | `() => void`        | Deletes the block and all questions within it (displays in red).             |

### 9.2 QuestionActionsMenu

-   **File Location**: `components/ActionMenus.tsx`
-   **Component Name**: `QuestionActionsMenu`

#### Purpose

The `QuestionActionsMenu` is a unified dropdown component providing a consistent set of actions for a single survey question. It is designed to be context-aware, showing only relevant actions based on the question's state (e.g., active vs. deactivated) and the view it's rendered in.

#### Usage

This component is triggered by clicking the "three-dots" icon on a question and is used in two locations:

1.  **Build Panel > Content Tab (`BuildPanel.tsx`)**: In the list of survey content, this menu provides a full set of actions for managing questions from the sidebar.
2.  **Survey Canvas (`QuestionCard.tsx`)**: Directly on the question card, this menu offers quick access to the most common actions.

Like the `BlockActionsMenu`, its props-driven rendering ensures flexibility. An action is only displayed if its corresponding `on...` callback is provided.

#### Design & UX

-   **Appearance**: Styled as an MD3-style menu, appearing as an absolutely positioned floating panel.
-   **Grouping**: Actions are logically grouped with dotted dividers for clarity:
    -   **Structural Actions**: Modifying the question's position or content (Move, Duplicate, Add to Library, Add Page Break).
    -   **State & Interaction**: Actions that change the question's state or allow inspection (Preview, Activate/Deactivate).
    -   **Destructive Actions**: Actions that permanently remove the question (Delete), styled in red.
-   **Contextual Actions**: The menu intelligently displays "Activate" for a hidden question and "Deactivate" for a visible one, providing a clear toggle for the question's state.

#### Props (API)

| Prop                  | Type                  | Description                                                                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `question`            | `Question`            | **Required.** The question object to which the actions apply. Used to determine state (e.g., `isHidden`).    |
| `onMoveToNewBlock`    | `() => void`          | Moves the question into a new, dedicated block.                                                               |
| `onDuplicate`         | `() => void`          | Creates a copy of the question immediately below the original.                                                |
| `onAddToLibrary`      | `() => void`          | (Not implemented) Placeholder for adding the question to a reusable content library.                          |
| `onAddPageBreak`      | `() => void`          | Inserts a page break element directly after the current question.                                             |
| `onPreview`           | `() => void`          | Opens the right sidebar and navigates directly to the "Preview" tab for this question.                        |
| `onActivate`          | `() => void`          | Makes a hidden question visible to respondents. Only shown if `question.isHidden` is `true`.                    |
| `onDeactivate`        | `() => void`          | Hides a visible question from respondents. Only shown if `question.isHidden` is `false` or `undefined`.       |
| `onDelete`            | `() => void`          | Permanently deletes the question from the survey.                                                             |
| `onReplaceFromLibrary`| `() => void`          | (Not implemented) Placeholder for replacing the question with one from the library.                           |