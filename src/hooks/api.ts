import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBudgetUsage,
  getEmployeeDashboard,
  getExpenseTrend,
  getManagerDashboard,
  getAdminDashboard,
  getMonthlySpend,
  getMyProfile,
  getTopCategories,
  getWalletCurrencies,
} from '@/api/dashboard.api';
import {
  assignDepartment,
  changeUserStatus,
  createDepartment,
  createUser,
  deleteUser,
  editUser,
  getAdminNotifications,
  getDepartments,
  getEmployeeProfile,
  getProfile,
  getUsers,
  promoteManager,
  type AssignDepartmentParams,
  type ChangeUserStatusParams,
  type CreateUserParams,
  type EditUserParams,
} from '@/api/admin.api';
import {
  getManagerApprovedRequests,
  getManagerExpenseOverview,
  getManagerNotifications,
  getManagerPendingRequests,
  getManagerRejectedRequests,
  submitDirectGrant,
} from '@/api/manager.api';
import {
  addExpense,
  approveRequest,
  getEmployeeNotifications,
  getExpenses,
  getMyRequests,
  getPendingRequests,
  rejectRequest,
  submitReimbursement,
  submitRequest,
  type AddExpenseParams,
  type SubmitReimbursementParams,
  type SubmitRequestParams,
} from '@/api/requests.api';
import {
  resubmitProof,
  submitPayment,
  type ResubmitParams,
  type SubmitPaymentParams,
} from '@/api/payments.api';
import {
  getFinanceAllRequests,
  getFinanceEmployeeBalances,
  getFinanceEmployeeHistory,
  getFinanceSafeBalances,
  getFinanceTransactions,
  processFinanceTransaction,
  submitDirectPayment,
} from '@/api/finance.api';
import type { DirectGrantParams, DirectPaymentParams } from '@/types/api';
import { changePassword, type ChangePasswordParams } from '@/api/auth.api';
import { buildEmailNameMap, buildRequesterNameMap } from '@/utils/mappers';
import { filterNotificationsForCurrentUser } from '@/utils/notifications';
import { useAuthStore } from '@/store/authStore';

export const queryKeys = {
  employeeDashboard: ['dashboard', 'employee'] as const,
  myProfile: ['profile', 'employee'] as const,
  managerDashboard: ['dashboard', 'manager'] as const,
  managerExpenseOverview: ['manager', 'expense-overview'] as const,
  adminDashboard: ['dashboard', 'admin'] as const,
  monthlySpend: ['dashboard', 'monthly-spend'] as const,
  expenseTrend: ['employee', 'expense-trend'] as const,
  budgetUsage: ['employee', 'budget-usage'] as const,
  topCategories: ['employee', 'top-categories'] as const,
  walletCurrencies: ['employee', 'wallet-currencies'] as const,
  users: ['users'] as const,
  departments: ['departments'] as const,
  pendingRequests: ['pending-requests'] as const,
  myRequests: ['my-requests'] as const,
  expenses: ['employee', 'expenses'] as const,
  managerPendingRequests: ['manager-requests', 'pending'] as const,
  managerApprovedRequests: ['manager-requests', 'approved'] as const,
  managerRejectedRequests: ['manager-requests', 'rejected'] as const,
  notifications: ['notifications'] as const,
  financeTransactions: ['finance', 'transactions'] as const,
  financeRequests: ['finance', 'requests'] as const,
  financeSafeBalances: ['finance', 'safe-balances'] as const,
  financeEmployeeBalances: ['finance', 'employee-balances'] as const,
  financeEmployeeHistory: ['finance', 'employee-history'] as const,
};

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: queryKeys.employeeDashboard,
    queryFn: getEmployeeDashboard,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: getMyProfile,
  });
}

export function useManagerDashboard() {
  return useQuery({
    queryKey: queryKeys.managerDashboard,
    queryFn: getManagerDashboard,
  });
}

export function useManagerExpenseOverview() {
  return useQuery({
    queryKey: queryKeys.managerExpenseOverview,
    queryFn: getManagerExpenseOverview,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: getAdminDashboard,
  });
}

export function useMonthlySpend() {
  return useQuery({
    queryKey: queryKeys.monthlySpend,
    queryFn: () => getMonthlySpend(6),
  });
}

export function useExpenseTrend() {
  return useQuery({
    queryKey: queryKeys.expenseTrend,
    queryFn: () => getExpenseTrend(6),
  });
}

export function useBudgetUsage() {
  return useQuery({
    queryKey: queryKeys.budgetUsage,
    queryFn: getBudgetUsage,
  });
}

export function useTopCategories() {
  return useQuery({
    queryKey: queryKeys.topCategories,
    queryFn: getTopCategories,
  });
}

