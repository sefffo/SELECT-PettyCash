import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      px={3}
      textAlign="center"
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          backgroundColor: 'rgba(20, 93, 184, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
          fontSize: 34,
          lineHeight: 1,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary', maxWidth: 280, mb: 2 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
