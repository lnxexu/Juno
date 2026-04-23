import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupPage } from '../SignupPage';
import { useAuthStore } from '../../store/authStore';
import { api, type User } from '../../services/api';

const mockSignedUpUser: User = {
  id: '2',
  email: 'new@example.com',
  name: 'New User',
  companyName: 'New Co',
  plan: 'starter',
  createdAt: '2026-04-21T00:00:00.000Z',
};

const renderSignupRoute = () => {
  const router = createMemoryRouter([
    {
      path: '/signup',
      Component: SignupPage,
    },
    {
      path: '/dashboard',
      element: <div>Dashboard Home</div>,
    },
  ], {
    initialEntries: ['/signup'],
  });

  render(<RouterProvider router={router} />);
  return router;
};

describe('SignupPage', () => {
  beforeEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState(), true);
    vi.restoreAllMocks();
  });

  it('signs up with valid input and redirects to dashboard', async () => {
    vi.spyOn(api.auth, 'signup').mockResolvedValueOnce(mockSignedUpUser);
    const user = userEvent.setup();

    renderSignupRoute();

    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
    await user.type(screen.getByLabelText('Full name'), 'New User');
    await user.type(screen.getByLabelText('Company'), 'New Co');
    await user.selectOptions(screen.getByLabelText('Plan'), 'starter');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(api.auth.signup).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'StrongPass123!',
      name: 'New User',
      companyName: 'New Co',
      plan: 'starter',
    });

    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument();
  });

  it('shows a clear duplicate email message', async () => {
    vi.spyOn(api.auth, 'signup').mockRejectedValueOnce(new Error('Email already in use.'));
    const user = userEvent.setup();

    renderSignupRoute();

    await user.type(screen.getByLabelText('Email'), 'duplicate@example.com');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123!');
    await user.type(screen.getByLabelText('Full name'), 'Duplicate User');
    await user.type(screen.getByLabelText('Company'), 'Duplicate Co');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists.');
  });

  it('enforces password strength before submitting', async () => {
    const signupSpy = vi.spyOn(api.auth, 'signup').mockResolvedValueOnce(mockSignedUpUser);
    const user = userEvent.setup();

    renderSignupRoute();

    await user.type(screen.getByLabelText('Email'), 'invalid@example.com');
    await user.type(screen.getByLabelText('Password'), 'weakpass');
    await user.type(screen.getByLabelText('Full name'), 'Invalid User');
    await user.type(screen.getByLabelText('Company'), 'Invalid Co');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Password requirement not met: One uppercase letter.');
    expect(signupSpy).not.toHaveBeenCalled();
  });
});
