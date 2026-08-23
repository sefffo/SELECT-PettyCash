import { useMemo } from 'react';
import { ProfilePage } from '@/components/shared';
import { useTranslation } from 'react-i18next';
import { useAdminProfile, useDepartments, useUsers } from '@/hooks/api';
import { useAuthStore } from '@/store/authStore';
import { mapApiUserToEmployee } from '@/utils/mappers';

export default function AdminProfile() {
  const { t } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const { data: profile } = useAdminProfile(currentUser?.id ?? null);
  const { data: users = [] } = useUsers();
  const { data: departments = [] } = useDepartments();

  const department = useMemo(() => {
    if (!currentUser?.id) return null;
    const own = users.find((u) => String(u.Id) === currentUser.id);
    if (!own) return null;
    const mapped = mapApiUserToEmployee(own, departments);
    return mapped.department === '—' ? null : mapped.department;
  }, [users, departments, currentUser]);

  return (
    <ProfilePage
      title={t('admin.profile')}
      subtitle={t('admin.profileSubtitle')}
      roleLabel={t('role.admin')}
      accentColor="#145DB8"
      fallbackChar="A"
      profile={profile ? { name: profile.Name, email: profile.Email } : null}
      department={department}
    />
  );
}