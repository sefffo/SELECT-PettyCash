import { useState, useEffect, useMemo } from 'react';
import { Box, Drawer, useTheme } from '@mui/material';
import { DashboardOutlined, ReceiptLongOutlined, AccountBalanceWalletOutlined, History, NotificationsOutlined, SettingsOutlined, PersonOutline } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar, AppHeader } from '@/components/shared';
import type { AppSidebarNavItem } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useFinanceAllRequests } from '@/hooks/api';
import { useUnreadNotifications } from '@/hooks/unreadNotifications';
import { isFinancePendingPaymentStatus } from '@/types/finance';
import { ROUTES, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/utils/constants';

const FINANCE_ACCENT = '#145DB8';

export function FinanceLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const validateSession = useAuthStore((s) => s.validateSession);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const { data: requests } = useFinanceAllRequests();
  const unreadCount = useUnreadNotifications();

  const financeQueueCount = useMemo(
    () => (requests ?? []).filter((r) => isFinancePendingPaymentStatus(r.Status)).length,
    [requests],
  );
  const queueBadge = financeQueueCount > 0 ? (financeQueueCount > 99 ? '99+' : financeQueueCount) : undefined;
  const unreadBadge = unreadCount === 0 ? undefined : unreadCount > 99 ? '99+' : unreadCount;

  const navItems: AppSidebarNavItem[] = [
    { label: 'finance.nav.overview', icon: <DashboardOutlined />, path: ROUTES.FINANCE_DASHBOARD },
    { label: 'finance.nav.transactions', icon: <ReceiptLongOutlined />, path: ROUTES.FINANCE_TRANSACTIONS },
    { label: 'finance.nav.balances', icon: <AccountBalanceWalletOutlined />, path: ROUTES.FINANCE_BALANCES, badge: queueBadge },
    { label: 'finance.nav.employeeHistory', icon: <History />, path: ROUTES.FINANCE_EMPLOYEE_HISTORY },
    { label: 'finance.nav.notifications', icon: <NotificationsOutlined />, path: ROUTES.FINANCE_NOTIFICATIONS, badge: unreadBadge },
    { label: 'finance.nav.settings', icon: <SettingsOutlined />, path: ROUTES.FINANCE_SETTINGS },
    { label: 'finance.nav.profile', icon: <PersonOutline />, path: ROUTES.FINANCE_PROFILE },
  ];

  useEffect(() => {
    if (!validateSession()) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [validateSession, navigate]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppHeader panelLabel="finance.financePanel" onMenuClick={() => setDrawerOpen(true)} />

      <Box display="flex" flex={1}>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AppSidebar navItems={navItems} panelLabel="finance.financePanel" accent={FINANCE_ACCENT} matchExactPaths={[ROUTES.FINANCE_DASHBOARD]} />
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
            panelLabel="finance.financePanel"
            accent={FINANCE_ACCENT}
            matchExactPaths={[ROUTES.FINANCE_DASHBOARD]}
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