import { PeopleOutlined, HourglassEmptyOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GlassStatCard, SkeletonLoader } from '@/components/shared';

interface ManagerStatCardsProps {
  teamCount: number;
  pendingRequests: number;
  loading?: boolean;
}

export function ManagerStatCards({
  teamCount, pendingRequests, loading,
}: ManagerStatCardsProps) {
  const { t } = useTranslation();

  if (loading) return <SkeletonLoader type="dashboard" count={2} />;

  return <>
    <GlassStatCard
      title={t('manager.teamMembers')}
      subtitle={t('manager.underSupervision')}
      value={teamCount}
      icon={<PeopleOutlined />}
      color="#145DB8"
      index={0}
    />
    <GlassStatCard
      title={t('manager.pendingRequests')}
      subtitle={t('manager.awaitingReview')}
      value={pendingRequests}
      icon={<HourglassEmptyOutlined />}
      color="#F59E0B"
      index={1}
    />
  </>;
}