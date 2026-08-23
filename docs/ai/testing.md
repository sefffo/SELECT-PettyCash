# Testing

## Stack
- **Vitest** - Test runner
- **@testing-library/react** - Component testing
- **MSW** - API mocking

## Running Tests
```bash
npm test        # Run once
npm run test    # Watch mode
```

## Writing Tests
- Test files co-located or in `src/test/components/`
- MSW handlers in `src/test/mocks/handlers.ts`
- Setup in `src/test/setup.ts` (auto-imported via vitest config)
