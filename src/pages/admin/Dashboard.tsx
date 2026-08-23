import { Box } from '@mui/material';
import {
  BusinessOutlined,
  FactCheckOutlined,
  PeopleAltOutlined,
  ReceiptLongOutlined,
  SpaceDashboardOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard, usePendingRequests } from '@/hooks/api';
import { DashboardHero, GlassStatCard, SkeletonLoader } from '@/components/shared';
import { AdminPendingChart } from '@/components/admin/AdminPendingChart';
import { mapPendingRequestToRequest } from '@/utils/mappers';
import { ROUTES } from '@/utils/constants';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useAdminDashboard();
  const { data: pendingData, isLoading: pendingLoading } = usePendingRequests();

  const stats = [
    {
      value: data?.TotalUsers ?? 0,
      label: t('admin.totalEmployees'),
      sublabel: t('admin.activeEmployees', { count: data?.TotalUsers ?? 0 }),
      icon: <PeopleAltOutlined />,
      color: '#145DB8',
      format: 'count' as const,
    },
    {
      value: data?.TotalDepartments ?? 0,
      label: t('admin.departments'),
      sublabel: t('admin.departmentsHint'),
      icon: <BusinessOutlined />,
      color: '#7C3AED',
      format: 'count' as const,
    },
    {
      value: data?.TotalCompanyPendingAmount ?? 0,
      label: t('admin.companyPending'),
      sublabel: t('admin.companyPendingHint'),
      icon: <ReceiptLongOutlined />,
      color: '#22C55E',
      format: 'currency' as const,
    },
  ];

  const requests = (pendingData ?? []).map(mapPendingRequestToRequest);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHero
        badgeIcon={<SpaceDashboardOutlined />}
        badgeLabel={t('common.overview')}
        title={t('admin.dashboard')}
        subtitle={t('admin.dashboardSubtitle')}
        showGreeting
        actions={[
          {
            label: t('admin.reviewRequests'),
            icon: <FactCheckOutlined />,
            onClick: () => navigate(ROUTES.ADMIN_REQUESTS),
          },
        ]}
        stats={stats.map((s) => ({
          label: s.label,
          sublabel: s.sublabel,
          icon: s.icon,
          value: s.value,
          isCurrency: s.format === 'currency',
          loading: isLoading,
        }))}
      />

      {isLoading ? (
        <Box mb={3}>
          <SkeletonLoader type="dashboard" count={3} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 1.5, mb: 3 }}>
          {stats.map((s, i) => (
            <GlassStatCard key={s.label} title={s.label} subtitle={s.sublabel} value={s.value} icon={s.icon} color={s.color} index={i} format={s.format} />
          ))}
        </Box>
      )}

      <AdminPendingChart requests={requests} loading={pendingLoading} />
    </motion.div>
  );
}