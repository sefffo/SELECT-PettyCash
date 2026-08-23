import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({ message = 'Loading...', size = 40 }: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      gap={2}
    >
      <CircularProgress size={size} sx={{ color: '#145DB8' }} />
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
}
