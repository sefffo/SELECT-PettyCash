import { test, expect } from '@playwright/test';
import { USERS, MUTATIONS_ENABLED } from '../helpers/credentials';
import { apiExecute, apiLogin, envelopeStatus } from '../helpers/api';

// Marks one unread notification as read via the real API. Runs ONLY with
// E2E_MUTATIONS=1 because it changes persisted notification state.

const stamp = Date.now();

test.skip(!MUTATIONS_ENABLED, 'E2E_MUTATIONS=1 required for mutation tests');

test('TC-NOT-001 mark a notification as read via the API', async ({ request }) => {
  const token = (await apiLogin(request, USERS.employee.email, USERS.employee.password)).token;
  expect(token).toBeTruthy();

  const list = await apiExecute(request, 'Employee/GetNotifications', {}, token);
  expect(envelopeStatus(list)).toBe(0);
  const rows = (list.Data ?? list.data) as unknown as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(rows) || rows.length === 0) {
    test.info().annotations.push({ type: 'skip', description: `no notifications available (run ${stamp})` });
    return;
  }

  const unread = rows.find((n) => n.IsRead === false || n.Read === false);
  const notificationId = String(unread?.NotificationId ?? unread?.Id ?? '');
  if (!notificationId) {
    test.info().annotations.push({ type: 'skip', description: 'no unread notifications to mark' });
    return;
  }

  const marked = await apiExecute(request, 'User/MarkNotificationsRead', { NotificationId: notificationId }, token);
  expect(envelopeStatus(marked)).toBe(0);

  const after = await apiExecute(request, 'Employee/GetNotifications', {}, token);
  const afterRows = (after.Data ?? after.data) as Array<Record<string, unknown>>;
  const target = afterRows.find((n) => String(n.NotificationId ?? n.Id ?? '') === notificationId);
  if (target) {
    expect(target.IsRead ?? target.Read).not.toBe(false);
  }
});