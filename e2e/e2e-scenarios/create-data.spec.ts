import { test, expect } from '@playwright/test';
import { USERS, MUTATIONS_ENABLED } from '../helpers/credentials';
import { apiExecute, apiLogin, envelopeStatus, envelopeMessage, decodeJwt } from '../helpers/api';

// Data-creating admin/manager actions driven through the real API.
// Runs ONLY with E2E_MUTATIONS=1.
//
// Persistent-data footprint:
//  - the admin user and its department are created and then deleted (self-cleaning)
//  - an "E2E Dept" department has NO delete endpoint and therefore REMAINS
//  - the 1 EGP direct grant increases the employee wallet balance permanently

const stamp = Date.now();
const uniqEmail = `e2e.created.${stamp}@company.com`;

test.skip(!MUTATIONS_ENABLED, 'E2E_MUTATIONS=1 required for mutation tests');

test('TC-ADM-013 admin creates, edits and deletes a user via the API', async ({ request }) => {
  const adminToken = (await apiLogin(request, USERS.admin.email, USERS.admin.password)).token;

  const created = await apiExecute(request, 'Admin/CreateUser', {
    Name: `E2E Created ${stamp}`,
    Email: uniqEmail,
    Password: 'E2ePass123!',
    Role: 'Employee',
  }, adminToken);
  expect(envelopeStatus(created)).toBe(0);

  const users = await apiExecute(request, 'Data/Users', {}, adminToken);
  expect(envelopeStatus(users)).toBe(0);
  const rows = (users.Data ?? users.data) as Array<Record<string, unknown>>;
  const createdRow = rows.find((u) => String(u.Email).toLowerCase() === uniqEmail);
  expect(createdRow, 'created user must appear in the users list').toBeTruthy();
  const createdId = String(createdRow!.Id);

  const edited = await apiExecute(request, 'Admin/EditUser', { Id: createdId, Name: `E2E Edited ${stamp}` }, adminToken);
  expect(envelopeStatus(edited)).toBe(0);

  const deleted = await apiExecute(request, 'Admin/DeleteUser', { Id: createdId }, adminToken);
  expect(envelopeStatus(deleted)).toBe(0);

  const after = await apiExecute(request, 'Data/Users', {}, adminToken);
  const afterRows = (after.Data ?? after.data) as Array<Record<string, unknown>>;
  expect(afterRows.some((u) => String(u.Id) === createdId)).toBe(false);
});

test('TC-DEPT-003 admin creates a department via the API', async ({ request }) => {
  const adminToken = (await apiLogin(request, USERS.admin.email, USERS.admin.password)).token;
  const name = `E2E Dept ${stamp}`;

  const created = await apiExecute(request, 'Department/Create', { Name: name }, adminToken);
  expect(envelopeStatus(created), envelopeMessage(created)).toBe(0);

  const depts = await apiExecute(request, 'Data/Departments', {}, adminToken);
  expect(envelopeStatus(depts)).toBe(0);
  const rows = (depts.Data ?? depts.data) as Array<Record<string, unknown>>;
  expect(rows.some((d) => String(d.Name) === name)).toBe(true);
});

test('TC-PC-014 manager issues a small direct grant via the API', async ({ request }) => {
  const managerToken = (await apiLogin(request, USERS.manager.email, USERS.manager.password)).token;
  const employeeToken = (await apiLogin(request, USERS.employee.email, USERS.employee.password)).token;
  const employeeId = decodeJwt(employeeToken).nameid as string;
  expect(employeeId).toBeTruthy();

  const wallet = (await apiExecute(request, 'Employee/GetWallet', {}, employeeToken)).Data as Record<string, number>;
  const beforeEgp = Number(wallet.EGP ?? 0);

  const grant = await apiExecute(request, 'Manager/DirectGrant', {
    EmployeeId: employeeId,
    Amount: 1,
    Currency: 'EGP',
    Notes: `E2E direct grant ${stamp}`,
  }, managerToken);
  expect(envelopeStatus(grant)).toBe(0);

  const after = (await apiExecute(request, 'Employee/GetWallet', {}, employeeToken)).Data as Record<string, number>;
  expect(Number(after.EGP ?? 0)).toBe(beforeEgp + 1);
});