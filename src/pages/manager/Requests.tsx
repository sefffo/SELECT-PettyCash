import { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useManagerApprovedRequests, useManagerPendingRequests, useManagerRejectedRequests } from '@/hooks/api';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { FilterChips } from '@/components/feature/FilterChips';
import { EmptyState, SkeletonLoader } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { mapManagerRequestToRequest, sortByDateDesc } from '@/utils/mappers';

export default function ManagerRequests() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pendingQuery = useManagerPendingRequests();
  const approvedQuery = useManagerApprovedRequests();
  const rejectedQuery = useManagerRejectedRequests();
  const [filter, setFilter] = useState('pending');

  const filters = [
    { value: 'all', label: t('manager.allRequests') },
    { value: 'pending', label: t('request.status.pending') },
    { value: 'approved', label: t('expense.status.approved') },
    { value: 'rejected', label: t('expense.status.rejected') },
  ];

  const filterLabel =
    filter === 'all'
      ? t('manager.allRequests')
      : filter === 'approved'
        ? t('expense.status.approved')
        : filter === 'rejected'
          ? t('expense.status.rejected')
          : t('request.status.pending');

  const pendingRequests = useMemo(
    () => sortByDateDesc((pendingQuery.data ?? []).map(mapManagerRequestToRequest)),
    [pendingQuery.data],
  );
  const approvedRequests = useMemo(
    () => sortByDateDesc((approvedQuery.data ?? []).map(mapManagerRequestToRequest)),
    [approvedQuery.data],
  );
  const rejectedRequests = useMemo(
    () => sortByDateDesc((rejectedQuery.data ?? []).map(mapManagerRequestToRequest)),
    [rejectedQuery.data],
  );

  const allRequests = useMemo(() => {
    const seen = new Set<string>();
    const combined = [...pendingRequests, ...approvedRequests, ...rejectedRequests];
    return combined.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  }, [pendingRequests, approvedRequests, rejectedRequests]);

  const requests = filter === 'all' ? allRequests : filter === 'approved' ? approvedRequests : filter === 'rejected' ? rejectedRequests : pendingRequests;
  const isLoading = filter === 'all'
    ? pendingQuery.isLoading || approvedQuery.isLoading || rejectedQuery.isLoading
    : filter === 'approved'
      ? approvedQuery.isLoading
      : filter === 'rejected'
        ? rejectedQuery.isLoading
        : pendingQuery.isLoading;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>{t('manager.teamRequests')}</Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>{t('manager.teamRequestsSubtitle')}</Typography>
      </Box>

      <FilterChips options={filters} selected={filter} onChange={setFilter} />

      {isLoading ? (
        <Box mt={2}><SkeletonLoader type="list" count={4} /></Box>
      ) : requests.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={1} mt={1.5}>
          {requests.map((req) => (
            <Box
              key={req.id}
              onClick={() => navigate(`/manager/requests/${req.id}`)}
              sx={{
                p: { xs: 1.5, sm: 2 }, borderRadius: 3, backgroundColor: 'background.paper',
                border: '1px solid', borderColor: 'divider', cursor: 'pointer',
                transition: 'all 0.2s', '&:hover': { borderColor: '#145DB8' },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5} gap={1}>
                <Box minWidth={0} flex={1}>
                  <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrencyByCode(req.amount, req.currency)}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '100%' }}>
                    {req.employeeName ?? req.employeeId} · {req.reason} · {formatDate(req.createdAt)}
                  </Typography>
                </Box>
                <Box flexShrink={0}>
                  <StatusBadge status={req.status} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box mt={3}>
          <EmptyState icon="📋" title={t('manager.noRequestsFound')}
            description={filter !== 'all' ? t('manager.noRequestsForFilter', { filter: filterLabel }) : t('manager.noRequestsAll')} />
        </Box>
      )}
    </Box>
  );
}
