import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const brandLogoSx = (accent: string) => ({
  width: 32,
  height: 32,
  borderRadius: 1.5,
  background: `linear-gradient(135deg, ${alpha(accent, 0.82)}, ${accent})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 800,
  flexShrink: 0,
  boxShadow: `0 3px 8px ${alpha(accent, 0.35)}`,
});

export const sectionLabelSx = {
  fontSize: 11,
  fontWeight: 700,
  color: 'text.disabled',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  px: 0.5,
  mb: 0.5,
} as const;

export const navItemSx = (theme: Theme, active: boolean, collapsed: boolean, accent?: string) => {
  const color = accent ?? theme.palette.primary.main;
  return {
    justifyContent: collapsed ? 'center' : 'flex-start',
    px: collapsed ? 0 : 1.5,
    py: 1,
    borderRadius: 1.5,
    gap: collapsed ? 0 : 1.5,
    fontSize: 13,
    minHeight: { xs: 44, sm: 40 },
    backgroundColor: active ? alpha(color, 0.09) : 'transparent',
    color: active ? color : 'text.secondary',
    fontWeight: active ? 600 : 500,
    boxShadow: active ? `inset 0 0 0 1px ${alpha(color, 0.18)}` : 'none',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      backgroundColor: active ? alpha(color, 0.09) : 'action.hover',
      color: active ? color : 'text.primary',
    },
    '& .MuiButton-startIcon': { mr: 0, '& .MuiSvgIcon-root': { fontSize: 20 } },
  } as const;
};
