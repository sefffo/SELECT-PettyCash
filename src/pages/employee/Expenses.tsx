import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useExpenses } from '@/hooks/api';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { EmptyState, SkeletonLoader } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { mapExpenseStatus } from '@/utils/mappers';
import type { EmployeeExpenseItem } from '@/types/api';

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

export default function EmployeeExpenses() {
  const { t } = useTranslation();
  const { data, isLoading } = useExpenses();

  const expenses = sortByExpenseDateDesc(data ?? []);

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>{t('employee.myExpenses')}</Typography>
      </Box>

      {isLoading ? (
        <Box mt={1}><SkeletonLoader type="list" count={4} /></Box>
      ) : expenses.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={1}>
          {expenses.map((expense) => (
            <Box
              key={expense.ExpenseId}
              sx={{
                p: { xs: 1.5, sm: 2 }, borderRadius: 3, backgroundColor: 'background.paper',
                border: '1px solid', borderColor: 'divider',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5} gap={1}>
                <Box minWidth={0} flex={1}>
                  <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatCurrencyByCode(expense.Amount, expense.Currency)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '100%' }}>
                    {expense.Reason || '—'} · {formatDate(expense.DateSubmitted ?? null)}
                  </Typography>
                </Box>
                <Box flexShrink={0}>
                  <StatusBadge status={mapExpenseStatus(expense.Status)} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box mt={2}>
          <EmptyState icon="🧾" title={t('employee.noExpenses')} description={t('employee.noExpensesHint')} />
        </Box>
      )}
    </Box>
  );
}
