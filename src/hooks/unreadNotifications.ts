import { useNotifications } from '@/hooks/api';
import { useNotificationStore } from '@/store/notificationStore';
import { getNotificationKey, isNotificationRead } from '@/utils/notifications';

export function useUnreadNotifications(): number {
  const { data, totalUnread } = useNotifications();
  const viewedIds = useNotificationStore((s) => s.viewedIds);

  // Prefer the backend's total unread count when the paginated endpoint
  // provides one, so the badge is not limited to the currently loaded page.
  if (totalUnread !== null && totalUnread !== undefined) {
    return Math.max(0, totalUnread);
  }

  const notifications = data ?? [];
  return notifications.filter(
    (notification) => !isNotificationRead(notification) && !viewedIds.includes(getNotificationKey(notification)),
  ).length;
}