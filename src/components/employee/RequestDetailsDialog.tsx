import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogContent, DialogTitle, IconButton, TextField, useTheme } from '@mui/material';
import { Close, ReceiptLongOutlined, Replay, UploadOutlined } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
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

interface RequestDetailsDialogProps {
  requestId: string | null;
  onClose: () => void;
}

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

export function RequestDetailsDialog({ requestId, onClose }: RequestDetailsDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: pendingData } = useMyRequests();
  const submitPaymentMutation = useSubmitPayment();
  const resubmitProofMutation = useResubmitProof();
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const rawRequest = (pendingData ?? []).find((r) => r.RequestId === requestId);
  const request = (pendingData ?? [])
    .map(mapEmployeeRequestToRequest)
    .find((r) => r.id === requestId);

  const canSubmitProof = !!rawRequest && isFinanceStage(rawRequest.Status ?? '');

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

  const handleSubmitProof = async () => {
    if (!request || !receiptUrl.trim() || submitPaymentMutation.isPending) return;
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
    if (!request || !receiptUrl.trim() || resubmitProofMutation.isPending) return;
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

  const handleClose = () => {
    setReceiptUrl('');
    setNotes('');
    onClose();
  };

  return (
    <>
      <Dialog
        open={Boolean(requestId)}
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
          <IconButton size="small" aria-label={t('common.close')} onClick={handleClose}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
          {!request ? (
            <Box textAlign="center" py={4}>
              <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>{t('employee.requestNotFound')}</Typography>
            </Box>
          ) : (
            <>
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', mt: 1, mb: 1.5, wordBreak: 'break-word', lineHeight: 1.35 }}
              >
                {request.reason}
              </Typography>

              <Box sx={{ mb: 1.5 }}>
                <StatusBadge status={request.status} />
              </Box>

              <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <DetailRow label={t('request.requestType')} value={t(REQUEST_TYPE_KEYS[request.requestType] ?? '')} />
                <DetailRow label={t('employee.requestAmount')} value={formatCurrencyByCode(request.amount, request.currency || 'EGP')} strong />
                <DetailRow label={t('employee.requestCurrency')} value={request.currency || 'EGP'} />
                <DetailRow label={t('employee.requestDate')} value={formatDate(request.createdAt)} />
                <DetailRow label={t('employee.requestStatus')} value={t(statusLabelKey(request.status), { defaultValue: request.status })} />
              </Box>

              {canSubmitProof && (
                <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', p: 2, mt: 2.5 }}>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}