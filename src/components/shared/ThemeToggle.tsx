import { IconButton, Tooltip, type SxProps, type Theme } from '@mui/material';
import { LightModeOutlined, DarkModeOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/uiStore';

interface ThemeToggleProps {
  sx?: SxProps<Theme>;
}

export function ThemeToggle({ sx }: ThemeToggleProps) {
  const { t } = useTranslation();
  const mode = useUIStore((s) => s.mode);
  const toggleMode = useUIStore((s) => s.toggleMode);
  const isDark = mode === 'dark';

  return (
    <Tooltip title={t('theme.toggleTheme')}>
      <IconButton
        onClick={toggleMode}
        aria-label={t('theme.toggleTheme')}
        sx={{
          borderRadius: 1.5,
          color: 'text.secondary',
          transition: 'color 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
          ...sx,
        }}
      >
        <motion.span
          key={mode}
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-flex' }}
        >
          {isDark ? <LightModeOutlined sx={{ fontSize: 18 }} /> : <DarkModeOutlined sx={{ fontSize: 18 }} />}
        </motion.span>
      </IconButton>
    </Tooltip>
  );
}