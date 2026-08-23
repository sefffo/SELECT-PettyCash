import { useState } from 'react';
import { Avatar, Box, Button, Divider, IconButton, Menu, MenuItem, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ExpandMore, Logout, Menu as MenuIcon, PersonOutline, SettingsOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useLogout';
import { NotificationsMenu } from './NotificationsMenu';
import { ThemeToggle } from './ThemeToggle';
import { APP_HEADER_HEIGHT, APP_HEADER_HEIGHT_MOBILE, ROUTES } from '@/utils/constants';
import type { UserRole } from '@/types/vertex';

interface AppHeaderProps {
  panelLabel: string;
  onMenuClick: () => void;
  showNotifications?: boolean;
}

const PROFILE_ROUTES: Record<UserRole, string> = {
  employee: ROUTES.EMPLOYEE_PROFILE,
  manager: ROUTES.MANAGER_PROFILE,
  admin: ROUTES.ADMIN_PROFILE,
  finance: ROUTES.FINANCE_PROFILE,
};

const SETTINGS_ROUTES: Record<UserRole, string> = {
  employee: ROUTES.EMPLOYEE_SETTINGS,
  manager: ROUTES.MANAGER_SETTINGS,
  admin: ROUTES.ADMIN_SETTINGS,
  finance: ROUTES.FINANCE_SETTINGS,
};

export function AppHeader({ panelLabel, onMenuClick, showNotifications = false }: AppHeaderProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const handleLogout = useLogout();
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

  const userMenuOpen = Boolean(userMenuAnchor);
  const profilePath = role ? PROFILE_ROUTES[role] : ROUTES.EMPLOYEE_PROFILE;
  const settingsPath = role ? SETTINGS_ROUTES[role] : ROUTES.EMPLOYEE_SETTINGS;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(event.currentTarget);
  const handleCloseUserMenu = () => setUserMenuAnchor(null);
  const goTo = (path: string) => {
    handleCloseUserMenu();
    navigate(path);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: { xs: 1, sm: 1.5 },
        py: 0.75,
        pt: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        backgroundColor: theme.palette.glass,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        minHeight: { xs: APP_HEADER_HEIGHT_MOBILE, md: APP_HEADER_HEIGHT },
      }}
    >
      <Box display="flex" alignItems="center" gap={0.5} minWidth={0}>
        <IconButton
          onClick={onMenuClick}
          aria-label="Open menu"
          sx={{
            display: { md: 'none' },
            width: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            flexShrink: 0,
          }}
        >
          <MenuIcon sx={{ fontSize: 22 }} />
        </IconButton>
        <Box minWidth={0}>
          <Typography
            noWrap
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: 'text.primary',
              borderInlineStart: '3px solid',
              borderColor: 'primary.main',
              pl: 1,
              lineHeight: 1.3,
            }}
          >
            {t(panelLabel)}
          </Typography>
          {role && (
            <Typography
              noWrap
              sx={{
                fontSize: 11,
                color: 'text.secondary',
                fontWeight: 500,
                pl: 1,
                lineHeight: 1.3,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {t(`role.${role}`)}
            </Typography>
          )}
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={{ xs: 0.25, sm: 0.75 }} flexShrink={0}>
        <ThemeToggle sx={{ width: { xs: 40, sm: 44 }, height: { xs: 40, sm: 44 }, borderRadius: 1.5 }} />

        {showNotifications && <NotificationsMenu />}

        <Button
          onClick={handleOpenUserMenu}
          aria-label={user?.name ?? t('nav.profile')}
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 0.75,
            height: { xs: 40, sm: 44 },
            borderRadius: 1.5,
            minWidth: 0,
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            {user?.name?.charAt(0) ?? 'E'}
          </Avatar>
          <Box
            component="span"
            sx={{ display: { xs: 'none', md: 'inline-block' }, textAlign: 'start', lineHeight: 1.2 }}
          >
            <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary', maxWidth: 120 }}>
              {user?.name ?? t('nav.profile')}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary', maxWidth: 120 }}>
              {role ? t(`role.${role}`) : ''}
            </Typography>
          </Box>
          <ExpandMore sx={{ fontSize: 18, color: 'text.secondary', display: { xs: 'none', md: 'block' } }} />
        </Button>

        <Menu
          anchorEl={userMenuAnchor}
          open={userMenuOpen}
          onClose={handleCloseUserMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                mt: 0.75,
                minWidth: 200,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: theme.shadows[5],
                p: 0.5,
              },
            },
          }}
        >
          <MenuItem onClick={() => goTo(profilePath)} sx={{ gap: 1.5, py: 1, borderRadius: 1.5, fontSize: 13.5, fontWeight: 500 }}>
            <PersonOutline sx={{ fontSize: 18, color: 'text.secondary' }} />
            {t('nav.profile')}
          </MenuItem>
          <MenuItem onClick={() => goTo(settingsPath)} sx={{ gap: 1.5, py: 1, borderRadius: 1.5, fontSize: 13.5, fontWeight: 500 }}>
            <SettingsOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            {t('nav.settings')}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              handleCloseUserMenu();
              handleLogout();
            }}
            sx={{ gap: 1.5, py: 1, borderRadius: 1.5, fontSize: 13.5, fontWeight: 500, color: 'error.main' }}
          >
            <Logout sx={{ fontSize: 18 }} />
            {t('nav.logout')}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}