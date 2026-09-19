import { test, expect } from '@playwright/test';
import { USERS } from '../helpers/credentials';
import { apiExecute, apiLogin, envelopeStatus } from '../helpers/api';

let employeeToken: string;
let managerToken: string;

test.beforeAll(async ({ request }) => {
  employeeToken = (await apiLogin(request, USERS.employee.email, USERS.employee.password)).token;
  managerToken = (await apiLogin(request, USERS.manager.email, USERS.manager.password)).token;
});

const employeeForbiddenActions: Array<[string, string, Record<string, unknown>]> = [
  ['TC-ADM-017/TC-PC-024 admin-only: Admin/CreateUser', 'Admin/CreateUser', { Name: 'Nobody', Email: 'nobody@company.com', Password: '123456', Role: 'Employee' }],
  ['TC-PC-011 admin-only: Data/Users', 'Data/Users', {}],
  ['TC-DEPT-004 admin-only: Data/Departments', 'Data/Departments', {}],
  ['TC-PC-024 finance-only: Finance/SafeBalances', 'Finance/SafeBalances', {}],
  ['TC-FIN-005 finance-only: Finance/Transactions', 'Finance/Transactions', {}],
  ['TC-ADM-018 finance-only: Finance/GetAllRequests', 'Finance/GetAllRequests', {}],
  ['TC-ADM-011 admin-only: Admin/GetAllNotifications', 'Admin/GetAllNotifications', {}],
  ['TC-MGR-006 manager-only: Manager/Employees/Balances', 'Manager/Employees/Balances', {}],
  ['TC-PC-013 manager-only: Manager/DirectGrant', 'Manager/DirectGrant', { EmployeeId: 'x', Amount: 1, Currency: 'EGP', Notes: 'x' }],
];

for (const [name, action, parameters] of employeeForbiddenActions) {
  test(`${name} is forbidden for an employee token`, async ({ request }) => {
    const envelope = await apiExecute(request, action, parameters, employeeToken);
    expect(envelopeStatus(envelope)).toBeGreaterThanOrEqual(400);
  });
}

test('TC-MGR-010/TC-PC-011 a manager can read Data/Users', async ({ request }) => {
  const envelope = await apiExecute(request, 'Data/Users', {}, managerToken);
  expect(envelopeStatus(envelope)).toBe(0);
});

test('TC-ADM-011 admin-only endpoints are forbidden for a manager token', async ({ request }) => {
  const envelope = await apiExecute(request, 'Admin/GetAllNotifications', {}, managerToken);
  expect(envelopeStatus(envelope)).toBeGreaterThanOrEqual(400);
});

// The four tests below encode the DOCUMENTED security contract. They FAIL on
// purpose because the live backend does not enforce it (real application bugs).
// They are kept failing so the defects stay visible in the report.

test('BUG report: employee token must NOT access Manager/GetPendingRequests', async ({ request }) => {
  const envelope = await apiExecute(request, 'Manager/GetPendingRequests', {}, employeeToken);
  expect(envelopeStatus(envelope)).toBeGreaterThanOrEqual(400);
});

test('BUG report: Employee/GetWallet must require an authenticated token', async ({ request }) => {
  const envelope = await apiExecute(request, 'Employee/GetWallet', {});
  expect(envelopeStatus(envelope)).toBeGreaterThanOrEqual(400);
});

test('BUG report: Finance/SafeBalances must require an authenticated token', async ({ request }) => {
  const envelope = await apiExecute(request, 'Finance/SafeBalances', {});
  expect(envelopeStatus(envelope)).toBeGreaterThanOrEqual(400);
});

test('BUG report: Finance/Transactions must require an authenticated token', async ({ request }) => {
  const envelope = await apiExecute(request, 'Finance/Transactions', {});
  expect(envelopeStatus(envelope)).toBeGreaterThanOrEqual(400);
});