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
    <Box display="flex" alignItems="center" gap={1.25} mb={2} flexWrap="wrap" rowGap={1}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          backgroundColor: alpha(color, 0.1),
          '& .MuiSvgIcon-root': { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0} flex={1}>
        <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: 'text.primary' }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{action}</Box>}
    </Box>
  );
}