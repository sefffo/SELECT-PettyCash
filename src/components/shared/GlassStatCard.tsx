import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import { TrendingUpRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedNumber } from './AnimatedNumber';
import { formatCurrency } from '@/utils/format';

interface GlassStatCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  color: string;
  value: number | null;
  index?: number;
  format?: 'count' | 'currency';
  badgeLabel?: string;
  sx?: SystemStyleObject;
}

export function GlassStatCard({
  title,
  subtitle,
  icon,
  color,
  value,
  index = 0,
  format = 'count',
  badgeLabel,
  sx,
}: GlassStatCardProps) {
  const { t } = useTranslation();

  const display = value === null ? '—' : format === 'currency' ? (
    <AnimatedNumber value={value} formatFn={(n) => formatCurrency(Math.round(n))} />
  ) : (
    <AnimatedNumber value={value} formatFn={(n) => `${Math.round(n)}`} />
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      sx={[
        {
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          minWidth: 0,
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            borderColor: alpha(color, 0.4),
            boxShadow: `0px 10px 28px ${alpha(color, 0.12)}`,
          },
        },
        ...(sx ? [sx] : []),
      ]}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          insetInlineEnd: -50,
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(color, 0.09)}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5} gap={1}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.72)})`,
            boxShadow: `0px 4px 12px ${alpha(color, 0.35)}`,
            '& .MuiSvgIcon-root': { fontSize: 20 },
          }}
        >
          {icon}
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.75,
            py: 0.25,
            borderRadius: 1.5,
            backgroundColor: alpha(color, 0.1),
            color,
            flexShrink: 0,
          }}
        >
          <TrendingUpRounded sx={{ fontSize: 12 }} />
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {badgeLabel ?? t('finance.live')}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{
        fontSize: { xs: 20, sm: 23 },
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.15,
        mb: 0.25,
        color: 'text.primary',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {display}
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 0.1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}