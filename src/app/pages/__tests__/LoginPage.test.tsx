import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { useAuthStore } from '../../store/authStore';
import { api, type User } from '../../services/api';

const mockUser: User = {
  id: '1',
  email: 'owner@example.com',
  name: 'Business Owner',
  companyName: 'Acme Co',
  plan: 'professional',
  createdAt: '2026-04-21T00:00:00.000Z',
};

const renderLoginRoute = (initialEntries = ['/login']) => {
  const router = createMemoryRouter([
    {
      path: '/login',
      Component: LoginPage,
    },
    {
      path: '/dashboard',
      element: <div>Dashboard Home</div>,
    },
    {
      path: '/dashboard/settings',
      element: <div>Settings</div>,
    },
  ], {
    initialEntries,
  });

  render(<RouterProvider router={router} />);
  return router;
};

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState(), true);
    vi.restoreAllMocks();
  });

  it('logs in with valid credentials and redirects to dashboard', async () => {
    vi.spyOn(api.auth, 'login').mockResolvedValueOnce(mockUser);
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText('Email'), 'owner@example.com');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(api.auth.login).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'StrongPass123!',
    });
    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument();
  });

  it('redirects to original protected path after login', async () => {
    vi.spyOn(api.auth, 'login').mockResolvedValueOnce(mockUser);
    const user = userEvent.setup();

    renderLoginRoute([
      {
        pathname: '/login',
        state: { from: '/dashboard/settings' },
      },
    ]);

    await user.type(screen.getByLabelText('Email'), 'owner@example.com');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Settings')).toBeInTheDocument();
  });

  it('shows a clear error when credentials are invalid', async () => {
    vi.spyOn(api.auth, 'login').mockRejectedValueOnce(new Error('Invalid email or password.'));
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText('Email'), 'owner@example.com');
    await user.type(screen.getByLabelText('Password'), 'WrongPass123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });

  it('redirects authenticated users away from login page', async () => {
    useAuthStore.setState({ user: mockUser });

    renderLoginRoute();

    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument();
  });
});
