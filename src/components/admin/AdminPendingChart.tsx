import { Box, Button, Typography, useTheme } from '@mui/material';
import { PieChartOutlined } from '@mui/icons-material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardCardHeader, EmptyState, SkeletonLoader } from '@/components/shared';
import type { Request, RequestTypeValue } from '@/types/vertex';
import { formatCurrency, formatTooltipCurrency } from '@/utils/format';

interface AdminPendingChartProps {
  requests: Request[];
  loading?: boolean;
}

const TYPE_ORDER: RequestTypeValue[] = ['cash-advance', 'budget', 'purchase', 'travel'];
const TYPE_TO_KEY: Record<RequestTypeValue, string> = {
  'cash-advance': 'cashAdvance',
  budget: 'budget',
  purchase: 'purchase',
  travel: 'travel',
};
const COLORS = ['#145DB8', '#7C3AED', '#22C55E', '#F59E0B'];

export function AdminPendingChart({ requests, loading }: AdminPendingChartProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const data = useMemo(() => {
    return TYPE_ORDER.map((type, index) => ({
      name: t(`request.type.${TYPE_TO_KEY[type]}`),
      value: requests
        .filter((r) => r.requestType === type)
        .reduce((sum, r) => sum + r.amount, 0),
      color: COLORS[index],
    })).filter((d) => d.value > 0);
  }, [requests, t]);

  if (loading) return <SkeletonLoader type="card" count={2} />;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5, minWidth: 0 }}>
      <DashboardCardHeader
        icon={<PieChartOutlined />}
        color="#145DB8"
        title={t('admin.pendingChart')}
        subtitle={t('admin.pendingChartSubtitle')}
        action={
          <Button
            size="small"
            onClick={() => navigate('/admin/requests')}
            sx={{ borderRadius: 2, flexShrink: 0, py: 0.4, px: 1.25, fontSize: 13, textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.viewAll')}
          </Button>
        }
      />
      {data.length === 0 ? (
        <EmptyState icon="📊" title={t('admin.allCaughtUp')} description={t('admin.noPendingRequests')} />
      ) : (
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={3}>
          <Box sx={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} strokeWidth={0}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={formatTooltipCurrency}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>{formatCurrency(total)}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('admin.pendingTotal')}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.map((entry) => (
              <Box key={entry.name} display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 14, color: 'text.primary', flex: 1 }}>{entry.name}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>{formatCurrency(entry.value)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}