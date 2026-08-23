import { useTranslation } from 'react-i18next';
import { SettingsPage } from '@/components/shared';

export default function ManagerSettings() {
  const { t } = useTranslation();
  return <SettingsPage title={t('manager.settings')} subtitle={t('manager.settingsSubtitle')} />;
}