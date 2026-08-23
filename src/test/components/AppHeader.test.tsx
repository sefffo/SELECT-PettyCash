import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppHeader } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import i18n from '@/i18n/config';
import type { Employee, UserRole } from '@/types/vertex';

function makeUser(role: UserRole): Employee {
  const apiRole =
    role === 'admin'
      ? 'Administrator'
      : role === 'manager'
        ? 'Manager'
        : role === 'finance'
          ? 'Finance'
          : 'Employee';
  return {
    id: 'u1',
    name: 'Test User',
    email: 'test@selecteg.com',
    avatar: '',
    role: apiRole,
    department: '',
    status: 'active',
    userRole: role,
    createdAt: '',
    updatedAt: '',
  };
}

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

function renderHeader(showNotifications = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/employee/dashboard']}>
        <AppHeader panelLabel="nav.employeePanel" onMenuClick={() => undefined} showNotifications={showNotifications} />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AppHeader', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      role: null,
      sessionExpiresAt: null,
    });
    useUIStore.setState({ locale: 'en', mode: 'light' });
    void i18n.changeLanguage('en');
  });

  it('renders the panel title and the user menu trigger', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader();
    expect(screen.getByText(/employee panel/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /test user/i })).toBeDefined();
  });

  it('opens the user menu with Profile, Settings and Logout', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /test user/i }));
    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /logout/i })).toBeDefined();
  });

  it('does not render a standalone logout button, notifications, or inline language toggles in the navbar', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader();
    expect(screen.queryByRole('button', { name: 'Logout' })).toBeNull();
    expect(screen.queryByRole('button', { name: /notifications/i })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Settings' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'EN' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'AR' })).toBeNull();
  });

  it('renders the theme toggle in the navbar and toggles dark mode', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    useUIStore.setState({ locale: 'en', mode: 'light' });
    renderHeader();
    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggle).toBeDefined();
    expect(useUIStore.getState().mode).toBe('light');
    fireEvent.click(toggle);
    expect(useUIStore.getState().mode).toBe('dark');
  });

  it('logs out from the user menu', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /test user/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(screen.getByTestId('location').textContent).toBe('/login');
  });

  it('navigates to the profile page from the user menu', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /test user/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /profile/i }));
    expect(screen.getByTestId('location').textContent).toBe('/employee/profile');
  });

  it('navigates to the settings page from the user menu', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /test user/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /settings/i }));
    expect(screen.getByTestId('location').textContent).toBe('/employee/settings');
  });

  it('renders the notifications bell when showNotifications is enabled', () => {
    useAuthStore.setState({ user: makeUser('employee'), isAuthenticated: true, role: 'employee' });
    renderHeader(true);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeDefined();
  });
});