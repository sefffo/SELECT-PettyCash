import { useState, useEffect } from 'react';
import { Box, Drawer, useTheme } from '@mui/material';
import { DashboardOutlined, ReceiptLongOutlined, PeopleOutlined, PersonOutlined, NotificationsOutlined, SettingsOutlined } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar, AppHeader } from '@/components/shared';
import type { AppSidebarNavItem } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useManagerPendingRequests } from '@/hooks/api';
import { useUnreadNotifications } from '@/hooks/unreadNotifications';
import { ROUTES, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/utils/constants';

export function ManagerLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const validateSession = useAuthStore((s) => s.validateSession);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { data: pendingRequests } = useManagerPendingRequests();
  const unreadCount = useUnreadNotifications();

  const pendingCount = pendingRequests?.length ?? 0;
  const pendingBadge = pendingCount > 0 ? (pendingCount > 99 ? '99+' : pendingCount) : undefined;
  const unreadBadge = unreadCount === 0 ? undefined : unreadCount > 99 ? '99+' : unreadCount;

  const navItems: AppSidebarNavItem[] = [
    { label: 'nav.dashboard', icon: <DashboardOutlined />, path: ROUTES.MANAGER_DASHBOARD },
    { label: 'nav.requests', icon: <ReceiptLongOutlined />, path: ROUTES.MANAGER_REQUESTS, badge: pendingBadge },
    { label: 'nav.employees', icon: <PeopleOutlined />, path: ROUTES.MANAGER_EMPLOYEES },
    { label: 'nav.profile', icon: <PersonOutlined />, path: ROUTES.MANAGER_PROFILE },
    { label: 'nav.notifications', icon: <NotificationsOutlined />, path: ROUTES.MANAGER_NOTIFICATIONS, badge: unreadBadge },
    { label: 'nav.settings', icon: <SettingsOutlined />, path: ROUTES.MANAGER_SETTINGS },
  ];

  useEffect(() => {
    if (!validateSession()) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [validateSession, navigate]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppHeader panelLabel="nav.managerPanel" onMenuClick={() => setDrawerOpen(true)} showNotifications />

      <Box display="flex" flex={1}>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AppSidebar navItems={navItems} panelLabel="nav.managerPanel" />
        </Box>

        <Drawer
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ display: { md: 'none' } }}
          slotProps={{
            paper: { sx: { border: 'none', backgroundColor: 'background.paper', width: { xs: '100%', sm: 360 } } },
          }}
        >
          <AppSidebar
            navItems={navItems}
            panelLabel="nav.managerPanel"
            variant="mobile"
            onClose={() => setDrawerOpen(false)}
          />
        </Drawer>

        <Box component="main" flex={1} sx={{ backgroundColor: 'background.default', minHeight: '100vh', marginInlineStart: { xs: 0, md: sidebarOpen ? `${SIDEBAR_WIDTH}px` : `${SIDEBAR_COLLAPSED_WIDTH}px` }, transition: 'margin-inline-start 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <Box sx={{ flex: 1, px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2.5 } }}>
            <Box maxWidth={1200} mx="auto">
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}