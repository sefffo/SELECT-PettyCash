import { useMemo } from 'react';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBudgetUsage,
  getCompletedTransfers,
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
  getAdminDashboardBalances,
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
  getManagerEmployeeBalances,
  getManagerExpenseOverview,
  getManagerNotifications,
  getManagerPendingRequests,
  getManagerRejectedRequests,
  submitDirectGrant,
} from '@/api/manager.api';
import {
  addExpense,
  approveRequest,
  getEmployeeExpenses,
  getEmployeeAllRequests,
  getEmployeeNotifications,
  getMyRequests,
  getPendingRequests,
  markAllNotificationsAsRead,
  markNotificationAsRead,
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
  getFinanceRequestDetails,
  getFinanceSafeBalances,
  getFinanceTransactions,
  processFinanceTransaction,
  submitDirectPayment,
} from '@/api/finance.api';
import type { ApiNotification, DirectGrantParams, DirectPaymentParams, NotificationPageResult } from '@/types/api';
import { changePassword, type ChangePasswordParams } from '@/api/auth.api';
import { buildEmailNameMap, buildRequesterNameMap } from '@/utils/mappers';
import { filterNotificationsForCurrentUser, getNotificationKey } from '@/utils/notifications';
import { useAuthStore } from '@/store/authStore';

export const queryKeys = {
  employeeDashboard: ['dashboard', 'employee'] as const,
  myProfile: ['profile', 'employee'] as const,
  managerDashboard: ['dashboard', 'manager'] as const,
  managerExpenseOverview: ['manager', 'expense-overview'] as const,
  completedTransfers: ['manager', 'completed-transfers'] as const,
  adminDashboard: ['dashboard', 'admin'] as const,
  adminDashboardBalances: ['dashboard', 'admin', 'balances'] as const,
  monthlySpend: ['dashboard', 'monthly-spend'] as const,
  expenseTrend: ['employee', 'expense-trend'] as const,
  budgetUsage: ['employee', 'budget-usage'] as const,
  topCategories: ['employee', 'top-categories'] as const,
  walletCurrencies: ['employee', 'wallet-currencies'] as const,
  users: ['users'] as const,
  departments: ['departments'] as const,
  pendingRequests: ['pending-requests'] as const,
  myRequests: ['my-requests'] as const,
  employeeAllRequests: ['employee', 'all-requests'] as const,
  expenses: ['employee', 'expenses'] as const,
  managerPendingRequests: ['manager-requests', 'pending'] as const,
  managerApprovedRequests: ['manager-requests', 'approved'] as const,
  managerRejectedRequests: ['manager-requests', 'rejected'] as const,
  managerEmployeeBalances: ['manager', 'employee-balances'] as const,
  notifications: ['notifications'] as const,
  financeTransactions: ['finance', 'transactions'] as const,
  financeRequests: ['finance', 'requests'] as const,
  financeSafeBalances: ['finance', 'safe-balances'] as const,
  financeEmployeeBalances: ['finance', 'employee-balances'] as const,
  financeEmployeeHistory: ['finance', 'employee-history'] as const,
  financeRequestDetails: ['finance', 'request-details'] as const,
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
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.managerDashboard, userId] as const,
    queryFn: getManagerDashboard,
    enabled: Boolean(userId),
  });
}

export function useManagerExpenseOverview(currency = 'EGP') {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.managerExpenseOverview, userId, currency] as const,
    queryFn: () => getManagerExpenseOverview(currency),
    enabled: Boolean(userId),
  });
}

/**
 * Shared Manager/Admin dashboard chart series (`Manager/CompletedTransfers`).
 * Fetches the full annual series for the current year; the backend scopes rows
 * to the caller's role (company-wide for Admin, department for Manager).
 */
export function useCompletedTransfers() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const targetYear = new Date().getFullYear();
  return useQuery({
    queryKey: [...queryKeys.completedTransfers, userId, targetYear] as const,
    queryFn: () => getCompletedTransfers({ TargetYear: targetYear }),
    enabled: Boolean(userId),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: getAdminDashboard,
  });
}

