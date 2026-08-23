import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function Unauthorized() {
  const navigate = useNavigate();
  const getDashboardPath = useAuthStore((s) => s.getDashboardPath);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        textAlign: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Typography sx={{ fontSize: 72, fontWeight: 800, color: '#145DB8', lineHeight: 1, mb: 1 }}>
        403
      </Typography>
      <Typography variant="h2" sx={{ color: 'text.primary', mb: 0.5 }}>
        Access Denied
      </Typography>
      <Typography sx={{ fontSize: 15, color: 'text.secondary', maxWidth: 400, mb: 3 }}>
        You do not have permission to access this page. If you believe this is an error, please contact your administrator.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(isAuthenticated ? getDashboardPath() : '/login', { replace: true })}
        sx={{ borderRadius: 2, py: 1.2, px: 3, fontSize: 15 }}
      >
        {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
      </Button>
    </Box>
  );
}
