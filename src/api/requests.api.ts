import { execute } from './axios';
import type { ApiNotification, EmployeeExpenseItem, EmployeeRequestItem, PendingRequest } from '@/types/api';

export async function getPendingRequests(): Promise<PendingRequest[]> {
  return execute<PendingRequest[]>({ action: 'Data/PendingRequests' });
}

export async function getMyRequests(): Promise<EmployeeRequestItem[]> {
  return execute<EmployeeRequestItem[]>({ action: 'Employee/GetMyRequests' });
}

export async function getExpenses(): Promise<EmployeeExpenseItem[]> {
  return execute<EmployeeExpenseItem[]>({ action: 'Employee/GetExpenses' });
}

export function getEmployeeNotifications(): Promise<ApiNotification[]> {
  return execute<ApiNotification[]>({ action: 'Employee/GetNotifications' });
}

export interface SubmitRequestParams {
  Amount: number;
  Currency: string;
  Reason: string;
}

export async function submitRequest(params: SubmitRequestParams): Promise<{ RequestId: string }> {
  return execute<{ RequestId: string }>({
    action: 'PettyCash/Submit',
    parameters: {
      Amount: params.Amount,
      Currency: params.Currency,
      Reason: params.Reason,
    },
  });
}

export interface SubmitReimbursementParams {
  Amount: number;
  Currency: string;
  Reason: string;
  Category: string;
}

export async function submitReimbursement(params: SubmitReimbursementParams): Promise<{ RequestId: string }> {
  return execute<{ RequestId: string }>({
    action: 'PettyCash/Submit',
    parameters: {
      Amount: params.Amount,
      Currency: params.Currency,
      Reason: params.Reason,
      Category: params.Category,
      RequestType: 'Reimbursement',
    },
  });
}

export interface AddExpenseParams {
  Title: string;
  Category: string;
  Amount: number;
  Currency: string;
  ExpenseDate: string;
  Description: string;
  ReceiptUrl?: string;
}

export async function addExpense(params: AddExpenseParams): Promise<{ RequestId?: string }> {
  return execute<{ RequestId?: string }>({
    action: 'Employee/AddExpense',
    parameters: {
      Title: params.Title,
      Category: params.Category,
      Amount: params.Amount,
      Currency: params.Currency,
      ExpenseDate: params.ExpenseDate,
      Description: params.Description,
      ReceiptUrl: params.ReceiptUrl,
    },
  });
}

export async function approveRequest(requestId: string): Promise<{ RequestId: string }> {
  return execute<{ RequestId: string }>({
    action: 'PettyCash/Approve',
    parameters: { RequestId: requestId },
  });
}

export async function rejectRequest(requestId: string, reason: string): Promise<{ RequestId: string }> {
  return execute<{ RequestId: string }>({
    action: 'PettyCash/Reject',
    parameters: { RequestId: requestId, RejectionReason: reason },
  });
}
