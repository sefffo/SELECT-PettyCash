import type { ApiDepartment, ApiRole, ApiUser, EmployeeAllRequestItem, EmployeeRequestItem, ManagerRequestItem, PendingRequest, PendingRequestStatus } from '@/types/api';
import type { Employee, ExpenseStatus, Request, RequestStatus, RequestTypeValue, UserRole } from '@/types/vertex';

export function apiRoleToUserRole(role: ApiRole): UserRole {
  switch (role) {
    case 'Administrator': return 'admin';
    case 'Manager': return 'manager';
    case 'Finance': return 'finance';
    default: return 'employee';
  }
}

export function mapApiUserToEmployee(user: ApiUser, departments: ApiDepartment[]): Employee {
  const dept = departments.find((d) => d.Id === user.DepartmentId);
  return {
    id: String(user.Id),
    name: user.Name,
    email: user.Email,
    avatar: '',
    role: user.Role,
    department: dept?.Name ?? '—',
    status: user.Status === 'Inactive' ? 'inactive' : 'active',
    userRole: apiRoleToUserRole(user.Role),
    createdAt: '',
    updatedAt: '',
  };
}

/**
 * Maps the backend request lifecycle to the normalized UI status.
 * Backend lifecycle: Pending/PendingManager -> Approved -> PendingFinance
 * ("Pending Finance") -> Completed, or Rejected. `Completed` means Finance has
 * disbursed the money and must never be collapsed into `pending`.
 */
export function mapPendingRequestStatus(status: PendingRequestStatus): RequestStatus {
  const normalized = (status ?? '').trim().toLowerCase().replace(/[\s_]+/g, '');
  switch (normalized) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'completed': return 'completed';
    case 'pendingfinance': return 'pending-finance';
    default: return 'pending';
  }
}

function mapCategoryToRequestType(category: string): RequestTypeValue {
  const normalized = (category ?? '').trim().toLowerCase();
  if (normalized.includes('travel')) return 'travel';
  if (normalized.includes('purchase')) return 'purchase';
  if (normalized.includes('budget')) return 'budget';
  if (normalized.includes('advance')) return 'cash-advance';
  return 'budget';
}

/**
 * Maps the `RequestType` field from `Employee/Requests/GetAll` to a
 * normalized `RequestTypeValue`. Values like `"Advance"` come from the backend
 * and differ from the free-text category strings used by older endpoints.
 */
function mapApiRequestType(requestType: string): RequestTypeValue {
  const normalized = (requestType ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'advance': return 'cash-advance';
    case 'reimbursement': return 'budget';
    case 'travel': return 'travel';
    case 'purchase': return 'purchase';
    default: return mapCategoryToRequestType(requestType);
  }
}

export function buildRequesterNameMap(users: ApiUser[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const user of users) map[user.Id] = user.Name;
  return map;
}

export function buildEmailNameMap(users: ApiUser[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const user of users) {
    const email = (user.Email ?? '').trim().toLowerCase();
    if (email) map[email] = user.Name;
  }
  return map;
}

export function mapPendingRequestToRequest(r: PendingRequest): Request {
  return {
    id: r.RequestId,
    employeeId: '',
    employeeName: r.EmployeeName ?? '',
    requestType: mapCategoryToRequestType(r.Reason),
    amount: r.Amount,
    department: '',
    reason: r.Reason,
    status: mapPendingRequestStatus(r.Status),
    createdAt: r.DateRequested,
    updatedAt: r.DateRequested,
  };
}

export function sortByDateDesc(requests: Request[]): Request[] {
  return [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function mapEmployeeRequestToRequest(r: EmployeeRequestItem): Request {
  return {
    id: r.RequestId,
    employeeId: '',
    employeeName: '',
    requestType: mapCategoryToRequestType(r.Description ?? ''),
    amount: r.Amount,
    currency: r.Currency ?? undefined,
    department: '',
    reason: r.Description ?? '',
    status: mapPendingRequestStatus(r.Status),
    createdAt: r.SubmittedAt ?? '',
    updatedAt: r.SubmittedAt ?? '',
  };
}

/**
 * Maps a row from `Employee/Requests/GetAll` to the shared `Request` shape.
 * This endpoint uses `Reason` (not `Description`) and `DateRequested` (not
 * `SubmittedAt`), and exposes an explicit `RequestType` field.
 */
export function mapEmployeeAllRequestToRequest(r: EmployeeAllRequestItem): Request {
  return {
    id: r.RequestId,
    employeeId: '',
    employeeName: '',
    requestType: mapApiRequestType(r.RequestType),
    amount: r.Amount,
    currency: r.Currency ?? undefined,
    department: '',
    reason: r.Reason ?? '',
    status: mapPendingRequestStatus(r.Status),
    createdAt: r.DateRequested ?? '',
    updatedAt: r.DateRequested ?? '',
  };
}

export function mapManagerRequestStatus(status: string): RequestStatus {
  if (status === 'Approved') return 'approved';
  if (status === 'Rejected') return 'rejected';
  return 'pending';
}

export function mapManagerRequestToRequest(r: ManagerRequestItem): Request {
  return {
    id: r.RequestId,
    employeeId: '',
    employeeName: r.EmployeeName ?? '',
    requestType: mapCategoryToRequestType(r.Reason),
    amount: r.Amount,
    currency: r.Currency ?? undefined,
    department: '',
    reason: r.Reason,
    status: mapManagerRequestStatus(r.Status),
    createdAt: r.DateRequested,
    updatedAt: r.DateRequested,
  };
}

const FINANCE_STAGE_STATUSES = ['PendingFinance', 'PendingApproval'] as const;

export function isFinanceStage(status: string): boolean {
  return (FINANCE_STAGE_STATUSES as readonly string[]).includes(status);
}

/** i18n key for a normalized status value (e.g. `pending-finance` -> `request.status.pendingFinance`). */
export function statusLabelKey(status: string): string {
  const camel = (status ?? '').trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return `request.status.${camel}`;
}

export function mapExpenseStatus(status: string | null | undefined): ExpenseStatus {
  const normalized = (status ?? '').toLowerCase().replace(/[\s_]+/g, '-');
  switch (normalized) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'reimbursed': return 'reimbursed';
    case 'completed': return 'completed';
    case 'under-review':
    case 'underreview':
    case 'in-review':
    case 'inreview':
      return 'under-review';
    case 'submitted': return 'submitted';
    case 'pending': return 'pending';
    case 'pending-manager':
    case 'pendingmanager':
      return 'pending-manager';
    case 'pending-approval':
    case 'pendingapproval':
      return 'pending-approval';
    case 'pending-finance':
    case 'pendingfinance':
      return 'pending-finance';
    default: return 'pending';
  }
}
