# Routing

## Structure
- Flat routes defined in `src/routes/AppRouter.tsx`
- All pages lazy-loaded with `React.lazy()`
- AnimatePresence for page transitions
- Route constants in `src/utils/constants.ts`

## Adding a New Route
1. Create page component in `src/pages/` with default export
2. Add route constant in `src/utils/constants.ts`
3. Add lazy import and Route in `src/routes/AppRouter.tsx`

## Example
```typescript
const Contact = lazy(() => import('@/pages/Contact'));

// In AppRouter:
<Route path={ROUTES.CONTACT} element={<Contact />} />
```
