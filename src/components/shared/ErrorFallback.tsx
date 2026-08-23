import { Box, Typography, Button } from '@mui/material';

interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      gap={2}
    >
      <Typography variant="h4" color="error">
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {error?.message ?? 'An unexpected error occurred'}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
