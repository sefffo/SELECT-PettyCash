import type { ReactNode } from 'react';
import { Box, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DarkModeOutlined, Language, LightModeOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/uiStore';
import { ChangePasswordCard } from './ChangePasswordCard';

const ACCENT = '#145DB8';

const sectionCardSx = {
  backgroundColor: 'background.paper',
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  p: 3,
  transition: 'box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  '&:hover': {
    boxShadow: '0 10px 28px rgba(7, 19, 33, 0.10)',
    transform: 'translateY(-1px)',
  },
} as const;

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          flexShrink: 0,
          background: `linear-gradient(135deg, ${alpha(ACCENT, 0.85)}, ${ACCENT})`,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 10px ${alpha(ACCENT, 0.28)}`,
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{subtitle}</Typography>
      </Box>
    </Box>
  );
}

interface SettingsPageProps {
  title: string;
  subtitle: string;
}

export function SettingsPage({ title, subtitle }: SettingsPageProps) {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);
  const mode = useUIStore((s) => s.mode);
  const setMode = useUIStore((s) => s.setMode);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>{title}</Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2.5} maxWidth={720}>
        <Box sx={sectionCardSx}>
          <SectionHeader
            icon={mode === 'dark' ? <DarkModeOutlined sx={{ fontSize: 20 }} /> : <LightModeOutlined sx={{ fontSize: 20 }} />}
            title={t('settings.appearance')}
            subtitle={t('nav.theme')}
          />

          <Box
            sx={{
              backgroundColor: 'surfaceLight',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 0.5,
            }}
          >
            <RadioGroup
              value={mode}
              onChange={(event) => setMode(event.target.value as 'light' | 'dark')}
              sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 0.25 }}
            >
              <FormControlLabel
                value="light"
                control={<Radio size="small" />}
                label={t('theme.light')}
                sx={{
                  fontSize: 13,
                  color: 'text.primary',
                  mx: 0,
                  px: 1,
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              />
              <FormControlLabel
                value="dark"
                control={<Radio size="small" />}
                label={t('theme.dark')}
                sx={{
                  fontSize: 13,
                  color: 'text.primary',
                  mx: 0,
                  px: 1,
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              />
            </RadioGroup>
          </Box>
        </Box>

        <Box sx={sectionCardSx}>
          <SectionHeader
            icon={<Language sx={{ fontSize: 20 }} />}
            title={t('settings.language')}
            subtitle={t('nav.language')}
          />

          <Select
            value={locale}
            onChange={(event) => setLocale(event.target.value as 'en' | 'ar')}
            size="small"
            fullWidth
            startAdornment={<Language sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />}
            sx={{ maxWidth: 280, fontSize: 13, borderRadius: 1.5 }}
          >
            <MenuItem value="en" sx={{ fontSize: 13 }}>English</MenuItem>
            <MenuItem value="ar" sx={{ fontSize: 13 }}>العربية</MenuItem>
          </Select>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.75 }}>
            {t('settings.appliesImmediately')}
          </Typography>
        </Box>

        <ChangePasswordCard
          title={t('settings.changePassword')}
          subtitle={t('settings.changePasswordSubtitle')}
          submitLabel={t('settings.changePassword')}
          sx={{ p: 3, mb: 0, transition: 'box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)', '&:hover': { boxShadow: '0 10px 28px rgba(7, 19, 33, 0.10)', transform: 'translateY(-1px)' } }}
        />
      </Box>
    </motion.div>
  );
}