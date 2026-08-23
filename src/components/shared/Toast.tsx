import { Snackbar, Alert } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ open, message, severity = 'success', onClose, duration = 4000 }: ToastProps) {
  return (
    <Snackbar open={open} autoHideDuration={duration} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 80, sm: 80, md: 24 } }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ borderRadius: 2, fontSize: 13, fontWeight: 500 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
