import { CheckCircleOutlined, PendingActionsOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useEmployeeDashboard, useMyRequests } from '@/hooks/api';
import { GlassStatCard, SkeletonLoader } from '@/components/shared';

export function EmployeeSummaryCards() {
  const { t } = useTranslation();
  const theme = useTheme();
  const p = theme.palette;

  const { isLoading } = useEmployeeDashboard();
  const { data: requests } = useMyRequests();

  if (isLoading) return <SkeletonLoader type="dashboard" count={2} />;

  const isSettled = (status: string) => status === 'Approved' || status === 'Rejected' || status === 'Completed';
  const pendingCount = (requests ?? []).filter((r) => !isSettled(r.Status)).length;
  const approvedCount = (requests ?? []).filter((r) => r.Status === 'Approved').length;

  const cards = [
    {
      title: t('employee.pendingRequests'),
      subtitle: t('employee.awaitingReview'),
      value: pendingCount,
      icon: <PendingActionsOutlined />,
      color: p.info.main,
      format: 'count' as const,
    },
    {
      title: t('employee.approvedRequests'),
      subtitle: t('employee.fullyApproved'),
      value: approvedCount,
      icon: <CheckCircleOutlined />,
      color: p.success.main,
      format: 'count' as const,
    },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <GlassStatCard
          key={card.title}
          {...card}
          index={i}
          sx={{
            p: { xs: 1.25, sm: 1.75 },
            '& > div:nth-of-type(2)': { mb: 1 },
          }}
        />
      ))}
    </>
  );
}