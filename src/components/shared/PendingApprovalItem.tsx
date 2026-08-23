import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/utils/format';

interface PendingApprovalItemProps {
  id: string;
  employeeName: string;
  amount: number;
  reason: string;
  createdAt: string;
  status: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  index?: number;
}

export function PendingApprovalItem({
  id, employeeName, amount, reason, createdAt, status, onApprove, onReject, index = 0,
}: PendingApprovalItemProps) {
  const initials = employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const isPending = status === 'pending' || status === 'draft';
  const accentColor = '#145DB8';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, py: 1, minWidth: 0,
        borderBottom: '1px solid', borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, backgroundColor: `${accentColor}18`, color: accentColor, flexShrink: 0 }}>
        {initials}
      </Avatar>
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{employeeName}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{reason}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{formatDate(createdAt)}</Typography>
      </Box>
      <Box textAlign="right" flexShrink={0}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{formatCurrency(amount)}</Typography>
      </Box>
      {isPending && onApprove && onReject && (
        <Box display="flex" gap={0.5} flexShrink={0}>
          <Tooltip title="Approve">
            <IconButton size="small" onClick={() => onApprove(id)}
              sx={{ width: { xs: 40, md: 30 }, height: { xs: 40, md: 30 }, borderRadius: 1.5, backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16A34A',
                '&:hover': { backgroundColor: '#16A34A', color: '#fff' } }}>
              <Check sx={{ fontSize: { xs: 18, md: 14 } }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton size="small" onClick={() => onReject(id)}
              sx={{ width: { xs: 40, md: 30 }, height: { xs: 40, md: 30 }, borderRadius: 1.5, backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#DC2626',
                '&:hover': { backgroundColor: '#DC2626', color: '#fff' } }}>
              <Close sx={{ fontSize: { xs: 18, md: 14 } }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
