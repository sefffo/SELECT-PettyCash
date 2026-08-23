import { TextField, InputAdornment } from '@mui/material';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface CurrencyInputProps {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
  autoFocus?: boolean;
  sx?: object;
  currency?: string;
}

export function CurrencyInput({
  label,
  error,
  registration,
  placeholder = '0.00',
  autoFocus,
  sx,
  currency = 'EGP',
}: CurrencyInputProps) {
  return (
    <TextField
      {...registration}
      label={label}
      placeholder={placeholder}
      error={!!error}
      helperText={error}
      autoFocus={autoFocus}
      fullWidth
      type="number"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {currency}
            </InputAdornment>
          ),
        },
        htmlInput: { step: '0.01', min: '0' },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontSize: { xs: '1.35rem', sm: '1.5rem' },
          fontWeight: 700,
          '& input': { textAlign: 'right' },
        },
        ...sx,
      }}
    />
  );
}
