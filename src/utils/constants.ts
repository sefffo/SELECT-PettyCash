export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? '/api';

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

export const APP_HEADER_HEIGHT = 64;
export const APP_HEADER_HEIGHT_MOBILE = 56;

export const STORAGE_KEYS = {
  THEME_MODE: 'theme-mode',
  AUTH_TOKEN: 'auth-token',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',

  EMPLOYEE: '/employee',
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_REQUESTS: '/employee/requests',
  EMPLOYEE_NEW_REQUEST: '/employee/requests/new',
  EMPLOYEE_REQUEST_DETAIL: '/employee/requests/:id',
  EMPLOYEE_EXPENSES: '/employee/expenses',
  EMPLOYEE_PROFILE: '/employee/profile',
  EMPLOYEE_NOTIFICATIONS: '/employee/notifications',
  EMPLOYEE_SETTINGS: '/employee/settings',

  MANAGER: '/manager',
  MANAGER_DASHBOARD: '/manager/dashboard',
  MANAGER_EMPLOYEES: '/manager/employees',
  MANAGER_REQUESTS: '/manager/requests',
  MANAGER_REQUEST_DETAIL: '/manager/requests/:id',
  MANAGER_PROFILE: '/manager/profile',
  MANAGER_NOTIFICATIONS: '/manager/notifications',
  MANAGER_SETTINGS: '/manager/settings',

  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_REQUESTS: '/admin/requests',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_SETTINGS: '/admin/settings',

  FINANCE: '/finance',
  FINANCE_DASHBOARD: '/finance',
  FINANCE_TRANSACTIONS: '/finance/transactions',
  FINANCE_BALANCES: '/finance/balances',
  FINANCE_EMPLOYEE_HISTORY: '/finance/employee-history',
  FINANCE_NOTIFICATIONS: '/finance/notifications',
  FINANCE_SETTINGS: '/finance/settings',
  FINANCE_PROFILE: '/finance/profile',
} as const;
