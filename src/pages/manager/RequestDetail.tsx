import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useApproveRequest, useManagerApprovedRequests, useManagerPendingRequests, useManagerRejectedRequests, useRejectRequest } from '@/hooks/api';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { ConfirmationDialog, RejectRequestDialog, Toast } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { canApproveRequests, canRejectRequests } from '@/utils/permissions';
import { mapManagerRequestToRequest } from '@/utils/mappers';

const requestTypeLabels: Record<string, { label: string; emoji: string }> = {
  'cash-advance': { label: 'Cash Advance', emoji: '💵' },
  budget: { label: 'Budget Request', emoji: '📊' },
  purchase: { label: 'Purchase Request', emoji: '🛒' },
  travel: { label: 'Travel Request', emoji: '✈️' },
};

export default function ManagerRequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = useAuthStore((s) => s.role);
  const pendingQuery = useManagerPendingRequests();
  const approvedQuery = useManagerApprovedRequests();
  const rejectedQuery = useManagerRejectedRequests();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const request = [...(pendingQuery.data ?? []), ...(approvedQuery.data ?? []), ...(rejectedQuery.data ?? [])]
    .map(mapManagerRequestToRequest)
    .find((r) => r.id === id);

  if (!request) {
    return (
      <Box textAlign="center" py={8}>
        <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>Request not found</Typography>
        <Button onClick={() => navigate('/manager/requests')} sx={{ mt: 1, borderRadius: 2, fontSize: 13 }}>Back to requests</Button>
      </Box>
    );
  }

  const typeInfo = requestTypeLabels[request.requestType] ?? { label: request.reason, emoji: '📄' };

  const handleApprove = async () => {
    if (!canApproveRequests(role)) return;
    setApproveOpen(false);
    try {
      await approveMutation.mutateAsync(request.id);
      setToast({ open: true, message: 'Request approved!', severity: 'success' });
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setToast({ open: true, message: message || 'Failed to approve request.', severity: 'error' });
    }
  };

  const handleReject = async (reason: string) => {
    if (!canRejectRequests(role)) return;
    setRejectOpen(false);
    try {
      await rejectMutation.mutateAsync({ requestId: request.id, reason });
      setToast({ open: true, message: 'Request rejected.', severity: 'error' });
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setToast({ open: true, message: message || 'Failed to reject request.', severity: 'error' });
    }
  };

  const canAct = canApproveRequests(role);
  const isActionable = canAct && request.status === 'pending';

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.75} mb={2.5}>
        <Button onClick={() => navigate(-1)} sx={{ minWidth: 40, width: 40, height: 40, p: 0, flexShrink: 0, color: 'text.secondary' }}><ArrowBack sx={{ fontSize: 20 }} /></Button>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>Request Details</Typography>
      </Box>

      <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, p: 2.5, border: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ fontSize: 28 }}>{typeInfo.emoji}</Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>REQUEST TYPE</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{typeInfo.label}</Typography>
            </Box>
          </Box>
          <StatusBadge status={request.status} size="medium" />
        </Box>

        <Box mb={2.5}>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>EMPLOYEE</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary' }}>{request.employeeName ?? request.employeeId}</Typography>
        </Box>

        <Box mb={2.5}>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>AMOUNT REQUESTED</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary', mt: 0.2 }}>{formatCurrencyByCode(request.amount, request.currency)}</Typography>
        </Box>

        <Box mb={2.5}>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>CATEGORY</Typography>
          <Typography sx={{ mt: 0.25, fontSize: 15, color: 'text.primary' }}>{request.reason}</Typography>
        </Box>

        <Box display="flex" gap={3} flexWrap="wrap" mb={2.5}>
          <Box>
            <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>REQUESTED</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{formatDate(request.createdAt)}</Typography>
          </Box>
        </Box>

        {isActionable && (
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5}>
            <Button fullWidth variant="contained" color="success" startIcon={<CheckCircle sx={{ fontSize: 18 }} />} onClick={() => setApproveOpen(true)} sx={{ borderRadius: 2, py: 1, fontSize: 15 }}>
              Approve
            </Button>
            <Button fullWidth variant="outlined" color="error" startIcon={<Cancel sx={{ fontSize: 18 }} />} onClick={() => setRejectOpen(true)} sx={{ borderRadius: 2, py: 1, fontSize: 15 }}>
              Reject
            </Button>
          </Box>
        )}
      </Box>

      <ConfirmationDialog open={approveOpen} onClose={() => setApproveOpen(false)} onConfirm={handleApprove} title="Approve Request?" message={`This will approve the request for ${formatCurrencyByCode(request.amount, request.currency)}.`} confirmLabel="Approve" confirmColor="success" icon="✅" />
      <RejectRequestDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        employeeName={request.employeeName ?? request.employeeId}
        amount={formatCurrencyByCode(request.amount, request.currency)}
        submitting={rejectMutation.isPending}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
