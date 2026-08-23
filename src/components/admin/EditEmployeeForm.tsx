import { Button, TextField, MenuItem, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { editUserFormSchema, type EditUserFormData } from '@/schemas/admin';
import type { ApiRole } from '@/types/api';

interface EditEmployeeFormProps {
  initialValues: { name: string; role: ApiRole };
  onSubmit: (data: EditUserFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const roleOptions: ApiRole[] = ['Administrator', 'Manager', 'Employee', 'Finance'];

export function EditEmployeeForm({ initialValues, onSubmit, onCancel, isSubmitting }: EditEmployeeFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: { name: initialValues.name, role: initialValues.role },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField {...register('name')} label={t('admin.employeeTable.employee')} placeholder="Enter employee name"
        error={!!errors.name} helperText={errors.name?.message} fullWidth autoFocus />
      <TextField {...register('role')} label={t('admin.employeeTable.role')} select
        error={!!errors.role} helperText={errors.role?.message} fullWidth>
        {roleOptions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
      <Box display="flex" gap={2} mt={1}>
        <Button variant="outlined" fullWidth onClick={onCancel} sx={{ borderRadius: 2, py: 1.2 }}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ borderRadius: 2, py: 1.2 }}>
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>
      </Box>
    </Box>
  );
}