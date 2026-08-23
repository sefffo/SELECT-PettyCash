import { execute } from './axios';
import type {
  AdminEmployeeProfileData,
  AdminProfileInfo,
  ApiDepartment,
  ApiNotification,
  ApiRole,
  ApiUser,
  ApiUserStatus,
  CreateUserResult,
} from '@/types/api';

export async function getUsers(): Promise<ApiUser[]> {
  return execute<ApiUser[]>({ action: 'Data/Users' });
}

export async function getDepartments(): Promise<ApiDepartment[]> {
  return execute<ApiDepartment[]>({ action: 'Data/Departments' });
}

export interface CreateUserParams {
  Name: string;
  Email: string;
  Password: string;
  Role: ApiRole;
  DepartmentId: string | null;
}

export async function createUser(params: CreateUserParams): Promise<CreateUserResult> {
  return execute<CreateUserResult>({
    action: 'Admin/CreateUser',
    parameters: {
      Name: params.Name,
      Email: params.Email,
      Password: params.Password,
      Role: params.Role,
      DepartmentId: params.DepartmentId,
    },
  });
}

export interface AssignDepartmentParams {
  TargetUserId: string;
  DepartmentId: string;
}

export async function assignDepartment(params: AssignDepartmentParams): Promise<{ DepartmentId: string; TargetUserId: string }> {
  return execute<{ DepartmentId: string; TargetUserId: string }>({
    action: 'Admin/AssignDepartment',
    parameters: { TargetUserId: params.TargetUserId, DepartmentId: params.DepartmentId },
  });
}

export async function createDepartment(name: string): Promise<{ DepartmentId: string }> {
  return execute<{ DepartmentId: string }>({
    action: 'Department/Create',
    parameters: { Name: name },
  });
}

export interface PromoteManagerParams {
  TargetUserId: string;
  Role: 'Manager';
}

export async function promoteManager(targetUserId: string): Promise<{ TargetUserId: string }> {
  return execute<{ TargetUserId: string }>({
    action: 'Admin/PromoteManager',
    parameters: { TargetUserId: targetUserId, Role: 'Manager' },
  });
}

export interface EditUserParams {
  TargetUserId: string;
  Name: string;
  Role: ApiRole;
}

export async function editUser(params: EditUserParams): Promise<{ TargetUserId: string }> {
  return execute<{ TargetUserId: string }>({
    action: 'Admin/EditUser',
    parameters: { TargetUserId: params.TargetUserId, Name: params.Name, Role: params.Role },
  });
}

export async function deleteUser(targetUserId: string): Promise<{ TargetUserId: string }> {
  return execute<{ TargetUserId: string }>({
    action: 'Admin/DeleteUser',
    parameters: { TargetUserId: targetUserId },
  });
}

export interface ChangeUserStatusParams {
  UserId: string;
  Status: ApiUserStatus;
}

export async function changeUserStatus(params: ChangeUserStatusParams): Promise<{ TargetUserId: string }> {
  return execute<{ TargetUserId: string }>({
    action: 'Users/ChangeStatus',
    parameters: { UserId: params.UserId, Status: params.Status },
  });
}

export async function getProfile(targetUserId: string): Promise<AdminProfileInfo> {
  return execute<AdminProfileInfo>({
    action: 'Admin/GetProfile',
    parameters: { TargetUserId: targetUserId },
  });
}

export async function getEmployeeProfile(targetUserId: string): Promise<AdminEmployeeProfileData> {
  return execute<AdminEmployeeProfileData>({
    action: 'Admin/GetEmployeeProfile',
    parameters: { TargetUserId: targetUserId },
  });
}

export function getAdminNotifications(): Promise<ApiNotification[]> {
  return execute<ApiNotification[]>({ action: 'Admin/GetAllNotifications' });
}
