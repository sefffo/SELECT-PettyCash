import { createTheme, type Shadows, type ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    glass: string;
    surface: string;
    surfaceLight: string;
  }
  interface PaletteOptions {
    glass?: string;
    surface?: string;
    surfaceLight?: string;
  }
}

const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: { fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 },
  h2: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
  h3: { fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h4: { fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h5: { fontSize: 15, fontWeight: 600 },
  h6: { fontSize: 13, fontWeight: 600 },
  subtitle1: { fontSize: 15, fontWeight: 500 },
  subtitle2: { fontSize: 13, fontWeight: 500 },
  body1: { fontSize: 15, lineHeight: 1.6 },
  body2: { fontSize: 13, lineHeight: 1.5 },
  caption: { fontSize: 13, lineHeight: 1.4 },
};

const baseShadows: Shadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.04), 0px 1px 1px rgba(0, 0, 0, 0.02)',
  '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 1px 2px rgba(0, 0, 0, 0.04)',
  '0px 4px 8px rgba(0, 0, 0, 0.06), 0px 2px 4px rgba(0, 0, 0, 0.04)',
  '0px 6px 12px rgba(0, 0, 0, 0.08), 0px 4px 8px rgba(0, 0, 0, 0.04)',
  '0px 10px 20px rgba(0, 0, 0, 0.10), 0px 6px 12px rgba(0, 0, 0, 0.06)',
  '0px 14px 28px rgba(0, 0, 0, 0.12), 0px 8px 16px rgba(0, 0, 0, 0.06)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 4px 12px rgba(0, 0, 0, 0.08)',
  '0px 0px 0px 1px rgba(128, 138, 158, 0.12) inset',
  '0px 0px 0px 1px rgba(128, 138, 158, 0.18)',
] as Shadows;

/** Neutral interaction colors that read correctly on both light and dark surfaces. */
const neutralHover = 'rgba(128, 138, 158, 0.10)';
const neutralActive = 'rgba(128, 138, 158, 0.14)';
const inputSurface = 'rgba(128, 138, 158, 0.06)';

const sharedComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        minHeight: '100vh',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(20, 93, 184, 0.14) 0%, transparent 60%),' +
          'radial-gradient(ellipse 60% 40% at 100% 100%, rgba(56, 189, 248, 0.05) 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 35% at 0% 100%, rgba(34, 197, 94, 0.04) 0%, transparent 60%)',
        backgroundAttachment: 'fixed',
        '&:focus-visible': { outline: 'none' },
        '*:focus-visible': {
          outline: '2px solid #38BDF8',
          outlineOffset: 2,
          borderRadius: 6,
        },
        '&::-webkit-scrollbar': { width: 8, height: 8 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(128, 138, 158, 0.35)',
          borderRadius: 8,
          '&:hover': { background: 'rgba(128, 138, 158, 0.5)' },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(128, 138, 158, 0.35) transparent',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 10,
        padding: '10px 20px',
        fontSize: 13,
        minHeight: 40,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:active': { transform: 'scale(0.98)' },
        '@media (pointer: coarse)': { minHeight: 44 },
      },
      contained: {
        boxShadow: '0px 2px 8px rgba(20, 93, 184, 0.2)',
        '&:hover': {
          boxShadow: '0px 4px 14px rgba(20, 93, 184, 0.3)',
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'translateY(0px)' },
      },
      outlined: {
        borderColor: 'rgba(128, 138, 158, 0.4)',
        '&:hover': {
          borderColor: 'rgba(128, 138, 158, 0.6)',
          backgroundColor: neutralHover,
        },
      },
      sizeSmall: {
        padding: '6px 14px',
        fontSize: 12,
        minHeight: 32,
        '@media (pointer: coarse)': { minHeight: 40 },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        '@media (pointer: coarse)': { minWidth: 44, minHeight: 44 },
        '&:hover': { backgroundColor: neutralHover },
        '&:active': { backgroundColor: neutralActive },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0px 4px 12px rgba(15, 30, 54, 0.06)',
        backgroundImage: 'none',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        fontSize: 12,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          backgroundColor: inputSurface,
          transition: 'all 0.2s ease',
          '&:hover': { backgroundColor: neutralHover },
          '&.Mui-focused': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 18, padding: 8 },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 500,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        transition: 'all 0.2s ease',
        '@media (pointer: coarse)': { minHeight: 44 },
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: '0px 6px 16px rgba(20, 93, 184, 0.35)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': { boxShadow: '0px 10px 24px rgba(20, 93, 184, 0.45)', transform: 'translateY(-2px)' },
      },
    },
  },
};

