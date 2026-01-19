import type { Meta, StoryObj } from '@storybook/react';
import { TypographyStressTest } from './TypographyStressTest';

const meta: Meta<typeof TypographyStressTest> = {
    title: 'Design Tokens/Typography Stress Test',
    component: TypographyStressTest,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
## Typography Stress Test

This is a comprehensive visual stress test for the **Dynamic Typography System**. 

### Purpose
Use this story to verify that:
- Line-heights are correctly applied when switching fonts
- Text doesn't overlap or appear squashed
- All heading levels (H1-H4) maintain proper vertical rhythm
- Form elements render correctly with the typography tokens
- Nested containers don't break the typography cascade

### How to Use
1. Use the font selector in the **Control Panel** to switch between fonts
2. Observe each scenario for any visual issues:
   - **Scenario A**: Standard width question card with long text
   - **Scenario B**: Mobile width (320px) to test constrained layouts
   - **Scenario C**: All heading levels with body text
   - **Scenario D**: Every text size from xs to 4xl
   - **Scenario E**: Alerts and component integration

### Expected Behavior
- Text should never overlap
- Line spacing should feel comfortable and readable
- Font changes should apply instantly without page refresh
- All Tailwind text-* classes should use CSS variables from tokens
        `,
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TypographyStressTest>;

/**
 * The default stress test with all scenarios visible.
 * Switch fonts using the control panel at the top.
 */
export const Default: Story = {};

/**
 * Test with Inter (default) font to establish baseline.
 */
export const WithInter: Story = {
    decorators: [
        (Story) => {
            // Force Inter font for this story
            document.documentElement.style.setProperty('--font-family-sans', '"Inter", system-ui, sans-serif');
            document.documentElement.style.setProperty('--font-family-heading', '"Inter", system-ui, sans-serif');
            document.documentElement.style.setProperty('--font-family-body', '"Inter", system-ui, sans-serif');
            return <Story />;
        },
    ],
};

/**
 * Test with Roboto font to verify cross-font compatibility.
 */
export const WithRoboto: Story = {
    decorators: [
        (Story) => {
            // Load Roboto font
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Force Roboto font for this story
            document.documentElement.style.setProperty('--font-family-sans', '"Roboto", system-ui, sans-serif');
            document.documentElement.style.setProperty('--font-family-heading', '"Roboto", system-ui, sans-serif');
            document.documentElement.style.setProperty('--font-family-body', '"Roboto", system-ui, sans-serif');
            return <Story />;
        },
    ],
};

/**
 * Test with Playfair Display (serif) to stress test with a dramatically different font.
 */
export const WithPlayfairDisplay: Story = {
    decorators: [
        (Story) => {
            // Load Playfair Display font
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Force Playfair Display font for this story
            document.documentElement.style.setProperty('--font-family-sans', '"Playfair Display", serif');
            document.documentElement.style.setProperty('--font-family-heading', '"Playfair Display", serif');
            document.documentElement.style.setProperty('--font-family-body', '"Playfair Display", serif');
            return <Story />;
        },
    ],
};
