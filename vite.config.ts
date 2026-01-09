import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to copy web.config after build
const copyWebConfig = () => ({
  name: 'copy-web-config',
  closeBundle() {
    const src = path.resolve(__dirname, 'web.config');
    const dest = path.resolve(__dirname, 'dist', 'web.config');
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log('✓ web.config copied to dist');
    }
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',  // Root path for Azure App Service (use '/SurveyBuilderPoc/' for IIS)
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['liberal-sure-delegation-bacterial.trycloudflare.com', 'wax-refused-magazines-seminars.trycloudflare.com', 'pharmacy-offerings-suggesting-rounds.trycloudflare.com', 'forms-twice-herbal-pat.trycloudflare.com', 'duncan-since-occurs-obtaining.trycloudflare.com'],
    },
    plugins: [react(), copyWebConfig()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  };
});
