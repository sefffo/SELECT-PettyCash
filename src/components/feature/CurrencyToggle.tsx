import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const CURRENCIES = ['EGP', 'USD', 'SAR'] as const;

export interface CurrencyToggleProps {
  value: string;
  onChange: (currency: string) => void;
  size?: 'small' | 'medium';
}

export function CurrencyToggle({ value, onChange, size = 'small' }: CurrencyToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size={size}
      value={value}
      onChange={(_event, next) => {
        if (next) onChange(next as string);
      }}
      sx={{
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          fontSize: 12,
          fontWeight: 600,
          px: 1.5,
          py: 0.25,
        },
      }}
    >
      {CURRENCIES.map((code) => (
        <ToggleButton key={code} value={code}>
          {code}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}