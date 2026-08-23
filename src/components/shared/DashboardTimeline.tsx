import type { ReactNode } from 'react';
import { Box } from '@mui/material';

interface DashboardTimelineProps {
  children: ReactNode;
}

export function DashboardTimeline({ children }: DashboardTimelineProps) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          insetInlineStart: { xs: 14, sm: 15 },
          top: 6,
          bottom: 6,
          width: 2,
          backgroundColor: 'divider',
          borderRadius: 1,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.25 } }}>{children}</Box>
    </Box>
  );
}