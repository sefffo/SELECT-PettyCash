import type { UserRole } from '@/types/vertex';

export function hasRole(role: UserRole | null, ...allowed: UserRole[]): boolean {
  return role !== null && allowed.includes(role);
}

export function canManageEmployees(role: UserRole | null): boolean {
  return role === 'admin';
}

export function canManageDepartments(role: UserRole | null): boolean {
  return role === 'admin';
}

export function canApproveRequests(role: UserRole | null): boolean {
  return role === 'manager';
}

export function canRejectRequests(role: UserRole | null): boolean {
  return role === 'manager';
}

export function canApproveExpenses(role: UserRole | null): boolean {
  return role === 'manager';
}

export function canRejectExpenses(role: UserRole | null): boolean {
  return role === 'manager';
}

export function canViewReports(role: UserRole | null): boolean {
  return role === 'admin';
}

export function canViewFinancialData(role: UserRole | null): boolean {
  return role === 'admin' || role === 'manager';
}
