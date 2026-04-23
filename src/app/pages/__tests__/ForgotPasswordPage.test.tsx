import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import { api } from '../../services/api';

const renderForgotPasswordRoute = () => {
  const router = createMemoryRouter([
    {
      path: '/forgot-password',
      Component: ForgotPasswordPage,
    },
    {
      path: '/login',
      element: <div>Login</div>,
    },
  ], {
    initialEntries: ['/forgot-password'],
  });

  render(<RouterProvider router={router} />);
};

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits email and shows confirmation message', async () => {
    vi.spyOn(api.auth, 'forgotPassword').mockResolvedValueOnce({
      message: 'If an account with that email exists, reset instructions have been sent.',
    });
    const user = userEvent.setup();

    renderForgotPasswordRoute();

    await user.type(screen.getByLabelText('Email'), 'owner@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset email' }));

    expect(api.auth.forgotPassword).toHaveBeenCalledWith({ email: 'owner@example.com' });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'If an account with that email exists, reset instructions have been sent.',
    );
  });

  it('validates email format before submitting', async () => {
    const forgotPasswordSpy = vi.spyOn(api.auth, 'forgotPassword').mockResolvedValueOnce({
      message: 'ok',
    });
    const user = userEvent.setup();

    renderForgotPasswordRoute();

    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Send reset email' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    expect(forgotPasswordSpy).not.toHaveBeenCalled();
  });
});
