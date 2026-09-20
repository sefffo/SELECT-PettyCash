import { useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { Add, ErrorOutline, ReceiptLongOutlined, Replay } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '@/hooks/api';
import type { EmployeeExpenseItem } from '@/types/api';
import { getStatusColor, getStatusLabelKey } from '@/components/feature/StatusBadge';
import {
  DashboardCardHeader,
  DashboardCardFooter,
  DashboardTimeline,
  DashboardTimelineCard,
  SkeletonLoader,
} from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { mapExpenseStatus } from '@/utils/mappers';
import { ROUTES } from '@/utils/constants';
import { AddExpenseDialog } from './AddExpenseDialog';
import { ExpenseDetailsDialog } from './ExpenseDetailsDialog';

function sortByExpenseDateDesc(items: EmployeeExpenseItem[]): EmployeeExpenseItem[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.DateSubmitted ?? '').getTime();
    const timeB = new Date(b.DateSubmitted ?? '').getTime();
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) return timeB - timeA;
    if (!Number.isNaN(timeA)) return -1;
    if (!Number.isNaN(timeB)) return 1;
    return 0;
  });
}

export function RecentExpensesCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [detailsExpense, setDetailsExpense] = useState<EmployeeExpenseItem | null>(null);
  const { data, isLoading, isError, refetch } = useExpenses();

  const expenses = sortByExpenseDateDesc(data ?? []);
  const previewExpenses = expenses.slice(0, 6);

  const hasData = !isLoading && !isError && expenses.length > 0;

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 1.5, sm: 2.5 },
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
      }}
    >
      <DashboardCardHeader
        icon={<ReceiptLongOutlined />}
        color="#0E7490"
        title={t('employee.recentExpenses')}
        subtitle={t('employee.recentExpensesHint')}
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={() => setAddExpenseOpen(true)}
            sx={{ borderRadius: 2, flexShrink: 0, py: 0.4, px: 1.25, fontSize: 13 }}
          >
            {t('employee.addExpense')}
          </Button>
        }
      />

      {isLoading && (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <SkeletonLoader type="list" count={6} />
        </Box>
      )}

      {!isLoading && isError && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              py: { xs: 1.5, sm: 2 },
              px: 2,
              maxWidth: '100%',
            }}
          >
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ErrorOutline sx={{ fontSize: { xs: 20, sm: 22 }, color: 'error.main' }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: 13.5, sm: 14 },
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.25,
              }}
            >
              {t('employee.expensesLoadFailed')}
            </Typography>
            <Typography
              sx={{ fontSize: { xs: 12, sm: 12.5 }, color: 'text.secondary', maxWidth: 320 }}
            >
              {t('employee.expensesLoadFailedHint')}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Replay sx={{ fontSize: 16 }} />}
              onClick={() => refetch()}
              sx={{
                borderRadius: 2,
                mt: 1.5,
                px: 1.5,
                fontSize: 13,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('employee.retry')}
            </Button>
          </Box>
        </Box>
      )}

      {!isLoading && !isError && expenses.length === 0 && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              py: { xs: 1.5, sm: 2 },
              px: 2,
              maxWidth: '100%',
            }}
          >
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ReceiptLongOutlined sx={{ fontSize: { xs: 20, sm: 22 }, color: 'text.secondary' }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: 13.5, sm: 14 },
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.25,
              }}
            >
              {t('employee.noExpenses')}
            </Typography>
            <Typography
              sx={{ fontSize: { xs: 12, sm: 12.5 }, color: 'text.secondary', maxWidth: 320 }}
            >
              {t('employee.noExpensesHint')}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={() => setAddExpenseOpen(true)}
              sx={{
                borderRadius: 2,
                mt: 1.5,
                px: 1.5,
                fontSize: 13,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('employee.addExpense')}
            </Button>
          </Box>
        </Box>
      )}

      {hasData && (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DashboardTimeline>
            {previewExpenses.map((expense) => {
              const label = expense.Reason || '—';
              const status = mapExpenseStatus(expense.Status);
              const statusLabelKey =
                status === 'pending-manager' ? 'request.status.pending' : getStatusLabelKey(status);
              return (
                <DashboardTimelineCard
                  key={expense.ExpenseId}
                  title={label}
                  statusLabel={statusLabelKey ? t(statusLabelKey) : undefined}
                  statusColor={getStatusColor(status)}
                  dateText={formatDate(expense.DateSubmitted ?? null)}
                  amountText={formatCurrencyByCode(expense.Amount, expense.Currency ?? 'EGP')}
                  onClick={() => setDetailsExpense(expense)}
                  ariaLabel={t('employee.expenseDetails')}
                />
              );
            })}
          </DashboardTimeline>
        </Box>
      )}

      {hasData && (
        <DashboardCardFooter
          onViewAll={() => navigate(ROUTES.EMPLOYEE_EXPENSES)}
          viewAllLabel={t('employee.viewAll')}
        />
      )}

      <AddExpenseDialog open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
      <ExpenseDetailsDialog expense={detailsExpense} onClose={() => setDetailsExpense(null)} />
    </Box>
  );
}
