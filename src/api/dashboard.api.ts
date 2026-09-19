import { execute } from './axios';
import type {
  AdminDashboardData,
  BudgetUsageData,
  CompletedTransferPoint,
  CompletedTransfersParams,
  EmployeeDashboardData,
  ExpenseTrendData,
  ExpenseTrendPoint,
  ManagerDashboardData,
  MonthlySpendPoint,
  MyProfileInfo,
  TopCategoriesData,
  TopCategoryItem,
  WalletCurrencies,
} from '@/types/api';

export function getEmployeeDashboard(): Promise<EmployeeDashboardData> {
  return execute<EmployeeDashboardData>({ action: 'Dashboard/Employee' });
}

export function getMyProfile(): Promise<MyProfileInfo> {
  return execute<MyProfileInfo>({ action: 'User/GetProfile' });
}

export function getManagerDashboard(): Promise<ManagerDashboardData> {
  return execute<ManagerDashboardData>({ action: 'Dashboard/Manager' });
}

export function getAdminDashboard(): Promise<AdminDashboardData> {
  return execute<AdminDashboardData>({ action: 'Dashboard/Admin' });
}

export function getMonthlySpend(months = 6): Promise<MonthlySpendPoint[]> {
  return execute<MonthlySpendPoint[]>({
    action: 'Dashboard/MonthlySpend',
    parameters: { Months: months },
  });
}

export async function getExpenseTrend(months = 6, currency = 'EGP'): Promise<ExpenseTrendPoint[]> {
  const payload = await execute<ExpenseTrendData | null>({
    action: 'Employee/ExpenseTrend',
    parameters: { Months: months, Currency: currency },
  });
  const rows = payload?.ChartData;
  return Array.isArray(rows) ? rows : [];
}

export function getBudgetUsage(currency = 'EGP'): Promise<BudgetUsageData> {
  return execute<BudgetUsageData>({
    action: 'Employee/BudgetUsage',
    parameters: { Currency: currency },
  });
}

export async function getTopCategories(currency = 'EGP'): Promise<TopCategoryItem[]> {
  const payload = await execute<TopCategoriesData | null>({
    action: 'Employee/TopCategories',
    parameters: { Currency: currency },
  });
  const rows = payload?.ChartData;
  return Array.isArray(rows) ? rows : [];
}

export function getWalletCurrencies(): Promise<WalletCurrencies> {
  return execute<WalletCurrencies>({ action: 'Employee/GetWallet' });
}

/**
 * Shared Manager/Admin dashboard chart series: completed transfers per month.
 * Sends only `TargetYear` so the backend returns the full 12-month annual
 * series (scoped server-side to the caller's role).
 */
export function getCompletedTransfers(params: CompletedTransfersParams = {}): Promise<CompletedTransferPoint[]> {
  return execute<CompletedTransferPoint[]>({
    action: 'Manager/CompletedTransfers',
    parameters: { ...params },
  });
}
