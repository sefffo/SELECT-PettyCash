import { Dialog, DialogContent, Typography, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          slots={{
            transition: (props) => (
              <motion.div {...props} initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }} />
            ),
          }}
          slotProps={{
            backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.5)', backdropFilter: 'blur(4px)' } },
            paper: { sx: { borderRadius: { xs: 0, sm: 3 }, maxWidth: 520, width: '100%', m: { xs: 0, sm: 2 }, minHeight: { xs: '100%', sm: 'auto' }, overflow: 'hidden' } },
          }}
          fullScreen={false}
          sx={{ '& .MuiDialog-container': { alignItems: { xs: 'flex-end', sm: 'center' } } }}
        >
          <Box sx={{ px: 2.5, pt: 2, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {title && <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>{title}</Typography>}
            <IconButton onClick={onClose} size="small" sx={{ width: 32, height: 32, color: 'text.secondary' }}><Close sx={{ fontSize: 18 }} /></IconButton>
          </Box>
          <DialogContent sx={{ px: 2.5, pb: 3 }}>{children}</DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