export function useWalletCurrencies() {
  return useQuery({
    queryKey: queryKeys.walletCurrencies,
    queryFn: getWalletCurrencies,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers,
  });
}

export function useRequesterNames() {
  const { data: users } = useUsers();
  return useMemo(() => buildRequesterNameMap(users ?? []), [users]);
}

export function useEmailNameMap() {
  const { data: users } = useUsers();
  return useMemo(() => buildEmailNameMap(users ?? []), [users]);
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: getDepartments,
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: queryKeys.pendingRequests,
    queryFn: getPendingRequests,
  });
}

export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.myRequests,
    queryFn: getMyRequests,
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: getExpenses,
  });
}

export function useManagerPendingRequests() {
  return useQuery({
    queryKey: queryKeys.managerPendingRequests,
    queryFn: getManagerPendingRequests,
  });
}

export function useManagerApprovedRequests() {
  return useQuery({
    queryKey: queryKeys.managerApprovedRequests,
    queryFn: getManagerApprovedRequests,
  });
}

export function useManagerRejectedRequests() {
  return useQuery({
    queryKey: queryKeys.managerRejectedRequests,
    queryFn: getManagerRejectedRequests,
  });
}

export function useNotifications() {
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.notifications, role, userId] as const,
    queryFn: () => {
      if (role === 'admin') return getAdminNotifications();
      if (role === 'manager') return getManagerNotifications();
      return getEmployeeNotifications();
    },
    select: (data) => filterNotificationsForCurrentUser(data ?? [], userId),
    enabled: role === 'admin' || role === 'manager' || role === 'finance' || role === 'employee',
  });
}

export function useFinanceTransactions() {
  return useQuery({
    queryKey: queryKeys.financeTransactions,
    queryFn: getFinanceTransactions,
  });
}

export function useFinanceAllRequests() {
  return useQuery({
    queryKey: queryKeys.financeRequests,
    queryFn: getFinanceAllRequests,
  });
}

export function useFinanceSafeBalances() {
  return useQuery({
    queryKey: queryKeys.financeSafeBalances,
    queryFn: getFinanceSafeBalances,
  });
}

export function useFinanceEmployeeBalances() {
  return useQuery({
    queryKey: queryKeys.financeEmployeeBalances,
    queryFn: getFinanceEmployeeBalances,
  });
}

export function useFinanceEmployeeHistory(employeeId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.financeEmployeeHistory, employeeId] as const,
    queryFn: () => getFinanceEmployeeHistory(employeeId as string),
    enabled: !!employeeId,
  });
}

export function useProcessTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => processFinanceTransaction(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeSafeBalances });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeEmployeeBalances });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeEmployeeHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests });
    },
  });
}

export function useSubmitDirectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: DirectPaymentParams) => submitDirectPayment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeEmployeeBalances });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeSafeBalances });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeEmployeeHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeRequests });
    },
  });
}

export function useSubmitDirectGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: DirectGrantParams) => submitDirectGrant(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.managerPendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerApprovedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerRejectedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeSafeBalances });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeEmployeeBalances });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeEmployeeHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

export function useAdminProfile(targetUserId: string | null) {
  return useQuery({
    queryKey: ['admin', 'profile', targetUserId] as const,
    queryFn: () => getProfile(targetUserId as string),
    enabled: !!targetUserId,
  });
}

export function useAdminEmployeeProfile(targetUserId: string | null) {
  return useQuery({
    queryKey: ['admin', 'employee-profile', targetUserId] as const,
    queryFn: () => getEmployeeProfile(targetUserId as string),
    enabled: !!targetUserId,
  });
}

export function useSubmitRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: SubmitRequestParams) => submitRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerPendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseTrend });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetUsage });
      queryClient.invalidateQueries({ queryKey: queryKeys.topCategories });
    },
  });
}

export function useSubmitReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: SubmitReimbursementParams) => submitReimbursement(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseTrend });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetUsage });
      queryClient.invalidateQueries({ queryKey: queryKeys.topCategories });
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AddExpenseParams) => addExpense(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseTrend });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetUsage });
      queryClient.invalidateQueries({ queryKey: queryKeys.topCategories });
    },
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerPendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerApprovedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) => rejectRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerPendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerRejectedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateUserParams) => createUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: EditUserParams) => editUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => deleteUser(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function useAssignDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AssignDepartmentParams) => assignDepartment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createDepartment(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function usePromoteManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => promoteManager(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ChangeUserStatusParams) => changeUserStatus(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: SubmitPaymentParams) => submitPayment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
    },
  });
}

export function useResubmitProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ResubmitParams) => resubmitProof(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (params: ChangePasswordParams) => changePassword(params),
  });
}
