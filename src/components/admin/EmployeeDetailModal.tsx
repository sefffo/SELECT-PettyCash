import { Box, Typography, Avatar, IconButton, Button, Divider } from '@mui/material';
import { Close, ReceiptLongOutlined, AccountBalanceWalletOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { Employee } from '@/types/vertex';
import type { AdminProfileInfo, ManagerEmployeeBalance, ManagerRequestItem } from '@/types/api';
import { formatDate, formatCurrencyByCode } from '@/utils/format';
import { mapManagerRequestStatus } from '@/utils/mappers';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { SkeletonLoader } from '@/components/shared';

const CURRENCY_COLORS: Record<string, string> = { EGP: '#145DB8', USD: '#22C55E', SAR: '#F59E0B' };
const BALANCE_FIELD_ORDER = ['EGP', 'USD', 'SAR'];
const NON_BALANCE_FIELDS = new Set(['employeeid', 'userid', 'id', 'email', 'departmentid']);

function balanceOrder(code: string): number {
  const index = BALANCE_FIELD_ORDER.indexOf(code);
  return index === -1 ? BALANCE_FIELD_ORDER.length : index;
}

function extractBalanceEntries(record: ManagerEmployeeBalance): { code: string; value: number }[] {
  return Object.entries(record)
    .filter(([key, value]) => typeof value === 'number' && !NON_BALANCE_FIELDS.has(key.trim().toLowerCase()))
    .map(([key, value]) => ({ code: key.trim().toUpperCase().replace(/^BALANCE/, ''), value: value as number }))
    .sort((a, b) => balanceOrder(a.code) - balanceOrder(b.code));
}

interface EmployeeDetailModalProps {
  employee: Employee | null;
  profile?: AdminProfileInfo | null;
  transactions?: ManagerRequestItem[];
  transactionsLoading?: boolean;
  balances?: ManagerEmployeeBalance[] | null;
  balancesLoading?: boolean;
  balancesError?: boolean;
  showDepartment?: boolean;
  showEmployeeId?: boolean;
  open: boolean;
  onClose: () => void;
}

export function EmployeeDetailModal({ employee, profile = null, transactions = [], transactionsLoading = false, balances, balancesLoading = false, balancesError = false, showDepartment = true, showEmployeeId = true, open, onClose }: EmployeeDetailModalProps) {
  const { t } = useTranslation();
  const walletRows = balances ?? [];

  return (
    <AnimatePresence>
      {open && employee && (
        <Dialog open={open} onClose={onClose}
          slots={{
            transition: (props) => (
              <motion.div {...props} initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
            ),
          }}
          slotProps={{
            backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
            paper: { sx: { borderRadius: 3, maxWidth: { xs: 'calc(100vw - 32px)', sm: 440 }, width: '100%', m: 2, p: 0, overflow: 'hidden' } },
          }}>
          <Box sx={{ position: 'relative', px: 2.5, pt: 2, pb: 1.25 }}>
            <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12, width: 32, height: 32, color: 'text.secondary' }}><Close sx={{ fontSize: 18 }} /></IconButton>
            <Box display="flex" alignItems="center" gap={1.5} pr={4}>
              <Avatar sx={{ width: 48, height: 48, flexShrink: 0, backgroundColor: '#145DB8', fontSize: 19, fontWeight: 700 }}>
                {(profile?.Name ?? employee.name).charAt(0)}
              </Avatar>
              <Box minWidth={0}>
                <Typography noWrap sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                  {profile?.Name ?? employee.name}
                </Typography>
                <Box component="span" sx={{ display: 'inline-block', mt: 0.5, px: 1, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 600, backgroundColor: employee.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)', color: employee.status === 'active' ? '#22C55E' : '#64748B' }}>
                  {employee.status === 'active' ? t('common.active') : t('common.inactive')}
                </Box>
              </Box>
            </Box>
          </Box>
          <DialogContent sx={{ px: 2.5, pt: 0.25, pb: 2 }}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1}>
              <InfoBlock label={t('admin.employeeTable.email')} value={profile?.Email ?? employee.email} />
              <InfoBlock label={t('admin.employeeTable.role')} value={String(profile?.Role ?? employee.role)} />
              {showEmployeeId && <InfoBlock label={t('admin.employeeId')} value={profile?.Id ?? employee.id} />}
              {showDepartment && <InfoBlock label={t('admin.employeeTable.department')} value={employee.department} />}
            </Box>

            {balances !== undefined && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <SectionHeader icon={<AccountBalanceWalletOutlined sx={{ fontSize: 14 }} />} label={t('admin.walletBalances')} />
                {balancesLoading ? (
                  <SkeletonLoader type="list" count={1} />
                ) : balancesError ? (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>{t('admin.walletBalancesLoadFailed')}</Typography>
                ) : walletRows.length === 0 || walletRows.every((record) => extractBalanceEntries(record).length === 0) ? (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>{t('admin.noWalletBalances')}</Typography>
                ) : (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {walletRows.flatMap((record, recordIndex) =>
                      extractBalanceEntries(record).map(({ code, value }) => {
                        const color = CURRENCY_COLORS[code] ?? '#145DB8';
                        return (
                          <Box
                            key={`${recordIndex}-${code}`}
                            sx={{
                              flex: '1 1 104px',
                              minWidth: 0,
                              borderRadius: 2,
                              px: 1.25,
                              py: 1.1,
                              border: '1px solid',
                              borderColor: alpha(color, 0.22),
                              background: `linear-gradient(135deg, ${alpha(color, 0.1)}, transparent 70%)`,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.75} mb={0.4}>
                              <Box sx={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, backgroundColor: color }} />
                              <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}>
                                {code}
                              </Typography>
                            </Box>
                            <Typography noWrap sx={{ fontSize: 14.5, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                              {formatCurrencyByCode(value, code)}
                            </Typography>
                          </Box>
                        );
                      }),
                    )}
                  </Box>
                )}
              </>
            )}

            <Divider sx={{ my: 1.5 }} />
            <SectionHeader icon={<ReceiptLongOutlined sx={{ fontSize: 14 }} />} label="TRANSACTIONS" />

            {transactionsLoading ? (
              <SkeletonLoader type="list" count={2} />
            ) : transactions.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>No transactions yet.</Typography>
            ) : (
              <Box sx={{ maxHeight: 232, overflowY: 'auto', pr: 0.25 }}>
                {transactions.map((tx) => (
                  <Box key={tx.RequestId} display="flex" justifyContent="space-between" alignItems="center" gap={1.25} py={0.75}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                    <Box minWidth={0} flex={1}>
                      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{tx.Reason}</Typography>
                      <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{formatDate(tx.DateRequested)} · #{tx.RequestId}</Typography>
                    </Box>
                    <Box flexShrink={0} display="flex" flexDirection="column" alignItems="flex-end" gap={0.35}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyByCode(tx.Amount, tx.Currency)}</Typography>
                      <StatusBadge status={mapManagerRequestStatus(tx.Status)} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, py: 0.85, mt: 1.75 }}>{t('common.close')}</Button>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0, px: 1.25, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mt: 0.25 }}>{value}</Typography>
    </Box>
  );
}

function SectionHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Box display="flex" alignItems="center" gap={1} mb={1}>
      <Box sx={{ width: 26, height: 26, borderRadius: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(20, 93, 184, 0.08)', color: '#145DB8' }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
  );
}
