import { useMemo, useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogContent,
  Button, Avatar, useTheme, useMediaQuery, Tooltip, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search, History, SendOutlined, AccountBalanceWalletOutlined, PaidOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFinanceEmployeeBalances, useFinanceEmployeeHistory, useRequesterNames, useSubmitDirectPayment, useUsers, useDepartments } from '@/hooks/api';
import { DirectMoneyRequestDialog, EmptyState, SkeletonLoader, Toast, ConfirmationDialog } from '@/components/shared';
import { FinanceStatusChip } from './FinanceStatusChip';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import { avatarColor, initialsOf } from '@/utils/avatar';
import { isFinanceVisibleTransactionStatus } from '@/types/finance';
import type { FinanceEmployeeBalance, FinanceTransactionItem } from '@/types/api';

type CurrencyCode = 'EGP' | 'USD' | 'SAR';

const CURRENCY_META: Record<CurrencyCode, { flag: string; color: string }> = {
  EGP: { flag: '🇪🇬', color: '#145DB8' },
  USD: { flag: '🇺🇸', color: '#22C55E' },
  SAR: { flag: '🇸🇦', color: '#F59E0B' },
};

const CURRENCY_ORDER: CurrencyCode[] = ['EGP', 'USD', 'SAR'];

interface HistoryDialogProps {
  employeeId: string;
  email: string;
  onClose: () => void;
}

