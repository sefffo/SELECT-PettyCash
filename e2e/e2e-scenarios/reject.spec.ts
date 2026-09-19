import { test, expect, type Page } from '@playwright/test';
import { USERS, MUTATIONS_ENABLED } from '../helpers/credentials';
import { loginViaUi } from '../helpers/login';

// Rejection flow: employee submits -> manager rejects with a reason.
// Runs ONLY with E2E_MUTATIONS=1 because it creates real persistent data.

const AMOUNT = 23.5;
const stamp = Date.now();
const reason = `E2E reject flow ${stamp}`;
const rejectReason = `E2E automated rejection ${stamp}`;

test.describe.configure({ mode: 'serial' });

let requestId: string | undefined;

function requireMutations(): void {
  test.skip(!MUTATIONS_ENABLED, 'E2E_MUTATIONS=1 required for mutation tests');
}

async function submitNewRequest(page: Page): Promise<string> {
  await page.goto('/employee/requests/new');
  await page.getByLabel(/Request Type/).click();
  await page.getByRole('option', { name: /Travel Request/ }).click();
  await page.getByLabel(/Amount/).fill(String(AMOUNT));
  await page.getByLabel(/Currency/).click();
  await page.getByRole('option', { name: 'USD' }).click();
  await page.getByLabel(/Reason/).fill(reason);
  await page.getByRole('button', { name: 'Submit Request' }).click();

  await expect(page.getByText('Request submitted for approval')).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/employee\/requests$/, { timeout: 15_000 });

  const row = page.locator('div').filter({ hasText: reason }).last();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.click();
  await expect(page).toHaveURL(/\/employee\/requests\/[0-9a-f-]+$/);
  return new URL(page.url()).pathname.split('/').pop() as string;
}

test('TC-EMP-011b rejection flow: employee submits a travel request', async ({ page }) => {
  requireMutations();
  await loginViaUi(page, USERS.employee);
  requestId = await submitNewRequest(page);
  expect(requestId).toBeTruthy();
});

test('TC-MGR-008b rejection flow: manager rejects the request with a reason', async ({ page }) => {
  requireMutations();
  expect(requestId, 'run the submit test first').toBeTruthy();
  await loginViaUi(page, USERS.manager);
  await page.goto(`/manager/requests/${requestId}`);
  await expect(page.getByText('Request Details')).toBeVisible();

  await page.getByRole('button', { name: 'Reject' }).first().click();
  await expect(page.getByText('Reject Request?')).toBeVisible();
  await page.getByPlaceholder('Write the reason for rejection...').fill(rejectReason);
  await page.getByRole('button', { name: 'Reject' }).last().click();

  await expect(page.getByText('Request rejected.')).toBeVisible({ timeout: 20_000 });
});

test('TC-EMP-013 rejection flow: employee sees the request rejected', async ({ page }) => {
  requireMutations();
  expect(requestId, 'run the submit test first').toBeTruthy();
  await loginViaUi(page, USERS.employee);
  await page.goto(`/employee/requests/${requestId}`);
  await expect(page.getByText('Request Details')).toBeVisible();
  await expect(page.getByText('Rejected', { exact: true })).toBeVisible({ timeout: 20_000 });
});