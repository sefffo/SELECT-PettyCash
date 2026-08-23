import { test, expect, type Page } from '@playwright/test';
import { BREAKPOINTS, DRAWER_BREAKPOINTS, LOCALES, MODAL_BREAKPOINTS, ROLES, VIEWPORT_HEIGHT, type LocaleCode } from './cases';

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

async function assertNoOverflow(page: Page, label: string): Promise<void> {
  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(horizontalOverflow, `horizontal overflow (${label})`).toBeLessThanOrEqual(1);

  const fixedOverflow = await page.evaluate(() => {
    const offenders: string[] = [];
    document.querySelectorAll('.MuiDrawer-paper, [role="dialog"]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > window.innerWidth) offenders.push(`${el.tagName} ${rect.width}px`);
    });
    return offenders;
  });
  expect(fixedOverflow, `fixed elements wider than viewport (${label})`).toEqual([]);
}

async function gotoAndSettle(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
}

for (const locale of LOCALES) {
  test(`no overflow - public - ${locale.code}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text()}`);
    });

    await seedLocale(page, locale.code);
    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });

    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await gotoAndSettle(page, '/login');
      await assertNoOverflow(page, `login ${locale.code} ${width}`);

      await gotoAndSettle(page, '/unauthorized');
      await assertNoOverflow(page, `unauthorized ${locale.code} ${width}`);
    }

    expect(errors).toEqual([]);
  });

  for (const role of ROLES) {
    test(`no overflow - ${role.key} - ${locale.code}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`console: ${m.text()}`);
      });

      await seedLocale(page, locale.code);
      await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
      await login(page, role.email, role.key);

      for (const width of BREAKPOINTS) {
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });

        for (const route of role.routes) {
          await gotoAndSettle(page, route.path);
          await assertNoOverflow(page, `${role.key}/${route.name} ${locale.code} ${width}`);
        }

        if (role.key === 'admin' && MODAL_BREAKPOINTS.includes(width)) {
          await gotoAndSettle(page, '/admin/employees');
          await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
          await page.locator('[data-testid="employee-action-view"]').click();
          await expect(page.locator('[role="dialog"]')).toBeVisible();
          await page.waitForTimeout(500);
          await assertNoOverflow(page, `view-modal ${locale.code} ${width}`);
          await page.keyboard.press('Escape');
          await expect(page.locator('[role="dialog"]')).toBeHidden();

          await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
          await page.locator('[data-testid="employee-action-department"]').click();
          await expect(page.locator('[role="dialog"]')).toBeVisible();
          await page.waitForTimeout(500);
          await assertNoOverflow(page, `change-dept-modal ${locale.code} ${width}`);
          await page.keyboard.press('Escape');
          await expect(page.locator('[role="dialog"]')).toBeHidden();

          await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
          await page.locator('[data-testid="employee-action-delete"]').click();
          await expect(page.locator('[role="dialog"]')).toBeVisible();
          await page.waitForTimeout(500);
          await assertNoOverflow(page, `delete-confirm ${locale.code} ${width}`);
          await page.keyboard.press('Escape');
          await expect(page.locator('[role="dialog"]')).toBeHidden();
        }

        if (role.key !== 'employee' && DRAWER_BREAKPOINTS.includes(width)) {
          await gotoAndSettle(page, `/${role.key}/dashboard`);
          await page.locator('[data-testid="MenuIcon"]').click();
          await expect(page.locator('.MuiDrawer-paper')).toBeVisible();
          await page.waitForTimeout(700);
          await assertNoOverflow(page, `${role.key}-drawer ${locale.code} ${width}`);
          await page.keyboard.press('Escape');
          await expect(page.locator('.MuiDrawer-paper')).toBeHidden();
        }
      }

      expect(errors).toEqual([]);
    });
  }
}
