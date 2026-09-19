import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Close, ReceiptLongOutlined, ScheduleOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { EmployeeExpenseItem } from '@/types/api';
import type { ExpenseStatus } from '@/types/vertex';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { mapExpenseStatus } from '@/utils/mappers';
import { formatCurrencyByCode, formatDate } from '@/utils/format';

const STATUS_LABEL_KEYS: Record<ExpenseStatus, string> = {
  submitted: 'expense.status.submitted',
  'under-review': 'expense.status.underReview',
  approved: 'expense.status.approved',
  rejected: 'expense.status.rejected',
  reimbursed: 'expense.status.reimbursed',
  completed: 'request.status.completed',
  pending: 'request.status.pending',
  'pending-manager': 'request.status.pending',
  'pending-approval': 'request.status.pendingApproval',
  'pending-finance': 'request.status.pendingFinance',
};

interface ExpenseDetailsDialogProps {
  expense: EmployeeExpenseItem | null;
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

export function ExpenseDetailsDialog({ expense, onClose }: ExpenseDetailsDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!expense) return null;

  const status = mapExpenseStatus(expense.Status);
  const isPendingManager = status === 'pending-manager';
  const currency = expense.Currency ?? 'EGP';
  const statusKey = STATUS_LABEL_KEYS[status] ?? 'request.status.pending';

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 480 },
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
          {t('employee.expenseDetails')}
        </Typography>
        <IconButton size="small" aria-label={t('common.close')} onClick={onClose}>
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
        <Typography
          sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', mt: 1, mb: 1.5, wordBreak: 'break-word', lineHeight: 1.35 }}
        >
          {expense.Reason || '—'}
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <StatusBadge status={status} labelKey={isPendingManager ? 'request.status.pending' : undefined} />
        </Box>

        {isPendingManager && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1.25,
              mb: 1.75,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.35),
            }}
          >
            <ScheduleOutlined sx={{ fontSize: 16, color: 'warning.main', mt: 0.1, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{t('employee.waitingManagerApproval')}</Typography>
          </Box>
        )}

        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <DetailRow label={t('employee.expenseFormDescription')} value={expense.Reason || '—'} strong />
          <DetailRow label={t('employee.expenseAmount')} value={formatCurrencyByCode(expense.Amount, currency)} strong />
          <DetailRow label={t('employee.expenseFormCurrency')} value={currency} />
          <DetailRow label={t('employee.expenseDate')} value={formatDate(expense.DateSubmitted ?? null)} />
          <DetailRow label={t('employee.expenseStatus')} value={t(statusKey)} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}