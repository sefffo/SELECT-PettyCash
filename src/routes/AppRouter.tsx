import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { EmployeeLayout } from '@/components/layout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { FinanceLayout } from '@/components/finance';
import { ProtectedRoute } from '@/components/auth';
import { LoadingSpinner } from '@/components/shared';
import { ROUTES } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';

/* ── Employee Pages ── */
const EmployeeDashboard = lazy(() => import('@/pages/employee/Dashboard'));
const EmployeeCashRequests = lazy(() => import('@/pages/employee/CashRequests'));
const EmployeeExpenses = lazy(() => import('@/pages/employee/Expenses'));
const EmployeeNewCashRequest = lazy(() => import('@/pages/employee/NewCashRequest'));
const EmployeeRequestDetail = lazy(() => import('@/pages/employee/RequestDetail'));
const EmployeeProfile = lazy(() => import('@/pages/employee/Profile'));
const EmployeeNotifications = lazy(() => import('@/pages/employee/Notifications'));
const EmployeeSettings = lazy(() => import('@/pages/employee/Settings'));

/* ── Manager Pages ── */
const ManagerDashboard = lazy(() => import('@/pages/manager/Dashboard'));
const ManagerEmployees = lazy(() => import('@/pages/manager/Employees'));
const ManagerRequests = lazy(() => import('@/pages/manager/Requests'));
const ManagerRequestDetail = lazy(() => import('@/pages/manager/RequestDetail'));
const ManagerProfile = lazy(() => import('@/pages/manager/Profile'));
const ManagerNotifications = lazy(() => import('@/pages/manager/Notifications'));
const ManagerSettings = lazy(() => import('@/pages/manager/Settings'));

/* ── Admin Pages ── */
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminRequests = lazy(() => import('@/pages/admin/Requests'));
const AdminEmployees = lazy(() => import('@/pages/admin/Employees'));
const AdminProfile = lazy(() => import('@/pages/admin/Profile'));
const AdminNotifications = lazy(() => import('@/pages/admin/Notifications'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

/* ── Finance Pages ── */
const FinanceDashboard = lazy(() => import('@/pages/finance/Dashboard'));
const FinanceTransactions = lazy(() => import('@/pages/finance/Transactions'));
const FinanceBalances = lazy(() => import('@/pages/finance/Balances'));
const FinanceEmployeeHistory = lazy(() => import('@/pages/finance/EmployeeHistory'));
const FinanceNotifications = lazy(() => import('@/pages/finance/Notifications'));
const FinanceSettings = lazy(() => import('@/pages/finance/Settings'));
const FinanceProfile = lazy(() => import('@/pages/finance/Profile'));

/* ── Shared Pages ── */
const Login = lazy(() => import('@/pages/Login'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

function LoginRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const getDashboardPath = useAuthStore((s) => s.getDashboardPath);
  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />;
  return <>{children}</>;
}

export function AppRouter() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);

  const getHomeRedirect = () => {
    if (!isAuthenticated) return ROUTES.LOGIN;
    switch (role) {
      case 'admin': return ROUTES.ADMIN_DASHBOARD;
      case 'manager': return ROUTES.MANAGER_DASHBOARD;
      case 'finance': return ROUTES.FINANCE_DASHBOARD;
      default: return ROUTES.EMPLOYEE_DASHBOARD;
    }
  };
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* ── Root redirects ── */}
          <Route path={ROUTES.HOME} element={<Navigate to={getHomeRedirect()} replace />} />
          <Route path={ROUTES.LOGIN} element={<LoginRoute><Login /></LoginRoute>} />
          <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

          {/* ── Employee routes (inside EmployeeLayout with sidebar) ── */}
          <Route
            path={ROUTES.EMPLOYEE}
            element={
              <ProtectedRoute allowedRoles={['employee', 'finance']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="requests" element={<EmployeeCashRequests />} />
            <Route path="expenses" element={<EmployeeExpenses />} />
            <Route path="requests/new" element={<EmployeeNewCashRequest />} />
            <Route path="requests/:id" element={<EmployeeRequestDetail />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="notifications" element={<EmployeeNotifications />} />
            <Route path="settings" element={<EmployeeSettings />} />
          </Route>

          {/* ── Manager routes (inside ManagerLayout) ── */}
          <Route
            path={ROUTES.MANAGER}
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.MANAGER_DASHBOARD} replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="employees" element={<ManagerEmployees />} />
            <Route path="requests" element={<ManagerRequests />} />
            <Route path="requests/:id" element={<ManagerRequestDetail />} />
            <Route path="profile" element={<ManagerProfile />} />
            <Route path="notifications" element={<ManagerNotifications />} />
            <Route path="settings" element={<ManagerSettings />} />
          </Route>

          {/* ── Admin routes (inside AdminLayout) ── */}
          <Route
            path={ROUTES.ADMIN}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ── Finance routes (inside FinanceLayout) ── */}
          <Route
            path={ROUTES.FINANCE}
            element={
              <ProtectedRoute allowedRoles={['finance']}>
                <FinanceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FinanceDashboard />} />
            <Route path="transactions" element={<FinanceTransactions />} />
            <Route path="balances" element={<FinanceBalances />} />
            <Route path="employee-history" element={<FinanceEmployeeHistory />} />
            <Route path="notifications" element={<FinanceNotifications />} />
            <Route path="settings" element={<FinanceSettings />} />
            <Route path="profile" element={<FinanceProfile />} />
          </Route>

          {/* ── 404 ── */}
          <Route path={ROUTES.NOT_FOUND} element={<Navigate to={getHomeRedirect()} replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}