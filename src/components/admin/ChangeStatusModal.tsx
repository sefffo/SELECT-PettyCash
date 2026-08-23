import { useState } from 'react';
import { Dialog, DialogContent, Typography, Button, Box, TextField, MenuItem } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ApiUser, ApiUserStatus } from '@/types/api';

interface ChangeStatusModalProps {
  user: ApiUser | null;
  currentStatus: ApiUserStatus;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, status: ApiUserStatus) => void;
  isSubmitting?: boolean;
}

const statusOptions: ApiUserStatus[] = ['Active', 'Inactive'];

export function ChangeStatusModal({ user, currentStatus, open, onClose, onConfirm, isSubmitting }: ChangeStatusModalProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ApiUserStatus>(currentStatus);

  const handleConfirm = () => {
    if (!user) return;
    onConfirm(String(user.Id), status);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && user && (
        <Dialog open={open} onClose={onClose}
          slots={{
            transition: (props) => (
              <motion.div {...props} initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} />
            ),
          }}
          slotProps={{
            backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
            paper: { sx: { borderRadius: 3, p: 1, maxWidth: { xs: 'calc(100vw - 32px)', sm: 380 }, width: '100%', m: 2 } },
          }}>
          <DialogContent sx={{ py: 2.5, px: 2.5 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>{t('admin.changeStatusTitle')}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2.5 }}>
              {user.Name} — {t('admin.currentStatus')}: <strong>{currentStatus === 'Active' ? t('common.active') : t('common.inactive')}</strong>
            </Typography>
            <TextField label={t('admin.newStatus')} select value={status} onChange={(e) => setStatus(e.target.value as ApiUserStatus)} fullWidth size="small" sx={{ mb: 2.5 }}>
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>{s === 'Active' ? t('common.active') : t('common.inactive')}</MenuItem>
              ))}
            </TextField>
            <Box display="flex" gap={1.5}>
              <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, py: 0.85 }}>{t('common.cancel')}</Button>
              <Button fullWidth variant="contained" disabled={status === currentStatus || isSubmitting}
                onClick={handleConfirm} sx={{ borderRadius: 2, py: 0.85 }}>
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
