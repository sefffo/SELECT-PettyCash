import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n/config';
import { STORAGE_KEYS } from '@/utils/constants';

type Locale = 'en' | 'ar';
type ThemeMode = 'light' | 'dark';

interface UIState {
  sidebarOpen: boolean;
  locale: Locale;
  mode: ThemeMode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLocale: (locale: Locale) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      locale: 'en',
      mode: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setLocale: (locale: Locale) => {
        i18n.changeLanguage(locale);
        set({ locale });
      },
      setMode: (mode: ThemeMode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: STORAGE_KEYS.THEME_MODE,
      partialize: (state) => ({ locale: state.locale, mode: state.mode }),
    },
  ),
);
