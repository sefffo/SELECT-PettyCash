import { test, expect, type Page } from '@playwright/test';
import {
  BREAKPOINTS, DRAWER_BREAKPOINTS, LOCALES, MODAL_BREAKPOINTS, ROLES,
  VIEWPORT_HEIGHT, shotPath, type LocaleCode,
} from './cases';

async function seedLocale(page: Page, locale: LocaleCode): Promise<void> {
  await page.addInitScript((code) => {
    localStorage.setItem('vertex-locale', code);
    localStorage.setItem('theme-mode', JSON.stringify({ state: { locale: code }, version: 0 }));
  }, locale);
}

async function login(page: Page, email: string, roleKey: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`/${roleKey}/dashboard`));
  await page.waitForTimeout(900);
}

async function gotoAndSettle(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

async function captureDrawer(page: Page, locale: LocaleCode, role: 'manager' | 'admin', width: number): Promise<void> {
  await gotoAndSettle(page, `/${role}/dashboard`);
  await page.locator('[data-testid="MenuIcon"]').click();
  await expect(page.locator('.MuiDrawer-paper')).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: shotPath(locale, role, width, 'drawer-open'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('.MuiDrawer-paper')).toBeHidden();
}

async function captureAdminDialogs(page: Page, locale: LocaleCode, width: number): Promise<void> {
  await gotoAndSettle(page, '/admin/employees');

  await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
  await page.locator('[data-testid="employee-action-view"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath(locale, 'admin', width, 'employees-view-modal'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toBeHidden();

  await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
  await page.locator('[data-testid="employee-action-department"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath(locale, 'admin', width, 'employees-change-dept-modal'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toBeHidden();

  await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
  await page.locator('[data-testid="employee-action-delete"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath(locale, 'admin', width, 'employees-delete-confirm'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toBeHidden();
}

for (const locale of LOCALES) {
  test(`public pages - ${locale.code}`, async ({ page }) => {
    await seedLocale(page, locale.code);
    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });

    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await gotoAndSettle(page, '/login');
      await page.screenshot({ path: shotPath(locale.code, 'public', width, 'login'), fullPage: true });

      await gotoAndSettle(page, '/unauthorized');
      await page.screenshot({ path: shotPath(locale.code, 'public', width, 'unauthorized'), fullPage: true });
    }
  });

  for (const role of ROLES) {
    test(`${role.key} screens - ${locale.code}`, async ({ page }) => {
      await seedLocale(page, locale.code);
      await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
      await login(page, role.email, role.key);

      for (const width of BREAKPOINTS) {
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });

        for (const route of role.routes) {
          await gotoAndSettle(page, route.path);
          await page.screenshot({ path: shotPath(locale.code, role.key, width, route.name), fullPage: true });
        }

        if (role.key === 'admin' && MODAL_BREAKPOINTS.includes(width)) {
          await captureAdminDialogs(page, locale.code, width);
        }

        if (role.key !== 'employee' && DRAWER_BREAKPOINTS.includes(width)) {
          await captureDrawer(page, locale.code, role.key, width);
        }
      }
    });
  }
}
