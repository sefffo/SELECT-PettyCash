import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BarChartOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardCardHeader } from '@/components/shared';
import { ChartCardState } from './ChartCardState';
import { useTopCategories } from '@/hooks/api';
import { formatCurrency } from '@/utils/format';

interface CategoryDatum {
  label: string;
  amount: number;
  percentage: number;
}

const MAX_CATEGORIES = 6;

interface TopCategoryTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: CategoryDatum }>;
}

function TopCategoryTooltip({ active, payload }: TopCategoryTooltipProps) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        boxShadow: 3,
        px: 1.25,
        py: 0.75,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>{datum.label}</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
        {formatCurrency(datum.amount)} · {datum.percentage.toFixed(0)}%
      </Typography>
    </Box>
  );
}

export function TopCategoryCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useTopCategories();

  const total = (data ?? []).reduce((sum, item) => sum + Number(item.Amount ?? 0), 0);

  const chartData: CategoryDatum[] = (data ?? [])
    .map((item) => {
      const amount = Number(item.Amount ?? 0);
      return {
        label: item.Category || t('employee.other'),
        amount,
        percentage: Number(item.Percentage ?? 0) > 0 ? Number(item.Percentage ?? 0) : total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, MAX_CATEGORIES);

  // Treat all-zero amounts as empty — rendering zero-length bars is misleading
  const isEmpty = chartData.length === 0 || chartData.every((item) => item.amount === 0);

  const barColors = chartData.map((_, index) =>
    alpha(theme.palette.primary.main, Math.max(0.35, 1 - index * 0.16)),
  );

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
        icon={<BarChartOutlined />}
        color="#7C3AED"
        title={t('employee.topCategory')}
        subtitle={t('employee.topCategoryHint')}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {isLoading || isError || isEmpty ? (
          <Box sx={{ flex: 1, display: 'flex' }}>
            <ChartCardState loading={isLoading} error={isError} empty={isEmpty} onRetry={() => void refetch()} />
          </Box>
        ) : (
          <Box sx={{ height: { xs: 190, sm: 210 }, mt: 0.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap={10}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={96}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 13)}…` : value)}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <Tooltip content={<TopCategoryTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={14}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.label} fill={barColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>

      {!isEmpty && !isLoading && !isError && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', rowGap: 0.25, minWidth: 0 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary' }}>
            {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0))}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('employee.topCategoryTotal')}</Typography>
        </Box>
      )}
    </Box>
  );
}
