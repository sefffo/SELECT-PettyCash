import { useState } from 'react';
import { Box, Typography, Button, IconButton, TextField, useTheme } from '@mui/material';
import { ArrowBack, ReceiptLongOutlined, Replay, UploadOutlined } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMyRequests, useSubmitPayment, useResubmitProof } from '@/hooks/api';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { Toast } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { isFinanceStage, mapEmployeeRequestToRequest, statusLabelKey } from '@/utils/mappers';

const REQUEST_TYPE_KEYS: Record<string, string> = {
  'cash-advance': 'request.type.cashAdvance',
  budget: 'request.type.budget',
  purchase: 'request.type.purchase',
  travel: 'request.type.travel',
};

function DetailRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        py: 1.1,
        px: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', flexShrink: 0 }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: strong ? 700 : 500,
          color: 'text.primary',
          textAlign: 'end',
          wordBreak: 'break-word',
          minWidth: 0,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function EmployeeRequestDetail() {
  const navigate = useNavigate();
  const theme = useTheme();
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
        <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>{t('employee.requestNotFound')}</Typography>
        <Button onClick={() => navigate('/employee/requests')} sx={{ mt: 1, borderRadius: 2, fontSize: 13 }}>
          {t('employee.backToRequests')}
        </Button>
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
      showToast(t('employee.proofSubmitted'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? t('employee.proofSubmitFailed'), 'error');
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
      showToast(t('employee.proofResubmitted'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? t('employee.proofResubmitFailed'), 'error');
    }
  };

  const requestTypeKey = REQUEST_TYPE_KEYS[request.requestType] ?? '';
  const currency = request.currency || 'EGP';

  return (
    <Box sx={{ maxWidth: 480, width: '100%', mx: 'auto' }}>
      <Box sx={{ borderRadius: 3, p: 1, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <ReceiptLongOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', flex: 1, minWidth: 0 }}>
            {t('employee.requestDetails')}
          </Typography>
          <IconButton size="small" aria-label={t('common.back')} onClick={() => navigate(-1)}>
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Typography
            sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', mt: 1, mb: 1.5, wordBreak: 'break-word', lineHeight: 1.35 }}
          >
            {request.reason}
          </Typography>

          <Box sx={{ mb: 1.5 }}>
            <StatusBadge status={request.status} />
          </Box>

          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
            <DetailRow label={t('request.requestType')} value={t(requestTypeKey)} />
            <DetailRow label={t('employee.requestAmount')} value={formatCurrencyByCode(request.amount, currency)} strong />
            <DetailRow label={t('employee.requestCurrency')} value={currency} />
            <DetailRow label={t('employee.requestDate')} value={formatDate(request.createdAt)} />
            <DetailRow label={t('employee.requestStatus')} value={t(statusLabelKey(request.status), { defaultValue: request.status })} />
          </Box>
        </Box>
      </Box>

      {canSubmitProof && (
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider', mt: 2.5 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>{t('employee.proofOfPayment')}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            {t('employee.proofOfPaymentHint')}
          </Typography>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            onSubmit={(e) => { e.preventDefault(); void handleSubmitProof(); }}>
            <TextField label={t('employee.receiptUrl')} value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://company-storage.com/receipts/rec_12345.jpg"
              fullWidth required
              helperText={!receiptUrl.trim() ? t('employee.receiptUrlHint') : ' '} />
            <TextField label={t('employee.notesOptional')} value={notes} onChange={(e) => setNotes(e.target.value)}
              multiline rows={2} fullWidth />

            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button fullWidth variant="contained" type="button" startIcon={<UploadOutlined sx={{ fontSize: 18 }} />}
                disabled={!receiptUrl.trim() || submitPaymentMutation.isPending} onClick={() => void handleSubmitProof()}
                sx={{ borderRadius: 2, py: 1 }}>
                {submitPaymentMutation.isPending ? t('employee.submitting') : t('employee.submitProof')}
              </Button>
              <Button fullWidth variant="outlined" type="button" startIcon={<Replay sx={{ fontSize: 18 }} />}
                disabled={!receiptUrl.trim() || resubmitProofMutation.isPending} onClick={() => void handleResubmitProof()}
                sx={{ borderRadius: 2, py: 1 }}>
                {resubmitProofMutation.isPending ? t('employee.resubmitting') : t('employee.resubmitProof')}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}