import { create } from 'zustand';

interface NotificationState {
  viewedIds: string[];
  markAsRead: (notificationKey: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  viewedIds: [],
  markAsRead: (notificationKey) =>
    set((state) =>
      state.viewedIds.includes(notificationKey)
        ? state
        : { viewedIds: [...state.viewedIds, notificationKey] },
    ),
}));
