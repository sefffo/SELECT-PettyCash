import { useMemo, useState } from 'react';
import { Box, Typography, Button, Avatar, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HourglassEmptyOutlined, SendOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFinanceAllRequests, useEmailNameMap, useProcessTransaction } from '@/hooks/api';
import { EmptyState, SkeletonLoader, Toast } from '@/components/shared';
import { PaymentModal } from './PaymentModal';
import { isFinancePendingPaymentStatus, type PaymentSource } from '@/types/finance';
import { avatarColor, initialsOf } from '@/utils/avatar';
import type { FinanceRequestItem } from '@/types/api';
import { formatCurrencyByCode, formatDate } from '@/utils/format';

interface FinancePendingPaymentsProps {
  maxItems?: number;
}

export function FinancePendingPayments({ maxItems = 5 }: FinancePendingPaymentsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useFinanceAllRequests();
  const emailNames = useEmailNameMap();
  const payMutation = useProcessTransaction();
  const [selected, setSelected] = useState<FinanceRequestItem | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const items = useMemo(() => (data ?? []).filter((r) => isFinancePendingPaymentStatus(r.Status)), [data]);
  const visibleItems = items.filter((item) => !paidIds.has(item.RequestId));

  const nameOf = (item: FinanceRequestItem): string => {
    const email = (item.EmployeeEmail ?? '').trim().toLowerCase();
    return emailNames[email] ?? item.EmployeeEmail ?? '';
  };

  const showToast = (message: string, severity: 'success' | 'error') =>
    setToast({ open: true, message, severity });

  const handleConfirmPay = async (_source: PaymentSource) => {
    if (!selected) return;
    try {
      await payMutation.mutateAsync(selected.RequestId);
      setPaidIds((prev) => new Set(prev).add(selected.RequestId));
      setSelected(null);
      showToast(t('finance.paymentSent'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? t('finance.paymentFailed'), 'error');
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 0 }}
    >
      <Box display="flex" alignItems="center" gap={1.25} mb={1.75}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, #F59E0B, ${alpha('#F59E0B', 0.72)})`,
            color: '#fff',
            boxShadow: '0px 4px 12px rgba(245, 158, 11, 0.35)',
            '& .MuiSvgIcon-root': { fontSize: 21 },
          }}
        >
          <HourglassEmptyOutlined />
        </Box>
        <Box minWidth={0}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>{t('finance.pendingPaymentsSection')}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('finance.pendingPaymentsSubtitle')}
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <SkeletonLoader type="list" count={3} />
      ) : visibleItems.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={1}>
          <AnimatePresence initial={false}>
            {visibleItems.slice(0, maxItems).map((item) => {
              const name = nameOf(item);
              const color = avatarColor(name);
              return (
                <motion.div
                  key={item.RequestId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 60, height: 0, marginTop: 0, marginBottom: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box
                    onClick={() => setSelected(item)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'border-color 0.2s ease',
                      '&:hover': { borderColor: alpha('#F59E0B', 0.5) },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(color, 0.9), fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {initialsOf(name)}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.RequestType} · {formatDate(item.DateSubmitted)}
                        </Typography>
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.75} flexShrink={0}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrencyByCode(item.Amount, item.Currency)}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SendOutlined sx={{ fontSize: 14 }} />}
                          disabled={payMutation.isPending && selected?.RequestId === item.RequestId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item);
                          }}
                          sx={{ borderRadius: 2, px: 1.5, minHeight: 30, backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: theme.palette.success.dark } }}
                        >
                          {payMutation.isPending && selected?.RequestId === item.RequestId
                            ? t('finance.paying')
                            : t('finance.payNow')}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      ) : (
        <EmptyState icon="✅" title={t('finance.noPendingPayments')} description={t('finance.noPendingPaymentsHint')} />
      )}

      <PaymentModal
        open={!!selected}
        amount={selected?.Amount ?? 0}
        currency={selected?.Currency}
        loading={payMutation.isPending}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirmPay}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}