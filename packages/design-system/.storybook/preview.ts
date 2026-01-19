import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import '../src/index.css';

// Type definitions for custom events
declare global {
  interface WindowEventMap {
    'color-changed': CustomEvent<Record<string, string>>;
    'font-changed': Event;
  }
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Branding', 'Design Tokens', 'Design Patterns', 'Components', '*'],
        method: 'alphabetical',
      },
    },
    darkMode: {
      // Storybook theme configuration
      current: 'light',
      // Apply classes to preview iframe
      classTarget: 'html',
      darkClass: 'dark',
      lightClass: 'light',
      stylePreview: true,
      // Theme objects with proper class names
      dark: {
        class: 'dark',
        appBg: '#1a1a2e',
        appContentBg: '#16162a',
        barBg: '#1a1a2e',
      },
      light: {
        class: 'light',
        appBg: '#ffffff',
        appContentBg: '#f8fafc',
        barBg: '#ffffff',
      },
    },
  },

  decorators: [
    (Story) => {
      const isDark = useDarkMode();

      // Sync color scheme (addon handles class toggling via classTarget config)
      useEffect(() => {
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      }, [isDark]);

      // Handle dynamic font changes from FontPreview
      useEffect(() => {
        const html = document.documentElement;

        const updateFont = () => {
          const savedFont = localStorage.getItem('global-font') || 'Inter';
          html.style.setProperty('--font-sans', `"${savedFont}", system-ui, sans-serif`);

          const linkId = `font-global-${savedFont}`;
          if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.href = `https://fonts.googleapis.com/css2?family=${savedFont.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        };

        updateFont();
        window.addEventListener('font-changed', updateFont);
        return () => window.removeEventListener('font-changed', updateFont);
      }, []);

      return React.createElement(Story);
    },
  ],
};

export default preview;

