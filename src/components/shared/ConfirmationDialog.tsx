import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  icon?: string;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  icon = '⚠️',
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          slots={{
            transition: (props) => (
              <motion.div
                {...props}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              />
            ),
          }}
          slotProps={{
            backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
            paper: { sx: { borderRadius: 3, p: 1, maxWidth: { xs: 'calc(100vw - 32px)', sm: 340 }, width: '100%', m: 2 } },
          }}
        >
          <DialogContent sx={{ textAlign: 'center', py: 3, px: 2.5 }}>
            <Box sx={{ fontSize: 40, mb: 1.5 }}>{icon}</Box>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
              {message}
            </Typography>
            <Box display="flex" gap={1.5}>
              <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, py: 1 }}>
                {cancelLabel}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color={confirmColor}
                onClick={onConfirm}
                sx={{ borderRadius: 2, py: 1 }}
              >
                {confirmLabel}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
