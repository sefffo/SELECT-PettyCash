import { ProfilePage } from '@/components/shared';
import { useTranslation } from 'react-i18next';

export default function FinanceProfile() {
  const { t } = useTranslation();
  return (
    <ProfilePage
      title={t('finance.profile')}
      subtitle={t('finance.profileSubtitle')}
      roleLabel={t('role.finance')}
      fallbackChar="F"
    />
  );
}
