# Agent Instructions

This is a production-grade React frontend template.

## Tech Stack
- React 18 + TypeScript + Vite
- Material UI 7 (use `@mui/material/styles` for createTheme/styled)
- React Router v6 (flat routes, lazy loading)
- Zustand (persisted UI state)
- TanStack Query v5 (server state)
- React Hook Form + Zod (forms)
- Framer Motion (animations)
- Axios (HTTP client)
- Vitest + Testing Library + MSW (tests)

## Key Conventions
- Path alias: `@/*` -> `src/*`
- Shared components in `components/shared/`
- Use `@mui/material/styles` only for `createTheme` and `styled`
- Default exports for lazy-loaded pages
- No `any` type
- All source files typed
