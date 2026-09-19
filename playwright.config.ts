import { defineConfig } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load the project's `.env` file so `E2E_*` / `VITE_API_BASE_URL` variables are
// available to the tests (Playwright does not read `.env` automatically).
function loadDotEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1]!;
    const raw = (match[2] ?? '').trim();
    const value = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
    if (key && !(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

export default defineConfig({
  testDir: './e2e',

  // Legacy experiment specs from earlier work are excluded from the default run.
  // They use outdated mock credentials and are not part of the new suite.
  testIgnore: ['**/debug.spec.ts', '**/overflow.spec.ts', '**/responsive.spec.ts'],

  timeout: 120_000,
  expect: { timeout: 15_000 },

  fullyParallel: false,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    // The app is deployed at https://pc.selecteg.com and talks to the live API.
    // Point E2E_BASE_URL at a local preview server if you prefer to test a local build.
    baseURL: process.env.E2E_BASE_URL ?? 'https://pc.selecteg.com',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});