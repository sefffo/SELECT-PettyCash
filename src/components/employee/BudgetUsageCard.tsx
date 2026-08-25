import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DonutLargeOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardCardHeader } from '@/components/shared';
import { ChartCardState } from './ChartCardState';
import { useBudgetUsage } from '@/hooks/api';
import { formatCurrency } from '@/utils/format';

const COLORS = {
  used: '#145DB8',
  remaining: 'rgba(20, 93, 184, 0.12)',
};

export function BudgetUsageCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useBudgetUsage();

  const totalBudget = Number(data?.TotalBudget ?? 0);
  const used = Number(data?.Used ?? 0);
  const remaining = Number(data?.Remaining ?? 0);

  /*
   * Derive usage percentage from TotalBudget + Used rather than trusting the
   * backend Percentage field (the live API returns 0 even when Used > 0).
   * When TotalBudget is 0 but Used > 0 we show the donut with 100% used so
   * the employee can still see they have outstanding spend.
   * The chart is always rendered once data arrives – only hidden on load/error.
   */
  const percentage =
    totalBudget > 0
      ? Math.min(Math.round((used / totalBudget) * 100), 100)
      : used > 0
      ? 100
      : 0;

  // Only suppress the chart while loading or on a network error
  const isEmpty = false;

  const chartData = [
    { name: 'used', value: percentage, color: COLORS.used },
    { name: 'remaining', value: Math.max(0, 100 - percentage), color: COLORS.remaining },
  ];

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
        icon={<DonutLargeOutlined />}
        color="#145DB8"
        title={t('employee.budgetUsage')}
        subtitle={t('employee.thisMonth')}
      />

      {isLoading || isError ? (
        <Box sx={{ flex: 1, display: 'flex' }}>
          <ChartCardState loading={isLoading} error={isError} empty={isEmpty} onRetry={() => void refetch()} />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: { xs: 120, sm: 140 },
              height: { xs: 120, sm: 140 },
              flexShrink: 0,
              mx: { xs: 'auto', sm: 0 },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={64}
                  paddingAngle={percentage > 0 && percentage < 100 ? 2 : 0}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={450}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value ?? 0)}%`, '']}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 22, sm: 28 },
                  fontWeight: 800,
                  color: 'text.primary',
                  lineHeight: 1,
                }}
              >
                {`${percentage}%`}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.25 }}>
                {t('employee.used')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {t('employee.totalBudget')}
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {formatCurrency(totalBudget)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {t('employee.used')}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {formatCurrency(used)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {t('employee.remaining')}
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {formatCurrency(remaining)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Box sx={{ height: 6, borderRadius: 3, backgroundColor: COLORS.remaining, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${percentage}%`,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: COLORS.used,
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
