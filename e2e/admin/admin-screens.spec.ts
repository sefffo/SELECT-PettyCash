import { test, expect } from '@playwright/test';
import { USERS } from '../helpers/credentials';
import { loginViaUi } from '../helpers/login';

test.describe('TC-ADM admin screens', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page, USERS.admin);
  });

  test('TC-ADM-001 dashboard renders company stats', async ({ page }) => {
    await expect(page.getByText('Admin Dashboard', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Employees').first()).toBeVisible();
    await expect(page.getByText('Departments', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Company Pending Amount').first()).toBeVisible();
  });

  test('TC-ADM-002 all requests page renders pending requests', async ({ page }) => {
    await page.goto('/admin/requests');
    await expect(page.getByText('Requests', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('All cash requests across the company')).toBeVisible();
    await expect(page.getByText('Status — All', { exact: true })).toBeVisible();
  });

  test('TC-ADM-003 employee management page lists employees and total', async ({ page }) => {
    await page.goto('/admin/employees');
    await expect(page.getByText('Employee Management')).toBeVisible();
    await expect(page.getByText(/\d+ total/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('TC-ADM-004 employee list can be searched', async ({ page }) => {
    await page.goto('/admin/employees');
    const search = page.getByPlaceholder(/Search/i).first();
    await search.fill('Farida');
    await expect(page.getByText('Farida', { exact: true }).first()).toBeVisible();
    await search.fill('zzzz-no-match');
    await expect(page.getByText('No employees found')).toBeVisible();
  });

  test('TC-ADM-005 status filter works on requests page', async ({ page }) => {
    await page.goto('/admin/requests');
    await expect(page.getByText('Status — All', { exact: true })).toBeVisible();
    await page.getByText('Status — All', { exact: true }).click();
    await page.getByRole('option', { name: 'Pending' }).click();
    await expect(page.getByText('Pending', { exact: true }).first()).toBeVisible();
  });

  test('TC-ADM-006 department management tab has Add Department', async ({ page }) => {
    await page.goto('/admin/employees');
    await page.getByRole('tab', { name: 'Department Management' }).click();
    await expect(page.getByText('Add Department', { exact: true })).toBeVisible();
  });

  test('TC-ADM-007 profile page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Profile', { exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/profile$/);
  });

  test('TC-ADM-008 settings page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Settings', { exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/settings$/);
  });

  test('TC-ADM-009 notifications page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Notifications', { exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/notifications$/);
  });
});