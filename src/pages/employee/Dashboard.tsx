import { Box } from '@mui/material';
import { AccountBalanceWalletOutlined, Add, ReceiptLongOutlined, SpaceDashboardOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EmployeeSummaryCards } from '@/components/employee/EmployeeSummaryCards';
import { ExpenseTrendCard } from '@/components/employee/ExpenseTrendCard';
import { BudgetUsageCard } from '@/components/employee/BudgetUsageCard';
import { TopCategoryCard } from '@/components/employee/TopCategoryCard';
import { RecentExpensesCard } from '@/components/employee/RecentExpensesCard';
import { BudgetRequestsCard } from '@/components/employee/BudgetRequestsCard';
import { WalletCurrenciesCard } from '@/components/employee/WalletCurrenciesCard';
import { useEmployeeDashboard, useMyProfile } from '@/hooks/api';
import { DashboardHero } from '@/components/shared';
import { ROUTES } from '@/utils/constants';

export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: dashboard, isLoading: dashboardLoading } = useEmployeeDashboard();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHero
        badgeIcon={<SpaceDashboardOutlined />}
        badgeLabel={t('common.overview')}
        title={t('employee.dashboard')}
        subtitle={t('employee.dashboardSubtitle')}
        showGreeting
        actions={[
          {
            label: t('employee.newRequest'),
            icon: <Add />,
            onClick: () => navigate(ROUTES.EMPLOYEE_NEW_REQUEST),
          },
        ]}
        stats={[
          {
            label: t('employee.availableBalance'),
            sublabel: t('employee.availableBalanceHint'),
            icon: <AccountBalanceWalletOutlined />,
            value: profile?.WalletEGP ?? 0,
            isCurrency: true,
            loading: profileLoading,
          },
          {
            label: t('employee.spentThisMonthTitle'),
            sublabel: t('employee.spentThisMonthHint'),
            icon: <ReceiptLongOutlined />,
            value: dashboard?.TotalSpentEGP ?? 0,
            isCurrency: true,
            loading: dashboardLoading,
          },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: { xs: 1, sm: 1.5 },
          mb: 3,
        }}
      >
        <EmployeeSummaryCards />
      </Box>

      <Box sx={{ mb: 3 }}>
        <WalletCurrenciesCard />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <ExpenseTrendCard />
        <BudgetUsageCard />
        <TopCategoryCard />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.65fr) minmax(300px, 1fr)' },
          gap: { xs: 2, md: 2.5 },
          alignItems: 'stretch',
          mt: 3,
        }}
      >
        <RecentExpensesCard />
        <BudgetRequestsCard />
      </Box>
    </motion.div>
  );
}