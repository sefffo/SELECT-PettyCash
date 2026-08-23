import { Box, Typography, Avatar } from '@mui/material';
import {
  EmailOutlined,
  ApartmentOutlined,
  WorkOutlineOutlined,
  CheckCircleOutlineOutlined,
  CalendarMonthOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { ChangePasswordCard } from './ChangePasswordCard';

interface ProfilePageProps {
  title: string;
  subtitle: string;
  roleLabel: string;
  accentColor?: string;
  fallbackChar?: string;
  profile?: { name: string; email: string } | null;
  department?: string | null;
  children?: React.ReactNode;
}

export function ProfilePage({ title, subtitle, roleLabel, accentColor = '#145DB8', fallbackChar = 'U', profile = null, department = null, children }: ProfilePageProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const displayName = profile?.name ?? user?.name ?? 'User';
  const displayEmail = profile?.email ?? user?.email;
  const displayDepartment = department ?? user?.department;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>{title}</Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>
      </Box>

      {/* Profile hero card */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: { xs: 2.5, sm: 3 },
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'center' },
          gap: { xs: 1.5, sm: 3 },
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        <Avatar
          sx={{
            width: { xs: 72, sm: 84 },
            height: { xs: 72, sm: 84 },
            backgroundColor: accentColor,
            fontSize: { xs: 28, sm: 34 },
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {displayName.charAt(0) ?? fallbackChar}
        </Avatar>
        <Box minWidth={0} flex={1}>
          <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: 15, color: 'text.secondary', mb: 1, wordBreak: 'break-word' }}>{displayEmail}</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Box sx={{ display: 'inline-block', px: 1.25, py: 0.3, borderRadius: 1.5, backgroundColor: `${accentColor}1F`, color: accentColor, fontWeight: 600, fontSize: 12 }}>
              {roleLabel}
            </Box>
            {user?.status && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.3, borderRadius: 1.5, backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16A34A', fontWeight: 600, fontSize: 12 }}>
                <CheckCircleOutlineOutlined sx={{ fontSize: 14 }} />
                {user.status === 'active' ? t('profile.active') : t('profile.inactive')}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Detail cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 1.5, mb: 2 }}>
        <DetailCard icon={<EmailOutlined />} label={t('profile.email')} value={displayEmail ?? t('profile.notAvailable')} />
        <DetailCard icon={<WorkOutlineOutlined />} label={t('profile.role')} value={roleLabel} />
        {displayDepartment && (
          <DetailCard icon={<ApartmentOutlined />} label={t('profile.department')} value={displayDepartment} />
        )}
        <DetailCard icon={<CalendarMonthOutlined />} label={t('profile.memberSince')} value={memberSince ?? t('profile.notAvailable')} />
      </Box>

      <ChangePasswordCard />

      {children}
    </motion.div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          backgroundColor: 'rgba(20, 93, 184, 0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#145DB8',
          '& .MuiSvgIcon-root': { fontSize: 19 },
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
