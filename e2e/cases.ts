export const BREAKPOINTS = [320, 360, 375, 390, 430, 768, 1024, 1280];
export const DRAWER_BREAKPOINTS = [320, 430, 768];
export const MODAL_BREAKPOINTS = [320, 430, 768, 1280];
export const VIEWPORT_HEIGHT = 800;

export const LOCALES = [
  { code: 'en', dir: 'ltr' },
  { code: 'ar', dir: 'rtl' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

export interface RouteSpec {
  path: string;
  name: string;
}

export interface RoleSpec {
  key: 'employee' | 'manager' | 'admin';
  email: string;
  routes: RouteSpec[];
}

export const ROLES: RoleSpec[] = [
  {
    key: 'employee',
    email: 'user@selecteg.com',
    routes: [
      { path: '/employee/dashboard', name: 'dashboard' },
      { path: '/employee/requests', name: 'requests' },
      { path: '/employee/requests/new', name: 'new-request' },
      { path: '/employee/requests/req-001', name: 'request-detail' },
      { path: '/employee/profile', name: 'profile' },
    ],
  },
  {
    key: 'manager',
    email: 'manager@selecteg.com',
    routes: [
      { path: '/manager/dashboard', name: 'dashboard' },
      { path: '/manager/requests', name: 'requests' },
      { path: '/manager/employees', name: 'employees' },
      { path: '/manager/requests/req-001', name: 'request-detail' },
    ],
  },
  {
    key: 'admin',
    email: 'admin@selecteg.com',
    routes: [
      { path: '/admin/dashboard', name: 'dashboard' },
      { path: '/admin/requests', name: 'requests' },
      { path: '/admin/employees', name: 'employees' },
    ],
  },
];

export const SHOT_ROOT = 'screenshots/regression';

export function shotPath(locale: LocaleCode, role: string, width: number, name: string): string {
  return `${SHOT_ROOT}/${locale}/${role}/${width}/${name}.png`;
}
