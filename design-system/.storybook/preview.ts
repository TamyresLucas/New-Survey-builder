import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global Theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';

      useEffect(() => {
        const html = document.documentElement;
        if (theme === 'dark') {
          html.classList.add('dark');
          html.style.colorScheme = 'dark'; // Optional: helps with scrollbars
        } else {
          html.classList.remove('dark');
          html.style.colorScheme = 'light';
        }
      }, [theme]);

      return React.createElement(Story);
    },
  ],
};

export default preview;