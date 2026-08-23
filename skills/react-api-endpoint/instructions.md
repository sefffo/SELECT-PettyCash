# React API Endpoint Skill

Add a new API endpoint to the service layer.

## Steps
1. Define request/response types in `src/types/api.ts`
2. Add typed method in `src/services/api.ts`

## Example
```typescript
// In types/api.ts
export interface Post {
  id: number;
  title: string;
  body: string;
}

// In services/api.ts
getPosts: (page = 1) =>
  http.get<PaginatedResponse<Post>>('/posts', { params: { page } }),
```
