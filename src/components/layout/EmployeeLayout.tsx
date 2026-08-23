import { useState, useEffect, useMemo } from 'react';
import { Box, Drawer, useTheme } from '@mui/material';
import { DashboardOutlined, ReceiptLongOutlined, AccountBalanceWalletOutlined, PersonOutlined, NotificationsOutlined, SettingsOutlined } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar, AppHeader } from '@/components/shared';
import type { AppSidebarNavItem } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useUnreadNotifications } from '@/hooks/unreadNotifications';
import { useMyRequests } from '@/hooks/api';
import { ROUTES, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/utils/constants';

export function EmployeeLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const validateSession = useAuthStore((s) => s.validateSession);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const unreadCount = useUnreadNotifications();
  const { data: myRequests } = useMyRequests();

  const pendingCount = useMemo(
    () => (myRequests ?? []).filter((r) => r.Status !== 'Approved' && r.Status !== 'Rejected').length,
    [myRequests],
  );
  const pendingBadge = pendingCount > 0 ? (pendingCount > 99 ? '99+' : pendingCount) : undefined;

  const navItems: AppSidebarNavItem[] = [
    { label: 'nav.dashboard', icon: <DashboardOutlined />, path: ROUTES.EMPLOYEE_DASHBOARD },
    { label: 'nav.requests', icon: <ReceiptLongOutlined />, path: ROUTES.EMPLOYEE_REQUESTS, badge: pendingBadge },
    { label: 'nav.expenses', icon: <AccountBalanceWalletOutlined />, path: ROUTES.EMPLOYEE_EXPENSES },
    { label: 'nav.profile', icon: <PersonOutlined />, path: ROUTES.EMPLOYEE_PROFILE },
    {
      label: 'nav.notifications',
      icon: <NotificationsOutlined />,
      path: ROUTES.EMPLOYEE_NOTIFICATIONS,
      badge: unreadCount === 0 ? undefined : unreadCount > 99 ? '99+' : unreadCount,
    },
    { label: 'nav.settings', icon: <SettingsOutlined />, path: ROUTES.EMPLOYEE_SETTINGS },
  ];

  useEffect(() => {
    if (!validateSession()) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [validateSession, navigate]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppHeader panelLabel="nav.employeePanel" onMenuClick={() => setDrawerOpen(true)} showNotifications />

      <Box display="flex" flex={1}>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AppSidebar
            navItems={navItems}
            panelLabel="nav.employeePanel"
          />
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
            panelLabel="nav.employeePanel"
            variant="mobile"
            onClose={() => setDrawerOpen(false)}
          />
        </Drawer>

        <Box component="main" flex={1} sx={{ backgroundColor: 'background.default', minWidth: 0, minHeight: '100vh', marginInlineStart: { xs: 0, md: sidebarOpen ? `${SIDEBAR_WIDTH}px` : `${SIDEBAR_COLLAPSED_WIDTH}px` }, transition: 'margin-inline-start 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <Box sx={{ flex: 1, minWidth: 0, px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2.5 } }}>
            <Box maxWidth={1200} mx="auto" sx={{ width: '100%', minWidth: 0 }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}