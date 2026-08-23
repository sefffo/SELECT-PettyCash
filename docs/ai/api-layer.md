# API Layer

## Services
- `src/services/http.ts` - Axios instance with interceptors
- `src/services/api.ts` - Typed API endpoints
- `src/services/queryClient.ts` - TanStack Query client

## HTTP Interceptors
- Request: Adds Bearer token from localStorage
- Response: Normalizes errors, clears token on 401

## Adding an Endpoint
1. Define types in `src/types/api.ts`
2. Add method in `src/services/api.ts`
3. Use with TanStack Query in consuming component
