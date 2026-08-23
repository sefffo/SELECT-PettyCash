# State Management

## Types
- **UI State** - Zustand (theme mode, sidebar)
- **Server State** - TanStack Query (API data, caching)
- **Form State** - React Hook Form + Zod

## Zustand Pattern
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  value: string;
  setValue: (val: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      value: 'default',
      setValue: (val) => set({ value: val }),
    }),
    { name: 'store-key' },
  ),
);
```

## TanStack Query Pattern
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers().then((r) => r.data.data),
  });
}
```
