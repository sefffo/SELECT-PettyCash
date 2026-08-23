import { useTranslation } from 'react-i18next';
import { SettingsPage } from '@/components/shared';

export default function AdminSettings() {
  const { t } = useTranslation();
  return <SettingsPage title={t('admin.settings')} subtitle={t('admin.settingsSubtitle')} />;
}