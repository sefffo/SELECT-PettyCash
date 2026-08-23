import { test, type Page } from '@playwright/test';

async function seedLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('vertex-locale', 'en');
    localStorage.setItem('theme-mode', JSON.stringify({ state: { locale: 'en' }, version: 0 }));
  });
}

async function login(page: Page, email: string, roleKey: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(new RegExp(`/${roleKey}/dashboard`));
}

async function scrollWidth(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth);
}

test('manager dashboard css experiments', async ({ page }) => {
  await seedLocale(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await login(page, 'manager@selecteg.com', 'manager');
  await page.goto('/manager/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  console.log(`baseline: ${await scrollWidth(page)}`);

  await page.addStyleTag({ content: `[style*="display: grid"] > * { min-width: 0 !important; }` });
  await page.waitForTimeout(500);
  console.log(`grid items min-width:0: ${await scrollWidth(page)}`);

  await page.addStyleTag({ content: `svg, .recharts-wrapper, .recharts-responsive-container { min-width: 0 !important; max-width: 100% !important; }` });
  await page.waitForTimeout(500);
  console.log(`svg min-width:0: ${await scrollWidth(page)}`);

  await page.addStyleTag({ content: `* { min-width: 0 !important; }` });
  await page.waitForTimeout(500);
  console.log(`all min-width:0: ${await scrollWidth(page)}`);

  await page.addStyleTag({ content: `* { overflow-x: hidden !important; }` });
  await page.waitForTimeout(500);
  console.log(`all overflow-x hidden: ${await scrollWidth(page)}`);
});
