# React Test Skill

Create a test for a component.

## Guidelines
- Use `describe`/`it`/`expect` from vitest
- Use `render`, `screen` from `@testing-library/react`
- Mock API calls via MSW handlers in `src/test/mocks/handlers.ts`
- Place tests co-located or in `src/test/components/`

## Example
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '@/components/shared/MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```
