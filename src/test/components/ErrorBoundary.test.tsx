import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/shared';

function BuggyComponent(): ReactNode {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>,
    );
    expect(getByText('Safe content')).toBeDefined();
  });

  it('renders error fallback when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeDefined();
  });
});
