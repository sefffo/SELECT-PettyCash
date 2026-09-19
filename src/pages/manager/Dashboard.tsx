import { Box } from '@mui/material';
import { FactCheckOutlined, HourglassEmptyOutlined, PeopleOutlined, SpaceDashboardOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ManagerStatCards,
  ManagerPendingApprovals,
  ManagerExpenseOverviewCard,
} from '@/components/manager';
import { useApproveRequest, useManagerNameMap, useManagerPendingRequests, useMyProfile, useRejectRequest, useUsers } from '@/hooks/api';
import { mapManagerRequestToRequest, resolveRequestEmployeeNames, sortByDateDesc } from '@/utils/mappers';
import { CompletedTransfersChartCard, DashboardHero, RejectRequestDialog } from '@/components/shared';
import { CurrencyToggle } from '@/components/feature';
import { ROUTES } from '@/utils/constants';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Request } from '@/types/vertex';
import { formatCurrencyByCode } from '@/utils/format';

export default function ManagerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: myProfile } = useMyProfile();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const nameMap = useManagerNameMap();
  const { data: pendingData, isLoading: pendingLoading } = useManagerPendingRequests();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();
  const [rejectTarget, setRejectTarget] = useState<Request | null>(null);
  const [currency, setCurrency] = useState('EGP');

  const requests = sortByDateDesc(resolveRequestEmployeeNames((pendingData ?? []).map(mapManagerRequestToRequest), nameMap));
  const loading = pendingLoading || usersLoading;

  const managerDepartment = (myProfile?.DepartmentId ?? '').trim().toLowerCase();
  const teamCount = users.filter(
    (u) => u.Role === 'Employee' && (u.DepartmentId ?? '').trim().toLowerCase() === managerDepartment,
  ).length;

  const handleApproveRequest = (id: string) => {
    approveMutation.mutate(id, {
      onError: (err) => {
        const message = (err as { message?: string } | null)?.message;
        window.alert(`Failed to approve: ${message ?? 'Unknown error'}`);
      },
    });
  };
  const handleOpenReject = (id: string) => {
    const target = requests.find((r) => r.id === id) ?? null;
    setRejectTarget(target);
  };
  const handleRejectRequest = (reason: string) => {
    if (!rejectTarget) return;
    rejectMutation.mutate({ requestId: rejectTarget.id, reason }, {
      onError: (err) => {
        const message = (err as { message?: string } | null)?.message;
        window.alert(`Failed to reject: ${message ?? 'Unknown error'}`);
      },
      onSettled: () => setRejectTarget(null),
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHero
        badgeIcon={<SpaceDashboardOutlined />}
        badgeLabel={t('common.overview')}
        title={t('manager.dashboard')}
        subtitle={t('manager.dashboardSubtitle')}
        showGreeting
        actions={[
          {
            label: t('manager.reviewRequests'),
            icon: <FactCheckOutlined />,
            onClick: () => navigate(ROUTES.MANAGER_REQUESTS),
          },
        ]}
        stats={[
          {
            label: t('manager.teamMembers'),
            sublabel: t('manager.underSupervision'),
            icon: <PeopleOutlined />,
            value: teamCount,
            loading,
          },
          {
            label: t('manager.pendingRequests'),
            sublabel: t('manager.awaitingReview'),
            icon: <HourglassEmptyOutlined />,
            value: requests.length,
            loading,
          },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 3 }}>
        <ManagerStatCards
          teamCount={teamCount}
          pendingRequests={requests.length}
          loading={loading}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1.5 }}>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          alignItems: 'stretch',
          mb: 3,
        }}
      >
        <ManagerExpenseOverviewCard currency={currency} />
        <CompletedTransfersChartCard currency={currency} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <ManagerPendingApprovals
          requests={requests}
          loading={loading}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleOpenReject}
        />
      </Box>

      <RejectRequestDialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectRequest}
        employeeName={rejectTarget?.employeeName || undefined}
        amount={rejectTarget ? formatCurrencyByCode(rejectTarget.amount, rejectTarget.currency) : undefined}
        submitting={rejectMutation.isPending}
      />
    </motion.div>
  );
}