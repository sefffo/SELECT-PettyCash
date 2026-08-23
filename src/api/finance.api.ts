import { execute } from './axios';
import type {
  DirectPaymentParams,
  FinanceEmployeeBalance,
  FinanceRequestDetails,
  FinanceRequestItem,
  FinanceSafeBalances,
  FinanceTransactionItem,
} from '@/types/api';

export function getFinanceTransactions(): Promise<FinanceTransactionItem[]> {
  return execute<FinanceTransactionItem[]>({ action: 'Finance/Transactions' });
}

export function getFinanceAllRequests(): Promise<FinanceRequestItem[]> {
  return execute<FinanceRequestItem[]>({ action: 'Finance/GetAllRequests' });
}

export function getFinanceSafeBalances(): Promise<FinanceSafeBalances> {
  return execute<FinanceSafeBalances>({ action: 'Finance/SafeBalances' });
}

export function getFinanceEmployeeBalances(): Promise<FinanceEmployeeBalance[]> {
  return execute<FinanceEmployeeBalance[]>({ action: 'Finance/EmployeeBalances' });
}

export function getFinanceEmployeeHistory(employeeId: string): Promise<FinanceTransactionItem[]> {
  return execute<FinanceTransactionItem[]>({
    action: 'Finance/EmployeeHistory',
    parameters: { EmployeeId: employeeId },
  });
}

export function getFinanceRequestDetails(requestId: string): Promise<FinanceRequestDetails> {
  return execute<FinanceRequestDetails>({
    action: 'Finance/GetRequestDetails',
    parameters: { RequestId: requestId },
  });
}

export function processFinanceTransaction(requestId: string): Promise<null> {
  return execute<null>({
    action: 'Finance/ProcessTransaction',
    parameters: { RequestId: requestId },
  });
}

export function submitDirectPayment(params: DirectPaymentParams): Promise<null> {
  return execute<null>({
    action: 'Finance/Payments/Direct',
    parameters: {
      EmployeeId: params.EmployeeId,
      Amount: params.Amount,
      Currency: params.Currency,
      Notes: params.Notes,
    },
  });
}
