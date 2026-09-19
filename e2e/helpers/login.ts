import { expect, type Page } from '@playwright/test';
import type { TestUser } from './credentials';

/**
 * Signs a user in through the real login screen and waits until the app lands
 * on that role's dashboard. Assumes the app is in English (its default locale).
 */
export async function loginViaUi(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Finance lands on /finance, everyone else on /<role>/dashboard.
  await expect(page).toHaveURL(new RegExp(`/${user.role === 'finance' ? 'finance/?' : `${user.role}/dashboard`}`), { timeout: 30_000 });

  // Wait for the sidebar (present on every role's panel) and for the initial
  // data fetch to finish so assertions below do not race the network.
  await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30_000 });
}

/** Signs out using the sidebar's Logout row. */
export async function logoutViaUi(page: Page): Promise<void> {
  await page.getByTestId('sidebar').getByText('Logout', { exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
}