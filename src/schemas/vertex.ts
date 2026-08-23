import { z } from 'zod';

export const requestSchema = z.object({
  requestType: z.string({ required_error: 'Select a request type' }),
  amount: z.number({ required_error: 'Amount is required' }).min(1, 'Minimum amount is EGP 1'),
  currency: z.string().min(1, 'Select a currency'),
  reason: z.string().min(10, 'Please provide at least 10 characters'),
});

export type RequestFormData = z.infer<typeof requestSchema>;

export const reimbursementSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }).min(1, 'Minimum amount is EGP 1'),
  category: z.string().min(1, 'Select a category'),
  reason: z.string().min(10, 'Please provide at least 10 characters'),
});

export type ReimbursementFormData = z.infer<typeof reimbursementSchema>;

export const addExpenseSchema = z
  .object({
    title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
    category: z.string().min(1, 'Select a category'),
    amount: z
      .number({ required_error: 'Amount is required', invalid_type_error: 'Amount is required' })
      .positive('Amount must be greater than 0'),
    currency: z.string().min(1, 'Select a currency'),
    expenseDate: z.string().min(1, 'Expense date is required').date('Enter a valid date'),
    description: z.string().min(10, 'Please provide at least 10 characters'),
    receiptUrl: z.string().optional(),
  })
  .refine((data) => data.expenseDate === '' || new Date(data.expenseDate) <= new Date(), {
    message: 'Expense date cannot be in the future',
    path: ['expenseDate'],
  });

export type AddExpenseFormData = z.infer<typeof addExpenseSchema>;

export const directMoneyRequestSchema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  currency: z.string().min(1, 'Select a currency'),
  notes: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
});

export type DirectMoneyRequestFormData = z.infer<typeof directMoneyRequestSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
