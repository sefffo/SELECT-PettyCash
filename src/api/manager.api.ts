import { execute } from './axios';
import type { DirectGrantParams, GetNotificationsParams, ManagerEmployeeBalance, ManagerExpenseOverviewData, ManagerExpenseOverviewPoint, ManagerRequestItem, NotificationPageResult } from '@/types/api';
import { normalizeNotificationsPage } from '@/utils/notifications';

export function getManagerPendingRequests(): Promise<ManagerRequestItem[]> {
  return execute<ManagerRequestItem[]>({ action: 'Manager/GetPendingRequests' });
}

export async function getManagerExpenseOverview(currency?: string): Promise<ManagerExpenseOverviewPoint[]> {
  const payload = await execute<ManagerExpenseOverviewData | null>({
    action: 'Manager/ExpenseOverview',
    parameters: currency ? { Currency: currency } : undefined,
  });
  const rows = payload?.ChartData;
  return Array.isArray(rows) ? rows : [];
}

export function getManagerApprovedRequests(): Promise<ManagerRequestItem[]> {
  return execute<ManagerRequestItem[]>({ action: 'Manager/GetApprovedRequests' });
}

export function getManagerRejectedRequests(): Promise<ManagerRequestItem[]> {
  return execute<ManagerRequestItem[]>({ action: 'Manager/GetRejectedRequests' });
}

export async function getManagerNotifications({ page, pageSize }: GetNotificationsParams): Promise<NotificationPageResult> {
  const payload = await execute<unknown>({
    action: 'Manager/GetNotifications',
    parameters: { Page: page, PageSize: pageSize },
  });
  return normalizeNotificationsPage(payload, pageSize);
}

export function getManagerEmployeeBalances(): Promise<ManagerEmployeeBalance[]> {
  return execute<ManagerEmployeeBalance[]>({ action: 'Manager/Employees/Balances' });
}

export function submitDirectGrant(params: DirectGrantParams): Promise<null> {
  return execute<null>({
    action: 'Manager/DirectGrant',
    parameters: {
      EmployeeId: params.EmployeeId,
      Amount: params.Amount,
      Currency: params.Currency,
      Notes: params.Notes,
      Category: params.Category,
    },
  });
}