export function useAdminDashboardBalances() {
  return useQuery({
    queryKey: queryKeys.adminDashboardBalances,
    queryFn: getAdminDashboardBalances,
  });
}

export function useMonthlySpend() {
  return useQuery({
    queryKey: queryKeys.monthlySpend,
    queryFn: () => getMonthlySpend(6),
  });
}

export function useExpenseTrend(currency = 'EGP') {
  return useQuery({
    queryKey: [...queryKeys.expenseTrend, currency] as const,
    queryFn: () => getExpenseTrend(6, currency),
  });
}

export function useBudgetUsage(currency = 'EGP') {
  return useQuery({
    queryKey: [...queryKeys.budgetUsage, currency] as const,
    queryFn: () => getBudgetUsage(currency),
  });
}

export function useTopCategories(currency = 'EGP') {
  return useQuery({
    queryKey: [...queryKeys.topCategories, currency] as const,
    queryFn: () => getTopCategories(currency),
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

/**
 * `UserId -> Name` map built from `Data/Users`. The manager PENDING queue
 * returns only `EmployeeId`, so pending rows are resolved against this map.
 */
export function useManagerNameMap() {
  const { data: users } = useUsers();
  return useMemo(() => buildRequesterNameMap(users ?? []), [users]);
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

/**
 * Fetches ALL custody requests for the authenticated employee via
 * `Employee/Requests/GetAll`, which includes requests initiated by Finance.
 */
export function useEmployeeAllRequests() {
  return useQuery({
    queryKey: queryKeys.employeeAllRequests,
    queryFn: getEmployeeAllRequests,
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: getEmployeeExpenses,
  });
}

export function useManagerPendingRequests() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.managerPendingRequests, userId] as const,
    queryFn: getManagerPendingRequests,
    enabled: Boolean(userId),
  });
}

export function useManagerApprovedRequests() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.managerApprovedRequests, userId] as const,
    queryFn: getManagerApprovedRequests,
    enabled: Boolean(userId),
  });
}

export function useManagerRejectedRequests() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.managerRejectedRequests, userId] as const,
    queryFn: getManagerRejectedRequests,
    enabled: Boolean(userId),
  });
}

export function useManagerEmployeeBalances() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  return useQuery({
    queryKey: [...queryKeys.managerEmployeeBalances, userId] as const,
    queryFn: getManagerEmployeeBalances,
    enabled: Boolean(userId),
  });
}

const NOTIFICATIONS_PAGE_SIZE = 10;

const noopFetchNextPage = async (): Promise<unknown> => undefined;

function isNotificationPagesData(value: unknown): value is { pages: NotificationPageResult[]; pageParams: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { pages?: unknown }).pages) &&
    (value as { pages: unknown[] }).pages.every(
      (page) => typeof page === 'object' && page !== null && Array.isArray((page as { items?: unknown }).items),
    )
  );
}

/** Updates read state inside both infinite-query pages and the legacy admin array. */
function applyToNotificationPages(
  data: unknown,
  updater: (notification: ApiNotification) => ApiNotification,
): unknown {
  if (Array.isArray(data)) {
    return (data as ApiNotification[]).map(updater);
  }
  if (isNotificationPagesData(data)) {
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map(updater),
      })),
    };
  }
  return data;
}

function filterNotificationPagesForCurrentUser<T>(
  data: T,
  userId: string | null | undefined,
): T {
  if (!userId) return data;
  if (Array.isArray(data)) return filterNotificationsForCurrentUser(data, userId) as unknown as T;
  if (isNotificationPagesData(data)) {
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: filterNotificationsForCurrentUser(page.items, userId),
      })),
    } as T;
  }
  return data;
}

