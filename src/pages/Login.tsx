import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, useTheme, useMediaQuery } from '@mui/material';
import { EmailOutlined, LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/shared';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const login = useAuthStore((s) => s.login);
  const getDashboardPath = useAuthStore((s) => s.getDashboardPath);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(getDashboardPath(), { replace: true });
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setError(message || t('auth.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{error}</Alert>
        </motion.div>
      )}

      <TextField label={t('auth.email')} type="email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth required autoFocus
        slotProps={{ input: { startAdornment: <EmailOutlined sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} /> } }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

      <TextField label={t('auth.password')} type="password" value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth required
        slotProps={{ input: { startAdornment: <LockOutlined sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} /> } }}
        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
        sx={{ mt: 3, py: 1.3, borderRadius: 2, fontSize: 15, fontWeight: 700 }}>
        {loading ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </Box>
  );

  if (isDesktop) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex' }}>
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <ThemeToggle sx={{ width: 40, height: 40, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.12)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.22)' } }} />
        </Box>
        <Box sx={{
          flex: '0 0 480px', background: 'linear-gradient(135deg, #0F4A94 0%, #145DB8 50%, #0F4A94 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          p: 6, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(56,189,248,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(34,197,94,0.06) 0%, transparent 60%)',
          }} />
          <Box textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              component={motion.div}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              sx={{
                width: 72, height: 72, borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2.5, color: 'white', fontSize: 22, fontWeight: 800,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
              PC
            </Box>
            <Typography variant="h1" fontWeight={800} mb={1} sx={{ color: 'white' }}>
              {t('auth.vertex')}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 320, lineHeight: 1.6, fontSize: 15 }}>
              {t('auth.subtitle')}
            </Typography>
            <Box mt={4} display="flex" gap={1.5} justifyContent="center">
              {['💰', '📊', '✅'].map((emoji, i) => (
                <Box key={i} component={motion.div}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {emoji}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, backgroundColor: 'background.default' }}>
          <Box sx={{ maxWidth: 400, width: '100%', p: 4, borderRadius: 3 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>{t('auth.signInSubtitle')}</Typography>
            <Typography sx={{ fontSize: 15, color: 'text.secondary', mb: 3 }}>{t('auth.welcomeBack')}</Typography>
            {formContent}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 1.5,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,93,184,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ThemeToggle sx={{ width: 40, height: 40 }} />
      </Box>
      <Box textAlign="center" mb={3} sx={{ position: 'relative' }}>
        <Box
          component={motion.div}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          sx={{
            width: 48, height: 48, borderRadius: 2,
            backgroundColor: '#145DB8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 1.5, color: 'white', fontSize: 15, fontWeight: 800,
            boxShadow: '0px 6px 16px rgba(20, 93, 184, 0.4)',
          }}>
          PC
        </Box>
        <Typography variant="h2" fontWeight={800} mb={0.5} sx={{ color: 'text.primary' }}>{t('auth.vertex')}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{t('auth.subtitle')}</Typography>
      </Box>

      <Box sx={{ maxWidth: 360, mx: 'auto', width: '100%', p: 2.5, borderRadius: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0px 12px 32px rgba(15, 30, 54, 0.12)', position: 'relative' }}>
        {formContent}
      </Box>
    </Box>
  );
}
