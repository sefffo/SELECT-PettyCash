import { ProfilePage } from '@/components/shared';
import { useTranslation } from 'react-i18next';

export default function ManagerProfile() {
  const { t } = useTranslation();
  return (
    <ProfilePage
      title={t('manager.profile')}
      subtitle={t('manager.profileSubtitle')}
      roleLabel={t('role.manager')}
      accentColor="#145DB8"
      fallbackChar="M"
    />
  );
}
