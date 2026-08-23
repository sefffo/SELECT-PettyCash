import { Box, Button, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

interface DashboardCardFooterProps {
  meta?: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
  children?: ReactNode;
}

export function DashboardCardFooter({ meta, onViewAll, viewAllLabel, children }: DashboardCardFooterProps) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        flexWrap: 'wrap',
        mt: 1.5,
        pt: 1.25,
        borderTop: '1px solid',
        borderColor: 'divider',
        minHeight: 44,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        {meta && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meta}
          </Typography>
        )}
        {children}
      </Box>
      {onViewAll && (
        <Button
          onClick={onViewAll}
          endIcon={<ArrowForward sx={{ fontSize: 16, transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
          sx={{
            p: 0.5,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 600,
            color: 'primary.main',
            textTransform: 'none',
            borderRadius: 1.5,
            flexShrink: 0,
            ml: 'auto',
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          {viewAllLabel}
        </Button>
      )}
    </Box>
  );
}