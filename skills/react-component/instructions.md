# React Component Skill

Create a new shared React component in `src/components/shared/`.

## Guidelines
- Use functional component with TypeScript props interface
- Export named function
- Use MUI components for styling
- Import types from `@/types/`
- Add barrel export in `components/shared/index.ts`

## Example
```typescript
import { Box, Typography } from '@mui/material';

interface Props {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: Props) {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}
```
