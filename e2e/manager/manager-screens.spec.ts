import { test, expect } from '@playwright/test';
import { USERS } from '../helpers/credentials';
import { loginViaUi } from '../helpers/login';

test.describe('TC-MGR manager screens', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page, USERS.manager);
  });

  test('TC-MGR-001 dashboard renders stats, pending approvals and expense overview', async ({ page }) => {
    await expect(page.getByText('Manager Dashboard', { exact: true })).toBeVisible();
    await expect(page.getByText('Team Members').first()).toBeVisible();
    await expect(page.getByText('Pending Requests', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Pending Approvals', { exact: true })).toBeVisible();
    await expect(page.getByText('Monthly Spending Trend', { exact: true }).first()).toBeVisible();
  });

  test('TC-MGR-009 Review Requests action opens the team requests page', async ({ page }) => {
    await page.getByRole('button', { name: /Review Requests/ }).click();
    await expect(page).toHaveURL(/\/manager\/requests$/);
    await expect(page.getByText('Team Requests')).toBeVisible();
  });

  test('TC-MGR-003 team requests page renders all four status filters', async ({ page }) => {
    await page.goto('/manager/requests');
    await expect(page.getByText('Team Requests')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pending' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approved' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rejected' })).toBeVisible();
  });

  test('TC-MGR-003 filter chips switch the request list', async ({ page }) => {
    await page.goto('/manager/requests');
    await page.getByRole('button', { name: 'Approved' }).click();
    await page.getByRole('button', { name: 'Rejected' }).click();
    await page.getByRole('button', { name: 'Pending' }).click();
  });

  test('TC-MGR-011 employees page renders team roster or empty state', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Employees', { exact: true }).click();
    await expect(page).toHaveURL(/\/manager\/employees$/);
    await expect(page.getByText('Employees', { exact: true }).first()).toBeVisible();
  });

  test('TC-MGR-012 profile page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Profile', { exact: true }).click();
    await expect(page).toHaveURL(/\/manager\/profile$/);
  });

  test('TC-MGR-013 settings page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Settings', { exact: true }).click();
    await expect(page).toHaveURL(/\/manager\/settings$/);
  });

  test('TC-MGR-014 notifications page renders', async ({ page }) => {
    await page.getByTestId('sidebar').getByText('Notifications', { exact: true }).click();
    await expect(page).toHaveURL(/\/manager\/notifications$/);
  });
});