import { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema, type RequestFormData } from '@/schemas/vertex';
import { useSubmitRequest } from '@/hooks/api';
import { CurrencyInput } from '@/components/feature/CurrencyInput';
import { Toast } from '@/components/shared';
import { requestTypes } from '@/utils/categories';

const CURRENCY_OPTIONS = ['EGP', 'USD', 'SAR'];

export default function EmployeeNewCashRequest() {
  const navigate = useNavigate();
  const submitRequest = useSubmitRequest();
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      currency: 'EGP',
    },
  });
  const selectedCurrency = watch('currency');

  const onSubmit = async (data: RequestFormData) => {
    if (submitted || submitRequest.isPending) return;
    setSubmitted(true);
    try {
      await submitRequest.mutateAsync({
        Amount: data.amount,
        Currency: data.currency,
        Reason: data.reason,
      });
      setToast({ open: true, message: 'Request submitted for approval', severity: 'success' });
      setTimeout(() => navigate('/employee/requests'), 1000);
    } catch (err) {
      setSubmitted(false);
      const message = (err as { message?: string } | null)?.message ?? 'Failed to submit request';
      setToast({ open: true, message, severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.75} mb={2.5}>
        <Button
          onClick={() => navigate(-1)}
          sx={{ minWidth: 40, width: 40, height: 40, p: 0, flexShrink: 0, color: 'text.secondary' }}
        >
          <ArrowBack sx={{ fontSize: 20 }} />
        </Button>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>
          New Request
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: 2.5,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            {...register('requestType')}
            label="Request Type"
            select
            fullWidth
            defaultValue=""
            error={!!errors.requestType}
            helperText={errors.requestType?.message}
          >
            {requestTypes.map((rt) => (
              <MenuItem key={rt.value} value={rt.value}>
                {rt.emoji} {rt.label}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <CurrencyInput
              label="Amount"
              error={errors.amount?.message ?? ''}
              registration={register('amount', { valueAsNumber: true })}
              currency={selectedCurrency}
            />

            <TextField
              {...register('currency')}
              label="Currency"
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
            {...register('reason')}
            label="Reason"
            multiline
            rows={3}
            placeholder="Explain why you need this request"
            error={!!errors.reason}
            helperText={errors.reason?.message}
            fullWidth
          />

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 2, py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || submitRequest.isPending || submitted}
              sx={{ borderRadius: 2, py: 1.2 }}
            >
              {isSubmitting || submitRequest.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ open: false, message: '', severity: 'success' })}
      />
    </Box>
  );
}
