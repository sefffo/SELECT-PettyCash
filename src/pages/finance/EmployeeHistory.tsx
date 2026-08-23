import { useMemo, useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper,
  TableSortLabel, useTheme, useMediaQuery, Button, MenuItem, Avatar, Tooltip, Chip,
  Autocomplete, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  History, Search, CheckCircleOutline, HourglassEmptyOutlined, ReceiptLongOutlined,
  ErrorOutlineOutlined, Refresh, AccountBalanceWalletOutlined, PersonSearchOutlined,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceEmployeeBalances, useFinanceEmployeeHistory, useRequesterNames } from '@/hooks/api';
import { FilterChips } from '@/components/feature/FilterChips';
import { EmptyState, SkeletonLoader, AnimatedNumber } from '@/components/shared';
import { FinanceStatusChip } from '@/components/finance/FinanceStatusChip';
import { avatarColor, initialsOf, currencyFlag } from '@/utils/avatar';
import type { FinanceEmployeeBalance, FinanceTransactionItem } from '@/types/api';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { isFinanceVisibleTransactionStatus } from '@/types/finance';

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

type CurrencyCode = 'EGP' | 'USD' | 'SAR';

const CURRENCY_META: Record<CurrencyCode, { flag: string; color: string }> = {
  EGP: { flag: '🇪🇬', color: '#145DB8' },
  USD: { flag: '🇺🇸', color: '#22C55E' },
  SAR: { flag: '🇸🇦', color: '#F59E0B' },
};

