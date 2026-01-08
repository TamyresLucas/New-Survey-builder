import type { Preview } from '@storybook/react';
import React, { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';
import { themes } from '@storybook/theming';
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
    // Configure the dark mode addon to control the UI
    darkMode: {
      dark: { ...themes.dark, appBg: 'rgb(0 0 0)', barBg: 'rgb(20 20 20)' },
      light: { ...themes.normal, appBg: 'rgb(255 255 255)', barBg: 'rgb(240 240 240)' },
      stylePreview: false, // Disable addon's automatic class management
    },
    backgrounds: {
      disable: true,
    },
    options: {
      storySort: {
        order: ['Branding', 'Design Tokens', 'Design Patterns', 'Components', '*'],
      },
    },
  },

  decorators: [
    (Story) => {
      const isDark = useDarkMode();

      // Manually manage dark mode class since we disabled stylePreview
      useEffect(() => {
        const html = document.documentElement;

        console.log('[Storybook Dark Mode] isDark changed to:', isDark);
        console.log('[Storybook Dark Mode] Current classes before change:', html.className);

        // Remove all possible legacy classes individually (safe way)
        const classesToRemove = ['theme-light', 'theme-dark', 'light'];
        classesToRemove.forEach(cls => {
          if (html.classList.contains(cls)) {
            html.classList.remove(cls);
          }
        });

        // Set dark mode class - CRITICAL: explicitly add/remove
        if (isDark) {
          if (!html.classList.contains('dark')) {
            html.classList.add('dark');
            console.log('[Storybook Dark Mode] Added "dark" class');
          }
        } else {
          if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            console.log('[Storybook Dark Mode] Removed "dark" class');
          }
        }

        // Set color scheme for native browser elements
        html.style.colorScheme = isDark ? 'dark' : 'light';

        console.log('[Storybook Dark Mode] Final classes:', html.className);
        console.log('[Storybook Dark Mode] Has "dark" class?', html.classList.contains('dark'));
      }, [isDark]);

      // Handle font changes - separate effect
      useEffect(() => {
        const html = document.documentElement;

        const updateFont = () => {
          const savedFont = localStorage.getItem('global-font') || 'Inter';
          // Format font value with quotes and fallbacks
          const fontValue = `"${savedFont}", system-ui, sans-serif`;
          html.style.setProperty('--font-sans', fontValue);

          // Ensure the font is loaded
          const linkId = `font-global-${savedFont}`;
          if (!document.getElementById(linkId)) {
            const link = document.createElement("link");
            link.id = linkId;
            link.href = `https://fonts.googleapis.com/css2?family=${savedFont.replace(/ /g, "+")}:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap`;
            link.rel = "stylesheet";
            document.head.appendChild(link);
          }
        };

        // Run immediately on mount
        updateFont();

        // Listen for font changes from FontPreview component
        window.addEventListener('font-changed', updateFont);

        return () => {
          window.removeEventListener('font-changed', updateFont);
        };
      }, []); // Empty array = runs once on mount + listens for events

      return React.createElement(Story);
    },
  ],
};

export default preview;