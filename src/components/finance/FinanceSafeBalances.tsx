import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AccountBalanceWalletOutlined, VerifiedOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFinanceSafeBalances } from '@/hooks/api';
import { SectionHeader, SkeletonLoader, AnimatedNumber } from '@/components/shared';
import { formatCurrencyByCode } from '@/utils/format';
import type { FinanceSafeBalances as SafeBalances } from '@/types/api';

const CURRENCY_META = [
  { key: 'EGP', flag: '🇪🇬', color: '#145DB8', labelKey: 'currency.egp' },
  { key: 'USD', flag: '🇺🇸', color: '#22C55E', labelKey: 'currency.usd' },
  { key: 'SAR', flag: '🇸🇦', color: '#F59E0B', labelKey: 'currency.sar' },
] as const;

const ORDER: (keyof SafeBalances)[] = ['EGP', 'USD', 'SAR'];

export function FinanceSafeBalances() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useFinanceSafeBalances();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.35),
          boxShadow: `0px 12px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          insetInlineEnd: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <SectionHeader
        title={t('finance.safeBalance')}
        subtitle={t('finance.safeBalanceHint')}
      />

      {isLoading ? (
        <SkeletonLoader type="dashboard" count={3} />
      ) : !data ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {CURRENCY_META.map((meta) => (
            <Box
              key={meta.key}
              sx={{
                borderRadius: 2,
                p: 1.75,
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'rgba(100, 116, 139, 0.06)',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>{t(meta.labelKey)}</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>—</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
              mb: 2,
            }}
          >
            {CURRENCY_META.map((meta, index) => {
              const value = Number(data[meta.key] ?? 0);
              return (
                <motion.div
                  key={meta.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + index * 0.09 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 2.5,
                      p: 1.75,
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${alpha(meta.color, 0.14)}, transparent 70%)`,
                      border: '1px solid',
                      borderColor: alpha(meta.color, 0.25),
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -30,
                        insetInlineEnd: -30,
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(meta.color, 0.18)}, transparent 70%)`,
                        pointerEvents: 'none',
                      }}
                    />
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 2,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          backgroundColor: alpha(meta.color, 0.14),
                        }}
                      >
                        {meta.flag}
                      </Box>
                      <Box minWidth={0}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}>
                          {meta.key}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t(meta.labelKey)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: 19, sm: 21 },
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.15,
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <AnimatedNumber value={value} formatFn={(n) => formatCurrencyByCode(n, meta.key)} />
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
              pt: 1.25,
              borderTop: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <VerifiedOutlined sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                {t('finance.verifiedBalancesNote')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <AccountBalanceWalletOutlined sx={{ fontSize: 15, color: 'primary.main' }} />
              {t('finance.totalCurrencies', { count: ORDER.length })}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}