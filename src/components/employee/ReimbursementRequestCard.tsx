import { useState } from 'react';
import { Alert, Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { ReceiptLongOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { reimbursementSchema, type ReimbursementFormData } from '@/schemas/vertex';
import { useSubmitReimbursement } from '@/hooks/api';
import { CurrencyInput } from '@/components/feature/CurrencyInput';

const reimbursementCategories = ['Office Supplies', 'Meals', 'Transportation', 'Other'];

interface ReimbursementResult {
  ok: boolean;
  message: string;
  requestId?: string;
}

export function ReimbursementRequestCard() {
  const { t } = useTranslation();
  const submitReimbursement = useSubmitReimbursement();
  const [result, setResult] = useState<ReimbursementResult | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReimbursementFormData>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: { category: 'Office Supplies' },
  });

  const onSubmit = async (data: ReimbursementFormData) => {
    if (submitReimbursement.isPending) return;
    try {
      const response = await submitReimbursement.mutateAsync({
        Amount: data.amount,
        Currency: 'EGP',
        Reason: data.reason,
        Category: data.category,
      });
      setResult({
        ok: true,
        message: t('employee.reimbursementSuccess'),
        requestId: response.RequestId,
      });
      reset();
    } catch (err) {
      const message = (err as { message?: string } | null)?.message ?? t('employee.reimbursementFailed');
      setResult({ ok: false, message });
    }
  };

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2.5 } }}>
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <ReceiptLongOutlined sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
          {t('employee.reimbursement')}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
        {t('employee.reimbursementSubtitle')}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <CurrencyInput
            label={t('employee.reimbursementAmount')}
            error={errors.amount?.message ?? ''}
            registration={register('amount', { valueAsNumber: true })}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.9375rem', fontWeight: 600, '& input': { textAlign: 'right' } } }}
          />
          <TextField
            {...register('category')}
            label={t('employee.reimbursementCategory')}
            select
            fullWidth
            error={!!errors.category}
            helperText={errors.category?.message}
          >
            {reimbursementCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          {...register('reason')}
          label={t('employee.reimbursementReason')}
          multiline
          rows={2}
          placeholder={t('employee.reimbursementReasonPlaceholder')}
          fullWidth
          error={!!errors.reason}
          helperText={errors.reason?.message}
        />

        {result && (
          <Alert
            severity={result.ok ? 'success' : 'error'}
            onClose={() => setResult(null)}
            sx={{ borderRadius: 2, '& .MuiAlert-message': { alignSelf: 'center' } }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{result.message}</Typography>
            {result.ok && result.requestId && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                {t('employee.reimbursementRequestId', { id: result.requestId })}
              </Typography>
            )}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || submitReimbursement.isPending}
          startIcon={<ReceiptLongOutlined sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: 2, py: 1.1, width: { xs: '100%', sm: 'auto' }, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          {isSubmitting || submitReimbursement.isPending ? t('employee.reimbursementSubmitting') : t('employee.reimbursementSubmit')}
        </Button>
      </Box>
    </Box>
  );
}