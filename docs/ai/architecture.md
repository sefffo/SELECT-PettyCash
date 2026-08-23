# Architecture

## Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Material UI 7** for component library
- **React Router v6** for routing
- **Zustand** for state management
- **TanStack Query** for server state
- **React Hook Form + Zod** for forms
- **Framer Motion** for animations
- **Axios** for HTTP
- **Vitest + Testing Library + MSW** for testing

## Project Structure
```
src/
  types/       - TypeScript type definitions
  utils/       - Constants and utility functions
  theme/       - MUI theme configuration
  store/       - Zustand stores
  services/    - API layer (Axios, TanStack Query)
  hooks/       - Custom React hooks
  schemas/     - Zod validation schemas
  components/
    shared/    - Reusable shared components
    layout/    - Layout components (Header, AppLayout)
    animations/- Framer Motion wrappers
  pages/       - Page components (lazy-loaded)
  routes/      - Router configuration
  test/        - Test setup and mocks
  App.tsx      - Provider composition root
  main.tsx     - Application entry point
```
