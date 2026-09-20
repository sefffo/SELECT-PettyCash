import type { ReactNode } from 'react';
import { Box } from '@mui/material';

interface DashboardTimelineProps {
  children: ReactNode;
}

export function DashboardTimeline({ children }: DashboardTimelineProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1 } }}>{children}</Box>
  );
}