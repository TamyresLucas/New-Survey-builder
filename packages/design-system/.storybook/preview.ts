import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
    backgrounds: { disabled: true },
    options: {
      storySort: {
        order: ['foresight', 'Branding', 'Design Tokens', 'Components', 'Patterns', 'Survey Builder', 'Blocks', 'Survey Rendering', '*'],
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

      // Apply saved font from localStorage on mount (simplified - no event listener needed)
      useEffect(() => {
        const html = document.documentElement;
        const savedFont = localStorage.getItem('global-font') || 'Inter';

        // Set all font family CSS variables atomically
        const fontValue = `"${savedFont}", system-ui, sans-serif`;
        html.style.setProperty('--font-family-sans', fontValue);
        html.style.setProperty('--font-family-heading', fontValue);
        html.style.setProperty('--font-family-body', fontValue);

        // Ensure the font is loaded from Google Fonts
        const linkId = `font-global-${savedFont}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.href = `https://fonts.googleapis.com/css2?family=${savedFont.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
      }, []);

      return React.createElement(Story);
    },
  ],
};

export default preview;
