import { useNotifications } from '@/hooks/api';
import { useNotificationStore } from '@/store/notificationStore';
import { getNotificationKey, isNotificationRead } from '@/utils/notifications';

export function useUnreadNotifications(): number {
  const { data } = useNotifications();
  const viewedIds = useNotificationStore((s) => s.viewedIds);
  const notifications = data ?? [];
  return notifications.filter(
    (notification) => !isNotificationRead(notification) && !viewedIds.includes(getNotificationKey(notification)),
  ).length;
}