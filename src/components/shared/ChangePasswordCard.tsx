import { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LockOutlined, VisibilityOutlined, VisibilityOffOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { changePasswordFormSchema, type ChangePasswordFormData } from '@/schemas/vertex';
import { useChangePassword } from '@/hooks/api';
import { Toast } from './Toast';

type Strength = 'weak' | 'medium' | 'strong';
type FieldKey = 'current' | 'new' | 'confirm';

const strengthColors: Record<Strength, string> = {
  weak: '#EF4444',
  medium: '#F59E0B',
  strong: '#22C55E',
};

const strengthKeys: Record<Strength, string> = {
  weak: 'profile.strengthWeak',
  medium: 'profile.strengthMedium',
  strong: 'profile.strengthStrong',
};

function getPasswordStrength(value: string): Strength | null {
  if (!value) return null;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

interface ChangePasswordCardProps {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  sx?: Record<string, unknown>;
}

export function ChangePasswordCard({ title, subtitle, submitLabel, sx }: ChangePasswordCardProps) {
  const { t } = useTranslation();
  const changePasswordMutation = useChangePassword();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [visible, setVisible] = useState<Record<FieldKey, boolean>>({ current: false, new: false, confirm: false });
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword' }) ?? '';
  const strength = getPasswordStrength(newPasswordValue);

  const toggleVisibility = (field: FieldKey) => setVisible((prev) => ({ ...prev, [field]: !prev[field] }));

  const passwordAdornment = (field: FieldKey) => (
    <InputAdornment position="end">
      <IconButton
        aria-label={visible[field] ? t('profile.hidePassword') : t('profile.showPassword')}
        size="small"
        onClick={() => toggleVisibility(field)}
        edge="end"
        sx={{ color: 'text.disabled' }}
      >
        {visible[field] ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
      </IconButton>
    </InputAdornment>
  );

  const strengthIndicator = strength ? (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%', mt: 0.25 }}>
      <Box sx={{ display: 'flex', gap: 0.5, flex: 1, maxWidth: { xs: 110, sm: 90 } }}>
        {([33, 66, 100] as const).map((threshold) => (
          <Box
            key={threshold}
            sx={{
              flex: 1,
              height: 3,
              borderRadius: 1,
              backgroundColor: strengthColors[strength],
              opacity: strength === 'weak' ? (threshold <= 33 ? 1 : 0.25) : strength === 'medium' ? (threshold <= 66 ? 1 : 0.25) : 1,
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: strengthColors[strength], whiteSpace: 'nowrap' }}>{t(strengthKeys[strength])}</Typography>
    </Box>
  ) : undefined;

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        OldPassword: data.currentPassword,
        NewPassword: data.newPassword,
      });
      reset();
      setVisible({ current: false, new: false, confirm: false });
      setToast({ open: true, message: t('profile.passwordUpdated'), severity: 'success' });
    } catch (err) {
      setToast({
        open: true,
        message: (err as { message?: string } | null)?.message ?? t('profile.passwordUpdateFailed'),
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          mb: 2,
          ...sx,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${alpha('#145DB8', 0.85)}, #145DB8)`,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(20, 93, 184, 0.28)',
            }}
          >
            <LockOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>{title ?? t('profile.security')}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{subtitle ?? t('profile.securitySubtitle')}</Typography>
          </Box>
        </Box>

        <Box sx={{ containerType: 'inline-size' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 1.5,
              '@container (min-width: 520px)': { gridTemplateColumns: '1fr 1fr' },
              '@container (min-width: 780px)': { gridTemplateColumns: '1fr 1fr 1fr' },
            }}
          >
            <TextField
              {...register('currentPassword')}
              label={t('profile.currentPassword')}
              type={visible.current ? 'text' : 'password'}
              autoComplete="current-password"
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              size="small"
              fullWidth
              slotProps={{ input: { endAdornment: passwordAdornment('current') } }}
            />
            <TextField
              {...register('newPassword')}
              label={t('profile.newPassword')}
              type={visible.new ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.newPassword}
              helperText={errors.newPassword ? errors.newPassword.message : strengthIndicator}
              size="small"
              fullWidth
              slotProps={{ input: { endAdornment: passwordAdornment('new') } }}
            />
            <TextField
              {...register('confirmPassword')}
              label={t('profile.confirmPassword')}
              type={visible.confirm ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              size="small"
              fullWidth
              sx={{
                '@container (min-width: 520px)': { gridColumn: '1 / -1' },
                '@container (min-width: 780px)': { gridColumn: 'auto' },
              }}
              slotProps={{ input: { endAdornment: passwordAdornment('confirm') } }}
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent={{ xs: 'stretch', sm: 'flex-end' }} mt={1.5}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
            disabled={changePasswordMutation.isPending}
            sx={{ borderRadius: 2, px: 2.5, width: { xs: '100%', sm: 'auto' }, textTransform: 'none', fontWeight: 600 }}
          >
            {changePasswordMutation.isPending ? t('common.saving') : (submitLabel ?? t('profile.updatePassword'))}
          </Button>
        </Box>
      </Box>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
