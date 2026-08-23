import { Box, Typography, TextField, InputAdornment, MenuItem } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePendingRequests } from '@/hooks/api';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { EmptyState, SkeletonLoader } from '@/components/shared';
import { formatCurrency } from '@/utils/format';
import { mapPendingRequestToRequest, sortByDateDesc } from '@/utils/mappers';

export default function AdminRequests() {
  const { t } = useTranslation();
  const { data, isLoading } = usePendingRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const requests = sortByDateDesc((data ?? []).map(mapPendingRequestToRequest));
  const filtered = requests.filter((r) => {
    const matchesSearch = !search || (r.employeeName ?? r.employeeId).toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>{t('nav.requests')}</Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>All cash requests across the company</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search') + '...'} fullWidth size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.disabled', fontSize: 18 }} /></InputAdornment> } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small"
          sx={{ minWidth: { xs: '100%', sm: 160 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
          <MenuItem value="all">Status — All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <SkeletonLoader type="list" count={4} />
      ) : filtered.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={1}>
          {filtered.map((req) => (
            <Box key={req.id} sx={{ p: 2, borderRadius: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5} gap={1}>
                <Box minWidth={0}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrency(req.amount)}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {req.employeeName ?? req.employeeId} · {req.reason}
                  </Typography>
                </Box>
                <StatusBadge status={req.status} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box mt={3}>
          <EmptyState icon="📋" title={t('transaction.noTransactions')} description={t('transaction.noTransactionsHint')} />
        </Box>
      )}
    </Box>
  );
}
