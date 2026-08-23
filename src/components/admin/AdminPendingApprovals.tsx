import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SectionHeader, EmptyState, PendingApprovalItem, SkeletonLoader } from '@/components/shared';
import type { Request } from '@/types/vertex';

interface AdminPendingApprovalsProps {
  requests: Request[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function AdminPendingApprovals({ requests, loading, onApprove, onReject }: AdminPendingApprovalsProps) {
  const { t } = useTranslation();
  if (loading) return <SkeletonLoader type="list" count={3} />;

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5, minWidth: 0 }}>
      <SectionHeader title={t('admin.pendingApprovalsSection')} subtitle={t('admin.requestsNeedReview', { count: pending.length })} viewAllLink="/admin/requests" />
      {pending.length === 0 ? (
        <EmptyState icon="✅" title={t('admin.allCaughtUp')} description={t('admin.noPendingRequests')} />
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {pending.slice(0, 5).map((req, i) => (
            <PendingApprovalItem key={req.id} id={req.id} employeeName={req.employeeName ?? req.employeeId}
              amount={req.amount} reason={req.reason} createdAt={req.createdAt} status={req.status}
              onApprove={onApprove} onReject={onReject} index={i} />
          ))}
        </Box>
      )}
    </Box>
  );
}
