import { execute } from './axios';
import type { ApiNotification, DirectGrantParams, ManagerEmployeeBalance, ManagerExpenseOverviewPoint, ManagerRequestItem } from '@/types/api';

export function getManagerPendingRequests(): Promise<ManagerRequestItem[]> {
  return execute<ManagerRequestItem[]>({ action: 'Manager/GetPendingRequests' });
}

export function getManagerExpenseOverview(): Promise<ManagerExpenseOverviewPoint[]> {
  return execute<ManagerExpenseOverviewPoint[]>({ action: 'Manager/ExpenseOverview' });
}

export function getManagerApprovedRequests(): Promise<ManagerRequestItem[]> {
  return execute<ManagerRequestItem[]>({ action: 'Manager/GetApprovedRequests' });
}

export function getManagerRejectedRequests(): Promise<ManagerRequestItem[]> {
  return execute<ManagerRequestItem[]>({ action: 'Manager/GetRejectedRequests' });
}

export function getManagerNotifications(): Promise<ApiNotification[]> {
  return execute<ApiNotification[]>({ action: 'Manager/GetNotifications' });
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
    },
  });
}
