import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionHeader, EmptyState, SkeletonLoader } from '@/components/shared';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import type { Request } from '@/types/vertex';

interface EmployeeRequestListProps {
  requests: Request[];
  loading?: boolean;
}

export function EmployeeRequestList({ requests, loading }: EmployeeRequestListProps) {
  const { t } = useTranslation();
  if (loading) return <SkeletonLoader type="list" count={4} />;

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}>
      <SectionHeader title={t('employee.myRequests')} viewAllLink="/employee/requests" />
      {requests.length === 0 ? (
        <EmptyState icon="📄" title={t('employee.noRequests')} description={t('employee.noRequestsHint')} />
      ) : (
        <Box display="flex" flexDirection="column" gap={0.75}>
          {requests.slice(0, 5).map((req, i) => (
            <Box component={motion.div} key={req.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>{req.reason}</Typography>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <StatusBadge status={req.status} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>{formatDate(req.createdAt)}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" fontWeight={700} flexShrink={0} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>{formatCurrencyByCode(req.amount, req.currency)}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