function HistoryDialog({ employeeId, email, onClose }: HistoryDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading } = useFinanceEmployeeHistory(employeeId);
  const history: FinanceTransactionItem[] = useMemo(
    () => (data ?? []).filter((tx) => isFinanceVisibleTransactionStatus(tx.Status)),
    [data],
  );

  return (
    <Dialog
      open
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
        paper: { sx: { borderRadius: 3, maxWidth: { xs: 'calc(100vw - 32px)', sm: 620 }, width: '100%', m: 2 } },
      }}
    >
      <DialogContent sx={{ py: 2.5, px: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(avatarColor(email), 0.85), fontSize: 15, fontWeight: 700 }}>
            {initialsOf(email)}
          </Avatar>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>{t('finance.historyTitle')}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</Typography>
          </Box>
        </Box>

        {isLoading ? (
          <SkeletonLoader type="list" count={4} />
        ) : history.length === 0 ? (
          <EmptyState icon="📭" title={t('finance.noHistory')} description={t('finance.noHistoryHint')} />
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {history.map((tx, index) => (
              <motion.div
                key={tx.TransactionNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', transition: 'border-color 0.2s', '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} mb={0.5}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrencyByCode(tx.Amount, tx.Currency)}
                    </Typography>
                    <FinanceStatusChip status={tx.Status} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{tx.TransactionType}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                    {formatDate(tx.Date)} · {tx.Source}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function FinanceEmployeeBalances() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data, isLoading } = useFinanceEmployeeBalances();
  const userNames = useRequesterNames();
  const { data: users = [] } = useUsers();
  const { data: departments = [] } = useDepartments();
  const transferMutation = useSubmitDirectPayment();

  const [search, setSearch] = useState('');
  const [historyTarget, setHistoryTarget] = useState<FinanceEmployeeBalance | null>(null);
  const [transferTarget, setTransferTarget] = useState<FinanceEmployeeBalance | null>(null);
  const [transferCurrency, setTransferCurrency] = useState<CurrencyCode>('EGP');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const balances: FinanceEmployeeBalance[] = useMemo(() => data ?? [], [data]);

  const eligibleEmployees = useMemo(
    () =>
      users
        .filter((u) => u.Role === 'Employee')
        .map((u) => ({
          id: String(u.Id),
          name: u.Name,
          email: u.Email,
          department: departments.find((d) => d.Id === u.DepartmentId)?.Name ?? '—',
        })),
    [users, departments],
  );

  const displayName = (b: FinanceEmployeeBalance): string => userNames[b.EmployeeId] ?? b.Email;

  const filtered = balances.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (displayName(b) ?? '').toLowerCase().includes(q) ||
      (b.Email ?? '').toLowerCase().includes(q)
    );
  });

  const totals = useMemo(() => {
    const sum = { EGP: 0, USD: 0, SAR: 0 } as Record<CurrencyCode, number>;
    for (const b of balances) {
      sum.EGP += Number(b.EGP ?? 0);
      sum.USD += Number(b.USD ?? 0);
      sum.SAR += Number(b.SAR ?? 0);
    }
    return sum;
  }, [balances]);

  const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

  const availableBalance = transferTarget ? Number(transferTarget[transferCurrency] ?? 0) : 0;
  const amountNum = Number(transferAmount);
  const validAmount = amountNum > 0 && amountNum <= availableBalance;

  const handleOpenTransfer = (b: FinanceEmployeeBalance, currency: CurrencyCode) => {
    setTransferTarget(b);
    setTransferCurrency(currency);
    setTransferAmount('');
    setTransferNotes('');
  };

  const handleConfirmTransfer = async () => {
    if (!transferTarget || !validAmount) return;
    setTransferConfirmOpen(false);
    try {
      await transferMutation.mutateAsync({
        EmployeeId: transferTarget.EmployeeId,
        Amount: amountNum,
        Currency: transferCurrency,
        Notes: transferNotes,
      });
      setTransferTarget(null);
      showToast(t('finance.transferSuccess'), 'success');
    } catch (err) {
      showToast((err as { message?: string } | null)?.message ?? t('finance.transferFailed'), 'error');
    }
  };

  const renderBalanceCell = (b: FinanceEmployeeBalance) => (
    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
      {CURRENCY_ORDER.map((code) => {
        const value = Number(b[code] ?? 0);
        const meta = CURRENCY_META[code];
        return (
          <Tooltip key={code} title={`${code} — ${formatCurrencyByCode(value, code)}`} arrow>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.9,
                py: 0.4,
                borderRadius: 1.5,
                minWidth: 86,
                justifyContent: 'center',
                backgroundColor: alpha(meta.color, 0.1),
                border: '1px solid',
                borderColor: alpha(meta.color, 0.22),
                cursor: 'default',
              }}
            >
              <Typography sx={{ fontSize: 11 }}>{meta.flag}</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrencyByCode(value, code)}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
      <Button
        size="small"
        variant="outlined"
        startIcon={<SendOutlined sx={{ fontSize: 14 }} />}
        onClick={() => handleOpenTransfer(b, 'EGP')}
        sx={{ borderRadius: 2, ml: 0.5, flexShrink: 0, fontSize: 12, px: 1.25, minHeight: 30, borderColor: alpha(theme.palette.success.main, 0.4), color: 'success.main', '&:hover': { borderColor: 'success.main', backgroundColor: alpha(theme.palette.success.main, 0.08) } }}
      >
        {t('finance.transfer')}
      </Button>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 0 }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5} mb={1.75} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <AccountBalanceWalletOutlined sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: 'text.primary' }}>{t('finance.custodyAccounts')}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{t('finance.custodyAccountsHint')}</Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search') + '...'}
            size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.disabled', fontSize: 18 }} /></InputAdornment> } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, width: { xs: '100%', sm: 240 } }}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<PaidOutlined sx={{ fontSize: 15 }} />}
            onClick={() => setRequestDialogOpen(true)}
            sx={{ borderRadius: 2, px: 1.5, fontSize: 12.5, flexShrink: 0 }}
          >
            {t('finance.requestMoney')}
          </Button>
        </Box>
      </Box>

      {!isLoading && balances.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip
            size="small"
            label={t('finance.accountsCount', { count: balances.length })}
            sx={{ borderRadius: 1.5, fontWeight: 600, backgroundColor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
          />
          {CURRENCY_ORDER.map((code) => (
            <Chip
              key={code}
              size="small"
              label={`${CURRENCY_META[code].flag} ${t('finance.custodyTotal', { currency: code })} ${formatCurrencyByCode(totals[code], code)}`}
              sx={{
                borderRadius: 1.5,
                fontWeight: 600,
                backgroundColor: alpha(CURRENCY_META[code].color, 0.1),
                color: theme.palette.mode === 'dark' ? CURRENCY_META[code].color : 'text.primary',
              }}
            />
          ))}
        </Box>
      )}

      {isLoading ? (
        <SkeletonLoader type="list" count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title={t('finance.noCustodyAccounts')} description={t('finance.noCustodyAccountsHint')} />
      ) : isDesktop ? (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: alpha(theme.palette.surfaceLight, 0.5) } }}>
                  <TableCell>{t('finance.employeeName')}</TableCell>
                  <TableCell>{t('finance.balances')}</TableCell>
                  <TableCell align="right">{t('finance.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((b) => {
                  const color = avatarColor(displayName(b));
                  return (
                    <TableRow key={b.EmployeeId} hover sx={{ transition: 'background-color 0.15s ease' }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(color, 0.9), fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initialsOf(displayName(b))}
                          </Avatar>
                          <Box minWidth={0}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {displayName(b)}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.Email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{renderBalanceCell(b)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('finance.history')} arrow>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<History sx={{ fontSize: 16 }} />}
                            onClick={() => setHistoryTarget(b)}
                            sx={{ borderRadius: 2, fontSize: 12, color: 'text.secondary', minWidth: 0, px: 1 }}
                          >
                            {t('finance.history')}
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {filtered.map((b, index) => {
            const color = avatarColor(displayName(b));
            return (
              <motion.div key={b.EmployeeId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} mb={1}>
                    <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(color, 0.9), fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {initialsOf(displayName(b))}
                      </Avatar>
                      <Box minWidth={0}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {displayName(b)}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.Email}
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" variant="text" startIcon={<History sx={{ fontSize: 15 }} />} onClick={() => setHistoryTarget(b)} sx={{ borderRadius: 2, fontSize: 12, flexShrink: 0 }}>
                      {t('finance.history')}
                    </Button>
                  </Box>
                  {renderBalanceCell(b)}
                </Box>
              </motion.div>
            );
          })}
        </Box>
      )}

      {historyTarget && (
        <HistoryDialog
          employeeId={historyTarget.EmployeeId}
          email={historyTarget.Email}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      <Dialog
        open={!!transferTarget}
        onClose={() => setTransferTarget(null)}
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
          paper: { sx: { borderRadius: 3, maxWidth: { xs: 'calc(100vw - 32px)', sm: 440 }, width: '100%', m: 2 } },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>{t('finance.directTransferTitle')}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
            {t('finance.directTransferHint')}: {transferTarget?.Email}
          </Typography>
        </Box>
        <DialogContent sx={{ py: 2, px: 2.5 }}>
          <Box display="flex" gap={1} mb={2}>
            {CURRENCY_ORDER.map((code) => (
              <Button
                key={code}
                variant={transferCurrency === code ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setTransferCurrency(code);
                  setTransferAmount('');
                }}
                sx={{ borderRadius: 2, flex: 1, fontSize: 13, px: 1 }}
              >
                {CURRENCY_META[code].flag} {code}
              </Button>
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1.5,
              p: 1.25,
              borderRadius: 2,
              backgroundColor: alpha(CURRENCY_META[transferCurrency].color, 0.08),
              border: '1px solid',
              borderColor: alpha(CURRENCY_META[transferCurrency].color, 0.22),
            }}
          >
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{t('finance.availableBalance')}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrencyByCode(availableBalance, transferCurrency)}
            </Typography>
          </Box>

          <TextField
            label={t('finance.amountLabel')}
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            fullWidth
            autoFocus
            error={transferAmount !== '' && !validAmount}
            helperText={transferAmount !== '' && !validAmount ? t('finance.amountError') : ' '}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label={t('finance.notesLabel')}
            value={transferNotes}
            onChange={(e) => setTransferNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder={t('finance.notesPlaceholder')}
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={1.5}>
            <Button fullWidth variant="outlined" onClick={() => setTransferTarget(null)} sx={{ borderRadius: 2, py: 0.85 }}>
              {t('common.cancel')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!validAmount || transferMutation.isPending}
              onClick={() => setTransferConfirmOpen(true)}
              sx={{ borderRadius: 2, py: 0.85, backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: theme.palette.success.dark } }}
            >
              {transferMutation.isPending ? t('finance.sending') : t('finance.confirmTransfer')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={transferConfirmOpen}
        onClose={() => setTransferConfirmOpen(false)}
        onConfirm={handleConfirmTransfer}
        title={t('finance.transferConfirmTitle')}
        message={t('finance.transferConfirmMessage', {
          amount: formatCurrencyByCode(amountNum, transferCurrency),
          employee: transferTarget?.Email ?? '',
        })}
        confirmLabel={t('finance.confirmTransfer')}
        confirmColor="success"
        icon="💸"
      />

      <DirectMoneyRequestDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        title={t('directMoney.title')}
        hint={t('directMoney.hint')}
        submitLabel={t('directMoney.submit')}
        submittingLabel={t('directMoney.submitting')}
        successMessage={t('directMoney.success')}
        employees={eligibleEmployees}
        submit={(params) => transferMutation.mutateAsync(params)}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}