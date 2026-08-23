import type { ReactElement } from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cancel, CheckCircle, CloudUpload, EditOutlined, HourglassEmptyOutlined, PaymentOutlined, VisibilityOutlined } from '@mui/icons-material';
import type { RequestStatus, ExpenseStatus } from '@/types/vertex';

type Status = RequestStatus | ExpenseStatus;

const statusConfig: Record<Status, { color: string; bg: string; darkText: string; lightText: string; key: string; icon: ReactElement }> = {
  draft: { color: '#64748B', bg: 'rgba(100, 116, 139, 0.15)', darkText: '#94A3B8', lightText: '#475569', key: 'request.status.draft', icon: <EditOutlined /> },
  pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', darkText: '#FBBF24', lightText: '#B45309', key: 'request.status.pending', icon: <HourglassEmptyOutlined /> },
  'pending-manager': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', darkText: '#FBBF24', lightText: '#B45309', key: 'request.status.pendingManager', icon: <HourglassEmptyOutlined /> },
  'pending-approval': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', darkText: '#FBBF24', lightText: '#B45309', key: 'request.status.pendingApproval', icon: <HourglassEmptyOutlined /> },
  'pending-finance': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', darkText: '#FBBF24', lightText: '#B45309', key: 'request.status.pendingFinance', icon: <HourglassEmptyOutlined /> },
  approved: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', darkText: '#4ADE80', lightText: '#15803D', key: 'expense.status.approved', icon: <CheckCircle /> },
  completed: { color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.15)', darkText: '#7DD3FC', lightText: '#0369A1', key: 'request.status.completed', icon: <PaymentOutlined /> },
  rejected: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', darkText: '#F87171', lightText: '#B91C1C', key: 'expense.status.rejected', icon: <Cancel /> },
  submitted: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', darkText: '#7DD3FC', lightText: '#0369A1', key: 'expense.status.submitted', icon: <CloudUpload /> },
  'under-review': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', darkText: '#FBBF24', lightText: '#B45309', key: 'expense.status.underReview', icon: <VisibilityOutlined /> },
  reimbursed: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)', darkText: '#4ADE80', lightText: '#15803D', key: 'expense.status.reimbursed', icon: <PaymentOutlined /> },
};

interface StatusBadgeProps {
  status: Status;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const config = statusConfig[status];
  if (!config) return null;
  const isDark = theme.palette.mode === 'dark';
  const text = isDark ? config.darkText : config.lightText;
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Chip
        icon={config.icon}
        label={t(config.key)}
        size={size}
        sx={{
          backgroundColor: config.bg,
          color: text,
          fontWeight: 600,
          borderRadius: 1,
          height: size === 'small' ? 22 : 28,
          fontSize: size === 'small' ? 11 : 12,
          px: size === 'small' ? 0.75 : 1.25,
          '& .MuiChip-icon': { fontSize: size === 'small' ? 13 : 15, color: 'inherit' },
        }}
      />
    </motion.div>
  );
}