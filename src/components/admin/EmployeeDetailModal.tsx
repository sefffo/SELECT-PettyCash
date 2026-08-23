import { Box, Typography, Avatar, IconButton, Button, Divider } from '@mui/material';
import { Close, Mail, Business, BadgeOutlined, CalendarToday, ReceiptLongOutlined, TagOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Employee } from '@/types/vertex';
import type { AdminProfileInfo, ManagerRequestItem } from '@/types/api';
import { formatDate, formatCurrencyByCode } from '@/utils/format';
import { mapManagerRequestStatus } from '@/utils/mappers';
import { StatusBadge } from '@/components/feature/StatusBadge';
import { SkeletonLoader } from '@/components/shared';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  profile?: AdminProfileInfo | null;
  transactions?: ManagerRequestItem[];
  transactionsLoading?: boolean;
  showDepartment?: boolean;
  showEmployeeId?: boolean;
  open: boolean;
  onClose: () => void;
}

export function EmployeeDetailModal({ employee, profile = null, transactions = [], transactionsLoading = false, showDepartment = true, showEmployeeId = true, open, onClose }: EmployeeDetailModalProps) {
  const { t } = useTranslation();

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
          <Box sx={{ position: 'relative', p: 2.5, pb: 0 }}>
            <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12, width: 32, height: 32, color: 'text.secondary' }}><Close sx={{ fontSize: 18 }} /></IconButton>
            <Box textAlign="center" mb={1.5}>
              <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1, backgroundColor: '#145DB8', fontSize: 22, fontWeight: 700 }}>
                {(profile?.Name ?? employee.name).charAt(0)}
              </Avatar>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>{profile?.Name ?? employee.name}</Typography>
              <Box component="span" sx={{ display: 'inline-block', mt: 0.4, px: 1.25, py: 0.3, borderRadius: 1.5, backgroundColor: employee.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)', color: employee.status === 'active' ? '#22C55E' : '#64748B', fontWeight: 600, fontSize: 12 }}>
                {employee.status === 'active' ? t('common.active') : t('common.inactive')}
              </Box>
            </Box>
          </Box>
          <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
            {showEmployeeId && <DetailRow icon={<TagOutlined sx={{ fontSize: 16 }} />} label={t('admin.employeeId')} value={profile?.Id ?? employee.id} />}
            <DetailRow icon={<Mail sx={{ fontSize: 16 }} />} label={t('admin.employeeTable.email')} value={profile?.Email ?? employee.email} />
            {showDepartment && <DetailRow icon={<Business sx={{ fontSize: 16 }} />} label={t('admin.employeeTable.department')} value={employee.department} />}
            <DetailRow icon={<BadgeOutlined sx={{ fontSize: 16 }} />} label={t('admin.employeeTable.role')} value={profile?.Role ?? employee.role} />
            <DetailRow icon={<CalendarToday sx={{ fontSize: 16 }} />} label="Joined" value={employee.createdAt ? formatDate(employee.createdAt) : '—'} />
            <DetailRow icon={<CalendarToday sx={{ fontSize: 16 }} />} label="Updated" value={employee.updatedAt ? formatDate(employee.updatedAt) : '—'} />
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
              <ReceiptLongOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>TRANSACTIONS</Typography>
            </Box>
            {transactionsLoading ? (
              <SkeletonLoader type="list" count={2} />
            ) : transactions.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 1 }}>No transactions yet.</Typography>
            ) : (
              <Box>
                {transactions.map((tx) => (
                  <Box key={tx.RequestId} display="flex" justifyContent="space-between" alignItems="center" gap={1}
                    sx={{ py: 0.8, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                    <Box minWidth={0} flex={1}>
                      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{tx.Reason}</Typography>
                      <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>{formatDate(tx.DateRequested)} · #{tx.RequestId}</Typography>
                    </Box>
                    <Box textAlign="right" flexShrink={0} display="flex" flexDirection="column" alignItems="flex-end" gap={0.4}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyByCode(tx.Amount, tx.Currency)}</Typography>
                      <StatusBadge status={mapManagerRequestStatus(tx.Status)} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, py: 0.85 }}>{t('common.close')}</Button>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box display="flex" alignItems="center" gap={1.25} py={0.8}>
      <Box sx={{ color: 'text.secondary', display: 'flex', width: 18 }}>{icon}</Box>
      <Box flex={1}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
      </Box>
    </Box>
  );
}
