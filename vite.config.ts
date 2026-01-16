
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Use (process as any).cwd() to fix the "Property 'cwd' does not exist on type 'Process'" error.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist', // Match the webDir in capacitor.config.json
    },
    define: {
      // Polyfill process.env for the geminiService which expects it
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
