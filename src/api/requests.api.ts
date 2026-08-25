import { execute } from './axios';
import type { ApiNotification, EmployeeAllRequestItem, EmployeeExpenseItem, EmployeeRequestItem, PendingRequest } from '@/types/api';

/**
 * Live API contracts (verified against https://pcapi.selecteg.com on 2026-08-24):
 *
 * - `Employee/Expenses/Get`  -> `{ ExpenseId, Amount, Currency, Reason, Status, DateSubmitted }[]`
 *   Only rows created via `Employee/Expenses/Submit` are returned.
 *   (`Employee/AddExpense` writes into the requests store and never shows up here.)
 *
 * - `Employee/Requests/Get`  -> returns only custody/grant rows. Records submitted via
 *   `PettyCash/Submit` are NOT included (verified across repeated calls), so the
 *   "my requests" list must be read from `Employee/GetMyRequests`, which returns every
 *   request created by the authenticated user immediately after submission:
 *   `{ RequestId, Amount, Currency, Description, Status, SubmittedAt }[]`.
 *
 * - `PettyCash/Submit` persists the requested currency only when sent as
 *   `CurrencyCode`; a `Currency` field is silently ignored and defaults to EGP.
 *
 * - Expenses are stored by the backend AS request rows: a record created via
 *   `Employee/Expenses/Submit` appears in `Employee/GetMyRequests` with its
 *   `ExpenseId` reused as `RequestId` (verified field-by-field). The requests
 *   list therefore must exclude rows whose `RequestId` matches an expense ID
 *   from `Employee/Expenses/Get`, otherwise every expense shows up twice
 *   (once under Recent Expenses, once under My Budget Requests).
 */
export async function getEmployeeExpenses(): Promise<EmployeeExpenseItem[]> {
  const result = await execute<EmployeeExpenseItem[]>({ action: 'Employee/Expenses/Get' });
  return result ?? [];
}

export async function getMyRequests(): Promise<EmployeeRequestItem[]> {
  const [requestsResult, expensesResult] = await Promise.allSettled([
    execute<EmployeeRequestItem[]>({ action: 'Employee/GetMyRequests' }),
    execute<EmployeeExpenseItem[]>({ action: 'Employee/Expenses/Get' }),
  ]);

  if (requestsResult.status === 'rejected') {
    throw requestsResult.reason;
  }
  const rows = requestsResult.value ?? [];

  // Entity-ID separation: drop rows that ARE expenses. If the expenses lookup
  // itself failed, return the rows unfiltered rather than losing real requests.
  if (expensesResult.status !== 'fulfilled') {
    return rows;
  }
  const expenseIds = new Set((expensesResult.value ?? []).map((expense) => expense.ExpenseId));
  return rows.filter((row) => !expenseIds.has(row.RequestId));
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  return execute<PendingRequest[]>({ action: 'Data/PendingRequests' });
}

/**
 * Returns ALL custody requests visible to the authenticated employee,
 * including requests initiated by Finance on their behalf.
 * Endpoint: Employee/Requests/GetAll
 */
export async function getEmployeeAllRequests(): Promise<EmployeeAllRequestItem[]> {
  return execute<EmployeeAllRequestItem[]>({ action: 'Employee/Requests/GetAll' });
}

export function getEmployeeNotifications(): Promise<ApiNotification[]> {
  return execute<ApiNotification[]>({ action: 'Employee/GetNotifications' });
}

export function markNotificationAsRead(notificationId: string): Promise<void> {
  return execute<void>({
    action: 'User/MarkNotificationsRead',
    parameters: { NotificationId: notificationId },
  });
}

export function markAllNotificationsAsRead(): Promise<void> {
  return execute<void>({ action: 'User/MarkNotificationsRead', parameters: {} });
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
      CurrencyCode: params.Currency,
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
      CurrencyCode: params.Currency,
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

/**
 * Creates an expense through `Employee/Expenses/Submit`, the only write endpoint whose
 * rows are returned by `Employee/Expenses/Get`. The backend persists just
 * Amount/Currency/Notes, so the dialog fields are composed into Notes using the same
 * "[Category] Title - Description" convention the backend itself applies to requests.
 */
export async function addExpense(params: AddExpenseParams): Promise<{ Message?: string }> {
  const parts = [
    `[${params.Category}] ${params.Title}`,
    params.Description.trim(),
  ].filter((part) => part.trim() !== '');
  const notes = parts.join(' - ').trim();

  return execute<{ Message?: string }>({
    action: 'Employee/Expenses/Submit',
    parameters: {
      Amount: params.Amount,
      Currency: params.Currency,
      Notes: notes,
    },
  });
}

/**
 * Expense approval flow (verified live 2026-08-24):
 *   Employee/Expenses/Submit -> "PendingManager"
 *   PettyCash/Approve        -> employee sees "Approved",
 *                               Finance list shows "Approved by Management"
 *   Finance/ProcessTransaction -> employee sees "Completed" (wallet/safe updated)
 *
 * Known backend gaps (reported): `PettyCash/Reject` only transitions rows in
 * status "Pending" and answers HTTP 404 for expense IDs, so expenses cannot be
 * rejected yet; and no manager-readable GET lists "PendingManager" expenses
 * (`Manager/GetPendingRequests` filters them out).
 */
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
