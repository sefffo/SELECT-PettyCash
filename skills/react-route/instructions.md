# React Route Skill

Add a new route to the application.

## Steps
1. Create page in `src/pages/` with default export
2. Add route constant in `src/utils/constants.ts`
3. Add lazy import and Route in `src/routes/AppRouter.tsx`

## Example
```typescript
// In constants.ts:
CONTACT: '/contact',

// In AppRouter.tsx:
const Contact = lazy(() => import('@/pages/Contact'));

<Route path={ROUTES.CONTACT} element={<Contact />} />
```
