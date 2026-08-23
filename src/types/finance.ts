/**
 * Payment source selected by the Finance team when disbursing a request.
 * NOTE: The Postman collection does not provide a parameter to send the payment
 * source to the backend yet. It is tracked client-side only until an API exists.
 */
export type PaymentSource = 'corporate-bank' | 'main-office-cash' | 'company-wallet';

export const PAYMENT_SOURCES: { value: PaymentSource; labelKey: string; icon: string }[] = [
  { value: 'corporate-bank', labelKey: 'finance.sourceCorporateBank', icon: '🏦' },
  { value: 'main-office-cash', labelKey: 'finance.sourceMainOfficeCash', icon: '💵' },
  { value: 'company-wallet', labelKey: 'finance.sourceCompanyWallet', icon: '📱' },
];

/**
 * Statuses returned by the finance request list API (`Finance/GetAllRequests`).
 * NOTE: Only `ApprovedByManagement` is part of the Finance workflow. Requests
 * in `Pending`/`PendingManagementApproval`/`RejectedByManagement` must NOT be
 * shown to Finance — they have not passed the Manager approval stage.
 */
export const FINANCE_REQUEST_STATUSES = {
  Pending: 'Pending',
  PendingManagementApproval: 'Pending Management Approval',
  ApprovedByManagement: 'Approved by Management',
  RejectedByManagement: 'Rejected by Management',
  Completed: 'Completed',
} as const;

/**
 * Statuses returned by `Finance/Transactions` and `Finance/EmployeeHistory`.
 * NOTE: `PendingManager` (awaiting Manager) and `Rejected` are NOT part of the
 * Finance workflow — Finance only handles manager-approved requests.
 */
export const FINANCE_TRANSACTION_STATUSES = {
  Pending: 'Pending',
  PendingManager: 'PendingManager',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Completed: 'Completed',
} as const;

/** Finance dashboard KPI values, computed from the finance-scoped APIs. */
export interface FinanceDashboardData {
  totalDisbursed: number;
  disbursedCount: number;
  pendingPaymentsTotal: number;
  pendingPaymentsCount: number;
  custodyAccountsCount: number;
}

export function isFinancePendingPaymentStatus(status: string): boolean {
  return status === FINANCE_REQUEST_STATUSES.ApprovedByManagement;
}

export function isDisbursedTransactionStatus(status: string): boolean {
  return status === FINANCE_TRANSACTION_STATUSES.Completed;
}

export function isPendingPaymentTransactionStatus(status: string): boolean {
  return status === FINANCE_TRANSACTION_STATUSES.Approved;
}

/**
 * Transaction statuses that belong to the Finance workflow. Rows still with the
 * Manager (`PendingManager`) or rejected (`Rejected`) must never surface in the
 * Finance view.
 */
export function isFinanceVisibleTransactionStatus(status: string): boolean {
  return isDisbursedTransactionStatus(status) || isPendingPaymentTransactionStatus(status);
}