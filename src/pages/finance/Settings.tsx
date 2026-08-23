import { useTranslation } from 'react-i18next';
import { SettingsPage } from '@/components/shared';

export default function FinanceSettings() {
  const { t } = useTranslation();
  return <SettingsPage title={t('finance.settings')} subtitle={t('finance.settingsSubtitle')} />;
}