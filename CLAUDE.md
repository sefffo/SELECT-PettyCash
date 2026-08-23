# Claude Instructions

This project is a production-grade React frontend template at `D:\Templates\react-app`.

## Commands
- `npm run dev` - Start dev server
- `npm run build` - TypeScript check + production build
- `npm run lint` - ESLint check
- `npm test` - Run Vitest tests
- `npm run format` - Prettier format

## Directory Structure
- `src/components/shared/` - Reusable shared components
- `src/components/layout/` - Layout components
- `src/components/animations/` - Animation wrappers
- `src/pages/` - Page components (lazy-loaded)
- `src/routes/` - React Router configuration
- `src/services/` - API layer (Axios + TanStack Query)
- `src/store/` - Zustand stores
- `src/theme/` - MUI theme (light + dark)
- `src/schemas/` - Zod validation schemas
- `src/hooks/` - Custom React hooks
- `src/utils/` - Constants & utilities
- `src/types/` - TypeScript type definitions
- `src/test/` - Test setup & MSW mocks

## Rules
- No `any` types
- Use `@mui/material/styles` for `createTheme` and `styled` only
- Shared components go in `components/shared/` not `common/`
- Pages use default exports for lazy loading
- Zustand stores use the `persist` middleware pattern
