# Component Guidelines

## Conventions
- Use functional components with TypeScript
- Export named functions, not arrow functions
- Each component in its own file
- Barrel exports via `index.ts`
- Default exports for lazy-loaded pages
- `@/*` path alias for src imports

## Patterns
- Shared components in `components/shared/`
- Layout components in `components/layout/`
- Animation wrappers in `components/animations/`
- Use MUI `styled` utility from `@mui/material/styles`
- No `any` types - use proper generics
