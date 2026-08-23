import { execute } from './axios';
import type {
  AdminDashboardData,
  BudgetUsageData,
  EmployeeDashboardData,
  ExpenseTrendPoint,
  ManagerDashboardData,
  MonthlySpendPoint,
  MyProfileInfo,
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

export function getExpenseTrend(months = 6): Promise<ExpenseTrendPoint[]> {
  return execute<ExpenseTrendPoint[]>({
    action: 'Employee/ExpenseTrend',
    parameters: { Months: months },
  });
}

export function getBudgetUsage(): Promise<BudgetUsageData> {
  return execute<BudgetUsageData>({ action: 'Employee/BudgetUsage' });
}

export function getTopCategories(): Promise<TopCategoryItem[]> {
  return execute<TopCategoryItem[]>({ action: 'Employee/TopCategories' });
}

export function getWalletCurrencies(): Promise<WalletCurrencies> {
  return execute<WalletCurrencies>({ action: 'Employee/GetWallet' });
}
