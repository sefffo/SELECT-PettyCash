import { Chip, useTheme } from '@mui/material';
import {
  Cancel,
  CheckCircle,
  HourglassEmptyOutlined,
  PaymentOutlined,
  Schedule,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface StatusChipConfig {
  color: string;
  bg: string;
  darkText: string;
  lightText: string;
  labelKey: string;
  icon: React.ReactElement;
}

const STATUSES: Record<string, StatusChipConfig> = {
  Pending: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    darkText: '#FBBF24',
    lightText: '#B45309',
    labelKey: 'finance.statusPending',
    icon: <HourglassEmptyOutlined />,
  },
  PendingManager: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    darkText: '#FBBF24',
    lightText: '#B45309',
    labelKey: 'finance.statusPendingManager',
    icon: <Schedule />,
  },
  'Pending Management Approval': {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    darkText: '#FBBF24',
    lightText: '#B45309',
    labelKey: 'finance.statusPendingManagement',
    icon: <HourglassEmptyOutlined />,
  },
  Approved: {
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.15)',
    darkText: '#4ADE80',
    lightText: '#15803D',
    labelKey: 'finance.statusPending',
    icon: <CheckCircle />,
  },
  'Approved by Management': {
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.15)',
    darkText: '#4ADE80',
    lightText: '#15803D',
    labelKey: 'finance.statusApprovedByManagement',
    icon: <CheckCircle />,
  },
  Rejected: {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    darkText: '#F87171',
    lightText: '#B91C1C',
    labelKey: 'finance.statusRejected',
    icon: <Cancel />,
  },
  'Rejected by Management': {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    darkText: '#F87171',
    lightText: '#B91C1C',
    labelKey: 'finance.statusRejectedByManagement',
    icon: <Cancel />,
  },
  Completed: {
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.15)',
    darkText: '#7DD3FC',
    lightText: '#0369A1',
    labelKey: 'finance.statusCompleted',
    icon: <PaymentOutlined />,
  },
};

interface FinanceStatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export function FinanceStatusChip({ status, size = 'small' }: FinanceStatusChipProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const config = STATUSES[status];
  if (!config) return null;
  const isDark = theme.palette.mode === 'dark';
  return (
    <Chip
      icon={config.icon}
      label={t(config.labelKey)}
      size={size}
      sx={{
        backgroundColor: config.bg,
        color: isDark ? config.darkText : config.lightText,
        fontWeight: 600,
        borderRadius: 1,
        height: size === 'small' ? 22 : 28,
        fontSize: size === 'small' ? 11 : 12,
        px: size === 'small' ? 0.75 : 1.25,
        '& .MuiChip-icon': { fontSize: size === 'small' ? 13 : 15, color: 'inherit' },
      }}
    />
  );
}