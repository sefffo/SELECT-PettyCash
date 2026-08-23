import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface DashboardCardHeaderProps {
  icon: ReactNode;
  color?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function DashboardCardHeader({ icon, color = '#145DB8', title, subtitle, action }: DashboardCardHeaderProps) {
  return (
    <Box display="flex" alignItems="center" gap={1.25} mb={1.75} flexWrap="wrap" rowGap={1}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2.5,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.72)})`,
          color: '#fff',
          boxShadow: `0px 4px 12px ${alpha(color, 0.35)}`,
          '& .MuiSvgIcon-root': { fontSize: 21 },
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0} flex={1}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{action}</Box>}
    </Box>
  );
}