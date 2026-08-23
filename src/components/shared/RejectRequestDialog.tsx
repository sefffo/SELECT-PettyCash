import { useState } from 'react';
import { Dialog, DialogContent, Typography, Button, Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RejectRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  message?: string;
  employeeName?: string;
  amount?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
}

export function RejectRequestDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  employeeName,
  amount,
  confirmLabel,
  cancelLabel,
  submitting = false,
}: RejectRequestDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const canConfirm = trimmed.length > 0 && !submitting;

  const handleClose = () => {
    if (submitting) return;
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setReason('');
    onConfirm(trimmed);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
        paper: { sx: { borderRadius: 3, p: 1, maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 }, width: '100%', m: 2 } },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 3, px: 2.5 }}>
            <Box sx={{ fontSize: 40, mb: 1.5 }}>❌</Box>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
              {title ?? t('manager.rejectDialogTitle')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>
              {message ?? t('manager.rejectDialogMessage')}
            </Typography>

            {(employeeName || amount) && (
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, fontWeight: 600 }}>
                {[employeeName, amount].filter(Boolean).join(' · ')}
              </Typography>
            )}

            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={5}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('manager.rejectReasonPlaceholder')}
              helperText={t('manager.rejectReasonHint')}
              inputProps={{ maxLength: 500 }}
              sx={{ textAlign: 'left', mb: 2.5 }}
            />

            <Box display="flex" gap={1.5}>
              <Button fullWidth variant="outlined" onClick={handleClose} disabled={submitting} sx={{ borderRadius: 2, py: 1 }}>
                {cancelLabel ?? t('common.cancel')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                disabled={!canConfirm}
                onClick={handleConfirm}
                sx={{ borderRadius: 2, py: 1 }}
              >
                {confirmLabel ?? t('manager.rejectDialogConfirm')}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
  );
}