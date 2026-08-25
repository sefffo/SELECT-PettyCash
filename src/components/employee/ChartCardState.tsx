import { Box, Button, Typography } from '@mui/material';
import { Error, Replay } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { EmptyState, SkeletonLoader } from '@/components/shared';

interface ChartCardStateProps {
  loading: boolean;
  error: boolean;
  empty: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ChartCardState({ loading, error, empty, onRetry, emptyTitle, emptyDescription }: ChartCardStateProps) {
  const { t } = useTranslation();

  if (loading) {
    return <SkeletonLoader type="dashboard" count={1} />;
  }

  if (error) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 0.75,
          py: 3,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'error.main',
            mb: 0.5,
          }}
        >
          <Error sx={{ fontSize: 22 }} />
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
          {t('employee.chartLoadFailed')}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {t('employee.chartLoadFailedHint')}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            startIcon={<Replay sx={{ fontSize: 16 }} />}
            onClick={onRetry}
            sx={{ mt: 0.75, borderRadius: 2, fontSize: 12.5, textTransform: 'none' }}
          >
            {t('employee.retry')}
          </Button>
        )}
      </Box>
    );
  }

  if (empty) {
    return (
      <EmptyState
        icon="📊"
        title={emptyTitle ?? t('employee.noExpenseData')}
        description={emptyDescription ?? t('employee.noExpenseDataHint')}
      />
    );
  }

  return null;
}