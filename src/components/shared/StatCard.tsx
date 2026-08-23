import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  index?: number;
}

export function StatCard({ title, value, subtitle, icon, color = '#145DB8', index = 0 }: StatCardProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: `${color}44`,
          boxShadow: '0px 8px 20px rgba(15, 30, 54, 0.10)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color,
          '& .MuiSvgIcon-root': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0} flex={1}>
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: 12,
              color: 'text.disabled',
              fontWeight: 400,
              mt: 0.25,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
