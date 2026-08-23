import { Box, Typography } from '@mui/material';
import { AccountBalanceWalletOutlined, Groups2Outlined, VerifiedOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FinanceSafeBalances, FinanceEmployeeBalances } from '@/components/finance';
import { AnimatedNumber, SkeletonLoader } from '@/components/shared';
import { useFinanceEmployeeBalances, useFinanceSafeBalances } from '@/hooks/api';

export default function FinanceBalances() {
  const { t } = useTranslation();
  const { data: safeBalances, isLoading: safeLoading } = useFinanceSafeBalances();
  const { data: employeeBalances, isLoading: accountsLoading } = useFinanceEmployeeBalances();

  const accountCount = employeeBalances?.length ?? 0;
  const safeCurrencyCount = safeBalances ? Object.keys(safeBalances).filter((k) => k in safeBalances).length : 0;

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

        <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
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
              <AccountBalanceWalletOutlined sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('finance.financePanel')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
              {t('finance.balances')}
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, color: 'rgba(255,255,255,0.82)', maxWidth: 520 }}>
              {t('finance.balancesSubtitle')}
            </Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ position: 'relative' }}>
            <Box sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroTotalAccounts')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {accountsLoading ? '—' : <AnimatedNumber value={accountCount} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <Groups2Outlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.custodyAccounts')}</Typography>
              </Box>
            </Box>
            <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroSafeCurrencies')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {safeLoading ? '—' : <AnimatedNumber value={safeCurrencyCount} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <VerifiedOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.safeBalance')}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0.35), transparent 60%)' }} />
      </Box>

      {accountsLoading || safeLoading ? (
        <SkeletonLoader type="dashboard" count={4} />
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          <FinanceSafeBalances />
          <FinanceEmployeeBalances />
        </Box>
      )}

      <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 2, textAlign: 'center' }}>
        {t('finance.settingsNote')}
      </Typography>
    </motion.div>
  );
}