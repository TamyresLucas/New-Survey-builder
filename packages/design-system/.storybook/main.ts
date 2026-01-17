import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "storybook-dark-mode"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "docs": {
    "autodocs": "tag"
  },
  "typescript": {
    "reactDocgen": "react-docgen-typescript"
  },
  "core": {
    "disableTelemetry": true
  },
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
    });
  },
};
export default config;