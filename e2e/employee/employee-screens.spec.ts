import { test, expect } from '@playwright/test';
import { USERS } from '../helpers/credentials';
import { loginViaUi } from '../helpers/login';

test.describe('TC-EMP employee screens', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page, USERS.employee);
  });

  test('TC-DASH-011 dashboard renders hero stats, wallet and summary cards', async ({ page }) => {
    await expect(page.getByText('Dashboard', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Wallet Currencies')).toBeVisible();
    await expect(page.getByText('Available Balance', { exact: true })).toBeVisible();
    await expect(page.getByText('Spent this month', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending requests').first()).toBeVisible();
    await expect(page.getByText('Approved requests').first()).toBeVisible();
    await expect(page.getByText('New Request', { exact: true }).first()).toBeVisible();
  });

  test('TC-DASH-001 quick action New Request opens the request form dialog', async ({ page }) => {
    await page.getByText('New Request', { exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
    await expect(page.getByText('New Request', { exact: true })).toBeVisible();
    await expect(page).not.toHaveURL(/\/employee\/requests\/new$/);
  });

  test('TC-EMP-004 sidebar navigates to requests list', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Requests', { exact: true }).click();
    await expect(page).toHaveURL(/\/employee\/requests$/);
    await expect(page.getByText('My Requests')).toBeVisible();
  });

  test('TC-EMP-005 sidebar navigates to expenses page', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Expenses', { exact: true }).click();
    await expect(page).toHaveURL(/\/employee\/expenses$/);
    await expect(page.getByText('My Expenses', { exact: true })).toBeVisible();
  });

  test('TC-EMP-002 profile page renders account details', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Profile', { exact: true }).click();
    await expect(page).toHaveURL(/\/employee\/profile$/);
    await expect(page.getByText('Your account details')).toBeVisible();
  });

  test('TC-EMP-003 settings page renders preferences', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Settings', { exact: true }).click();
    await expect(page).toHaveURL(/\/employee\/settings$/);
    await expect(page.getByText('Manage your language and appearance preferences')).toBeVisible();
  });

  test('TC-UI-LOG-013 notifications page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Notifications', { exact: true }).click();
    await expect(page).toHaveURL(/\/employee\/notifications$/);
    await expect(page.getByText('Notifications', { exact: true }).first()).toBeVisible();
  });

  test('TC-EMP-006 new request form validates required fields', async ({ page }) => {
    await page.goto('/employee/requests/new');
    await page.getByRole('button', { name: 'Submit Request' }).click();
    // NOTE: an empty amount renders zod's raw "Expected number, received nan"
    // (the form registers the amount as a numeric field and the required_error
    // only fires for undefined, not NaN) — a minor UX issue worth reporting.
    await expect(page.getByText('Expected number, received nan')).toBeVisible();
    await expect(page.getByText('Please provide at least 10 characters')).toBeVisible();
    await expect(page).toHaveURL(/\/employee\/requests\/new$/);
  });

  test('TC-EMP-007 new request form rejects amounts below the minimum', async ({ page }) => {
    await page.goto('/employee/requests/new');
    await page.getByLabel(/Request Type/).click();
    await page.getByRole('option', { name: /Cash Advance/ }).click();
    await page.getByLabel(/Amount/).fill('0.5');
    await page.getByLabel(/Reason/).fill('E2E minimum validation reason test');
    await page.getByRole('button', { name: 'Submit Request' }).click();
    await expect(page.getByText('Minimum amount is EGP 1')).toBeVisible();
    await expect(page).toHaveURL(/\/employee\/requests\/new$/);
  });

  test('TC-EMP-008 request currency selector offers EGP, USD and SAR', async ({ page }) => {
    await page.goto('/employee/requests/new');
    await page.getByLabel(/Currency/).click();
    await expect(page.getByRole('option', { name: 'EGP' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'USD' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'SAR' })).toBeVisible();
  });
});