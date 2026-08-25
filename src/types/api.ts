export type ApiRole = 'Administrator' | 'Manager' | 'Employee' | 'Finance';

export type ApiUserStatus = 'Active' | 'Inactive';

export interface ApiEnvelope<T> {
  StatusCode?: number;
  Message?: string;
  Data?: T;
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface LoginResult {
  token: string;
  role: ApiRole;
}

export interface ApiUser {
  Id: string;
  Name: string;
  Email: string;
  Role: ApiRole;
  DepartmentId: string | null;
  Status?: ApiUserStatus;
}

export interface ApiDepartment {
  Id: string;
  Name: string;
}

export type PendingRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'PendingManager'
  | 'PendingApproval'
  | 'PendingFinance'
  | 'Pending Finance'
  | 'Completed';

export interface PendingRequest {
  RequestId: string;
  EmployeeName?: string | null;
  Amount: number;
  CurrencyCode?: string | null;
  Reason: string;
  Status: PendingRequestStatus;
  DateRequested: string;
}

/**
 * A request row returned by `Employee/GetMyRequests` (verified against the live API):
 * `{ RequestId, Amount, Currency, Description, Status, SubmittedAt }`.
 */
export interface EmployeeRequestItem {
  RequestId: string;
  Amount: number;
  Currency?: string | null;
  Description?: string | null;
  Status?: PendingRequestStatus;
  SubmittedAt?: string | null;
}

export interface EmployeeDashboardData {
  PendingRequestsCount: number;
  TotalSpentEGP: number;
  TotalSpentUSD: number;
  TotalSpentSAR: number;
}

export interface MyProfileInfo {
  UserId: string;
  Name: string;
  Email: string;
  Role: ApiRole;
  DepartmentId: string | null;
  WalletEGP: number;
  WalletUSD: number;
  WalletSAR: number;
}

/** Wallet balances returned by `Employee/GetWallet` (per currency). */
export interface WalletCurrencies {
  EGP: number;
  USD: number;
  SAR: number;
}

/**
 * A finance transaction row returned by `Finance/Transactions` and
 * `Finance/EmployeeHistory`. Verified against the live API.
 */
export interface FinanceTransactionItem {
  TransactionNumber: string;
  Employee: string;
  TransactionType: string;
  Currency: string;
  Amount: number;
  Date: string;
  Status: string;
  Source: string;
}

/** Company safe balances returned by `Finance/SafeBalances` (per currency). */
export interface FinanceSafeBalances {
  EGP: number;
  USD: number;
  SAR: number;
}

/** An employee custody balance returned by `Finance/EmployeeBalances`. */
export interface FinanceEmployeeBalance {
  EmployeeId: string;
  Email: string;
  DepartmentId: string;
  EGP: number;
  USD: number;
  SAR: number;
}

/** An employee wallet-balance row returned by `Manager/Employees/Balances`. */
export interface ManagerEmployeeBalance {
  EmployeeId?: string;
  UserId?: string;
  Id?: string;
  Email?: string | null;
  DepartmentId?: string | null;
  EGP?: number | null;
  USD?: number | null;
  SAR?: number | null;
}

/** A custody request row returned by `Finance/GetAllRequests`. */
export interface FinanceRequestItem {
  RequestId: string;
  EmployeeEmail: string;
  Amount: number;
  Currency: string;
  Status: string;
  RequestType: string;
  DateSubmitted: string;
}

/** Params for the direct custody payment action `Finance/Payments/Direct`. */
export interface DirectPaymentParams {
  EmployeeId: string;
  Amount: number;
  Currency: string;
  Notes?: string;
}

/** Params for the manager direct grant action `Manager/DirectGrant`. */
export interface DirectGrantParams {
  EmployeeId: string;
  Amount: number;
  Currency: string;
  Notes?: string;
}

export interface ManagerDashboardData {
  DepartmentId: string;
  DepartmentBudget: number;
  PendingRequestCount: number;
}

/**
 * A monthly expense datapoint returned by `Manager/ExpenseOverview`.
 * Field names are loose because the endpoint response is not documented.
 */
export interface ManagerExpenseOverviewPoint {
  Month?: string;
  MonthName?: string;
  Amount?: number;
  Total?: number;
}

export interface AdminDashboardData {
  TotalUsers: number;
  TotalDepartments: number;
  TotalCompanyPendingAmount: number;
}

/** A monthly spend datapoint returned by `Dashboard/MonthlySpend`. */
export interface MonthlySpendPoint {
  Month?: string;
  Amount?: number;
  Total?: number;
}

/**
 * A monthly expense datapoint returned by `Employee/ExpenseTrend`.
 * Field names are loose because the endpoint response is not documented.
 */
export interface ExpenseTrendPoint {
  Month?: string;
  Amount?: number;
  Total?: number;
}

/**
 * Budget consumption returned by `Employee/BudgetUsage`.
 * `Percentage` may be absent or stale (the live API has returned `0` while
 * `Used` was non-zero), so consumers derive it from `Used` / `TotalBudget`
 * instead of trusting it blindly.
 */
export interface BudgetUsageData {
  TotalBudget: number;
  Used: number;
  Remaining: number;
  Percentage: number;
  Currency?: string;
}

/** A ranked expense category returned by `Employee/TopCategories`. */
export interface TopCategoryItem {
  Category: string;
  Amount: number;
  Percentage?: number;
}

/**
 * An expense row returned by `Employee/Expenses/Get` (verified against the live API):
 * `{ ExpenseId, Amount, Currency, Reason, Status, DateSubmitted }`.
 */
export interface EmployeeExpenseItem {
  ExpenseId: string;
  Amount: number;
  Currency?: string | null;
  Reason?: string | null;
  Status?: string;
  DateSubmitted?: string | null;
}

export interface CreateUserResult {
  Role: ApiRole;
  UserId: string;
  FloatLimit: number;
}

/**
 * A request row returned by the manager-scoped list APIs
 * (`Manager/GetPendingRequests`, `Manager/GetApprovedRequests`,
 * `Manager/GetRejectedRequests`) and by the `Admin/GetEmployeeProfile`
 * transaction history.
 */
export interface ManagerRequestItem {
  RequestId: string;
  EmployeeName?: string;
  Amount: number;
  Currency?: string | null;
  Reason: string;
  Status: string;
  DateRequested: string;
}

/** Profile payload returned by `Admin/GetProfile`. */
export interface AdminProfileInfo {
  Id: string;
  Name: string;
  Email: string;
  Role: ApiRole;
}

/** Profile + transaction history returned by `Admin/GetEmployeeProfile`. */
export interface AdminEmployeeProfileData {
  Profile: AdminProfileInfo;
  Transactions: ManagerRequestItem[];
}

/**
 * A notification row returned by the role-scoped notification APIs
 * (`Admin/GetAllNotifications`, `Manager/GetNotifications`).
 *
 * The endpoints accept no recipient parameter and may return rows for many
 * users, so consumers MUST scope the list to the authenticated user via the
 * recipient identifier below. The exact recipient field is not documented;
 * all known aliases are kept loose and consumers fail closed when absent.
 */
export interface ApiNotification {
  Id?: string;
  NotificationId?: string;
  UserId?: string;
  TargetUserId?: string;
  RecipientId?: string;
  EmployeeId?: string;
  Title?: string;
  Message?: string;
  Type?: string;
  IsRead?: boolean;
  Read?: boolean;
  DateCreated?: string;
  CreatedAt?: string;
  Date?: string;
  RequestId?: string;
  RelatedRequestId?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
