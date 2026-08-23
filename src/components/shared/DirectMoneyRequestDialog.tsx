import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Close, PaidOutlined } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { directMoneyRequestSchema, type DirectMoneyRequestFormData } from '@/schemas/vertex';
import { Toast } from '@/components/shared';
import { avatarColor, initialsOf } from '@/utils/avatar';

const CURRENCY_OPTIONS = ['EGP', 'USD', 'SAR'];

export interface DirectMoneyEmployeeOption {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export interface DirectMoneyRequestParams {
  EmployeeId: string;
  Amount: number;
  Currency: string;
  Notes: string;
}

interface DirectMoneyRequestDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hint: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  employees: DirectMoneyEmployeeOption[];
  initialEmployeeId?: string;
  submit: (params: DirectMoneyRequestParams) => Promise<unknown>;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export function DirectMoneyRequestDialog({
  open,
  onClose,
  title,
  hint,
  submitLabel,
  submittingLabel,
  successMessage,
  employees,
  initialEmployeeId,
  submit,
}: DirectMoneyRequestDialogProps) {
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DirectMoneyRequestFormData>({
    resolver: zodResolver(directMoneyRequestSchema),
    defaultValues: {
      employeeId: '',
      amount: undefined,
      currency: 'EGP',
      notes: '',
    },
  });

  const currency = watch('currency');
  const submitting = isSubmitting;

  useEffect(() => {
    if (open) {
      reset({ employeeId: initialEmployeeId ?? '', amount: undefined, currency: 'EGP', notes: '' });
    }
  }, [open, initialEmployeeId, reset]);

  const showToast = (message: string, severity: 'success' | 'error') =>
    setToast({ open: true, message, severity });

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const onSubmit = async (data: DirectMoneyRequestFormData) => {
    if (submitting) return;
    try {
      await submit({
        EmployeeId: data.employeeId,
        Amount: data.amount,
        Currency: data.currency,
        Notes: data.notes.trim(),
      });
      reset();
      onClose();
      showToast(successMessage, 'success');
    } catch (err) {
      const message = (err as { message?: string } | null)?.message ?? t('directMoney.failed');
      showToast(message, 'error');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              maxWidth: { xs: 'calc(100vw - 32px)', sm: 520 },
              width: '100%',
              m: 2,
              maxHeight: 'calc(100vh - 32px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(20, 93, 184, 0.1)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <PaidOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', flex: 1 }}>
            {title}
          </Typography>
          <IconButton size="small" aria-label={t('common.close')} onClick={handleClose} disabled={submitting}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>{hint}</Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => {
                const selected = employees.find((e) => e.id === field.value) ?? null;
                return (
                  <Autocomplete
                    options={employees}
                    value={selected}
                    onChange={(_event, value) => field.onChange(value?.id ?? '')}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    noOptionsText={t('directMoney.noEmployees')}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('directMoney.employee')}
                        placeholder={t('directMoney.employeePlaceholder')}
                        error={!!errors.employeeId}
                        helperText={errors.employeeId?.message}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(avatarColor(option.email), 0.9), fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {initialsOf(option.email)}
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {option.name}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {option.email}
                            {option.department ? ` · ${option.department}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                );
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                {...register('amount', { valueAsNumber: true })}
                label={t('directMoney.amount')}
                type="number"
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {currency}
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { step: '0.01', min: '0' },
                }}
              />

              <TextField
                {...register('currency')}
                label={t('directMoney.currency')}
                select
                fullWidth
                error={!!errors.currency}
                helperText={errors.currency?.message}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              {...register('notes')}
              label={t('directMoney.reason')}
              multiline
              rows={2}
              placeholder={t('directMoney.reasonPlaceholder')}
              fullWidth
              error={!!errors.notes}
              helperText={errors.notes?.message}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mt: 0.5 }}>
              <Button fullWidth variant="outlined" onClick={handleClose} disabled={submitting} sx={{ borderRadius: 2, py: 1, fontSize: 13.5 }}>
                {t('common.cancel')}
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={<PaidOutlined sx={{ fontSize: 18 }} />}
                sx={{ borderRadius: 2, py: 1, fontSize: 13.5 }}
              >
                {submitting ? submittingLabel : submitLabel}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}