// Test account credentials for the four application roles.
//
// Defaults are the project's documented test accounts (see investigation-report.md).
// When running against a different environment, override them via environment
// variables or the project `.env` file:
//   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
//   E2E_MANAGER_EMAIL / E2E_MANAGER_PASSWORD
//   E2E_FINANCE_EMAIL / E2E_FINANCE_PASSWORD
//   E2E_EMPLOYEE_EMAIL / E2E_EMPLOYEE_PASSWORD
//   E2E_BASE_URL / E2E_API_BASE_URL

export type UserRoleKey = 'admin' | 'manager' | 'finance' | 'employee';

/**
 * When E2E_MUTATIONS=1, mutation (data-creating) specs run: submit/approve/reject
 * requests, create users/departments, direct transfers/grants, password changes.
 * Off by default so the main suite stays read-only against live data.
 */
export const MUTATIONS_ENABLED = process.env.E2E_MUTATIONS === '1';

/** Guard for mutation specs; skipped entirely unless mutations are enabled. */
export function mutationsEnabled(): boolean {
  return MUTATIONS_ENABLED;
}

export interface TestUser {
  role: UserRoleKey;
  email: string;
  password: string;
  /** Where the app sends the user right after a successful login. */
  dashboardPath: string;
}

export const USERS: Record<UserRoleKey, TestUser> = {
  admin: {
    role: 'admin',
    email: process.env.E2E_ADMIN_EMAIL ?? 'farida@company.com',
    password: process.env.E2E_ADMIN_PASSWORD ?? '555555',
    dashboardPath: '/admin/dashboard',
  },
  manager: {
    role: 'manager',
    email: process.env.E2E_MANAGER_EMAIL ?? 'youssef@company.com',
    password: process.env.E2E_MANAGER_PASSWORD ?? '555555',
    dashboardPath: '/manager/dashboard',
  },
  finance: {
    role: 'finance',
    email: process.env.E2E_FINANCE_EMAIL ?? 'finance@company.com',
    password: process.env.E2E_FINANCE_PASSWORD ?? '555555',
    dashboardPath: '/finance',
  },
  employee: {
    role: 'employee',
    email: process.env.E2E_EMPLOYEE_EMAIL ?? 'menna@company.com',
    password: process.env.E2E_EMPLOYEE_PASSWORD ?? '555555',
    dashboardPath: '/employee/dashboard',
  },
};