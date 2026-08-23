import { useMemo, useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper,
  TableSortLabel, useTheme, useMediaQuery, Button, MenuItem, Avatar, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ReceiptLongOutlined, Search, CheckCircleOutline, TrendingUpOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceTransactions } from '@/hooks/api';
import { FilterChips } from '@/components/feature/FilterChips';
import { EmptyState, SkeletonLoader, AnimatedNumber } from '@/components/shared';
import { FinanceStatusChip } from '@/components/finance/FinanceStatusChip';
import { avatarColor, initialsOf, currencyFlag } from '@/utils/avatar';
import type { FinanceTransactionItem } from '@/types/api';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { isFinanceVisibleTransactionStatus, FINANCE_TRANSACTION_STATUSES } from '@/types/finance';

type StatusFilter = 'all' | string;
type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

const rowsPerPageOptions = [5, 10, 25];

const sortOptions: { value: `${SortKey}-${SortDir}`; labelKey: string }[] = [
  { value: 'date-desc', labelKey: 'finance.sortDateDesc' },
  { value: 'date-asc', labelKey: 'finance.sortDateAsc' },
  { value: 'amount-desc', labelKey: 'finance.sortAmountDesc' },
  { value: 'amount-asc', labelKey: 'finance.sortAmountAsc' },
];

const STATUS_FILTERS: { value: string; labelKey: string }[] = [
  { value: FINANCE_TRANSACTION_STATUSES.Approved, labelKey: 'finance.statusPending' },
  { value: FINANCE_TRANSACTION_STATUSES.Completed, labelKey: 'finance.statusCompleted' },
];

