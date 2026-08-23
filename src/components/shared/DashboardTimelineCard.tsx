import type { ReactNode } from 'react';
import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export type TimelineTone = 'success' | 'warning' | 'info' | 'error' | 'neutral';

interface DashboardTimelineCardProps {
  icon: ReactNode;
  tone: TimelineTone;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  dateText: string;
  amountText: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function DashboardTimelineCard({ icon, tone, title, subtitle, badge, dateText, amountText, onClick, ariaLabel }: DashboardTimelineCardProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const color = tone === 'neutral' ? theme.palette.text.secondary : theme.palette[tone].main;
  const bg = alpha(color, 0.12);
  const borderColor = alpha(color, 0.35);

  const content = (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Typography noWrap title={title} sx={{ fontSize: { xs: 12.5, sm: 13 }, fontWeight: 700, color: 'text.primary', flex: 1, minWidth: 0 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {badge}
          {onClick && (
            <ChevronRight
              sx={{
                fontSize: 18,
                color: 'text.disabled',
                transform: isRtl ? 'scaleX(-1)' : 'none',
                transition: 'color 0.2s ease',
                '.MuiButtonBase-root:hover &': { color: 'primary.main' },
              }}
            />
          )}
        </Box>
      </Box>
      {subtitle && (
        <Typography noWrap title={subtitle} sx={{ fontSize: { xs: 11, sm: 11.5 }, color: 'text.secondary', mt: 0.15 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: { xs: 0.75, sm: 0.9 } }}>
        <Typography sx={{ fontSize: { xs: 10.5, sm: 11 }, color: 'text.disabled' }}>{dateText}</Typography>
        <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
          {amountText}
        </Typography>
      </Box>
    </>
  );

  const cardSx = {
    display: 'block',
    width: '100%',
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
    borderRadius: 2,
    backgroundColor: 'surfaceLight',
    border: '1px solid',
    borderColor: 'divider',
    p: { xs: 1.1, sm: 1.4 },
  } as const;

  return (
    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.25 }, alignItems: 'flex-start', position: 'relative', minWidth: 0 }}>
      <Box
        sx={{
          width: { xs: 30, sm: 32 },
          height: { xs: 30, sm: 32 },
          borderRadius: '50%',
          flexShrink: 0,
          zIndex: 1,
          mt: { xs: 0.9, sm: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          color,
          border: '1px solid',
          borderColor,
          '& .MuiSvgIcon-root': { fontSize: { xs: 15, sm: 16 } },
        }}
      >
        {icon}
      </Box>
      {onClick ? (
        <ButtonBase
          component="div"
          role="button"
          tabIndex={0}
          focusRipple
          aria-label={ariaLabel}
          onClick={onClick}
          sx={{
            ...cardSx,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: alpha(color, 0.55),
              boxShadow: `0 2px 10px ${alpha(color, 0.14)}`,
            },
            '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          }}
        >
          {content}
        </ButtonBase>
      ) : (
        <Box sx={cardSx}>{content}</Box>
      )}
    </Box>
  );
}