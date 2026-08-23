import { Box } from '@mui/material';
import {
  AccountBalanceWallet,
  Cancel,
  CheckCircle,
  Group,
  InfoOutlined,
  NotificationsNone,
  Payments,
  ReceiptLong,
} from '@mui/icons-material';
import type { NotificationKind } from '@/utils/notifications';

interface NotificationIconProps {
  kind: NotificationKind;
  size?: 'small' | 'medium';
}

const iconConfig: Record<NotificationKind, { icon: typeof CheckCircle; color: string; bg: string }> = {
  approval: { icon: CheckCircle, color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)' },
  rejection: { icon: Cancel, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  request: { icon: ReceiptLong, color: '#145DB8', bg: 'rgba(20, 93, 184, 0.12)' },
  payment: { icon: Payments, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  budget: { icon: AccountBalanceWallet, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  team: { icon: Group, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)' },
  update: { icon: InfoOutlined, color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)' },
  default: { icon: NotificationsNone, color: '#145DB8', bg: 'rgba(20, 93, 184, 0.08)' },
};

export function NotificationIcon({ kind, size = 'small' }: NotificationIconProps) {
  const config = iconConfig[kind];
  const Icon = config.icon;
  const boxSize = size === 'small' ? 34 : 44;
  return (
    <Box
      sx={{
        width: boxSize,
        height: boxSize,
        borderRadius: 1.5,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <Icon sx={{ fontSize: size === 'small' ? 18 : 22 }} />
    </Box>
  );
}