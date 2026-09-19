import { test, expect } from '@playwright/test';
import { USERS, MUTATIONS_ENABLED } from '../helpers/credentials';
import { apiExecute, apiLogin, envelopeStatus } from '../helpers/api';

// Change-password round trip driven through the real API. The password is
// changed to a temporary value, verified with a fresh login, then restored.
// Runs ONLY with E2E_MUTATIONS=1.

const TEMP_PASSWORD = `E2E.Tmp.${Date.now()}`;

test.skip(!MUTATIONS_ENABLED, 'E2E_MUTATIONS=1 required for mutation tests');

test('TC-USR-001/002/003 password change verifies and restores via the API', async ({ request }) => {
  const originalPassword = USERS.employee.password;
  const token = (await apiLogin(request, USERS.employee.email, originalPassword)).token;
  expect(token, 'initial login must succeed').toBeTruthy();

  try {
    const change = await apiExecute(request, 'User/ChangePassword', {
      CurrentPassword: originalPassword,
      NewPassword: TEMP_PASSWORD,
    }, token);
    expect(envelopeStatus(change), 'change password should succeed').toBe(0);

    const oldLogin = await apiLogin(request, USERS.employee.email, originalPassword);
    expect(oldLogin.token).toBeFalsy();

    const newLogin = await apiLogin(request, USERS.employee.email, TEMP_PASSWORD);
    expect(newLogin.token).toBeTruthy();
  } finally {
    const restoreToken = (await apiLogin(request, USERS.employee.email, TEMP_PASSWORD)).token;
    const restore = await apiExecute(request, 'User/ChangePassword', {
      CurrentPassword: TEMP_PASSWORD,
      NewPassword: originalPassword,
    }, restoreToken);
    const finalLogin = await apiLogin(request, USERS.employee.email, originalPassword);
    expect(restoreToken, 'restore password change must succeed').toBeTruthy();
    expect(finalLogin.token).toBeTruthy();
    expect(envelopeStatus(restore), 'restoring the password should succeed').toBe(0);
  }
});