import { useMemo, useState } from 'react';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApproveRequest, useManagerApprovedRequests, useManagerNameMap, useManagerPendingRequests, useManagerRejectedRequests, useRejectRequest } from '@/hooks/api';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { FilterChips } from '@/components/feature/FilterChips';
import { EmptyState, RejectRequestDialog, SkeletonLoader, Toast } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { canApproveRequests, canRejectRequests } from '@/utils/permissions';
import { mapManagerRequestToRequest, resolveRequestEmployeeNames, sortByDateDesc } from '@/utils/mappers';
import type { Request } from '@/types/vertex';

export default function ManagerRequests() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const nameMap = useManagerNameMap();
  const pendingQuery = useManagerPendingRequests();
  const approvedQuery = useManagerApprovedRequests();
  const rejectedQuery = useManagerRejectedRequests();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();
  const [filter, setFilter] = useState('pending');
  const [rejectTarget, setRejectTarget] = useState<Request | null>(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleApprove = (id: string) => {
    if (!canApproveRequests(role)) return;
    approveMutation.mutate(id, {
      onSuccess: () => setToast({ open: true, message: 'Request approved!', severity: 'success' }),
      onError: (err) => {
        const message = (err as { message?: string } | null)?.message;
        setToast({ open: true, message: message || 'Failed to approve request.', severity: 'error' });
      },
    });
  };

  const handleOpenReject = (id: string) => {
    setRejectTarget(requests.find((r) => r.id === id) ?? null);
  };

  const handleRejectRequest = (reason: string) => {
    if (!canRejectRequests(role) || !rejectTarget) return;
    rejectMutation.mutate(
      { requestId: rejectTarget.id, reason },
      {
        onError: (err) => {
          const message = (err as { message?: string } | null)?.message;
          setToast({ open: true, message: message || 'Failed to reject request.', severity: 'error' });
        },
        onSettled: () => setRejectTarget(null),
      },
    );
  };

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
    () => sortByDateDesc(resolveRequestEmployeeNames((pendingQuery.data ?? []).map(mapManagerRequestToRequest), nameMap)),
    [pendingQuery.data, nameMap],
  );
  const approvedRequests = useMemo(
    () => sortByDateDesc(resolveRequestEmployeeNames((approvedQuery.data ?? []).map(mapManagerRequestToRequest), nameMap)),
    [approvedQuery.data, nameMap],
  );
  const rejectedRequests = useMemo(
    () => sortByDateDesc(resolveRequestEmployeeNames((rejectedQuery.data ?? []).map(mapManagerRequestToRequest), nameMap)),
    [rejectedQuery.data, nameMap],
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
        <Box display="flex" flexDirection="column" gap={0.75} mt={1.5}>
          {requests.map((req) => (
              <Box key={req.id} onClick={() => navigate(`/manager/requests/${req.id}`)}
                sx={(theme) => ({
                  position: 'relative',
                  p: { xs: 1.25, sm: 1.5 },
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0px 2px 8px rgba(0, 0, 0, 0.25)'
                    : '0px 2px 8px rgba(15, 30, 54, 0.05)',
                  transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0px 10px 24px rgba(0, 0, 0, 0.35)'
                      : '0px 10px 24px rgba(15, 30, 54, 0.12)',
                  },
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0px 0px 0px 3px rgba(56, 189, 248, 0.25)'
                      : '0px 0px 0px 3px rgba(20, 93, 184, 0.15)',
                  },
                  '& .MuiChip-root': {
                    fontWeight: 700,
                    outline: '1px solid currentColor',
                    outlineOffset: '-1px',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0px 1px 2px rgba(0, 0, 0, 0.35)'
                      : '0px 1px 2px rgba(15, 30, 54, 0.08)',
                  },
                })}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                  <Avatar sx={{
                    width: 32, height: 32, borderRadius: 1.75,
                    fontSize: 11.5, fontWeight: 700, letterSpacing: '-0.01em',
                    backgroundColor: 'rgba(20, 93, 184, 0.12)', color: 'primary.main',
                    boxShadow: 'inset 0 0 0 1px rgba(20, 93, 184, 0.18)', flexShrink: 0,
                  }}>
                    {(req.employeeName?.split(' ').map((n) => n[0] ?? '').join('').slice(0, 2) || '—').toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.employeeName || '—'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box minWidth={0} flex={1}>
                    <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrencyByCode(req.amount, req.currency)}</Typography>
                    <Typography sx={{ fontSize: 12.5, lineHeight: 1.4, color: 'text.secondary', mt: 0.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '100%' }}>
                      {req.reason}
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.01em', color: 'text.disabled', mt: 0.25 }}>
                      {formatDate(req.createdAt)}
                    </Typography>
                  </Box>
                  <Box flexShrink={0} pl={0.25}>
                    <StatusBadge status={req.status} />
                  </Box>
                </Box>
                {canApproveRequests(role) && req.status === 'pending' && (
                  <>
                    <Box sx={{ height: '1px', backgroundColor: 'divider', my: 1 }} />
                    <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()} flexWrap="wrap" justifyContent="flex-end">
                      <Button size="small" aria-label={t('manager.approve')} startIcon={<Check sx={{ fontSize: 15 }} />} onClick={() => handleApprove(req.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        sx={{
                          flex: { xs: 1, sm: 'none' },
                          borderRadius: 1.75, px: 1.25, py: 0.4, fontSize: 12, fontWeight: 700,
                          textTransform: 'none', minWidth: 0, whiteSpace: 'nowrap',
                          color: '#16A34A', backgroundColor: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.28)',
                          boxShadow: '0px 1px 2px rgba(22, 163, 74, 0.12)',
                          transition: 'all 0.2s ease',
                          '&:hover': { backgroundColor: '#16A34A', color: '#fff', borderColor: '#16A34A', boxShadow: '0px 4px 12px rgba(22, 163, 74, 0.28)' },
                        }}>
                        {t('manager.approve')}
                      </Button>
                      <Button size="small" aria-label={t('manager.reject')} startIcon={<Close sx={{ fontSize: 15 }} />} onClick={() => handleOpenReject(req.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        sx={{
                          flex: { xs: 1, sm: 'none' },
                          borderRadius: 1.75, px: 1.25, py: 0.4, fontSize: 12, fontWeight: 700,
                          textTransform: 'none', minWidth: 0, whiteSpace: 'nowrap',
                          color: '#DC2626', backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.28)',
                          boxShadow: '0px 1px 2px rgba(220, 38, 38, 0.12)',
                          transition: 'all 0.2s ease',
                          '&:hover': { backgroundColor: '#DC2626', color: '#fff', borderColor: '#DC2626', boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.28)' },
                        }}>
                        {t('manager.reject')}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
          ))}
        </Box>
      ) : (
        <Box mt={3}>
          <EmptyState icon="📋" title={t('manager.noRequestsFound')}
            description={filter !== 'all' ? t('manager.noRequestsForFilter', { filter: filterLabel }) : t('manager.noRequestsAll')} />
        </Box>
      )}

      <RejectRequestDialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectRequest}
        employeeName={rejectTarget?.employeeName || undefined}
        amount={rejectTarget ? formatCurrencyByCode(rejectTarget.amount, rejectTarget.currency) : undefined}
        submitting={rejectMutation.isPending}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
