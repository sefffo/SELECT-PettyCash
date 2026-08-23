import { type ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
// @ts-expect-error stylis has no types
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useUIStore } from '@/store/uiStore';
import { lightTheme, darkTheme, rtlLightTheme, rtlDarkTheme } from './theme';

const cacheLtr = createCache({ key: 'vtx' });
const cacheRtl = createCache({
  key: 'vtx-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const locale = useUIStore((state) => state.locale);
  const mode = useUIStore((state) => state.mode);
  const isRtl = locale === 'ar';

  const theme = useMemo(() => {
    if (isRtl) return mode === 'dark' ? rtlDarkTheme : rtlLightTheme;
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [isRtl, mode]);
  const cache = isRtl ? cacheRtl : cacheLtr;

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [isRtl, locale]);

  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
