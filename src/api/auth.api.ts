import { execute } from './axios';
import type { LoginResult } from '@/types/api';

export interface LoginParams {
  Email: string;
  Password: string;
}

export async function loginRequest({ Email, Password }: LoginParams): Promise<LoginResult> {
  return execute<LoginResult>({
    action: 'Auth/Login',
    parameters: { Email, Password },
  });
}

export interface ChangePasswordParams {
  OldPassword: string;
  NewPassword: string;
}

export async function changePassword(params: ChangePasswordParams): Promise<{ Message?: string }> {
  return execute<{ Message?: string }>({
    action: 'User/ChangePassword',
    parameters: { OldPassword: params.OldPassword, NewPassword: params.NewPassword },
  });
}
