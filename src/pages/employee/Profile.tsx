import { Box, Typography, Divider, Fab } from '@mui/material';
import { AdminPanelSettingsOutlined, SupervisorAccountOutlined, ChevronRight, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { ProfilePage } from '@/components/shared';

export default function EmployeeProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <ProfilePage
      title={t('employee.profile')}
      subtitle={t('employee.profileSubtitle')}
      roleLabel={user?.role ?? t('role.employee')}
      accentColor="#145DB8"
      fallbackChar="E"
    >
      {(user?.userRole === 'manager' || user?.userRole === 'admin') && (
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {user.userRole === 'manager' && (
            <>
              <MenuItemRow icon={<SupervisorAccountOutlined />} label={t('nav.managerPanel')} onClick={() => navigate('/manager/dashboard')} />
              <Divider />
            </>
          )}
          {user.userRole === 'admin' && (
            <MenuItemRow icon={<AdminPanelSettingsOutlined />} label={t('nav.adminPanel')} onClick={() => navigate('/admin/dashboard')} />
          )}
        </Box>
      )}
      <Fab color="primary" size="small" onClick={() => navigate('/employee/requests/new')}
        sx={{ position: 'fixed', bottom: { xs: 80, md: 24 }, right: 24, backgroundColor: '#145DB8', '&:hover': { backgroundColor: '#1E7AE6' } }}>
        <Add />
      </Fab>
    </ProfilePage>
  );
}

function MenuItemRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        minHeight: 48,
        cursor: 'pointer',
        transition: 'background 0.2s',
        '&:hover': { backgroundColor: 'action.hover' },
        color: 'text.primary',
        '& .MuiSvgIcon-root': { fontSize: 20 },
      }}
    >
      <Box display="flex" alignItems="center" gap={2} minWidth={0}>
        {icon}
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{label}</Typography>
      </Box>
      <ChevronRight sx={{ fontSize: 18, color: 'text.disabled' }} />
    </Box>
  );
}
