import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['e2e/**', 'test-results/**', 'node_modules/**'],
  },
  resolve: {
    alias: [
      { find: /^@mui\/icons-material$/, replacement: resolve(__dirname, 'src/test/icons-shim.ts') },
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  },
});
