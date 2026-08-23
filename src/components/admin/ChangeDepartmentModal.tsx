import { useState } from 'react';
import { Dialog, DialogContent, Typography, Button, Box, TextField, MenuItem } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ApiDepartment, ApiUser } from '@/types/api';

interface ChangeDepartmentModalProps {
  user: ApiUser | null;
  currentDepartment: string;
  departments: ApiDepartment[];
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, departmentId: string) => void;
  isSubmitting?: boolean;
}

export function ChangeDepartmentModal({ user, currentDepartment, departments, open, onClose, onConfirm, isSubmitting }: ChangeDepartmentModalProps) {
  const { t } = useTranslation();
  const [deptId, setDeptId] = useState(user?.DepartmentId ?? '');

  const handleConfirm = () => {
    if (!user || !deptId) return;
    onConfirm(String(user.Id), deptId);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && user && (
        <Dialog open={open} onClose={onClose}
          slots={{
            transition: (props) => (
              <motion.div {...props} initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} />
            ),
          }}
          slotProps={{
            backdrop: { sx: { backgroundColor: 'rgba(7, 19, 33, 0.6)', backdropFilter: 'blur(4px)' } },
            paper: { sx: { borderRadius: 3, p: 1, maxWidth: { xs: 'calc(100vw - 32px)', sm: 380 }, width: '100%', m: 2 } },
          }}>
          <DialogContent sx={{ py: 2.5, px: 2.5 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>{t('admin.employeeTable.department')}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2.5 }}>
              {user.Name} is currently in <strong>{currentDepartment}</strong>
            </Typography>
            <TextField label={t('admin.employeeTable.department')} select value={deptId} onChange={(e) => setDeptId(e.target.value)} fullWidth size="small" sx={{ mb: 2.5 }}>
              {departments.filter((d) => d.Id !== user.DepartmentId).map((d) => (
                <MenuItem key={d.Id} value={d.Id}>{d.Name}</MenuItem>
              ))}
            </TextField>
            <Box display="flex" gap={1.5}>
              <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, py: 0.85 }}>{t('common.cancel')}</Button>
              <Button fullWidth variant="contained" disabled={!deptId || deptId === user.DepartmentId || isSubmitting}
                onClick={handleConfirm} sx={{ borderRadius: 2, py: 0.85 }}>
                {isSubmitting ? t('common.saving') : t('common.change')}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
