import { Box, Typography, Avatar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const todayLabel = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

interface WelcomeHeaderProps {
  subtitleKey: string;
  fallbackChar: string;
}

export function WelcomeHeader({ subtitleKey, fallbackChar }: WelcomeHeaderProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <Box
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative', zIndex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: { xs: 2, sm: 3 },
        }}
      >
        <Box display="flex" gap={2} alignItems="center" minWidth={0}>
          <Avatar
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              borderRadius: 2,
              backgroundColor: '#145DB8',
              fontSize: { xs: 16, sm: 20 },
              fontWeight: 700, color: 'white',
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0) ?? fallbackChar}
          </Avatar>
          <Box minWidth={0}>
            <Typography sx={{ color: 'text.secondary', fontSize: { xs: 12.5, sm: 13 }, mb: 0.25, fontWeight: 500 }}>
              {todayLabel()}
            </Typography>
            <Typography sx={{ color: 'text.primary', fontSize: { xs: 20, sm: 22 }, fontWeight: 700, lineHeight: 1.2, mb: 0.25 }}>
              {greeting()}, {firstName}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: { xs: 13.5, sm: 15 } }}>
              {t(subtitleKey)}
            </Typography>
            {user?.email && (
              <Typography sx={{ color: 'text.disabled', fontSize: { xs: 12, sm: 12.5 }, mt: 0.5 }} noWrap title={user.email}>
                {user.email}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}