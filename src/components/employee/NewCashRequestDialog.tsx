import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Close, RequestQuoteOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestSchema, type RequestFormData } from '@/schemas/vertex';
import { useSubmitRequest } from '@/hooks/api';
import { CurrencyInput } from '@/components/feature/CurrencyInput';
import { Toast } from '@/components/shared';
import { requestCategories, requestTypes } from '@/utils/categories';

const CURRENCY_OPTIONS = ['EGP', 'USD', 'SAR'];

const inputSx = {
  '& .MuiInputLabel-root': { fontSize: 14.5 },
  '& .MuiOutlinedInput-input': { fontSize: 15.5, py: 1.35 },
  '& .MuiInputBase-multiline': { lineHeight: 1.5 },
};

interface NewCashRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export function NewCashRequestDialog({ open, onClose }: NewCashRequestDialogProps) {
  const submitRequest = useSubmitRequest();
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      currency: 'EGP',
      category: '',
    },
  });

  const selectedCurrency = watch('currency');
  const submitting = isSubmitting || submitRequest.isPending;

  const showToast = (message: string, severity: 'success' | 'error') =>
    setToast({ open: true, message, severity });

  const handleClose = () => {
    if (submitting) return;
    reset();
    setSubmitted(false);
    onClose();
  };

  const onSubmit = async (data: RequestFormData) => {
    if (submitted || submitting) return;
    setSubmitted(true);
    try {
      await submitRequest.mutateAsync({
        Amount: data.amount,
        Currency: data.currency,
        Reason: data.reason,
        Category: data.category,
      });
      reset();
      setSubmitted(false);
      onClose();
      showToast('Request submitted for approval', 'success');
    } catch (err) {
      setSubmitted(false);
      const message = (err as { message?: string } | null)?.message ?? 'Failed to submit request';
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
              overflowY: 'auto',
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
            <RequestQuoteOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', flex: 1 }}>
            New Request
          </Typography>
          <IconButton size="small" aria-label="Close" onClick={handleClose} disabled={submitting}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              {...register('requestType')}
              label="Request Type"
              select
              fullWidth
              defaultValue=""
              error={!!errors.requestType}
              helperText={errors.requestType?.message}
              sx={inputSx}
            >
              {requestTypes.map((rt) => (
                <MenuItem key={rt.value} value={rt.value} sx={{ fontSize: 15, py: 1.1 }}>
                  {rt.emoji} {rt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              {...register('category')}
              label="Category"
              select
              fullWidth
              defaultValue=""
              error={!!errors.category}
              helperText={errors.category?.message}
              sx={inputSx}
            >
              {requestCategories.map((category) => (
                <MenuItem key={category} value={category} sx={{ fontSize: 15, py: 1.1 }}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <CurrencyInput
                label="Amount"
                error={errors.amount?.message ?? ''}
                registration={register('amount', { valueAsNumber: true })}
                currency={selectedCurrency}
                sx={{
                  '& .MuiOutlinedInput-root': { fontSize: 15.5, fontWeight: 700, '& input': { textAlign: 'right' } },
                  ...inputSx,
                }}
              />

              <TextField
                {...register('currency')}
                label="Currency"
                select
                fullWidth
                error={!!errors.currency}
                helperText={errors.currency?.message}
                sx={inputSx}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: 15, py: 1.1 }}>
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
              sx={inputSx}
            />

            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                disabled={submitting}
                sx={{ borderRadius: 2, py: 1.4, fontSize: 14 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting || submitted}
                sx={{ borderRadius: 2, py: 1.4, fontSize: 14 }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
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