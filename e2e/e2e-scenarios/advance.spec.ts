import { test, expect, type Page } from '@playwright/test';
import { USERS, MUTATIONS_ENABLED } from '../helpers/credentials';
import { loginViaUi } from '../helpers/login';

// Full advance lifecycle across all three panels:
//   employee submits -> manager approves -> finance pays -> employee sees Completed.
// Runs ONLY with E2E_MUTATIONS=1 because it creates real persistent data.

const AMOUNT = 47.75;
const stamp = Date.now();
const reason = `E2E advance lifecycle ${stamp}`;

test.describe.configure({ mode: 'serial' });

let requestId: string | undefined;

function requireMutations(): void {
  test.skip(!MUTATIONS_ENABLED, 'E2E_MUTATIONS=1 required for mutation tests');
}

async function submitNewRequest(page: Page): Promise<string> {
  await page.goto('/employee/requests/new');
  await page.getByLabel(/Request Type/).click();
  await page.getByRole('option', { name: /Cash Advance/ }).click();
  await page.getByLabel(/Category/).click();
  await page.getByRole('option', { name: 'Office Supplies' }).click();
  await page.getByLabel(/Amount/).fill(String(AMOUNT));
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

test('TC-EMP-011 full lifecycle: employee submits a cash advance via the UI', async ({ page }) => {
  requireMutations();
  await loginViaUi(page, USERS.employee);
  requestId = await submitNewRequest(page);
  expect(requestId).toBeTruthy();
});

test('TC-MGR-008 full lifecycle: manager approves the request', async ({ page }) => {
  requireMutations();
  expect(requestId, 'run the submit test first').toBeTruthy();
  await loginViaUi(page, USERS.manager);
  await page.goto(`/manager/requests/${requestId}`);
  await expect(page.getByText('Request Details')).toBeVisible();

  await page.getByRole('button', { name: 'Approve' }).first().click();
  await expect(page.getByText('Approve Request?')).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).last().click();

  await expect(page.getByText('Request approved!')).toBeVisible({ timeout: 20_000 });
});

test('TC-FIN-009 full lifecycle: finance processes the payment', async ({ page }) => {
  requireMutations();
  expect(requestId, 'run the submit test first').toBeTruthy();
  await loginViaUi(page, USERS.finance);
  await page.goto('/finance');
  await expect(page.getByText('Pending Payments', { exact: true }).first()).toBeVisible({ timeout: 20_000 });

  const payRow = page
    .locator('div')
    .filter({ hasText: 'EGP 47.75' })
    .filter({ hasText: 'Pay Now' })
    .first();
  await payRow.getByRole('button', { name: 'Pay Now' }).click();
  await expect(page.getByText('Confirm Payment')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm & Pay' }).click();
  await expect(page.getByText('Payment sent successfully')).toBeVisible({ timeout: 20_000 });
});

test('TC-EMP-012 full lifecycle: employee sees the request as Completed', async ({ page }) => {
  requireMutations();
  expect(requestId, 'run the submit test first').toBeTruthy();
  await loginViaUi(page, USERS.employee);
  await page.goto(`/employee/requests/${requestId}`);
  await expect(page.getByRole('heading', { name: 'Request Details' })).toBeVisible();
  await expect(page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 20_000 });
});