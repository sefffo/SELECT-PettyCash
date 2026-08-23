import type { ApiNotification } from '@/types/api';

export type NotificationKind =
  | 'approval'
  | 'rejection'
  | 'request'
  | 'payment'
  | 'budget'
  | 'team'
  | 'update'
  | 'default';

const KIND_RULES: { kind: NotificationKind; keywords: string[] }[] = [
  { kind: 'approval', keywords: ['approv', 'accept', 'confirm', 'success', 'approved'] },
  { kind: 'rejection', keywords: ['reject', 'declin', 'denied', 'cancel', 'rejected'] },
  { kind: 'payment', keywords: ['payment', 'proof', 'paid', 'transfer', 'receipt', 'payout'] },
  { kind: 'request', keywords: ['request', 'submit', 'created', 'new'] },
  { kind: 'budget', keywords: ['budget', 'float', 'balance', 'wallet', 'limit', 'fund'] },
  { kind: 'team', keywords: ['user', 'employee', 'department', 'team', 'member', 'manager', 'role'] },
  { kind: 'update', keywords: ['update', 'status', 'changed', 'info'] },
];

export function getNotificationTitle(notification: ApiNotification): string {
  return notification.Title ?? notification.Message ?? '';
}

export function getNotificationMessage(notification: ApiNotification): string | null {
  return notification.Title && notification.Message ? notification.Message : null;
}

export function isNotificationRead(notification: ApiNotification): boolean {
  return Boolean(notification.IsRead ?? notification.Read);
}

export function getNotificationKey(notification: ApiNotification): string {
  const id = notification.Id ?? notification.NotificationId;
  if (id) return id;
  return [notification.Title ?? '', notification.DateCreated ?? notification.CreatedAt ?? notification.Date ?? ''].join('|');
}

export function getNotificationDate(notification: ApiNotification): string | null {
  const raw = notification.DateCreated ?? notification.CreatedAt ?? notification.Date;
  if (!raw) return null;
  return Number.isNaN(new Date(raw).getTime()) ? null : raw;
}

export function getNotificationRequestId(notification: ApiNotification): string | null {
  return notification.RequestId ?? notification.RelatedRequestId ?? null;
}

export function getNotificationRecipientId(notification: ApiNotification): string | null {
  return (
    notification.UserId ??
    notification.TargetUserId ??
    notification.RecipientId ??
    notification.EmployeeId ??
    null
  );
}

/**
 * Scopes a globally returned notification list to the authenticated user.
 * Rows carrying a recipient identifier are kept only when it matches the
 * current user; rows without any recipient identifier are treated as
 * unscoped/global and are kept rather than dropped.
 */
export function filterNotificationsForCurrentUser(
  notifications: ApiNotification[],
  userId: string | null | undefined,
): ApiNotification[] {
  if (!userId) return [];
  const normalizedUserId = userId.trim().toLowerCase();
  return notifications.filter((notification) => {
    const recipientId = getNotificationRecipientId(notification);
    return (
      recipientId === null ||
      recipientId.trim().toLowerCase() === normalizedUserId
    );
  });
}

export function getNotificationKind(notification: ApiNotification): NotificationKind {
  const haystack = [notification.Type, notification.Title, notification.Message]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();
  const match = KIND_RULES.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)));
  return match?.kind ?? 'default';
}
