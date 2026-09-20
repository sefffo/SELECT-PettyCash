import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface DashboardTimelineCardProps {
  title: string;
  dateText: string;
  statusLabel?: string;
  statusColor?: string;
  amountText: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function DashboardTimelineCard({ title, dateText, statusLabel, statusColor, amountText, onClick, ariaLabel }: DashboardTimelineCardProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const color = statusColor ?? theme.palette.text.secondary;
  const tint = alpha(color, 0.08);
  const tintHover = alpha(color, 0.16);

  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 1, sm: 1.5 }, minWidth: 0, width: '100%' }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
        <Typography noWrap title={title} sx={{ fontSize: { xs: 12.5, sm: 13 }, fontWeight: 700, color: 'text.primary', lineHeight: 1.35 }}>
          {title}
        </Typography>
        <Typography noWrap title={`${dateText}${statusLabel ? ` · ${statusLabel}` : ''}`} sx={{ fontSize: { xs: 10.5, sm: 11 }, color: 'text.disabled', lineHeight: 1.45 }}>
          {dateText}
          {statusLabel && (
            <>
              {'  ·  '}
              <Box component="span" sx={{ color, fontWeight: 600 }}>
                {statusLabel}
              </Box>
            </>
          )}
        </Typography>
      </Box>
      <Typography
        sx={{
          flexShrink: 0,
          ml: 0.5,
          fontSize: { xs: 12, sm: 12.5 },
          fontWeight: 700,
          color: 'text.primary',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {amountText}
      </Typography>
      {onClick && (
        <ChevronRight
          sx={{
            flexShrink: 0,
            fontSize: { xs: 17, sm: 18 },
            color: 'text.disabled',
            transform: isRtl ? 'scaleX(-1)' : 'none',
          }}
        />
      )}
    </Box>
  );

  const rowSx = {
    display: 'block',
    width: '100%',
    minWidth: 0,
    textAlign: 'left',
    py: 0.75,
    px: { xs: 1.75, sm: 2 },
    borderLeft: '4px solid',
    borderColor: color,
    borderRadius: 0,
    backgroundColor: tint,
    ...(onClick
      ? {
          transition: 'background-color 0.15s ease',
          '&:hover': { backgroundColor: tintHover },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 1 },
        }
      : {}),
  } as const;

  if (onClick) {
    return (
      <ButtonBase component="div" role="button" tabIndex={0} focusRipple aria-label={ariaLabel} onClick={onClick} sx={rowSx}>
        {content}
      </ButtonBase>
    );
  }

  return <Box sx={rowSx}>{content}</Box>;
}