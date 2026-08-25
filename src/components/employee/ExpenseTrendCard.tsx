import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ShowChartOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardCardHeader } from '@/components/shared';
import { ChartCardState } from './ChartCardState';
import { useExpenseTrend } from '@/hooks/api';
import { formatCurrency, formatTooltipCurrency } from '@/utils/format';

interface TrendDatum {
  label: string;
  amount: number;
}

const GRADIENT_ID = 'expenseTrendFill';

function compactAmount(value: number): string {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `${value}`;
}

export function ExpenseTrendCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useExpenseTrend();

  const chartData: TrendDatum[] = (data ?? []).map((point, index) => ({
    label: point.Month || `#${index + 1}`,
    amount: Number(point.Amount ?? point.Total ?? 0),
  }));

  // Treat all-zero data as empty — a flat zero line is misleading
  const isEmpty = chartData.length === 0 || chartData.every((p) => p.amount === 0);

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
        icon={<ShowChartOutlined />}
        color="#145DB8"
        title={t('employee.expenseTrend')}
        subtitle={t('employee.expenseTrendHint')}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {isLoading || isError || isEmpty ? (
          <Box sx={{ flex: 1, display: 'flex' }}>
            <ChartCardState loading={isLoading} error={isError} empty={isEmpty} onRetry={() => void refetch()} />
          </Box>
        ) : (
          <Box sx={{ height: { xs: 190, sm: 210 }, mt: 0.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <YAxis
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactAmount}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <Tooltip
                  cursor={{ stroke: alpha(theme.palette.primary.main, 0.35), strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  labelFormatter={(label) => String(label)}
                  formatter={(value) => formatTooltipCurrency(value)}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: 12.5 }}
                  itemStyle={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: 13 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2.5}
                  fill={`url(#${GRADIENT_ID})`}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>

      {!isEmpty && !isLoading && !isError && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', rowGap: 0.25, minWidth: 0 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary' }}>
            {formatCurrency(chartData.reduce((sum, point) => sum + point.amount, 0))}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('employee.expenseTrendTotal')}</Typography>
        </Box>
      )}
    </Box>
  );
}
