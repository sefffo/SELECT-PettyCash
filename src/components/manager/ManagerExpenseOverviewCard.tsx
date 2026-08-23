import { Box, Button, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ErrorOutline, Replay, TrendingUpOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardCardHeader, SkeletonLoader } from '@/components/shared';
import { useManagerExpenseOverview } from '@/hooks/api';
import type { ManagerExpenseOverviewPoint } from '@/types/api';
import { formatCurrency, formatTooltipCurrency } from '@/utils/format';

interface TrendDatum {
  label: string;
  amount: number;
}

const GRADIENT_ID = 'managerExpenseOverviewFill';

function compactAmount(value: number): string {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `${value}`;
}

function monthTimeOf(point: ManagerExpenseOverviewPoint): number {
  const raw = (point.Month ?? '').trim();
  const match = /^(\d{4})-(\d{2})/.exec(raw);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, 1).getTime();
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? Number.NEGATIVE_INFINITY : date.getTime();
}

function labelOf(point: ManagerExpenseOverviewPoint, index: number): string {
  const raw = point.Month ?? point.MonthName;
  if (!raw || raw.trim() === '') return `#${index + 1}`;
  const match = /^(\d{4})-(\d{2})/.exec(raw.trim());
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
  return raw;
}

function buildChartData(points: ManagerExpenseOverviewPoint[]): TrendDatum[] {
  return [...points]
    .sort((a, b) => monthTimeOf(a) - monthTimeOf(b))
    .map((point, index) => ({
      label: labelOf(point, index),
      amount: Number(point.Amount ?? point.Total ?? 0),
    }));
}

export function ManagerExpenseOverviewCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useManagerExpenseOverview();

  const chartData = buildChartData(data ?? []);
  const isEmpty = chartData.length === 0;

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
        icon={<TrendingUpOutlined />}
        color={theme.palette.primary.main}
        title={t('manager.monthlyTrend')}
        subtitle={t('manager.monthlyTrendSubtitle')}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {isLoading && (
          <Box sx={{ flex: 1, display: 'flex' }}>
            <SkeletonLoader type="dashboard" count={1} />
          </Box>
        )}

        {!isLoading && isError && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 0.75,
              py: 3,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
                mb: 0.5,
              }}
            >
              <ErrorOutline sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
              {t('manager.monthlyTrendLoadFailed')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('manager.monthlyTrendLoadFailedHint')}
            </Typography>
            <Button
              size="small"
              startIcon={<Replay sx={{ fontSize: 16 }} />}
              onClick={() => void refetch()}
              sx={{ mt: 0.75, borderRadius: 2, fontSize: 12.5, textTransform: 'none' }}
            >
              {t('manager.retry')}
            </Button>
          </Box>
        )}

        {!isLoading && !isError && isEmpty && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 0.75,
              py: 3,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: 'text.secondary',
                mb: 0.5,
              }}
            >
              <ErrorOutline sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
              {t('manager.monthlyTrendEmpty')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('manager.monthlyTrendEmptyHint')}
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && !isEmpty && (
          <Box sx={{ height: { xs: 200, sm: 230 }, mt: 0.5 }}>
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
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('manager.monthlyTrendTotal')}</Typography>
        </Box>
      )}
    </Box>
  );
}