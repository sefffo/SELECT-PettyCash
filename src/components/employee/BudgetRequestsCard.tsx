import { useMemo, type ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import { Add, Check, ChecklistOutlined, Close, PaymentOutlined, PersonOutline, ScheduleOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMyRequests } from '@/hooks/api';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { DashboardCardHeader, DashboardCardFooter, DashboardTimeline, DashboardTimelineCard, EmptyState, SkeletonLoader, type TimelineTone } from '@/components/shared';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { ROUTES } from '@/utils/constants';
import type { PendingRequestStatus } from '@/types/api';
import type { ExpenseStatus } from '@/types/vertex';

interface TimelineStepConfig {
  icon: ReactNode;
  tone: TimelineTone;
}

function timelineStepConfig(status: PendingRequestStatus | undefined): TimelineStepConfig {
  switch (status) {
    case 'Approved':
      return { icon: <Check fontSize="small" />, tone: 'success' };
    case 'Completed':
      return { icon: <PaymentOutlined fontSize="small" />, tone: 'info' };
    case 'Rejected':
      return { icon: <Close fontSize="small" />, tone: 'error' };
    case 'PendingFinance':
    case 'Pending Finance':
    case 'PendingApproval':
      return { icon: <PersonOutline fontSize="small" />, tone: 'info' };
    case 'Pending':
    case 'PendingManager':
      return { icon: <ScheduleOutlined fontSize="small" />, tone: 'warning' };
    default:
      return { icon: <ScheduleOutlined fontSize="small" />, tone: 'warning' };
  }
}

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

  const requests = useMemo(
    () =>
      [...(data ?? [])]
        .sort((a, b) => new Date(b.SubmittedAt ?? '').getTime() - new Date(a.SubmittedAt ?? '').getTime())
        .slice(0, 5),
    [data],
  );

  const totalRequests = (data ?? []).length;
  const hasRequests = !isLoading && !isError && requests.length > 0;

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2.5 }, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            onClick={() => navigate(ROUTES.EMPLOYEE_NEW_REQUEST)}
            sx={{ borderRadius: 2, py: 0.35, px: 1.15, fontSize: 12.5 }}
          >
            {t('employee.newRequest')}
          </Button>
        }
      />

      {isLoading ? (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <SkeletonLoader type="list" count={5} />
        </Box>
      ) : isError ? (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState icon="⚠️" title={t('employee.loadFailed')} description={t('employee.loadFailedHint')} />
        </Box>
      ) : requests.length === 0 ? (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState icon="📋" title={t('employee.noBudgetRequests')} description={t('employee.noBudgetRequestsHint')} />
        </Box>
      ) : (
        <DashboardTimeline>
          {requests.map((request) => {
            const config = timelineStepConfig(request.Status);
            const description = request.Description ?? '';
            return (
              <DashboardTimelineCard
                key={request.RequestId}
                icon={config.icon}
                tone={config.tone}
                title={description || '—'}
                badge={<StatusBadge status={statusBadgeValue(request.Status)} />}
                dateText={t('employee.requestedOn', { date: formatDate(request.SubmittedAt) })}
                amountText={formatCurrencyByCode(request.Amount, request.Currency)}
                onClick={() => navigate(ROUTES.EMPLOYEE_REQUEST_DETAIL.replace(':id', request.RequestId))}
                ariaLabel={t('employee.openRequestDetails', { title: description || request.RequestId })}
              />
            );
          })}
        </DashboardTimeline>
      )}

      {hasRequests && (
        <DashboardCardFooter
          meta={t('employee.budgetRequestsTotal', { count: totalRequests })}
          onViewAll={() => navigate(ROUTES.EMPLOYEE_REQUESTS)}
          viewAllLabel={t('employee.viewAll')}
        />
      )}
    </Box>
  );
}