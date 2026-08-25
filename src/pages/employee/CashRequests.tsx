import { Box, Typography, Fab, Button, Chip } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEmployeeAllRequests } from '@/hooks/api';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { EmptyState, SkeletonLoader } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { mapEmployeeAllRequestToRequest, sortByDateDesc } from '@/utils/mappers';

const REQUEST_TYPE_LABELS: Record<string, string> = {
  'cash-advance': 'Advance',
  'budget': 'Budget',
  'purchase': 'Purchase',
  'travel': 'Travel',
};

export default function EmployeeCashRequests() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: requestsData, isLoading: requestsLoading } = useEmployeeAllRequests();

  const requests = sortByDateDesc((requestsData ?? []).map(mapEmployeeAllRequestToRequest));

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>{t('employee.myRequests')}</Typography>
      </Box>

      {requestsLoading ? (
        <Box mt={1}><SkeletonLoader type="list" count={4} /></Box>
      ) : requests.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={1}>
          {requests.map((req) => (
            <Box
              key={req.id}
              onClick={() => navigate(`/employee/requests/${req.id}`)}
              sx={{
                p: { xs: 1.5, sm: 2 }, borderRadius: 3, backgroundColor: 'background.paper',
                border: '1px solid', borderColor: 'divider', cursor: 'pointer',
                transition: 'all 0.2s', '&:hover': { borderColor: '#145DB8' },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5} gap={1}>
                <Box minWidth={0} flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.25}>
                    <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 700, color: 'text.primary' }}>
                      {formatCurrencyByCode(req.amount, req.currency)}
                    </Typography>
                    {req.requestType && (
                      <Chip
                        label={REQUEST_TYPE_LABELS[req.requestType] ?? req.requestType}
                        size="small"
                        sx={{ fontSize: 11, height: 20, backgroundColor: 'action.hover', color: 'text.secondary' }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '100%' }}>
                    {req.reason} · {formatDate(req.createdAt)}
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
        <Box mt={2}>
          <EmptyState icon="📋" title="No requests yet" description="Create your first cash request to get started."
            action={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employee/requests/new')}>New Request</Button>} />
        </Box>
      )}

      <Fab color="primary" size="small" onClick={() => navigate('/employee/requests/new')}
        sx={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#145DB8', '&:hover': { backgroundColor: '#1E7AE6' } }}>
        <Add />
      </Fab>
    </Box>
  );
}
