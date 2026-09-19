import { test, expect } from '@playwright/test';
import { USERS, type UserRoleKey } from '../helpers/credentials';
import { loginViaUi, logoutViaUi } from '../helpers/login';

const roles: UserRoleKey[] = ['admin', 'manager', 'finance', 'employee'];

for (const role of roles) {
  test(`TC-AUTH-001/TC-UI-LOG-001 ${role} signs in successfully and lands on dashboard`, async ({ page }) => {
    await loginViaUi(page, USERS[role]);
    await expect(page).toHaveURL(USERS[role].dashboardPath);
    await expect(page.getByTestId('sidebar')).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBeTruthy();
  });
}

test('TC-UI-LOG-002 empty credentials keep user on login and show no error', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('TC-UI-LOG-003 invalid credentials show an error banner and keep email', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(USERS.employee.email);
  await page.getByLabel('Password').fill('definitely-wrong-password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // NOTE: the UI surfaces the backend's raw message ("Invalid email or password.")
  // instead of the i18n "Invalid credentials. Try again." key. Reported as a finding.
  await expect(page.getByRole('alert')).toContainText('Invalid email or password.');
  await expect(page.getByLabel('Email')).toHaveValue(USERS.employee.email);
  await expect(page).toHaveURL(/\/login$/);
});

test('TC-UI-LOG-003b error message reveals whether the email exists (enumeration)', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('ghost@company.com');
  await page.getByLabel('Password').fill('whatever');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid credentials.');

  // Same password, existing account -> different message. This lets callers
  // enumerate valid accounts through the login screen. Reported.
  await page.getByLabel('Email').fill(USERS.employee.email);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid email or password.');
});

test('TC-UI-LOG-004 password field is masked', async ({ page }) => {
  await page.goto('/login');
  const password = page.getByLabel('Password');
  await expect(password).toHaveAttribute('type', 'password');
  await password.fill('secret123');
  await expect(password).toHaveAttribute('type', 'password');
});

test('TC-UI-LOG-005 theme toggle persists dark mode', async ({ page }) => {
  await page.goto('/login');
  const toggle = page.getByRole('button', { name: 'Toggle theme' });
  await toggle.click();
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('theme-mode')))
    .toContain('dark');
});

test('TC-UI-LOG-008 expired persisted session redirects to login', async ({ page }) => {
  await page.goto('/login');
  await loginViaUi(page, USERS.employee);
  const token = await page.evaluate(() => localStorage.getItem('auth-token'));
await page.evaluate((t) => {
      localStorage.setItem('auth-token', t as string);
      localStorage.setItem(
        'pretty-cash-session',
        JSON.stringify({
          state: {
            isAuthenticated: true,
            role: 'employee',
            user: {
              id: 'dccd53a8-0ee4-40e0-9900-c794b00ea877',
              email: 'menna@company.com',
              name: 'Menna',
              userRole: 'employee',
            },
            sessionExpiresAt: Date.now() - 60_000,
          },
          version: 0,
        }),
      );
    }, token);
  await page.goto('/employee/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('TC-UI-LOG-009 protected routes redirect to login when not authenticated', async ({ page }) => {
  const protectedPaths = [
    '/employee/dashboard',
    '/manager/dashboard',
    '/admin/dashboard',
    '/finance',
  ];
  for (const path of protectedPaths) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  }
});

test('TC-UI-LOG-010 logout returns to login and clears session', async ({ page }) => {
  await loginViaUi(page, USERS.employee);
  await logoutViaUi(page);
  await expect(page).toHaveURL(/\/login$/);
  const token = await page.evaluate(() => localStorage.getItem('auth-token'));
  expect(token).toBeNull();
});

test('TC-UI-LOG-011 wrong-role user is blocked from other panels', async ({ page }) => {
  await loginViaUi(page, USERS.employee);
  await page.goto('/manager/dashboard');
  await expect(page).toHaveURL(/\/unauthorized$/);
  await page.goto('/admin/employees');
  await expect(page).toHaveURL(/\/unauthorized$/);
  await page.goto('/finance');
  await expect(page).toHaveURL(/\/unauthorized$/);
});

test.describe('login helpers sanity', () => {
  test('session survives reload', async ({ page }) => {
    await loginViaUi(page, USERS.manager);
    await page.reload();
    await expect(page).toHaveURL(USERS.manager.dashboardPath);
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });
});

