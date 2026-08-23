import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AccountBalanceWalletOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DashboardCardHeader, SkeletonLoader } from '@/components/shared';
import { useWalletCurrencies } from '@/hooks/api';

const CURRENCIES = [
  { code: 'EGP', color: '#145DB8' },
  { code: 'USD', color: '#22C55E' },
  { code: 'SAR', color: '#F59E0B' },
] as const;

function formatWalletBalance(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function WalletCurrenciesCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useWalletCurrencies();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.35),
          boxShadow: `0px 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <DashboardCardHeader
        icon={<AccountBalanceWalletOutlined />}
        color="#145DB8"
        title={t('employee.walletCurrencies')}
        subtitle={t('employee.walletCurrenciesHint')}
      />

      {isLoading ? (
        <SkeletonLoader type="dashboard" count={3} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1.5,
            flex: 1,
          }}
        >
          {CURRENCIES.map((currency, index) => {
            const balance = data?.[currency.code] ?? null;
            return (
              <Box
                key={currency.code}
                component={motion.div}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                sx={{
                  borderRadius: 2,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: `linear-gradient(135deg, ${alpha(currency.color, 0.1)}, transparent 70%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  minWidth: 0,
                }}
              >
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1.5,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currency.color,
                      background: alpha(currency.color, 0.14),
                      '& .MuiSvgIcon-root': { fontSize: 15 },
                    }}
                  >
                    <AccountBalanceWalletOutlined />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: 'text.secondary',
                    }}
                  >
                    {currency.code}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: 20 },
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1.15,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {balance === null ? '—' : formatWalletBalance(balance, currency.code)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}