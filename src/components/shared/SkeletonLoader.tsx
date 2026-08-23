import { Box, Skeleton } from '@mui/material';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'dashboard';
  count?: number;
}

export function SkeletonLoader({ type = 'card', count = 3 }: SkeletonLoaderProps) {
  if (type === 'list') {
    return (
      <Box display="flex" flexDirection="column" gap={1.5}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} display="flex" alignItems="center" gap={1.5}>
            <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: 'surfaceLight' }} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'surfaceLight' }} />
              <Skeleton variant="text" width="40%" height={14} sx={{ bgcolor: 'surfaceLight' }} />
            </Box>
            <Skeleton variant="rounded" width={60} height={24} sx={{ bgcolor: 'surfaceLight', borderRadius: 1.5 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'dashboard') {
    return (
      <Box display="flex" flexDirection="column" gap={2.5}>
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3, bgcolor: 'surfaceLight' }} />
        <Box display="flex" gap={1.5}>
          <Skeleton variant="rounded" height={84} sx={{ borderRadius: 3, bgcolor: 'surfaceLight', flex: 1 }} />
          <Skeleton variant="rounded" height={84} sx={{ borderRadius: 3, bgcolor: 'surfaceLight', flex: 1 }} />
        </Box>
        <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: 'surfaceLight' }} />
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} display="flex" gap={1.5}>
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, bgcolor: 'surfaceLight' }} />
            <Box flex={1}>
              <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'surfaceLight' }} />
              <Skeleton variant="text" width="50%" height={12} sx={{ bgcolor: 'surfaceLight' }} />
            </Box>
            <Skeleton variant="text" width={60} height={16} sx={{ bgcolor: 'surfaceLight' }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3, bgcolor: 'surfaceLight' }} />
      ))}
    </Box>
  );
}