export const lightPalette = {
  mode: 'light' as const,
  primary: { main: '#145DB8', light: '#2E7BE0', dark: '#0D4A92', contrastText: '#FFFFFF' },
  secondary: { main: '#0E7490', light: '#0891B2', dark: '#155E75', contrastText: '#FFFFFF' },
  success: { main: '#16A34A', light: '#22C55E', dark: '#15803D' },
  warning: { main: '#D97706', light: '#F59E0B', dark: '#B45309' },
  error: { main: '#DC2626', light: '#EF4444', dark: '#B91C1C' },
  info: { main: '#0E7490', light: '#0891B2', dark: '#155E75' },
  background: { default: '#F3F5F9', paper: '#FCFCFD' },
  text: {
    primary: '#1B2430',
    secondary: 'rgba(27, 36, 48, 0.68)',
    disabled: 'rgba(27, 36, 48, 0.38)',
  },
  divider: 'rgba(23, 43, 77, 0.10)',
  action: { hover: 'rgba(23, 43, 77, 0.06)', selected: 'rgba(20, 93, 184, 0.10)', active: 'rgba(23, 43, 77, 0.16)' },
  glass: 'rgba(255, 255, 255, 0.72)',
  surface: '#FCFCFD',
  surfaceLight: '#E9EDF3',
};

export const darkPalette = {
  mode: 'dark' as const,
  primary: { main: '#145DB8', light: '#2E7BE0', dark: '#0D4A92', contrastText: '#FFFFFF' },
  secondary: { main: '#38BDF8', light: '#7DD3FC', dark: '#0EA5E9' },
  success: { main: '#22C55E', light: '#4ADE80', dark: '#16A34A' },
  warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
  error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
  info: { main: '#38BDF8', light: '#7DD3FC', dark: '#0EA5E9' },
  background: { default: '#0D1420', paper: '#17222F' },
  text: {
    primary: '#F2F5F9',
    secondary: 'rgba(242, 245, 249, 0.72)',
    disabled: 'rgba(242, 245, 249, 0.36)',
  },
  divider: 'rgba(255, 255, 255, 0.08)',
  action: { hover: 'rgba(255, 255, 255, 0.08)', selected: 'rgba(20, 93, 184, 0.16)', active: 'rgba(255, 255, 255, 0.14)' },
  glass: 'rgba(23, 34, 47, 0.72)',
  surface: '#17222F',
  surfaceLight: '#223246',
};

function buildTheme(palette: typeof lightPalette | typeof darkPalette, direction: 'ltr' | 'rtl'): ReturnType<typeof createTheme> {
  return createTheme({
    direction,
    shape: { borderRadius: 12 },
    palette: { ...palette },
    typography,
    spacing: 8,
    breakpoints: {
      values: { xs: 0, sm: 640, md: 900, lg: 1200, xl: 1440 },
    },
    shadows: baseShadows.map((s) =>
      s === 'none' ? 'none' : s.replace(/rgba\(0,\s*0,\s*0/gi, 'rgba(0, 0, 0'),
    ) as Shadows,
    components: {
      ...sharedComponents,
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              palette.mode === 'dark'
                ? '0px 4px 12px rgba(0, 0, 0, 0.2), 0px 0px 0px 1px rgba(255, 255, 255, 0.04)'
                : '0px 4px 12px rgba(15, 30, 54, 0.06), 0px 0px 0px 1px rgba(15, 30, 54, 0.03)',
            border: 'none',
            '&:hover': {
              boxShadow:
                palette.mode === 'dark'
                  ? '0px 8px 24px rgba(0, 0, 0, 0.3), 0px 0px 0px 1px rgba(255, 255, 255, 0.07)'
                  : '0px 8px 24px rgba(15, 30, 54, 0.10), 0px 0px 0px 1px rgba(15, 30, 54, 0.05)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
    },
  } as ThemeOptions);
}

export const lightTheme = buildTheme(lightPalette, 'ltr');
export const darkTheme = buildTheme(darkPalette, 'ltr');
export const rtlLightTheme = buildTheme(lightPalette, 'rtl');
export const rtlDarkTheme = buildTheme(darkPalette, 'rtl');
