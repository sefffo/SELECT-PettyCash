# React API Integration Skill

Use an API endpoint with TanStack Query in a component.

## Example
```typescript
import { useQuery } from '@tanstack/react-query';
import { api, type User } from '@/services/api';
import { LoadingSpinner } from '@/components/shared';
import { Typography } from '@mui/material';

export function UserList() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Typography color="error">Failed to load</Typography>;

  return (
    <div>
      {users?.map((user) => (
        <Typography key={user.id}>{user.name}</Typography>
      ))}
    </div>
  );
}
```
