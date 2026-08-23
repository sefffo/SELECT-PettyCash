import { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DownloadOutlined, ReceiptLongOutlined, AccountBalanceWalletOutlined, History, SpaceDashboardOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useFinanceAllRequests,
  useFinanceEmployeeBalances,
  useFinanceTransactions,
} from '@/hooks/api';
import { FinanceStatCards, FinancePendingPayments } from '@/components/finance';
import { AnimatedNumber, SkeletonLoader } from '@/components/shared';
import {
  isDisbursedTransactionStatus,
  isFinancePendingPaymentStatus,
  type FinanceDashboardData,
} from '@/types/finance';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/utils/constants';

function HeroStat({
  label,
  sublabel,
  icon,
  value,
  loading,
  isCurrency,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  value: number;
  loading?: boolean;
  isCurrency?: boolean;
}) {
  return (
    <Box sx={{ minWidth: { xs: 100, sm: 132 } }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
        {loading ? '—' : isCurrency ? (
          <AnimatedNumber value={value} formatFn={(n) => formatCurrency(Math.round(n))} />
        ) : (
          <AnimatedNumber value={value} />
        )}
      </Typography>
      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
        {icon}
        <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{sublabel}</Typography>
      </Box>
    </Box>
  );
}

export default function FinanceDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: transactions, isLoading: transactionsLoading } = useFinanceTransactions();
  const { data: requests, isLoading: requestsLoading } = useFinanceAllRequests();
  const { data: balances, isLoading: balancesLoading } = useFinanceEmployeeBalances();

  const dashboardData: FinanceDashboardData = useMemo(() => {
    const tx = transactions ?? [];
    const req = requests ?? [];
    const disbursed = tx.filter((item) => isDisbursedTransactionStatus(item.Status));
    const pendingPayments = req.filter((item) => isFinancePendingPaymentStatus(item.Status));
    return {
      totalDisbursed: disbursed.reduce((sum, item) => sum + Number(item.Amount ?? 0), 0),
      disbursedCount: disbursed.length,
      pendingPaymentsTotal: pendingPayments.reduce((sum, item) => sum + Number(item.Amount ?? 0), 0),
      pendingPaymentsCount: pendingPayments.length,
      custodyAccountsCount: (balances ?? []).length,
    };
  }, [transactions, requests, balances]);

  const loading = transactionsLoading || requestsLoading || balancesLoading;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Hero banner */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          mb: 2.5,
          color: '#fff',
          background: 'linear-gradient(135deg, #0D4A92 0%, #145DB8 45%, #1D6FD6 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, insetInlineEnd: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -100, insetInlineStart: '30%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2.5, alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
          <Box minWidth={0}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                mb: 1.25,
                backgroundColor: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <SpaceDashboardOutlined sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('finance.nav.overview')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
              {t('finance.dashboard')}
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, color: 'rgba(255,255,255,0.82)', maxWidth: 520, mb: { xs: 2, sm: 2.5 } }}>
              {t('finance.dashboardSubtitle')}
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<ReceiptLongOutlined sx={{ fontSize: 17 }} />}
                onClick={() => navigate(ROUTES.FINANCE_TRANSACTIONS)}
                sx={{ borderRadius: 2, px: 2.25, py: 1, backgroundColor: '#fff', color: '#0D4A92', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: 'none' } }}
              >
                {t('nav.transactions')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccountBalanceWalletOutlined sx={{ fontSize: 17 }} />}
                onClick={() => navigate(ROUTES.FINANCE_BALANCES)}
                sx={{ borderRadius: 2, px: 2.25, py: 1, borderColor: 'rgba(255,255,255,0.5)', color: '#fff', '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' } }}
              >
                {t('nav.balances')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<History sx={{ fontSize: 17 }} />}
                onClick={() => navigate(ROUTES.FINANCE_EMPLOYEE_HISTORY)}
                sx={{ borderRadius: 2, px: 2.25, py: 1, borderColor: 'rgba(255,255,255,0.5)', color: '#fff', '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' } }}
              >
                {t('finance.nav.employeeHistory')}
              </Button>
              <Button
                variant="outlined"
                disabled
                startIcon={<DownloadOutlined sx={{ fontSize: 17 }} />}
                sx={{ borderRadius: 2, px: 2.25, py: 1, borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.75)' }}
              >
                {t('finance.exportLedger')}
              </Button>
            </Box>
          </Box>

          <Box display="flex" gap={2.5} flexWrap="wrap" sx={{ position: 'relative' }}>
            <HeroStat
              label={t('finance.totalDisbursed')}
              sublabel={t('finance.completedPaymentsCount', { count: dashboardData.disbursedCount })}
              icon={<ReceiptLongOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />}
              value={dashboardData.totalDisbursed}
              loading={loading}
              isCurrency
            />
            <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
            <HeroStat
              label={t('finance.pendingPayments')}
              sublabel={t('finance.approvedAwaitingFinance', { count: dashboardData.pendingPaymentsCount })}
              icon={<ReceiptLongOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />}
              value={dashboardData.pendingPaymentsCount}
              loading={loading}
            />
            <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
            <HeroStat
              label={t('finance.custodyAccounts')}
              sublabel={t('finance.custodyAccountsHint')}
              icon={<AccountBalanceWalletOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />}
              value={dashboardData.custodyAccountsCount}
              loading={loading}
            />
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0.35), transparent 60%)' }} />
      </Box>

      {loading ? (
        <SkeletonLoader type="dashboard" count={3} />
      ) : (
        <Box sx={{ mb: 3 }}>
          <FinanceStatCards
            totalDisbursed={dashboardData.totalDisbursed}
            disbursedCount={dashboardData.disbursedCount}
            pendingPaymentsTotal={dashboardData.pendingPaymentsTotal}
            pendingPaymentsCount={dashboardData.pendingPaymentsCount}
            custodyAccountsCount={dashboardData.custodyAccountsCount}
          />
        </Box>
      )}

      <Box sx={{ mb: 2.5 }}>
        <FinancePendingPayments maxItems={6} />
      </Box>
    </motion.div>
  );
}