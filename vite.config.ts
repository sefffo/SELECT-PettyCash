import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  cacheDir: 'C:/Users/clint/AppData/Local/Temp/opencode/vite-cache',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'recharts', test: /node_modules[\\/]recharts[\\/]/ },
          ],
        },
      },
    },
  },
});
