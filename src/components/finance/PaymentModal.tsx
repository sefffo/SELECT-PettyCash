import { useState } from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PAYMENT_SOURCES, type PaymentSource } from '@/types/finance';
import { formatCurrencyByCode } from '@/utils/format';

interface PaymentModalProps {
  open: boolean;
  amount: number;
  currency?: string | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (source: PaymentSource) => void;
}

export function PaymentModal({ open, amount, currency, loading, onClose, onConfirm }: PaymentModalProps) {
  const { t } = useTranslation();
  const [source, setSource] = useState<PaymentSource>('corporate-bank');

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      slots={{
        transition: (props) => (
          <motion.div
            {...props}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        ),
      }}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
        paper: { sx: { borderRadius: 3, maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 }, width: '100%', m: 2, p: 0 } },
      }}
    >
      <DialogContent sx={{ py: 2.5, px: 2.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
          {t('finance.paymentTitle')}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
          {t('finance.paymentSubtitle')}
        </Typography>

        <Box sx={{ mb: 2.5, p: 1.75, borderRadius: 2, backgroundColor: 'rgba(20, 93, 184, 0.06)', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
            {t('finance.requestedAmount')}
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrencyByCode(amount, currency)}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 1 }}>
          {t('finance.paymentSource')}
        </Typography>
        <Box display="flex" flexDirection="column" gap={1} mb={2.5}>
          {PAYMENT_SOURCES.map((option) => {
            const selected = source === option.value;
            return (
              <Box
                key={option.value}
                role="button"
                tabIndex={0}
                onClick={() => setSource(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSource(option.value); }
                }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.25, borderRadius: 2, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: selected ? '#145DB8' : 'divider',
                  backgroundColor: selected ? 'rgba(20, 93, 184, 0.07)' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: selected ? '#145DB8' : 'rgba(20, 93, 184, 0.4)' },
                }}
              >
                <Box sx={{ fontSize: 20, flexShrink: 0 }}>{option.icon}</Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', flex: 1 }}>
                  {t(option.labelKey)}
                </Typography>
                <Box sx={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: '2px solid',
                  borderColor: selected ? '#145DB8' : 'divider',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: selected ? '#145DB8' : 'transparent',
                }}>
                  {selected && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fff' }} />}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box display="flex" gap={1.5}>
          <Button fullWidth variant="outlined" onClick={onClose} disabled={loading} sx={{ borderRadius: 2, py: 0.85 }}>
            {t('common.cancel')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            disabled={loading}
            onClick={() => onConfirm(source)}
            sx={{ borderRadius: 2, py: 0.85 }}
          >
            {loading ? t('finance.paying') : t('finance.confirmPay')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}