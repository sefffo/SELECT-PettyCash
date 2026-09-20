import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Add, ChecklistOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMyRequests } from '@/hooks/api';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import {
  DashboardCardHeader,
  DashboardCardFooter,
  DashboardTimeline,
  DashboardTimelineCard,
  EmptyState,
  SkeletonLoader,
} from '@/components/shared';
import { getStatusColor, getStatusLabelKey } from '@/components/feature/StatusBadge';
import { NewCashRequestDialog } from '@/components/employee/NewCashRequestDialog';
import { RequestDetailsDialog } from '@/components/employee/RequestDetailsDialog';
import { ROUTES } from '@/utils/constants';
import type { PendingRequestStatus } from '@/types/api';
import type { ExpenseStatus } from '@/types/vertex';

function statusBadgeValue(status: PendingRequestStatus | undefined): ExpenseStatus {
  switch (status) {
    case 'Approved':
      return 'approved';
    case 'Completed':
      return 'completed';
    case 'Rejected':
      return 'rejected';
    case 'PendingFinance':
    case 'Pending Finance':
      return 'pending-finance';
    case 'PendingApproval':
      return 'pending-approval';
    case 'PendingManager':
      return 'pending-manager';
    default:
      return 'pending';
  }
}

export function BudgetRequestsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMyRequests();
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const requests = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => new Date(b.SubmittedAt ?? '').getTime() - new Date(a.SubmittedAt ?? '').getTime(),
      ),
    [data],
  );

  const totalRequests = (data ?? []).length;
  const previewRequests = requests.slice(0, 6);
  const hasRequests = !isLoading && !isError && requests.length > 0;

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 1.5, sm: 2.5 },
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
      }}
    >
      <DashboardCardHeader
        icon={<ChecklistOutlined />}
        color="#7C3AED"
        title={t('employee.budgetRequests')}
        subtitle={t('employee.budgetRequestsHint')}
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Add sx={{ fontSize: 15 }} />}
            onClick={() => setNewRequestOpen(true)}
            sx={{ borderRadius: 2, py: 0.35, px: 1.15, fontSize: 12.5 }}
          >
            {t('employee.newRequest')}
          </Button>
        }
      />

      {isLoading ? (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <SkeletonLoader type="list" count={6} />
        </Box>
      ) : isError ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyState
            icon="⚠️"
            title={t('employee.loadFailed')}
            description={t('employee.loadFailedHint')}
          />
        </Box>
      ) : requests.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyState
            icon="📋"
            title={t('employee.noBudgetRequests')}
            description={t('employee.noBudgetRequestsHint')}
          />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DashboardTimeline>
            {previewRequests.map((request) => {
              const description = request.Description ?? '';
              const status = statusBadgeValue(request.Status);
              const statusLabelKey = getStatusLabelKey(status);
              return (
                <DashboardTimelineCard
                  key={request.RequestId}
                  title={description || '—'}
                  statusLabel={statusLabelKey ? t(statusLabelKey) : undefined}
                  statusColor={getStatusColor(status)}
                  dateText={t('employee.requestedOn', { date: formatDate(request.SubmittedAt) })}
                  amountText={formatCurrencyByCode(request.Amount, request.Currency)}
                  onClick={() => setDetailsId(request.RequestId)}
                  ariaLabel={t('employee.openRequestDetails', { title: description })}
                />
              );
            })}
          </DashboardTimeline>
        </Box>
      )}

      {hasRequests && (
        <DashboardCardFooter
          meta={t('employee.budgetRequestsTotal', { count: totalRequests })}
          onViewAll={() => navigate(ROUTES.EMPLOYEE_REQUESTS)}
          viewAllLabel={t('employee.viewAll')}
        />
      )}

      <NewCashRequestDialog open={newRequestOpen} onClose={() => setNewRequestOpen(false)} />
      <RequestDetailsDialog requestId={detailsId} onClose={() => setDetailsId(null)} />
    </Box>
  );
}
