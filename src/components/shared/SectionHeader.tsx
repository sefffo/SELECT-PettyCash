import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
}

export function SectionHeader({ title, subtitle, viewAllLink, viewAllLabel = 'View All' }: SectionHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5} gap={1} flexWrap="wrap" rowGap={0.5}>
      <Box minWidth={0}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {viewAllLink && (
        <Button size="small" onClick={() => navigate(viewAllLink)} sx={{ borderRadius: 2, flexShrink: 0, py: 0.4, px: 1.25, fontSize: 13 }}>
          {viewAllLabel}
        </Button>
      )}
    </Box>
  );
}
