import { useState } from 'react';
import { Box } from '@mui/material';
import { AccountBalanceWalletOutlined, Add, ReceiptLongOutlined, SpaceDashboardOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EmployeeSummaryCards } from '@/components/employee/EmployeeSummaryCards';
import { AddExpenseDialog } from '@/components/employee/AddExpenseDialog';
import { NewCashRequestDialog } from '@/components/employee/NewCashRequestDialog';
import { ExpenseTrendCard } from '@/components/employee/ExpenseTrendCard';
import { TopCategoryCard } from '@/components/employee/TopCategoryCard';
import { RecentExpensesCard } from '@/components/employee/RecentExpensesCard';
import { BudgetRequestsCard } from '@/components/employee/BudgetRequestsCard';
import { WalletCurrenciesCard } from '@/components/employee/WalletCurrenciesCard';
import { CurrencyToggle } from '@/components/feature';
import { useEmployeeDashboard, useMyProfile } from '@/hooks/api';
import { DashboardHero } from '@/components/shared';

export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [currency, setCurrency] = useState('EGP');
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
            onClick: () => setNewRequestOpen(true),
          },
          {
            label: t('employee.newExpense'),
            icon: <Add />,
            onClick: () => setAddExpenseOpen(true),
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: { xs: 1, sm: 1.5 },
          mb: 3,
        }}
      >
        <EmployeeSummaryCards />
      </Box>

      <AddExpenseDialog open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
      <NewCashRequestDialog open={newRequestOpen} onClose={() => setNewRequestOpen(false)} />

      <Box sx={{ mb: 3 }}>
        <WalletCurrenciesCard />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <ExpenseTrendCard currency={currency} />
        <TopCategoryCard currency={currency} />
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