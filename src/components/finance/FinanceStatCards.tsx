import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AccountBalanceWalletOutlined,
  HourglassEmptyOutlined,
  PeopleAltOutlined,
  TrendingUpRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedNumber, SkeletonLoader } from '@/components/shared';
import { formatCurrency } from '@/utils/format';

interface FinanceStatCardsProps {
  totalDisbursed: number;
  disbursedCount: number;
  pendingPaymentsTotal: number;
  pendingPaymentsCount: number;
  custodyAccountsCount: number;
  loading?: boolean;
}

const cardConfig = [
  { key: 'disbursed', icon: <AccountBalanceWalletOutlined />, color: '#145DB8' },
  { key: 'pending', icon: <HourglassEmptyOutlined />, color: '#F59E0B' },
  { key: 'accounts', icon: <PeopleAltOutlined />, color: '#22C55E' },
] as const;

function StatCardGlass({
  title,
  subtitle,
  icon,
  color,
  value,
  index,
  isCount,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  value: number | null;
  index: number;
  isCount?: boolean;
}) {
  const { t } = useTranslation();
  const display = value === null ? '—' : isCount ? (
    <AnimatedNumber value={value} formatFn={(n) => `${Math.round(n)}`} />
  ) : (
    <AnimatedNumber value={value} formatFn={(n) => formatCurrency(Math.round(n))} />
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      sx={{
        borderRadius: 3,
        p: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          borderColor: alpha(color, 0.4),
          boxShadow: `0px 10px 28px ${alpha(color, 0.12)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          insetInlineEnd: -50,
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color, 0.09)}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.72)})`,
            boxShadow: `0px 4px 12px ${alpha(color, 0.35)}`,
            '& .MuiSvgIcon-root': { fontSize: 20 },
          }}
        >
          {icon}
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.75,
            py: 0.25,
            borderRadius: 1.5,
            backgroundColor: alpha(color, 0.1),
            color,
          }}
        >
          <TrendingUpRounded sx={{ fontSize: 12 }} />
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('finance.live')}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{
        fontSize: { xs: 20, sm: 23 },
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.15,
        mb: 0.25,
        color: 'text.primary',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {display}
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.1 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {subtitle}
      </Typography>
    </Box>
  );
}

export function FinanceStatCards({
  totalDisbursed,
  disbursedCount,
  pendingPaymentsTotal,
  pendingPaymentsCount,
  custodyAccountsCount,
  loading,
}: FinanceStatCardsProps) {
  const { t } = useTranslation();

  if (loading) return <SkeletonLoader type="dashboard" count={3} />;

  const cards = [
    {
      title: t('finance.totalDisbursed'),
      subtitle: t('finance.completedPaymentsCount', { count: disbursedCount }),
      icon: cardConfig[0]!.icon,
      color: cardConfig[0]!.color,
      value: totalDisbursed,
    },
    {
      title: t('finance.pendingPayments'),
      subtitle: t('finance.approvedAwaitingFinance', { count: pendingPaymentsCount }),
      icon: cardConfig[1]!.icon,
      color: cardConfig[1]!.color,
      value: pendingPaymentsTotal,
    },
    {
      title: t('finance.custodyAccounts'),
      subtitle: t('finance.custodyAccountsHint'),
      icon: cardConfig[2]!.icon,
      color: cardConfig[2]!.color,
      value: custodyAccountsCount,
      isCount: true,
    },
  ];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      gap: 1.5,
    }}>
      {cards.map((card, i) => (
        <StatCardGlass key={i} {...card} index={i} />
      ))}
    </Box>
  );
}