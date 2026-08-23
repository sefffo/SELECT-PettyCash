import { Box, Button, Chip, Dialog, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import { Close, Launch } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import {
  getNotificationDate,
  getNotificationKey,
  getNotificationKind,
  getNotificationMessage,
  getNotificationRequestId,
  getNotificationTitle,
  isNotificationRead,
} from '@/utils/notifications';
import { NotificationIcon } from './NotificationIcon';
import type { ApiNotification } from '@/types/api';

interface NotificationDetailsDialogProps {
  notification: ApiNotification | null;
  onClose: () => void;
}

function formatFullDate(raw: string, locale: string): string {
  const loc = locale === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(raw));
}

interface MetaRowProps {
  label: string;
  value: string;
  action?: React.ReactNode;
}

function MetaRow({ label, value, action }: MetaRowProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={1}>
      <Box minWidth={0}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.03 }}>
          {label}
        </Typography>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', mt: 0.25 }}>
          {value}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

export function NotificationDetailsDialog({ notification, onClose }: NotificationDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const viewedIds = useNotificationStore((s) => s.viewedIds);

  const open = notification !== null;
  const read = notification !== null && (isNotificationRead(notification) || viewedIds.includes(getNotificationKey(notification)));

  const handleViewRequest = () => {
    if (!notification) return;
    const requestId = getNotificationRequestId(notification);
    if (!requestId) return;
    onClose();
    navigate(`/manager/requests/${requestId}`);
  };

  return (
    <AnimatePresence>
      {open && notification && (
        <Dialog
          open={open}
          onClose={onClose}
          slots={{
            transition: (props) => (
              <motion.div
                {...props}
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 8 }}
                transition={{ duration: 0.2 }}
              />
            ),
          }}
          slotProps={{
            backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
            paper: {
              sx: {
                borderRadius: 3,
                p: 1,
                maxWidth: { xs: 'calc(100vw - 32px)', sm: 440 },
                width: '100%',
                m: 2,
                backgroundImage: 'none',
              },
            },
          }}
        >
          <DialogContent sx={{ py: 1.5, px: 2, maxHeight: 'min(72vh, 600px)', overflowY: 'auto' }}>
            <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
              <NotificationIcon kind={getNotificationKind(notification)} size="medium" />
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: 'text.primary', lineHeight: 1.35, pt: 0.5 }}>
                {getNotificationTitle(notification) || t('notification.details')}
              </Typography>
              <IconButton
                onClick={onClose}
                aria-label={t('common.close')}
                size="small"
                sx={{ width: 32, height: 32, borderRadius: 1.5, color: 'text.secondary', flexShrink: 0, '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Chip
              size="small"
              label={read ? t('notification.read') : t('notification.unread')}
              sx={{
                mb: 1.5,
                backgroundColor: read
                  ? 'rgba(100, 116, 139, 0.15)'
                  : 'rgba(239, 68, 68, 0.12)',
                color: read ? '#64748B' : '#EF4444',
                fontWeight: 600,
                borderRadius: 1,
                height: 24,
                fontSize: 11,
                px: 1,
              }}
            />

            {getNotificationMessage(notification) && (
              <Typography
                sx={{
                  fontSize: 13.5,
                  color: 'text.secondary',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                {getNotificationMessage(notification)}
              </Typography>
            )}

            {getNotificationMessage(notification) && <Divider sx={{ mb: 1.5 }} />}

            <Box
              sx={{
                backgroundColor: 'background.default',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {getNotificationDate(notification) && (
                <MetaRow
                  label={t('notification.date')}
                  value={formatFullDate(getNotificationDate(notification) as string, i18n.language)}
                />
              )}
              {notification.Type && <MetaRow label={t('notification.type')} value={notification.Type} />}
              {getNotificationRequestId(notification) && (
                <MetaRow
                  label={t('notification.relatedRequest')}
                  value={getNotificationRequestId(notification) as string}
                  action={
                    role === 'manager' ? (
                      <Button
                        size="small"
                        variant="text"
                        endIcon={<Launch sx={{ fontSize: 14 }} />}
                        onClick={handleViewRequest}
                        sx={{ borderRadius: 1.5, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                      >
                        {t('notification.viewRequest')}
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{ borderRadius: 2, py: 1, mt: 2, fontSize: 13 }}
            >
              {t('common.close')}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}