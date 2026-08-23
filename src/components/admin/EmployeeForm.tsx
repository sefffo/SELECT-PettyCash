import { Button, TextField, MenuItem, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createUserFormSchema, type CreateUserFormData } from '@/schemas/admin';
import type { ApiDepartment, ApiRole } from '@/types/api';

interface EmployeeFormProps {
  departments: ApiDepartment[];
  onSubmit: (data: CreateUserFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const roleOptions: ApiRole[] = ['Administrator', 'Manager', 'Employee', 'Finance'];

export function EmployeeForm({ departments, onSubmit, onCancel, isSubmitting }: EmployeeFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { name: '', email: '', password: '', role: 'Employee', departmentId: null },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField {...register('name')} label={t('admin.employeeTable.employee')} placeholder="Enter employee name"
        error={!!errors.name} helperText={errors.name?.message} fullWidth autoFocus />
      <TextField {...register('email')} label={t('admin.employeeTable.email')} type="email" placeholder="employee@selecteg.com"
        error={!!errors.email} helperText={errors.email?.message} fullWidth />
      <TextField {...register('password')} label={t('common.password')} type="password" placeholder="Minimum 6 characters"
        error={!!errors.password} helperText={errors.password?.message} fullWidth />
      <TextField {...register('role')} label={t('admin.employeeTable.role')} select
        error={!!errors.role} helperText={errors.role?.message} fullWidth>
        {roleOptions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
      <TextField {...register('departmentId')} label={t('admin.employeeTable.department')} select
        error={!!errors.departmentId} helperText={errors.departmentId?.message} fullWidth>
        <MenuItem value="">{t('admin.noDepartment')}</MenuItem>
        {departments.map((d) => <MenuItem key={d.Id} value={d.Id}>{d.Name}</MenuItem>)}
      </TextField>
      <Box display="flex" gap={2} mt={1}>
        <Button variant="outlined" fullWidth onClick={onCancel} sx={{ borderRadius: 2, py: 1.2 }}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ borderRadius: 2, py: 1.2 }}>
          {isSubmitting ? t('common.saving') : t('common.add')}
        </Button>
      </Box>
    </Box>
  );
}