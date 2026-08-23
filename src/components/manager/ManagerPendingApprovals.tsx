import { Box, Typography, Avatar, Button } from '@mui/material';
import { Check, Close, ArrowForward, HourglassEmptyOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardCardHeader, EmptyState, SkeletonLoader } from '@/components/shared';
import { formatCurrencyByCode, formatDate } from '@/utils/format';
import type { Request } from '@/types/vertex';

const ROW_BREAKPOINT = '@media (min-width: 768px)';

interface ManagerPendingApprovalsProps {
  requests: Request[];
  loading?: boolean;
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
}

function ApprovalRow({
  id, employeeName, amount, currency, reason, createdAt, status,
  onApprove, onReject,
}: {
  id: string; employeeName: string; amount: number; currency?: string; reason: string;
  createdAt: string; status: string;
  onApprove?: (id: string) => void; onReject?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const isPending = status === 'pending' || status === 'draft';
  const initials = employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const accentColor = '#145DB8';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.25,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 0,
        flexWrap: 'wrap',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: `${accentColor}33` },
        [ROW_BREAKPOINT]: { flexWrap: 'nowrap' },
      }}
    >
      <Avatar sx={{
        width: 34, height: 34, borderRadius: 1.5,
        fontSize: 12, fontWeight: 700,
        backgroundColor: `${accentColor}18`, color: accentColor, flexShrink: 0,
      }}>
        {initials}
      </Avatar>

      <Box sx={{
        flex: '1 1 0%', minWidth: 0,
        [ROW_BREAKPOINT]: { flex: '0 1 180px' },
      }}>
        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {employeeName}
          </Typography>
          <Box sx={{
            px: 0.5, py: 0.125, borderRadius: 0.75,
            backgroundColor: `${accentColor}12`, color: accentColor,
            fontSize: 10, fontWeight: 600, lineHeight: 1.4, textTransform: 'capitalize', flexShrink: 0,
          }}>
            {t('manager.requestTypeCash')}
          </Box>
        </Box>
        <Typography sx={{
          fontSize: 11, color: 'text.disabled',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {formatDate(createdAt)}
        </Typography>
        <Typography sx={{
          fontSize: 12, color: 'text.secondary',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          [ROW_BREAKPOINT]: { display: 'none' },
        }}>
          {reason}
        </Typography>
      </Box>

      <Typography sx={{
        display: 'none',
        flex: '1 1 0%',
        minWidth: 0,
        width: 0,
        fontSize: 12, color: 'text.secondary',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        [ROW_BREAKPOINT]: { display: 'block' },
      }}>
        {reason}
      </Typography>

      <Typography sx={{
        marginInlineStart: 'auto',
        fontSize: 14, fontWeight: 700, color: 'text.primary',
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0,
        [ROW_BREAKPOINT]: { marginInlineStart: 0 },
      }}>
        {formatCurrencyByCode(amount, currency)}
      </Typography>

      {isPending && (
        <Box sx={{
          display: 'flex', gap: 0.75, flexShrink: 0,
          width: '100%', justifyContent: 'flex-end',
          [ROW_BREAKPOINT]: { width: 'auto', justifyContent: 'flex-start' },
        }}>
          <Button size="small" aria-label={t('manager.approve')} startIcon={<Check sx={{ fontSize: 15 }} />} onClick={() => onApprove?.(id)}
            sx={{
              borderRadius: 1.5, px: 1.25, py: 0.45, fontSize: 12, fontWeight: 600,
              textTransform: 'none', minWidth: 0, whiteSpace: 'nowrap',
              color: '#16A34A', backgroundColor: 'rgba(34, 197, 94, 0.12)',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#16A34A', color: '#fff' },
            }}>
            {t('manager.approve')}
          </Button>
          <Button size="small" aria-label={t('manager.reject')} startIcon={<Close sx={{ fontSize: 15 }} />} onClick={() => onReject?.(id)}
            sx={{
              borderRadius: 1.5, px: 1.25, py: 0.45, fontSize: 12, fontWeight: 600,
              textTransform: 'none', minWidth: 0, whiteSpace: 'nowrap',
              color: '#DC2626', backgroundColor: 'rgba(239, 68, 68, 0.12)',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#DC2626', color: '#fff' },
            }}>
            {t('manager.reject')}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function ManagerPendingApprovals({
  requests, loading,
  onApproveRequest, onRejectRequest,
}: ManagerPendingApprovalsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) return <SkeletonLoader type="list" count={4} />;

  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.status === 'draft');
  const totalPending = pendingRequests.length;

  if (totalPending === 0) {
    return (
      <Box sx={{ borderRadius: 3, p: 2.5, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 0, overflow: 'hidden' }}>
        <DashboardCardHeader icon={<HourglassEmptyOutlined />} color="#F59E0B" title={t('manager.pendingApprovals')} />
        <EmptyState icon="✅" title={t('manager.allCaughtUp')} description={t('manager.nothingToReview')} />
      </Box>
    );
  }

  return (
    <Box sx={{ borderRadius: 3, p: 2.5, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 0, overflow: 'hidden' }}>
      <DashboardCardHeader
        icon={<HourglassEmptyOutlined />}
        color="#F59E0B"
        title={t('manager.pendingApprovals')}
        subtitle={t('manager.itemsNeedReview', { count: totalPending })}
        action={
          <Button
            size="small"
            onClick={() => navigate('/manager/requests')}
            sx={{ borderRadius: 2, flexShrink: 0, py: 0.4, px: 1.25, fontSize: 13, textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.viewAll')}
          </Button>
        }
      />

      <Box display="flex" flexDirection="column" gap={1}>
        {pendingRequests.slice(0, 5).map((req) => (
          <ApprovalRow key={req.id} id={req.id} employeeName={req.employeeName ?? req.employeeId}
            amount={req.amount} currency={req.currency} reason={req.reason} createdAt={req.createdAt} status={req.status}
            onApprove={onApproveRequest} onReject={onRejectRequest} />
        ))}
      </Box>

      {totalPending > 5 && (
        <Box textAlign="center" mt={1.5}>
          <Box onClick={() => navigate('/manager/requests')}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#145DB8', fontSize: 13, fontWeight: 600, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
            {t('manager.viewAllItems', { count: totalPending })}
            <ArrowForward sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
