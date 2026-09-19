import type { ApiNotification, NotificationPageResult } from '@/types/api';

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
  // 'finance', 'transaction', 'sent', 'disburs', 'custody' added so Finance-originated
  // notifications are always classified as payment and get the blue Payments icon.
  { kind: 'payment', keywords: ['payment', 'proof', 'paid', 'transfer', 'receipt', 'payout', 'finance', 'transaction', 'sent', 'disburs', 'custody', 'advance'] },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function firstArray(payload: Record<string, unknown>): ApiNotification[] | undefined {
  for (const key of [
    'Items',
    'Notifications',
    'Records',
    'Results',
    'Data',
    'items',
    'notifications',
    'records',
    'results',
    'data',
  ]) {
    const candidate = payload[key];
    if (Array.isArray(candidate)) return candidate as ApiNotification[];
  }
  return undefined;
}

function firstNumber(payload: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function firstBoolean(payload: Record<string, unknown>, ...keys: string[]): boolean | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
  }
  return null;
}

/**
 * Normalizes the raw backend payload for a lazy-loaded notification endpoint
 * into the shared `NotificationPageResult`. Handles both a bare array (the
 * legacy unpaged shape) and an envelope object with pagination metadata.
 *
 * The live `Employee/GetNotifications` / `Manager/GetNotifications` endpoints
 * honor `Page`/`PageSize` by slicing, but return a BARE ARRAY with no
 * pagination metadata (`HasMore`/`Total`/`NextPage` are absent). For that
 * shape (and for envelope payloads that also omit the metadata) `hasMore` is
 * inferred from the page length: a page that returned the full requested
 * `pageSize` may have more pages, a short page (or an empty one) is the last.
 *
 * Field names are probed against the backend's documented (PascalCase) and
 * conventional (camelCase) aliases so the adapter keeps working while the
 * exact pagination field names are confirmed against the live API.
 */
export function normalizeNotificationsPage(payload: unknown, pageSize?: number): NotificationPageResult {
  const inferredHasMore = (items: ApiNotification[], pageSizeValue: number | undefined): boolean =>
    pageSizeValue !== undefined && items.length > 0 && items.length >= pageSizeValue;

  if (Array.isArray(payload)) {
    const items = payload as ApiNotification[];
    return { items, hasMore: inferredHasMore(items, pageSize), nextPage: null, totalUnread: null };
  }
  if (!isRecord(payload)) {
    return { items: [], hasMore: false, nextPage: null, totalUnread: null };
  }

  const items = firstArray(payload) ?? [];
  const hasMoreFlag = firstBoolean(payload, 'HasMore', 'hasMore');
  const nextPageValue = firstNumber(payload, 'NextPage', 'nextPage');
  const total = firstNumber(payload, 'Total', 'TotalCount', 'TotalRecords', 'total', 'totalCount');
  const currentPage = firstNumber(payload, 'Page', 'PageIndex', 'page', 'pageIndex');
  const pageCount = firstNumber(payload, 'PageCount', 'TotalPages', 'pageCount', 'totalPages');
  const totalUnread = firstNumber(payload, 'UnreadCount', 'TotalUnread', 'Unread', 'unreadCount', 'totalUnread');

  let hasMore: boolean;
  if (hasMoreFlag !== null) {
    hasMore = hasMoreFlag;
  } else if (nextPageValue !== null) {
    hasMore = true;
  } else if (total !== null && items.length > 0) {
    hasMore = items.length < total;
  } else if (pageCount !== null && currentPage !== null) {
    hasMore = currentPage < pageCount;
  } else {
    hasMore = inferredHasMore(items, pageSize);
  }

  return { items, hasMore, nextPage: nextPageValue, totalUnread };
}
