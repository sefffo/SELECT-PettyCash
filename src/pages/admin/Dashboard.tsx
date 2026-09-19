import { Box } from '@mui/material';
import { BusinessOutlined, PeopleAltOutlined, SpaceDashboardOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdminDashboard } from '@/hooks/api';
import { CompletedTransfersChartCard, DashboardHero, GlassStatCard, SkeletonLoader } from '@/components/shared';
import { AdminDashboardBalances } from '@/components/admin';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminDashboard();

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
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHero
        badgeIcon={<SpaceDashboardOutlined />}
        badgeLabel={t('common.overview')}
        title={t('admin.dashboard')}
        subtitle={t('admin.dashboardSubtitle')}
        showGreeting
        stats={stats.map((s) => ({
          label: s.label,
          sublabel: s.sublabel,
          icon: s.icon,
          value: s.value,
          isCurrency: false,
          loading: isLoading,
        }))}
      />

      {isLoading ? (
        <Box mb={3}>
          <SkeletonLoader type="dashboard" count={2} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr' }, gap: 1.5, mb: 3 }}>
          {stats.map((s, i) => (
            <GlassStatCard key={s.label} title={s.label} subtitle={s.sublabel} value={s.value} icon={s.icon} color={s.color} index={i} format={s.format} />
          ))}
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <AdminDashboardBalances />
      </Box>

      <Box sx={{ mb: 3 }}>
        <CompletedTransfersChartCard />
      </Box>
    </motion.div>
  );
}