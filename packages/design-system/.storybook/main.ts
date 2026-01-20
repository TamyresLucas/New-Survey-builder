import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig, loadEnv } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "storybook-dark-mode"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "typescript": {
    "reactDocgen": "react-docgen-typescript"
  },
  "core": {
    "disableTelemetry": true
  },
  async viteFinal(config, { configType }) {
    // Carrega variáveis de ambiente
    const env = loadEnv(configType || 'development', process.cwd(), '');

    return mergeConfig(config, {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          // Usa o diretório atual (process.cwd) para resolver o caminho
          '@': path.resolve(process.cwd(), 'src'),
        },
      },
    });
  }
};

export default config;