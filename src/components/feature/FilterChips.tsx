import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';

interface FilterChipsProps {
  options: { value: string; label: string; icon?: string }[];
  selected: string;
  onChange: (value: string) => void;
}

export function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  return (
    <Box display="flex" gap={0.75} sx={{ overflowX: 'auto', py: 0.5, mx: { xs: -1, sm: 0 }, px: { xs: 1, sm: 0 }, '&::-webkit-scrollbar': { display: 'none' } }}>
      {options.map((opt) => (
        <motion.div key={opt.value} whileTap={{ scale: 0.95 }}>
          <Chip
            label={opt.label}
            icon={opt.icon ? <span style={{ fontSize: 14 }}>{opt.icon}</span> : undefined}
            variant={selected === opt.value ? 'filled' : 'outlined'}
            onClick={() => onChange(opt.value)}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              height: { xs: 40, sm: 32 },
              fontSize: 13,
              backgroundColor: selected === opt.value ? 'primary.main' : 'transparent',
              color: selected === opt.value ? 'white' : 'text.secondary',
              borderColor: selected === opt.value ? 'primary.main' : 'divider',
              whiteSpace: 'nowrap',
              '& .MuiChip-label': { px: { xs: 1.25, sm: 1 } },
              '&:hover': {
                backgroundColor: selected === opt.value ? 'primary.dark' : 'action.hover',
              },
            }}
          />
        </motion.div>
      ))}
    </Box>
  );
}
