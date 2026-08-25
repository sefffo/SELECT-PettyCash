import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/utils/constants';
import { queryClient } from '@/services/queryClient';
import { loginRequest } from '@/api/auth.api';
import type { ApiRole } from '@/types/api';
import type { Employee, UserRole } from '@/types/vertex';

interface JwtClaims {
  nameid?: string;
  email?: string;
  unique_name?: string;
  role?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

function isValidRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'manager' || value === 'employee' || value === 'finance';
}

function mapApiRole(role: ApiRole): UserRole {
  switch (role) {
    case 'Administrator': return 'admin';
    case 'Manager': return 'manager';
    case 'Finance': return 'finance';
    default: return 'employee';
  }
}

function deriveName(email: string): string {
  const prefix = email.split('@')[0] ?? '';
  const parts = prefix.split(/[._-]+/).filter(Boolean);
  return parts.length > 1
    ? parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    : prefix;
}

function buildUser(token: string, email: string, apiRole: ApiRole): Employee {
  const claims = decodeJwtPayload(token);
  const fallbackName = deriveName(email);
  return {
    id: claims?.nameid ?? '',
    name: claims?.unique_name ?? fallbackName,
    email,
    avatar: '',
    role: apiRole,
    department: '',
    status: 'active',
    userRole: mapApiRole(apiRole),
    createdAt: '',
    updatedAt: '',
  };
}

function getTokenExpiry(token: string): number | null {
  const claims = decodeJwtPayload(token);
  return claims?.exp ? claims.exp * 1000 : null;
}

function detectTampering(persisted: Record<string, unknown>): boolean {
  if (persisted.isAuthenticated === true) {
    if (!persisted.user || typeof persisted.user !== 'object') return true;
    const u = persisted.user as Record<string, unknown>;
    if (typeof u.id !== 'string' || typeof u.email !== 'string') return true;
    if (!isValidRole(persisted.role)) return true;
    if (u.userRole !== persisted.role) return true;
  }
  return false;
}

interface PersistedSession {
  user: Employee | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  sessionExpiresAt: number | null;
}

interface AuthState extends PersistedSession {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  validateSession: () => boolean;
  getDashboardPath: () => string;
}

const initialState: PersistedSession = {
  user: null,
  isAuthenticated: false,
  role: null,
  sessionExpiresAt: null,
};

function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        const result = await loginRequest({ Email: email, Password: password });
        if (!result) {
          throw new Error('Login response was missing token and role data.');
        }
        const { token, role } = result;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        const user = buildUser(token, email, role);
        queryClient.clear();
        set({
          user,
          isAuthenticated: true,
          role: user.userRole,
          sessionExpiresAt: getTokenExpiry(token),
        });
        return true;
      },

      logout: () => {
        clearToken();
        queryClient.clear();
        set({ ...initialState });
      },

      validateSession: () => {
        const { isAuthenticated, sessionExpiresAt } = get();
        if (!isAuthenticated) return false;
        if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
          get().logout();
          return false;
        }
        return true;
      },

      getDashboardPath: () => {
        const role = get().role;
        switch (role) {
          case 'admin': return '/admin/dashboard';
          case 'manager': return '/manager/dashboard';
          case 'finance': return '/finance';
          case 'employee': return '/employee/dashboard';
          default: return '/login';
        }
      },
    }),
    {
      name: 'pretty-cash-session',
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        role: s.role,
        sessionExpiresAt: s.sessionExpiresAt,
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>;
        if (detectTampering(p)) return { ...current, ...initialState };
        return { ...current, ...p };
      },
    },
  ),
);

if (typeof window !== 'undefined') {
  window.addEventListener('pc:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}
