import { useState } from 'react';
import { Box, Button, CircularProgress, Divider, Typography } from '@mui/material';
import { NotificationsNoneOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from '@/hooks/api';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDate } from '@/utils/format';
import {
  getNotificationDate,
  getNotificationKey,
  getNotificationKind,
  getNotificationMessage,
  getNotificationTitle,
  isNotificationRead,
} from '@/utils/notifications';
import { NotificationIcon } from './NotificationIcon';
import { NotificationDetailsDialog } from './NotificationDetailsDialog';
import type { ApiNotification } from '@/types/api';

interface NotificationsPageProps {
  titleKey: string;
  subtitleKey: string;
}

export function NotificationsPage({ titleKey, subtitleKey }: NotificationsPageProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useNotifications();
  const viewedIds = useNotificationStore((s) => s.viewedIds);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const [selected, setSelected] = useState<ApiNotification | null>(null);

  const notifications = data ?? [];
  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification) && !viewedIds.includes(getNotificationKey(notification)),
  ).length;
  const markOneAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleOpen = (notification: ApiNotification) => {
    setSelected(notification);
    const key = getNotificationKey(notification);
    if (isNotificationRead(notification) || viewedIds.includes(key)) return;
    markAsRead(key);
    const notificationId = notification.Id ?? notification.NotificationId;
    if (notificationId) {
      markOneAsRead.mutate(notificationId);
    }
  };

  const handleMarkAllRead = () => {
    if (markAllAsRead.isPending || unreadCount === 0) return;
    for (const notification of notifications) {
      markAsRead(getNotificationKey(notification));
    }
    markAllAsRead.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ width: '100%' }}>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap" sx={{ minWidth: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h2" sx={{ color: 'text.primary' }}>{t(titleKey)}</Typography>
          <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>
            {t(subtitleKey)}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: 'primary.main',
              borderRadius: 1.5,
              px: 1.5,
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            {t('notification.markAllRead')}
          </Button>
        )}
      </Box>

      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: 640,
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <Box px={1.5} py={5} display="flex" justifyContent="center">
            <CircularProgress size={28} sx={{ color: '#145DB8' }} />
          </Box>
        ) : isError ? (
          <Box px={2} py={5} textAlign="center">
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {t('notification.loadFailed')}
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box px={2} py={5} textAlign="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                mx: 'auto',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(20, 93, 184, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
                color: 'primary.main',
              }}
            >
              <NotificationsNoneOutlined sx={{ fontSize: 28 }} />
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {t('notification.noNotifications')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('notification.noNotificationsHint')}
            </Typography>
          </Box>
        ) : (
          <Box>
            {notifications.map((notification, index) => {
              const read = isNotificationRead(notification);
              const title = getNotificationTitle(notification);
              const subtitle = getNotificationMessage(notification);
              const date = getNotificationDate(notification);
              return (
                <Box key={notification.Id ?? notification.NotificationId ?? index}>
                  {index > 0 && <Divider sx={{ mx: { xs: 1.5, sm: 2.5 } }} />}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpen(notification)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleOpen(notification);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        gap: { xs: 1, sm: 1.5 },
                        px: { xs: 1.5, sm: 2.5 },
                        py: { xs: 1.5, sm: 1.5 },
                        cursor: 'pointer',
                        outline: 'none',
                        backgroundColor: read ? 'transparent' : 'rgba(20, 93, 184, 0.06)',
                        transition:
                          'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          backgroundColor: read ? 'action.hover' : 'rgba(20, 93, 184, 0.09)',
                          boxShadow: '0 2px 8px rgba(7, 19, 33, 0.06)',
                        },
                        '&:focus-visible': { backgroundColor: 'action.hover' },
                      }}
                    >
                      <NotificationIcon kind={getNotificationKind(notification)} />
                      <Box minWidth={0} flex={1} sx={{ width: 0 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            noWrap
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: 13,
                              fontWeight: read ? 500 : 700,
                              color: read ? 'text.secondary' : 'text.primary',
                              lineHeight: 1.35,
                            }}
                          >
                            {title}
                          </Typography>
                          {!read && (
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                flexShrink: 0,
                                backgroundColor: 'error.main',
                                boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)',
                              }}
                            />
                          )}
                        </Box>
                        {subtitle && (
                          <Typography sx={{ fontSize: 12, color: read ? 'text.disabled' : 'text.secondary', mt: 0.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {subtitle}
                          </Typography>
                        )}
                        {date && (
                          <Typography sx={{ fontSize: 11, color: read ? 'text.disabled' : 'text.secondary', mt: 0.5 }}>
                            {formatDate(date)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <NotificationDetailsDialog notification={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}
