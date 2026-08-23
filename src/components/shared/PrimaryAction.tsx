import { Box, Button } from '@mui/material';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface PrimaryActionButton {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'contained' | 'outlined';
  disabled?: boolean;
}

interface PrimaryActionProps {
  actions: PrimaryActionButton[];
}

export function PrimaryAction({ actions }: PrimaryActionProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end', mb: 3 }}>
      {actions.map((action) => (
        <Button
          key={action.label}
          component={motion.button}
          whileTap={{ scale: 0.97 }}
          variant={action.variant ?? 'contained'}
          disabled={action.disabled}
          startIcon={action.icon}
          onClick={action.onClick}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            fontSize: 13.5,
            textTransform: 'none',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
}