export default function FinanceEmployeeHistory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const { data: employees } = useFinanceEmployeeBalances();
  const userNames = useRequesterNames();
  const [selectedId, setSelectedId] = useState<string>('');
  const { data, isLoading: historyLoading, isError, refetch } = useFinanceEmployeeHistory(selectedId || null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]!);

  const employeeList: FinanceEmployeeBalance[] = useMemo(() => employees ?? [], [employees]);
  const selectedEmployee = useMemo(
    () => employeeList.find((e) => e.EmployeeId === selectedId) ?? null,
    [employeeList, selectedId],
  );

  const displayName = (e: FinanceEmployeeBalance): string => userNames[e.EmployeeId] ?? e.Email;

  const history: FinanceTransactionItem[] = useMemo(
    () => (data ?? []).filter((tx) => isFinanceVisibleTransactionStatus(tx.Status)),
    [data],
  );

  const stats = useMemo(() => {
    const completed = history.filter((tx) => tx.Status === 'Completed').length;
    return { total: history.length, completed, pending: history.length - completed };
  }, [history]);

  const currencyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of history) {
      const code = (tx.Currency ?? '').trim().toUpperCase();
      totals.set(code, (totals.get(code) ?? 0) + Number(tx.Amount ?? 0));
    }
    return Array.from(totals.entries());
  }, [history]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = history.filter((tx) => {
      if (statusFilter !== 'all' && tx.Status !== statusFilter) return false;
      if (!q) return true;
      return (
        (tx.TransactionType ?? '').toLowerCase().includes(q) ||
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
  }, [history, search, statusFilter, sortKey, sortDir]);

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

  const handleSelectEmployee = (employee: FinanceEmployeeBalance | null) => {
    setSelectedId(employee?.EmployeeId ?? '');
    setSearch('');
    setStatusFilter('all');
    setPage(0);
  };

  const renderCurrencyPills = (balances: { EGP: number; USD: number; SAR: number }) =>
    (Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => {
      const value = Number(balances[code] ?? 0);
      const meta = CURRENCY_META[code];
      return (
        <Box
          key={code}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.4,
            borderRadius: 1.5,
            minWidth: 92,
            justifyContent: 'center',
            backgroundColor: alpha(meta.color, 0.1),
            border: '1px solid',
            borderColor: alpha(meta.color, 0.25),
          }}
        >
          <Typography sx={{ fontSize: 11 }}>{meta.flag}</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrencyByCode(value, code)}
          </Typography>
        </Box>
      );
    });

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
              <History sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('finance.employeeHistorySection')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
              {t('finance.employeeHistorySection')}
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, color: 'rgba(255,255,255,0.82)', maxWidth: 520 }}>
              {t('finance.employeeHistorySubtitle')}
            </Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" sx={{ position: 'relative' }}>
            <Box sx={{ minWidth: { xs: 110, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroTotalTransactions')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {historyLoading || !selectedEmployee ? '—' : <AnimatedNumber value={stats.total} />}
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
                {historyLoading || !selectedEmployee ? '—' : <AnimatedNumber value={stats.completed} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <CheckCircleOutline sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.statusCompleted')}</Typography>
              </Box>
            </Box>
            <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ minWidth: { xs: 110, sm: 140 } }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
                {t('finance.heroPending')}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {historyLoading || !selectedEmployee ? '—' : <AnimatedNumber value={stats.pending} />}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <HourglassEmptyOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{t('finance.statusPending')}</Typography>
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
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={1.5} mb={1.5}>
          <Autocomplete<FinanceEmployeeBalance, false, false, false>
            size="small"
            value={selectedEmployee}
            onChange={(_e, value) => handleSelectEmployee(value)}
            options={employeeList}
            getOptionLabel={(e) => `${displayName(e)} · ${e.Email}`}
            isOptionEqualToValue={(a, b) => a.EmployeeId === b.EmployeeId}
            noOptionsText={t('finance.noEmployeesMatch')}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('finance.selectEmployee')}
                placeholder={t('finance.searchEmployees')}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <PersonSearchOutlined sx={{ color: 'text.disabled', fontSize: 18, mr: 0.5 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            renderOption={(props, e) => {
              const name = displayName(e);
              return (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.75, minWidth: 0 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(avatarColor(name), 0.9), fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {initialsOf(name)}
                  </Avatar>
                  <Box minWidth={0} flex={1}>
                    <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{name}</Typography>
                    <Typography noWrap sx={{ fontSize: 11.5, color: 'text.secondary' }}>{e.Email}</Typography>
                  </Box>
                  <Box display="flex" gap={0.5}>
                    {(Object.keys(CURRENCY_META) as CurrencyCode[])
                      .filter((code) => Number(e[code] ?? 0) > 0)
                      .map((code) => (
                        <Typography key={code} sx={{ fontSize: 11, color: 'text.disabled' }}>{CURRENCY_META[code].flag}</Typography>
                      ))}
                  </Box>
                </Box>
              );
            }}
            sx={{ minWidth: { xs: '100%', md: 340 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
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
            sx={{ minWidth: { xs: '100%', md: 200 } }}
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
              { value: 'Approved', label: t('finance.statusPending') },
              { value: 'Completed', label: t('finance.statusCompleted') },
            ]}
            selected={statusFilter}
            onChange={(value) => { setStatusFilter(value as StatusFilter); setPage(0); }}
          />
          {!historyLoading && selectedEmployee && (
            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
              {t('finance.resultsCount', { shown: paged.length, total: filtered.length })}
            </Typography>
          )}
        </Box>
      </Box>

      {!selectedEmployee ? (
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <EmptyState icon="👤" title={t('finance.selectEmployeePlaceholder')} description={t('finance.selectEmployeeHint')} />
        </Box>
      ) : isError ? (
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', py: 4, px: 3, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.25),
              color: theme.palette.error.main,
            }}
          >
            <ErrorOutlineOutlined sx={{ fontSize: 34 }} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            {t('finance.historyLoadError')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            {t('finance.historyLoadErrorHint')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh sx={{ fontSize: 16 }} />}
            onClick={() => refetch()}
            sx={{ borderRadius: 2, px: 2 }}
          >
            {t('finance.retry')}
          </Button>
        </Box>
      ) : (
        <>
          {/* Selected employee identity + current balances */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 2.5 },
              mb: 1.5,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              backgroundImage: `linear-gradient(135deg, ${alpha('#145DB8', 0.06)}, ${alpha('#22C55E', 0.05)})`,
            }}
          >
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: alpha(avatarColor(displayName(selectedEmployee)), 0.9), fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initialsOf(displayName(selectedEmployee))}
                </Avatar>
                <Box minWidth={0}>
                  <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName(selectedEmployee)}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedEmployee.Email}
                  </Typography>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Box display="flex" flexDirection="column" gap={0.75} minWidth={0}>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <AccountBalanceWalletOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary' }}>
                    {t('finance.currentBalances')}
                  </Typography>
                </Box>
                <Box display="flex" gap={0.75} flexWrap="wrap">
                  {renderCurrencyPills(selectedEmployee)}
                </Box>
              </Box>
            </Box>
          </Box>

          {historyLoading ? (
            <SkeletonLoader type="list" count={5} />
          ) : filtered.length === 0 ? (
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <EmptyState icon="🔍" title={t('finance.noTransactions')} description={t('finance.noTransactionsHint')} />
            </Box>
          ) : (
            <>
              {currencyTotals.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mb={1.5}>
                  <Chip
                    size="small"
                    label={t('finance.historyCount', { count: stats.total })}
                    sx={{ borderRadius: 1.5, fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                  />
                  <Chip
                    size="small"
                    label={t('finance.historyCompleted', { count: stats.completed })}
                    sx={{ borderRadius: 1.5, fontWeight: 600, backgroundColor: alpha('#22C55E', 0.12), color: theme.palette.mode === 'dark' ? '#4ADE80' : '#15803D' }}
                  />
                  <Chip
                    size="small"
                    label={t('finance.historyPendingCount', { count: stats.pending })}
                    sx={{ borderRadius: 1.5, fontWeight: 600, backgroundColor: alpha('#F59E0B', 0.12), color: theme.palette.mode === 'dark' ? '#FBBF24' : '#B45309' }}
                  />
                  {currencyTotals.map(([code, total]) => {
                    const meta = CURRENCY_META[code as CurrencyCode] ?? { flag: currencyFlag(code), color: '#145DB8' };
                    return (
                      <Chip
                        key={code}
                        size="small"
                        label={`${meta.flag} ${t('finance.custodyTotal', { currency: code })} ${formatCurrencyByCode(total, code)}`}
                        sx={{
                          borderRadius: 1.5,
                          fontWeight: 600,
                          backgroundColor: alpha(meta.color, 0.1),
                          color: theme.palette.mode === 'dark' ? meta.color : 'text.primary',
                        }}
                      />
                    );
                  })}
                </Box>
              )}

              {isDesktop ? (
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: alpha(theme.palette.surfaceLight, 0.5) } }}>
                          <TableCell sortDirection={sortKey === 'date' ? sortDir : false}>
                            <TableSortLabel active={sortKey === 'date'} direction={sortKey === 'date' ? sortDir : 'asc'} onClick={() => handleSort('date')}>
                              {t('finance.date')}
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>{t('finance.transactionType')}</TableCell>
                          <TableCell>{t('finance.currency')}</TableCell>
                          <TableCell align="right" sortDirection={sortKey === 'amount' ? sortDir : false}>
                            <TableSortLabel active={sortKey === 'amount'} direction={sortKey === 'amount' ? sortDir : 'asc'} onClick={() => handleSort('amount')}>
                              {t('finance.requestedAmount')}
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>{t('finance.status')}</TableCell>
                          <TableCell>{t('finance.source')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paged.map((tx) => {
                          const meta = CURRENCY_META[tx.Currency as CurrencyCode] ?? { color: '#145DB8' };
                          return (
                            <TableRow key={tx.TransactionNumber} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell>
                                <Tooltip title={formatDate(tx.Date)} arrow>
                                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{formatDate(tx.Date)}</Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={0.75}>
                                  <Box
                                    sx={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: 1.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      backgroundColor: alpha(meta.color, 0.12),
                                      color: meta.color,
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {currencyFlag(tx.Currency)}
                                  </Box>
                                  <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600 }}>{tx.TransactionType}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{tx.Currency}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatCurrencyByCode(tx.Amount, tx.Currency)}
                                </Typography>
                              </TableCell>
                              <TableCell><FinanceStatusChip status={tx.Status} /></TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{tx.Source}</Typography>
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
                    {paged.map((tx, index) => {
                      const meta = CURRENCY_META[tx.Currency as CurrencyCode] ?? { flag: currencyFlag(tx.Currency), color: '#145DB8' };
                      return (
                        <motion.div
                          key={tx.TransactionNumber}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
                        >
                          <Box sx={{ p: 1.5, borderRadius: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={0.75}>
                              <Box minWidth={0}>
                                <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                                  <Typography sx={{ fontSize: 11 }}>{meta.flag}</Typography>
                                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                                    {formatCurrencyByCode(tx.Amount, tx.Currency)}
                                  </Typography>
                                </Box>
                                <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary' }}>{tx.TransactionType}</Typography>
                              </Box>
                              <FinanceStatusChip status={tx.Status} />
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
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
            </>
          )}
        </>
      )}
    </motion.div>
  );
}