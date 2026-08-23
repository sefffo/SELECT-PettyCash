import { Badge, Box, Typography, Button, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import { Close, Logout, MenuOpen, Menu as MenuIcon } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/uiStore';
import { useLogout } from '@/hooks/useLogout';
import { APP_HEADER_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/utils/constants';
import { brandLogoSx, navItemSx, sectionLabelSx } from '@/theme/sidebarStyles';

export interface AppSidebarNavItem {
  label: string;
  icon: ReactNode;
  path: string;
  badge?: ReactNode;
}

interface AppSidebarProps {
  navItems: AppSidebarNavItem[];
  panelLabel: string;
  accent?: string;
  matchExactPaths?: string[];
  variant?: 'desktop' | 'mobile';
  onClose?: () => void;
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export function AppSidebar({
  navItems,
  panelLabel,
  accent,
  matchExactPaths = [],
  variant = 'desktop',
  onClose,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const handleLogout = useLogout();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const collapsed = variant === 'desktop' && !sidebarOpen;
  const tooltipPlacement = theme.direction === 'rtl' ? 'left' : 'right';
  const accentColor = accent ?? theme.palette.primary.main;

  return (
    <Box
      data-testid="sidebar"
      component={motion.div}
      initial={variant === 'desktop' ? { x: -SIDEBAR_WIDTH, opacity: 0 } : undefined}
      animate={variant === 'desktop' ? { x: 0, opacity: 1 } : undefined}
      transition={variant === 'desktop' ? { type: 'spring', damping: 25, stiffness: 200 } : undefined}
      sx={{
        position: variant === 'desktop' ? 'fixed' : 'relative',
        top: variant === 'desktop' ? APP_HEADER_HEIGHT : 0,
        bottom: 0,
        insetInlineStart: 0,
        width: variant === 'mobile' ? '100%' : collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: variant === 'mobile' ? '100%' : `calc(100dvh - ${APP_HEADER_HEIGHT}px)`,
        overflowX: 'hidden',
        overflowY: variant === 'mobile' ? 'auto' : 'hidden',
        backgroundColor: 'background.paper',
        borderInlineEnd: variant === 'desktop' ? '1px solid' : 'none',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        flexShrink: 0,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Box p={2.5} pb={1.5} display="flex" alignItems="center" justifyContent="space-between" gap={1} sx={variant === 'mobile' ? { pt: 'max(1.5rem, env(safe-area-inset-top, 0px))' } : undefined}>
        <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
          <Box sx={brandLogoSx(accentColor)}>
            PC
          </Box>
          {!collapsed && (
            <Box minWidth={0}>
              <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>Petty Cash</Typography>
              <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>{t(panelLabel)}</Typography>
            </Box>
          )}
        </Box>
        {variant === 'desktop' && (
          <Tooltip title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')} placement="bottom">
            <IconButton
              onClick={toggleSidebar}
              aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
              sx={{ width: 32, height: 32, borderRadius: 1.5, color: 'text.secondary', flexShrink: 0, '&:hover': { color: 'text.primary' } }}
            >
              {collapsed ? <MenuIcon sx={{ fontSize: 18 }} /> : <MenuOpen sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        )}
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ width: 32, height: 32, borderRadius: 1.5, color: 'text.secondary', flexShrink: 0 }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 1.5 }} />

      <Box flex={1} px={1.25} pt={1.25} display="flex" flexDirection="column" gap={0.5}>
        {!collapsed && <Typography sx={sectionLabelSx}>{t('nav.menu')}</Typography>}
        {navItems.map((item, i) => {
          const active = matchExactPaths.includes(item.path)
            ? location.pathname === item.path
            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const button = (
            <Button
              fullWidth
              onClick={() => {
                navigate(item.path);
                onClose?.();
              }}
              sx={navItemSx(theme, active, collapsed, accentColor)}
              startIcon={
                collapsed && item.badge !== undefined ? (
                  <Badge
                    color="error"
                    badgeContent={item.badge}
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: 9,
                        fontWeight: 700,
                        height: 16,
                        minWidth: 16,
                        borderRadius: 8,
                        padding: '0 3px',
                        lineHeight: 1,
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
            >
              {!collapsed && (
                <>
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t(item.label)}
                  </Box>
                  {item.badge !== undefined && (
                    <Box
                      component="span"
                      sx={{
                        ml: 'auto',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 18,
                        minWidth: 18,
                        borderRadius: 9,
                        padding: '0 4px',
                        fontSize: 10,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: '#FFFFFF',
                        backgroundColor: 'error.main',
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </>
              )}
            </Button>
          );
          return (
            <Box component={motion.div} key={item.path} variants={itemVariants} custom={i}>
              {collapsed ? <Tooltip title={t(item.label)} placement={tooltipPlacement}>{button}</Tooltip> : button}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Divider sx={{ borderColor: 'divider' }} />
      </Box>

      <Box px={1.25} pb={1.5} sx={variant === 'mobile' ? { pb: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' } : undefined}>
        {collapsed ? (
          <Tooltip title={t('nav.logout')} placement={tooltipPlacement}>
            <Button
              fullWidth
              onClick={handleLogout}
              aria-label={t('nav.logout')}
              sx={{
                ...navItemSx(theme, false, collapsed, accentColor),
                '&:hover': { color: 'error.main', backgroundColor: 'rgba(239, 68, 68, 0.08)' },
              }}
            >
              <Logout sx={{ fontSize: 20 }} />
            </Button>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            onClick={handleLogout}
            sx={{
              ...navItemSx(theme, false, collapsed, accentColor),
              '&:hover': { color: 'error.main', backgroundColor: 'rgba(239, 68, 68, 0.08)' },
            }}
          >
            <Logout sx={{ fontSize: 20 }} />
            {t('nav.logout')}
          </Button>
        )}
      </Box>
    </Box>
  );
}