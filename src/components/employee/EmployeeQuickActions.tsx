import { Box, Typography, Button } from '@mui/material';
import { Add, ReceiptLongOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function EmployeeQuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2.5 } }}>
      <Typography variant="subtitle1" fontWeight={700} mb={1.5} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>{t('employee.quickActions')}</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <Button component={motion.button} whileTap={{ scale: 0.97 }} variant="contained" size="small"
          startIcon={<Add sx={{ fontSize: 16 }} />} onClick={() => navigate('/employee/requests/new')}
          sx={{ py: { xs: 1, sm: 1.1 }, borderRadius: 1.5, justifyContent: 'flex-start', px: { xs: 1.25, sm: 1.5 }, fontSize: '0.8125rem' }}>
          <Box textAlign="left">
            <Typography variant="body2" fontWeight={700} color="inherit" sx={{ fontSize: '0.8125rem' }}>{t('employee.newRequest')}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}>{t('employee.newRequestHint')}</Typography>
          </Box>
        </Button>
        <Button component={motion.button} whileTap={{ scale: 0.97 }} variant="outlined" size="small"
          startIcon={<ReceiptLongOutlined sx={{ fontSize: 16 }} />} onClick={() => navigate('/employee/requests')}
          sx={{ py: { xs: 1, sm: 1.1 }, borderRadius: 1.5, justifyContent: 'flex-start', px: { xs: 1.25, sm: 1.5 }, borderColor: 'divider', fontSize: '0.8125rem' }}>
          <Box textAlign="left">
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8125rem' }}>{t('employee.viewRequests')}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}>{t('employee.viewRequestsHint')}</Typography>
          </Box>
        </Button>
      </Box>
    </Box>
  );
}