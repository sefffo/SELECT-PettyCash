import { Box, Button, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CheckCircleOutline, CompareArrowsOutlined, ErrorOutline, Replay } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardCardHeader } from './DashboardCardHeader';
import { SkeletonLoader } from './SkeletonLoader';
import { useCompletedTransfers } from '@/hooks/api';
import type { CompletedTransferPoint } from '@/types/api';
import { formatCurrencyByCode } from '@/utils/format';

interface ChartDatum {
  label: string;
  EGP: number;
  EGPCount: number;
  USD: number;
  USDCount: number;
  SAR: number;
  SARCount: number;
}

const CURRENCIES = [
  { key: 'EGP', countKey: 'EGPCount', color: '#145DB8' },
  { key: 'USD', countKey: 'USDCount', color: '#22C55E' },
  { key: 'SAR', countKey: 'SARCount', color: '#F59E0B' },
] as const;

type CurrencyMeta = (typeof CURRENCIES)[number];

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function safeNumber(value: number | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthRank(month: string | undefined): number {
  const rank = MONTH_INDEX[(month ?? '').trim()];
  return rank ?? Number.MAX_SAFE_INTEGER;
}

function pointLabel(month: string | undefined, index: number): string {
  const raw = (month ?? '').trim();
  return raw === '' ? `#${index + 1}` : raw;
}

function buildChartData(points: CompletedTransferPoint[]): ChartDatum[] {
  return [...points]
    .sort((a, b) => monthRank(a.Month) - monthRank(b.Month))
    .map((point, index) => ({
      label: pointLabel(point.Month, index),
      EGP: safeNumber(point.EGP_Amount),
      EGPCount: safeNumber(point.EGP_Count),
      USD: safeNumber(point.USD_Amount),
      USDCount: safeNumber(point.USD_Count),
      SAR: safeNumber(point.SAR_Amount),
      SARCount: safeNumber(point.SAR_Count),
    }));
}

function compactAmount(value: number): string {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `${value}`;
}

interface CompletedTransfersTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartDatum }>;
  label?: string | number;
  currencies?: readonly CurrencyMeta[];
}

function CompletedTransfersTooltip({ active, payload, label, currencies = CURRENCIES }: CompletedTransfersTooltipProps) {
  const { t } = useTranslation();
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
        px: 1.5,
        py: 1,
        minWidth: 168,
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.primary', mb: 0.75 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {currencies.map((currency) => {
          const amount = datum[currency.key];
          const count = datum[currency.countKey];
          return (
            <Box key={currency.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: currency.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', minWidth: 34 }}>
                {currency.key}
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }} noWrap>
                {formatCurrencyByCode(amount, currency.key)}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                · {t('completedTransfers.transfers', { count })}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * Shared Manager/Admin dashboard chart card backed by the
 * `Manager/CompletedTransfers` endpoint. Renders the annual completed-transfers
 * series as a grouped bar chart per currency; the backend scopes rows to the
 * caller's role (company-wide for Admin, department for Manager).
 */
export function CompletedTransfersChartCard({ currency }: { currency?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useCompletedTransfers();

  // When a shared currency is supplied, the card renders only that currency's
  // existing backend series. With no prop (e.g. the admin dashboard) the
  // original all-currencies view is preserved.
  const visibleCurrencies: readonly CurrencyMeta[] = currency
    ? CURRENCIES.filter((item) => item.key === currency)
    : CURRENCIES;

  const chartData = buildChartData(data ?? []);
  const hasData = chartData.some((point) =>
    visibleCurrencies.some((item) => point[item.key] > 0 || point[item.countKey] > 0),
  );

  const totals = chartData.reduce(
    (acc, point) => ({
      EGP: acc.EGP + point.EGP,
      EGPCount: acc.EGPCount + point.EGPCount,
      USD: acc.USD + point.USD,
      USDCount: acc.USDCount + point.USDCount,
      SAR: acc.SAR + point.SAR,
      SARCount: acc.SARCount + point.SARCount,
    }),
    { EGP: 0, EGPCount: 0, USD: 0, USDCount: 0, SAR: 0, SARCount: 0 },
  );
  const totalCount = visibleCurrencies.reduce((sum, item) => sum + totals[item.countKey], 0);

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
        icon={<CompareArrowsOutlined />}
        color={theme.palette.primary.main}
        title={t('completedTransfers.title')}
        subtitle={t('completedTransfers.subtitle')}
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
              {t('completedTransfers.loadFailed')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('completedTransfers.loadFailedHint')}
            </Typography>
            <Button
              size="small"
              startIcon={<Replay sx={{ fontSize: 16 }} />}
              onClick={() => void refetch()}
              sx={{ mt: 0.75, borderRadius: 2, fontSize: 12.5, textTransform: 'none' }}
            >
              {t('completedTransfers.retry')}
            </Button>
          </Box>
        )}

        {!isLoading && !isError && !hasData && (
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
              <CompareArrowsOutlined sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
              {t('completedTransfers.empty')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('completedTransfers.emptyHint')}
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && hasData && (
          <Box sx={{ height: { xs: 210, sm: 240 }, mt: 0.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="24%" maxBarSize={10}>
                <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  minTickGap={8}
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
                  cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                  content={<CompletedTransfersTooltip currencies={visibleCurrencies} />}
                />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary, paddingBottom: 4 }}
                />
                {visibleCurrencies.map((item) => (
                  <Bar key={item.key} dataKey={item.key} name={item.key} fill={item.color} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>

      {!isLoading && !isError && hasData && (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
            rowGap: 0.5,
            pt: 1.25,
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', rowGap: 0.5, minWidth: 0 }}>
            {visibleCurrencies.map((item) => (
              <Box key={item.key} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>
                  {formatCurrencyByCode(totals[item.key], item.key)}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'text.secondary',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <CheckCircleOutline sx={{ fontSize: 15, color: 'success.main' }} />
            {t('completedTransfers.total', { count: totalCount })}
          </Typography>
        </Box>
      )}
    </Box>
  );
}