export default function FinanceTransactions() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data, isLoading } = useFinanceTransactions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]!);

  const transactions: FinanceTransactionItem[] = useMemo(
    () => (data ?? []).filter((tx) => isFinanceVisibleTransactionStatus(tx.Status)),
    [data],
  );

  const stats = useMemo(() => {
    const completed = transactions.filter((tx) => tx.Status === FINANCE_TRANSACTION_STATUSES.Completed).length;
    const total = transactions.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = transactions.filter((tx) => {
      if (statusFilter !== 'all' && tx.Status !== statusFilter) return false;
      if (!q) return true;
      return (
        (tx.TransactionType ?? '').toLowerCase().includes(q) ||
        (tx.Employee ?? '').toLowerCase().includes(q) ||
        (tx.Currency ?? '').toLowerCase().includes(q) ||
        (tx.Status ?? '').toLowerCase().includes(q) ||
        (tx.TransactionNumber ?? '').toLowerCase().includes(q)
      );
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const diff = sortKey === 'amount'
        ? Number(a.Amount ?? 0) - Number(b.Amount ?? 0)
        : new Date(a.Date).getTime() - new Date(b.Date).getTime();
      return diff * dir;
    });
    return rows;
  }, [transactions, search, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const handleSortSelect = (value: string) => {
    const [key, dir] = value.split('-') as [SortKey, SortDir];
    setSortKey(key);
    setSortDir(dir);
    setPage(0);
  };

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Hero banner */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          mb: 2.5,
          color: '#fff',
          background: 'linear-gradient(135deg, #0D4A92 0%, #145DB8 45%, #1D6FD6 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, insetInlineEnd: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -100, insetInlineStart: '30%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
          <Box minWidth={0}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                mb: 1.25,
                backgroundColor: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <ReceiptLongOutlined sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('finance.transactions')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
              {t('finance.transactionHistory')}
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, color: 'rgba(255,255,255,0.82)', maxWidth: 520 }}>
              {t('finance.transactionsSubtitle')}
            </Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ position: 'relative' }}>
            <Box sx={{ minWidth: { xs: 110, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroTotalTransactions')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {isLoading ? '—' : <AnimatedNumber value={stats.total} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <ReceiptLongOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.totalLabel')}</Typography>
              </Box>
            </Box>
            <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ minWidth: { xs: 110, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroCompleted')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {isLoading ? '—' : <AnimatedNumber value={stats.completed} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <CheckCircleOutline sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.statusCompleted')}</Typography>
              </Box>
            </Box>
            <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ minWidth: { xs: 110, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroSuccessRate')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {isLoading ? '—' : <AnimatedNumber value={stats.rate} formatFn={(n) => `${Math.round(n)}%`} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <TrendingUpOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.paymentSuccessRateHint')}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0.35), transparent 60%)' }} />
      </Box>

      {/* Toolbar */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        sx={{
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          mb: 1.5,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5} mb={1.5}>
          <TextField
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={t('common.search') + '...'}
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.disabled', fontSize: 18 }} /></InputAdornment>,
              },
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            size="small"
            value={`${sortKey}-${sortDir}`}
            onChange={(e) => handleSortSelect(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
          <FilterChips
            options={[
              { value: 'all', label: t('finance.filterAll') },
              ...STATUS_FILTERS.map((s) => ({ value: s.value, label: t(s.labelKey) })),
            ]}
            selected={statusFilter}
            onChange={(value) => { setStatusFilter(value as StatusFilter); setPage(0); }}
          />
          {!isLoading && (
            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
              {t('finance.resultsCount', { shown: paged.length, total: filtered.length })}
            </Typography>
          )}
        </Box>
      </Box>

      {isLoading ? (
        <SkeletonLoader type="list" count={5} />
      ) : filtered.length === 0 ? (
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <EmptyState icon="🔍" title={t('finance.noTransactions')} description={t('finance.noTransactionsHint')} />
        </Box>
      ) : isDesktop ? (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: alpha(theme.palette.surfaceLight, 0.5) } }}>
                  <TableCell>{t('finance.employeeName')}</TableCell>
                  <TableCell>{t('finance.transactionType')}</TableCell>
                  <TableCell>{t('finance.currency')}</TableCell>
                  <TableCell sortDirection={sortKey === 'amount' ? sortDir : false}>
                    <TableSortLabel active={sortKey === 'amount'} direction={sortKey === 'amount' ? sortDir : 'asc'} onClick={() => handleSort('amount')}>
                      {t('finance.requestedAmount')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('finance.status')}</TableCell>
                  <TableCell>{t('finance.source')}</TableCell>
                  <TableCell sortDirection={sortKey === 'date' ? sortDir : false}>
                    <TableSortLabel active={sortKey === 'date'} direction={sortKey === 'date' ? sortDir : 'asc'} onClick={() => handleSort('date')}>
                      {t('finance.date')}
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((tx) => {
                  const color = avatarColor(tx.Employee);
                  return (
                    <TableRow key={tx.TransactionNumber} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(color, 0.9), fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initialsOf(tx.Employee)}
                          </Avatar>
                          <Box minWidth={0}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                              {tx.Employee}
                            </Typography>
                            <Typography sx={{ fontSize: 10.5, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                              #{tx.TransactionNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{tx.TransactionType}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.9, py: 0.4, borderRadius: 1.5, backgroundColor: alpha(theme.palette.surfaceLight, 0.8), border: '1px solid', borderColor: 'divider' }}>
                          <Typography sx={{ fontSize: 11 }}>{currencyFlag(tx.Currency)}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>{tx.Currency}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrencyByCode(tx.Amount, tx.Currency)}
                        </Typography>
                      </TableCell>
                      <TableCell><FinanceStatusChip status={tx.Status} /></TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{tx.Source}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formatDate(tx.Date)} arrow>
                          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{formatDate(tx.Date)}</Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage={t('finance.rowsPerPage')}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <AnimatePresence initial={false}>
            {paged.map((tx) => {
              const color = avatarColor(tx.Employee);
              return (
                <motion.div
                  key={tx.TransactionNumber}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ p: 1.5, borderRadius: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={0.75}>
                      <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(color, 0.9), fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {initialsOf(tx.Employee)}
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
                            {formatCurrencyByCode(tx.Amount, tx.Currency)}
                          </Typography>
                          <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>{tx.Employee}</Typography>
                        </Box>
                      </Box>
                      <FinanceStatusChip status={tx.Status} />
                    </Box>
                    <Typography noWrap sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600, mb: 0.25 }}>{tx.TransactionType}</Typography>
                    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.7, py: 0.25, borderRadius: 1.5, backgroundColor: alpha(theme.palette.surfaceLight, 0.8), border: '1px solid', borderColor: 'divider' }}>
                        <Typography sx={{ fontSize: 10.5 }}>{currencyFlag(tx.Currency)}</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary' }}>{tx.Currency}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                        {formatDate(tx.Date)} · {tx.Source}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length > rowsPerPage && (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mt={0.5}>
              <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage(0)} sx={{ borderRadius: 2, px: 1.25, fontSize: 13 }}>
                «
              </Button>
              <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))} sx={{ borderRadius: 2, px: 1.25, fontSize: 13 }}>
                ‹
              </Button>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {page + 1} / {pageCount}
              </Typography>
              <Button variant="outlined" size="small" disabled={page >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, page + 1))} sx={{ borderRadius: 2, px: 1.25, fontSize: 13 }}>
                ›
              </Button>
              <Button variant="outlined" size="small" disabled={page >= pageCount - 1} onClick={() => setPage(pageCount - 1)} sx={{ borderRadius: 2, px: 1.25, fontSize: 13 }}>
                »
              </Button>
            </Box>
          )}
        </Box>
      )}
    </motion.div>
  );
}