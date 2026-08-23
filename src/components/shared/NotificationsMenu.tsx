import { useState, type ReactNode } from 'react';
import { Badge, Box, CircularProgress, Divider, IconButton, Popover, Typography, useTheme } from '@mui/material';
import { NotificationsNoneOutlined, NotificationsOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/api';
import { useUnreadNotifications } from '@/hooks/unreadNotifications';
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

interface NotificationsMenuProps {
  trigger?: (triggerProps: {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    unreadCount: number;
  }) => ReactNode;
}

export function NotificationsMenu({ trigger }: NotificationsMenuProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState<ApiNotification | null>(null);
  const { data, isLoading, isError } = useNotifications();
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const open = Boolean(anchorEl);
  const notifications = data ?? [];
  const unreadCount = useUnreadNotifications();
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  const handleOpenNotification = (notification: ApiNotification) => {
    markAsRead(getNotificationKey(notification));
    setSelected(notification);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);

  const triggerNode = trigger ? (
    trigger({ onClick: handleOpen, unreadCount })
  ) : (
    <IconButton
      size="small"
      aria-label={t('notification.title')}
      onClick={handleOpen}
      sx={{ width: { xs: 40, sm: 44 }, height: { xs: 40, sm: 44 }, borderRadius: 1.5, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
    >
      <Badge
        color="error"
        badgeContent={
          <motion.span
            key={badgeLabel}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {badgeLabel}
          </motion.span>
        }
        invisible={unreadCount === 0}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: 10,
            fontWeight: 700,
            height: 18,
            minWidth: 18,
            borderRadius: 9,
            padding: '0 4px',
            lineHeight: 1,
          },
        }}
      >
        <NotificationsOutlined sx={{ fontSize: 22 }} />
      </Badge>
    </IconButton>
  );

  return (
    <>
      {triggerNode}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              mt: 0.75,
              width: 360,
              maxWidth: '92vw',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: theme.shadows[5],
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box px={1.5} py={1} display="flex" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
            {t('notification.title')}
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                fontWeight: 700,
                fontSize: 11,
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
                minWidth: 22,
                textAlign: 'center',
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Box>
        <Divider />

        <Box sx={{ p: 0.5, maxHeight: 380, overflowY: 'auto' }}>
          {isLoading ? (
            <Box px={1.5} py={4} display="flex" justifyContent="center">
              <CircularProgress size={24} sx={{ color: '#145DB8' }} />
            </Box>
          ) : isError ? (
            <Box px={2} py={4} textAlign="center">
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {t('notification.loadFailed')}
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box px={2} py={4} textAlign="center">
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
            notifications.map((notification, index) => {
              const read = isNotificationRead(notification);
              const title = getNotificationTitle(notification);
              const subtitle = getNotificationMessage(notification);
              const date = getNotificationDate(notification);
              return (
                <Box
                  component={motion.div}
                  key={notification.Id ?? notification.NotificationId ?? index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                >
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenNotification(notification)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenNotification(notification);
                      }
                    }}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      px: 1.5,
                      py: 1.25,
                      mx: 0.25,
                      my: 0.25,
                      borderRadius: 1.5,
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
                    <Box minWidth={0} flex={1}>
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
                        <Typography noWrap sx={{ fontSize: 12, color: read ? 'text.disabled' : 'text.secondary', mt: 0.25 }}>
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
              );
            })
          )}
        </Box>
      </Popover>

      <NotificationDetailsDialog notification={selected} onClose={() => setSelected(null)} />
    </>
  );
}