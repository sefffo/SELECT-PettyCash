import { useState } from 'react';
import {
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
import { Add, Close, ReceiptLongOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { addExpenseSchema, type AddExpenseFormData } from '@/schemas/vertex';
import { useAddExpense } from '@/hooks/api';
import { Toast } from '@/components/shared';

const CATEGORY_OPTIONS = [
  { value: 'Transportation', labelKey: 'expense.transportation' },
  { value: 'Meals', labelKey: 'expense.meals' },
  { value: 'Office Supplies', labelKey: 'expense.officeSupplies' },
  { value: 'Utilities', labelKey: 'expense.utilities' },
  { value: 'Travel', labelKey: 'expense.travel' },
  { value: 'Entertainment', labelKey: 'expense.entertainment' },
  { value: 'Maintenance', labelKey: 'expense.maintenance' },
  { value: 'Other', labelKey: 'expense.other' },
];

const CURRENCY_OPTIONS = ['EGP', 'USD', 'SAR'];

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export function AddExpenseDialog({ open, onClose }: AddExpenseDialogProps) {
  const { t } = useTranslation();
  const addExpense = useAddExpense();
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddExpenseFormData>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      title: '',
      category: '',
      amount: undefined,
      currency: 'EGP',
      expenseDate: '',
      description: '',
      receiptUrl: '',
    },
  });

  const currency = watch('currency');
  const submitting = isSubmitting || addExpense.isPending;

  const showToast = (message: string, severity: 'success' | 'error') =>
    setToast({ open: true, message, severity });

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const onSubmit = async (data: AddExpenseFormData) => {
    if (submitting) return;
    try {
      await addExpense.mutateAsync({
        Title: data.title.trim(),
        Category: data.category,
        Amount: data.amount,
        Currency: data.currency,
        ExpenseDate: data.expenseDate,
        Description: data.description.trim(),
        ReceiptUrl: data.receiptUrl?.trim() || undefined,
      });
      reset();
      onClose();
      showToast(t('employee.expenseAdded'), 'success');
    } catch (err) {
      const message = (err as { message?: string } | null)?.message ?? t('employee.expenseAddFailed');
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
            <ReceiptLongOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', flex: 1 }}>
            {t('employee.addExpense')}
          </Typography>
          <IconButton size="small" aria-label={t('common.close')} onClick={handleClose} disabled={submitting}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            {t('employee.addExpenseHint')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              {...register('title')}
              label={t('employee.expenseFormTitle')}
              placeholder={t('employee.expenseFormTitlePlaceholder')}
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                {...register('category')}
                label={t('employee.expenseFormCategory')}
                select
                fullWidth
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...register('amount', { valueAsNumber: true })}
                label={t('employee.expenseFormAmount')}
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
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                {...register('currency')}
                label={t('employee.expenseFormCurrency')}
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

              <TextField
                {...register('expenseDate')}
                label={t('employee.expenseFormDate')}
                type="date"
                fullWidth
                error={!!errors.expenseDate}
                helperText={errors.expenseDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <TextField
              {...register('description')}
              label={t('employee.expenseFormDescription')}
              multiline
              rows={2}
              placeholder={t('employee.expenseFormDescriptionPlaceholder')}
              fullWidth
              error={!!errors.description}
              helperText={errors.description?.message}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            <TextField
              {...register('receiptUrl')}
              label={t('employee.expenseFormReceiptUrl')}
              placeholder="https://…"
              fullWidth
              error={!!errors.receiptUrl}
              helperText={errors.receiptUrl?.message ?? t('employee.expenseFormReceiptHint')}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mt: 0.5 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                disabled={submitting}
                sx={{ borderRadius: 2, py: 1, fontSize: 13.5 }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={<Add sx={{ fontSize: 18 }} />}
                sx={{ borderRadius: 2, py: 1, fontSize: 13.5 }}
              >
                {submitting ? t('employee.expenseFormSubmitting') : t('employee.addExpense')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
}