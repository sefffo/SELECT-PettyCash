export type UserRole = 'employee' | 'manager' | 'admin' | 'finance';
export type RequestStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'pending-manager'
  | 'pending-approval'
  | 'pending-finance';
export type ExpenseStatus =
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'reimbursed'
  | 'completed'
  | 'pending'
  | 'pending-manager'
  | 'pending-approval'
  | 'pending-finance';
export type EmployeeStatus = 'active' | 'inactive';

export type RequestTypeValue =
  | 'cash-advance'
  | 'budget'
  | 'purchase'
  | 'travel';

export type CategoryType =
  | 'transportation'
  | 'meals'
  | 'office-supplies'
  | 'utilities'
  | 'travel'
  | 'entertainment'
  | 'maintenance'
  | 'other';

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: EmployeeStatus;
  userRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  id: string;
  employeeId: string;
  employeeName?: string;
  requestType: string;
  amount: number;
  currency?: string;
  department: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}
