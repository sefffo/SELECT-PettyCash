import { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { ArrowBack, UploadOutlined, Replay } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMyRequests, useSubmitPayment, useResubmitProof } from '@/hooks/api';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { Toast } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { isFinanceStage, mapEmployeeRequestToRequest, statusLabelKey } from '@/utils/mappers';

export default function EmployeeRequestDetail() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: pendingData } = useMyRequests();
  const submitPaymentMutation = useSubmitPayment();
  const resubmitProofMutation = useResubmitProof();
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const rawRequest = (pendingData ?? []).find((r) => r.RequestId === id);
  const request = (pendingData ?? [])
    .map(mapEmployeeRequestToRequest)
    .find((r) => r.id === id);

  if (!request) {
    return (
      <Box textAlign="center" py={8}>
        <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>Request not found</Typography>
        <Button onClick={() => navigate('/employee/requests')} sx={{ mt: 1, borderRadius: 2, fontSize: 13 }}>Back to requests</Button>
      </Box>
    );
  }

  const canSubmitProof = !!rawRequest && isFinanceStage(rawRequest.Status ?? '');

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

  const handleSubmitProof = async () => {
    if (!receiptUrl.trim() || submitPaymentMutation.isPending) return;
    try {
      await submitPaymentMutation.mutateAsync({
        RequestId: request.id,
        ReceiptUrl: receiptUrl.trim(),
        Notes: notes.trim() || undefined,
      });
      showToast('Proof of payment submitted.', 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to submit proof.', 'error');
    }
  };

  const handleResubmitProof = async () => {
    if (!receiptUrl.trim() || resubmitProofMutation.isPending) return;
    try {
      await resubmitProofMutation.mutateAsync({
        RequestId: request.id,
        ReceiptUrl: receiptUrl.trim(),
        Notes: notes.trim() || undefined,
      });
      showToast('Proof of payment resubmitted.', 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? 'Failed to resubmit proof.', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.75} mb={2.5}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 40, width: 40, height: 40, p: 0, flexShrink: 0, color: 'text.secondary' }}><ArrowBack sx={{ fontSize: 20 }} /></Button>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>Request Details</Typography>
      </Box>

      <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ fontSize: 28 }}>📄</Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>CASH REQUEST</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{request.reason}</Typography>
            </Box>
          </Box>
          <StatusBadge status={request.status} size="medium" />
        </Box>

        <Box mb={2.5}>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>AMOUNT REQUESTED</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary', mt: 0.2 }}>{formatCurrencyByCode(request.amount, request.currency)}</Typography>
        </Box>

        <Box display="flex" gap={3} flexWrap="wrap">
          <Box>
            <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>REQUESTED</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{formatDate(request.createdAt)}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>STATUS</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{t(statusLabelKey(request.status), { defaultValue: request.status })}</Typography>
          </Box>
        </Box>
      </Box>

      {canSubmitProof && (
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider', mt: 2.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>Proof of Payment</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            Your request was approved. Submit the receipt URL for the payment so Finance can finalize it.
          </Typography>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            onSubmit={(e) => { e.preventDefault(); void handleSubmitProof(); }}>
            <TextField label="Receipt URL" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://company-storage.com/receipts/rec_12345.jpg"
              fullWidth required
              helperText={!receiptUrl.trim() ? 'Paste the URL of the uploaded receipt image.' : ' '} />
            <TextField label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
              multiline rows={2} fullWidth />

            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button fullWidth variant="contained" type="button" startIcon={<UploadOutlined sx={{ fontSize: 18 }} />}
                disabled={!receiptUrl.trim() || submitPaymentMutation.isPending} onClick={() => void handleSubmitProof()}
                sx={{ borderRadius: 2, py: 1 }}>
                {submitPaymentMutation.isPending ? 'Submitting...' : 'Submit Proof'}
              </Button>
              <Button fullWidth variant="outlined" type="button" startIcon={<Replay sx={{ fontSize: 18 }} />}
                disabled={!receiptUrl.trim() || resubmitProofMutation.isPending} onClick={() => void handleResubmitProof()}
                sx={{ borderRadius: 2, py: 1 }}>
                {resubmitProofMutation.isPending ? 'Resubmitting...' : 'Resubmit Proof'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}