# React Page Skill

Create a new page component.

## Guidelines
- Use default export for lazy loading
- Wrap content in `PageTransition` for animations
- Use MUI Box + Typography for layout
- Place in `src/pages/`

## Example
```typescript
import { Typography, Box } from '@mui/material';
import { PageTransition } from '@/components/animations';

export default function Contact() {
  return (
    <PageTransition>
      <Box>
        <Typography variant="h1">Contact</Typography>
        <Typography variant="body1" color="text.secondary">
          Contact page content here.
        </Typography>
      </Box>
    </PageTransition>
  );
}
```