export function useNotifications() {
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isPaginatedRole = role === 'employee' || role === 'manager' || role === 'finance';
  const isAdmin = role === 'admin';

  const selectNotifications = useMemo(
    () => <T,>(data: T): T => filterNotificationPagesForCurrentUser(data, userId),
    [userId],
  );

  const infinite = useInfiniteQuery({
    queryKey: [...queryKeys.notifications, 'pages', role, userId] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params = { page: pageParam, pageSize: NOTIFICATIONS_PAGE_SIZE };
      return role === 'manager' ? getManagerNotifications(params) : getEmployeeNotifications(params);
    },
    enabled: isPaginatedRole && Boolean(userId),
    staleTime: 60_000,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.nextPage ?? allPages.length + 1;
    },
    select: selectNotifications,
  });

  // Admin has no visible notifications UI and is intentionally NOT upgraded to
  // lazy loading. Keep the existing (unpaged) behavior unchanged.
  const admin = useQuery({
    queryKey: [...queryKeys.notifications, 'all', role, userId] as const,
    queryFn: getAdminNotifications,
    select: selectNotifications,
    enabled: isAdmin,
  });

  const flattened = (infinite.data?.pages ?? []).flatMap((page) => page.items);
  const seen = new Set<string>();
  const data = flattened.filter((notification) => {
    const key = getNotificationKey(notification);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    data: isAdmin ? (admin.data ?? []) : data,
    isLoading: isAdmin ? admin.isLoading : isPaginatedRole ? infinite.isLoading : false,
    isError: isAdmin ? admin.isError : isPaginatedRole ? infinite.isError : false,
    error: isAdmin ? admin.error : infinite.error,
    hasMore: isPaginatedRole ? infinite.hasNextPage : false,
    hasNextPage: isPaginatedRole ? infinite.hasNextPage : false,
    isFetchingNextPage: isPaginatedRole ? infinite.isFetchingNextPage : false,
    isFetchNextPageError: isPaginatedRole ? infinite.isFetchNextPageError : false,
    fetchNextPage: isPaginatedRole ? () => infinite.fetchNextPage() : noopFetchNextPage,
    totalUnread: isPaginatedRole ? (infinite.data?.pages[0]?.totalUnread ?? null) : null,
    refetch: isAdmin ? admin.refetch : infinite.refetch,
  };
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const snapshots = queryClient.getQueriesData({ queryKey: queryKeys.notifications });
      queryClient.setQueriesData({ queryKey: queryKeys.notifications }, (old) =>
        applyToNotificationPages(old, (notification) =>
          (notification.Id ?? notification.NotificationId) === notificationId
            ? { ...notification, IsRead: true }
            : notification,
        ),
      );
      return { snapshots };
    },
    onError: (_error, _notificationId, context) => {
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const snapshots = queryClient.getQueriesData({ queryKey: queryKeys.notifications });
      queryClient.setQueriesData({ queryKey: queryKeys.notifications }, (old) =>
        applyToNotificationPages(old, (notification) => ({ ...notification, IsRead: true })),
      );
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
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

export function useFinanceRequestDetails(requestId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.financeRequestDetails, requestId] as const,
    queryFn: () => getFinanceRequestDetails(requestId as string),
    enabled: !!requestId,
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
      // The processed record reaches its final backend status ("Completed"),
      // which the employee sees in both of their lists.
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.managerApprovedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      // Invalidate notifications so the employee bell badge refreshes immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      // Invalidate notifications so the employee bell badge refreshes immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      // Invalidate notifications so the employee bell badge refreshes immediately.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseTrend });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetUsage });
      queryClient.invalidateQueries({ queryKey: queryKeys.topCategories });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseTrend });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetUsage });
      queryClient.invalidateQueries({ queryKey: queryKeys.topCategories });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseTrend });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetUsage });
      queryClient.invalidateQueries({ queryKey: queryKeys.topCategories });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.managerRejectedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      // Approved expenses surface in Finance's queue ("Approved by Management")
      // and the employee's own lists must show the new backend status.
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.managerApprovedRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedTransfers });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllRequests });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (params: ChangePasswordParams) => changePassword(params),
  });
}
