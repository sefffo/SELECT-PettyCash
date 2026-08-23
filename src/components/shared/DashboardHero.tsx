import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { AnimatedNumber } from './AnimatedNumber';
import { formatCurrency } from '@/utils/format';

export interface DashboardHeroAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
}

export interface DashboardHeroStat {
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  value: number;
  loading?: boolean;
  isCurrency?: boolean;
}

interface DashboardHeroProps {
  badgeIcon?: ReactNode;
  badgeLabel: string;
  title: string;
  subtitle?: string;
  showGreeting?: boolean;
  actions?: DashboardHeroAction[];
  stats?: DashboardHeroStat[];
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function HeroStat({ label, sublabel, icon, value, loading, isCurrency }: DashboardHeroStat) {
  return (
    <Box sx={{ minWidth: { xs: 100, sm: 132 }, minHeight: 0 }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {loading ? '—' : isCurrency ? (
          <AnimatedNumber value={value} formatFn={(n) => formatCurrency(Math.round(n))} />
        ) : (
          <AnimatedNumber value={value} />
        )}
      </Typography>
      <Box display="flex" alignItems="center" gap={0.5} mt={0.5} minWidth={0}>
        {icon && (
          <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, color: 'rgba(255,255,255,0.7)', '& .MuiSvgIcon-root': { fontSize: 13 } }}>
            {icon}
          </Box>
        )}
        {sublabel && (
          <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function DashboardHero({ badgeIcon, badgeLabel, title, subtitle, showGreeting, actions, stats }: DashboardHeroProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: { xs: 2.5, sm: 3.5 },
        mb: 2.5,
        color: '#fff',
        background: 'linear-gradient(135deg, #0D4A92 0%, #145DB8 45%, #1D6FD6 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', top: -80, insetInlineEnd: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -100, insetInlineStart: '30%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2.5, alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
        <Box minWidth={0} flex={1}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 2,
              mb: 1.25,
              backgroundColor: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {badgeIcon && (
              <Box component="span" sx={{ display: 'inline-flex', '& .MuiSvgIcon-root': { fontSize: 15 } }}>
                {badgeIcon}
              </Box>
            )}
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {badgeLabel}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: { xs: 14, sm: 15 }, color: 'rgba(255,255,255,0.82)', maxWidth: 520, mb: { xs: 2, sm: 2.5 } }}>
              {subtitle}
            </Typography>
          )}
          {showGreeting && user && (
            <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', mb: { xs: 2, sm: 2.5 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>
              {t('common.overviewGreeting', { greeting: greeting(), name: firstName, email: user.email ?? '' })}
            </Typography>
          )}
          {actions && actions.length > 0 && (
            <Box display="flex" gap={1.25} flexWrap="wrap">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant === 'outline' ? 'outlined' : 'contained'}
                  startIcon={action.icon}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  sx={{
                    borderRadius: 2,
                    px: 2.25,
                    py: 1,
                    '& .MuiSvgIcon-root': { fontSize: 17 },
                    ...(action.variant === 'outline'
                      ? {
                          borderColor: 'rgba(255,255,255,0.5)',
                          color: '#fff',
                          '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' },
                        }
                      : {
                          backgroundColor: '#fff',
                          color: '#0D4A92',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
                        }),
                    ...(action.disabled
                      ? { borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.75)' }
                      : {}),
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {stats && stats.length > 0 && (
          <Box display="flex" gap={2.5} flexWrap="wrap" sx={{ position: 'relative', flexShrink: 0 }}>
            {stats.map((stat, index) => (
              <Box key={stat.label} display="flex" gap={2.5} alignItems="center">
                {index > 0 && (
                  <Box sx={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.18)', display: { xs: 'none', sm: 'block' } }} />
                )}
                <HeroStat {...stat} />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 4, background: 'linear-gradient(90deg, rgba(255,255,255,0.35), transparent 60%)' }} />
    </Box>
  );
}