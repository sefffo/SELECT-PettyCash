import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
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
        px: 2,
        py: 1.5,
        borderRadius: 4,
        backgroundColor: 'action.hover',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'text.disabled',
        }}
      >
        {label}
      </Typography>
      <Box>{children}</Box>
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
        backdrop: {
          sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' },
        },
        paper: {
          sx: {
            borderRadius: 4,
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 480 },
            width: '100%',
            m: 2,
            p: 0,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          },
        },
      }}
    >
      <DialogContent sx={{ py: 3, px: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1.5} mb={2.5}>
          <Box display="flex" alignItems="flex-start" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23555'%3E%3Cpath d='M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V2l-1.5 1.5zM19 19a1 1 0 0 1-2 0v-1H6v1a1 1 0 0 1-2 0v-2h15v2zm0-4H5V5h14v10z'/%3E%3C/svg%3E"
                alt="receipt"
                sx={{ width: 22, height: 22, opacity: 0.6 }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {t('finance.transactionDetails', 'Transaction Details')}
              </Typography>
              <Chip
                label={t('finance.statusRead', 'Read')}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: 'action.selected',
                  color: 'text.secondary',
                  borderRadius: 1.5,
                }}
              />
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0, mt: -0.25, color: 'text.secondary' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

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
                p: 2,
                borderRadius: 4,
                backgroundColor: 'action.hover',
                textAlign: 'center',
                mb: 0.25,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  mb: 0.5,
                }}
              >
                {t('finance.requestedAmount', 'Requested Amount')}
              </Typography>
              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: 'text.primary',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrencyByCode(data.Amount, data.Currency)}
              </Typography>
            </Box>

            <DetailRow label={t('finance.status', 'Status')}>
              <FinanceStatusChip status={data.Status} />
            </DetailRow>

            <DetailRow label={t('finance.requestType', 'Request Type')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
                {data.RequestType}
              </Typography>
            </DetailRow>

            <DetailRow label={t('finance.employeeEmail', 'Employee Email')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
                {data.EmployeeEmail}
              </Typography>
            </DetailRow>

            <DetailRow label={t('finance.reason', 'Reason')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
                {data.Reason}
              </Typography>
            </DetailRow>

            {data.ManagementDecisionReason && (
              <DetailRow label={t('finance.managementDecision', 'Management Decision')}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
                  {data.ManagementDecisionReason}
                </Typography>
              </DetailRow>
            )}

            <DetailRow label={t('finance.date', 'Date')}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
                {formatDate(data.DateSubmitted)}
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
            sx={{
              borderRadius: 99,
              py: 1.1,
              fontSize: 14,
              fontWeight: 600,
              borderColor: 'divider',
              color: 'primary.main',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'rgba(20,93,184,0.04)' },
            }}
          >
            {t('common.close', 'Close')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
