import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFinanceRequestDetails } from '@/hooks/api';
import { FinanceStatusChip } from './FinanceStatusChip';
import { formatCurrencyByCode, formatDate } from '@/utils/format';

interface TransactionDetailsDialogProps {
  open: boolean;
  requestId: string | null;
  onClose: () => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        backgroundColor: 'action.hover',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.4,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.disabled' }}>
        {label}
      </Typography>
      <Box sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>{children}</Box>
    </Box>
  );
}

export function TransactionDetailsDialog({ open, requestId, onClose }: TransactionDetailsDialogProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useFinanceRequestDetails(requestId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        paper: {
          sx: {
            borderRadius: 3,
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 480 },
            width: '100%',
            m: 2,
            p: 0,
            border: '1.5px solid',
            borderColor: 'primary.main',
          },
        },
      }}
    >
      <DialogContent sx={{ py: 2.5, px: 2.5 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1.5} mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(20, 93, 184, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              🧾
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {t('finance.transactionDetails', 'Transaction Details')}
              </Typography>
              {data && (
                <Chip
                  label={t('finance.statusRead', 'Read')}
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: 'action.selected',
                    color: 'text.secondary',
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0, mt: -0.5 }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Body */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={32} />
          </Box>
        ) : data ? (
          <Box display="flex" flexDirection="column" gap={1.25}>
            {/* Amount highlight */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                backgroundColor: 'rgba(20, 93, 184, 0.06)',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                mb: 0.5,
              }}
            >
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600, mb: 0.25 }}>
                {t('finance.requestedAmount', 'Requested Amount')}
              </Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
                {formatCurrencyByCode(data.Amount, data.Currency)}
              </Typography>
            </Box>

            <DetailRow label={t('finance.status', 'Status')}>
              <FinanceStatusChip status={data.Status} />
            </DetailRow>

            <DetailRow label={t('finance.requestType', 'Request Type')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{data.RequestType}</Typography>
            </DetailRow>

            <DetailRow label={t('finance.employeeEmail', 'Employee Email')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{data.EmployeeEmail}</Typography>
            </DetailRow>

            <DetailRow label={t('finance.reason', 'Reason')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{data.Reason}</Typography>
            </DetailRow>

            {data.ManagementDecisionReason && (
              <DetailRow label={t('finance.managementDecision', 'Management Decision')}>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{data.ManagementDecisionReason}</Typography>
              </DetailRow>
            )}

            <DetailRow label={t('finance.date', 'Date')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{formatDate(data.DateSubmitted)}</Typography>
            </DetailRow>

            <DetailRow label={t('finance.requestId', 'Request ID')}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {data.RequestId}
              </Typography>
            </DetailRow>
          </Box>
        ) : (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            {t('common.errorLoading', 'Failed to load details.')}
          </Typography>
        )}

        <Box mt={2.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 99, py: 1, fontSize: 14, fontWeight: 600 }}
          >
            {t('common.close', 'Close')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
