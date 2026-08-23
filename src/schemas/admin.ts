import { z } from 'zod';

export const createUserFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Administrator', 'Manager', 'Employee', 'Finance'], { required_error: 'Select a role' }),
  departmentId: z.string().nullable(),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export const editUserFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['Administrator', 'Manager', 'Employee', 'Finance'], { required_error: 'Select a role' }),
});

export type EditUserFormData = z.infer<typeof editUserFormSchema>;

export const departmentFormSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;
