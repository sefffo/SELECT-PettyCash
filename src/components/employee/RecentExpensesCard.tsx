import { useState, type ReactNode } from 'react';
import { Box, Button, TablePagination, Typography, useTheme } from '@mui/material';
import { Add, Check, Close, ErrorOutline, PaymentOutlined, PersonOutline, ReceiptLongOutlined, Replay, ScheduleOutlined } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '@/hooks/api';
import type { EmployeeExpenseItem } from '@/types/api';
import type { ExpenseStatus } from '@/types/vertex';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { DashboardCardHeader, DashboardCardFooter, DashboardTimeline, DashboardTimelineCard, SkeletonLoader, type TimelineTone } from '@/components/shared';
import { formatCurrency, formatDate } from '@/utils/format';
import { mapExpenseStatus } from '@/utils/mappers';
import { ROUTES } from '@/utils/constants';
import { AddExpenseDialog } from './AddExpenseDialog';

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24];

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function expenseDateOf(item: EmployeeExpenseItem): string {
  return item.ExpenseDate ?? item.Date ?? item.DateRequested ?? item.SubmittedAt ?? '';
}

function expenseLabelOf(item: EmployeeExpenseItem): string {
  return item.Description ?? item.Title ?? item.Name ?? item.Reason ?? '—';
}

function expenseAmountOf(item: EmployeeExpenseItem): number | null {
  return toFiniteNumber(item.Amount);
}

function sortByExpenseDateDesc(items: EmployeeExpenseItem[]): EmployeeExpenseItem[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(expenseDateOf(a)).getTime();
    const timeB = new Date(expenseDateOf(b)).getTime();
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) return timeB - timeA;
    if (!Number.isNaN(timeA)) return -1;
    if (!Number.isNaN(timeB)) return 1;
    return 0;
  });
}

function expenseTimelineConfig(status: ExpenseStatus): { icon: ReactNode; tone: TimelineTone } {
  switch (status) {
    case 'approved':
      return { icon: <Check fontSize="small" />, tone: 'success' };
    case 'completed':
    case 'reimbursed':
      return { icon: <PaymentOutlined fontSize="small" />, tone: 'info' };
    case 'rejected':
      return { icon: <Close fontSize="small" />, tone: 'error' };
    case 'pending-finance':
    case 'pending-approval':
      return { icon: <PersonOutline fontSize="small" />, tone: 'info' };
    case 'pending-manager':
    case 'pending':
      return { icon: <ScheduleOutlined fontSize="small" />, tone: 'warning' };
    default:
      return { icon: <ScheduleOutlined fontSize="small" />, tone: 'warning' };
  }
}

export function RecentExpensesCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]!);
  const { data, isLoading, isError, refetch } = useExpenses();

  const expenses = sortByExpenseDateDesc(data ?? []);
  const pageCount = Math.max(1, Math.ceil(expenses.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedExpenses = expenses.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  const hasData = !isLoading && !isError && expenses.length > 0;

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2.5 }, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: 2, maxWidth: '100%' }}>
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
            <Typography sx={{ fontSize: { xs: 13.5, sm: 14 }, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
              {t('employee.expensesLoadFailed')}
            </Typography>
            <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: 'text.secondary', maxWidth: 320 }}>
              {t('employee.expensesLoadFailedHint')}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Replay sx={{ fontSize: 16 }} />}
              onClick={() => refetch()}
              sx={{ borderRadius: 2, mt: 1.5, px: 1.5, fontSize: 13, textTransform: 'none', fontWeight: 600 }}
            >
              {t('employee.retry')}
            </Button>
          </Box>
        </Box>
      )}

      {!isLoading && !isError && expenses.length === 0 && (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: 2, maxWidth: '100%' }}>
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
            <Typography sx={{ fontSize: { xs: 13.5, sm: 14 }, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
              {t('employee.noExpenses')}
            </Typography>
            <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: 'text.secondary', maxWidth: 320 }}>
              {t('employee.noExpensesHint')}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={() => setAddExpenseOpen(true)}
              sx={{ borderRadius: 2, mt: 1.5, px: 1.5, fontSize: 13, textTransform: 'none', fontWeight: 600 }}
            >
              {t('employee.addExpense')}
            </Button>
          </Box>
        </Box>
      )}

      {hasData && (
        <DashboardTimeline>
          {pagedExpenses.map((expense, index) => {
            const amount = expenseAmountOf(expense);
            const label = expenseLabelOf(expense);
            const category = expense.Category ?? '';
            const status = mapExpenseStatus(expense.Status);
            const config = expenseTimelineConfig(status);
            return (
              <DashboardTimelineCard
                key={expense.Id ?? expense.ExpenseId ?? `expense-${index}`}
                icon={config.icon}
                tone={config.tone}
                title={label}
                subtitle={category || undefined}
                badge={<StatusBadge status={status} />}
                dateText={formatDate(expenseDateOf(expense) || null)}
                amountText={amount !== null ? formatCurrency(amount) : '—'}
              />
            );
          })}
        </DashboardTimeline>
      )}

      {hasData && (
        <DashboardCardFooter onViewAll={() => navigate(ROUTES.EMPLOYEE_EXPENSES)} viewAllLabel={t('employee.viewAll')}>
          <TablePagination
            component="div"
            count={expenses.length}
            page={currentPage}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage={t('employee.rowsPerPage')}
            sx={{
              flex: 1,
              minWidth: 0,
              '& .MuiTablePagination-toolbar': { minHeight: 40, px: { xs: 0, sm: 1 }, flexWrap: 'wrap', justifyContent: 'flex-end', rowGap: 0.5 },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: 12,
                color: 'text.secondary',
              },
              '& .MuiTablePagination-input': { fontSize: 12 },
            }}
          />
        </DashboardCardFooter>
      )}

      <AddExpenseDialog open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
    </Box>
  );
}