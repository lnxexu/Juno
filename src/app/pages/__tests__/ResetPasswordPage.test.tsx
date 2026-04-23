import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordPage } from '../ResetPasswordPage';
import { api } from '../../services/api';

const renderResetPasswordRoute = (initialEntries = ['/reset-password/token-1234567890']) => {
  const router = createMemoryRouter([
    {
      path: '/reset-password/:token',
      Component: ResetPasswordPage,
    },
    {
      path: '/login',
      element: <div>Login</div>,
    },
  ], {
    initialEntries,
  });

  render(<RouterProvider router={router} />);
};

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resets password and shows success message', async () => {
    vi.spyOn(api.auth, 'resetPassword').mockResolvedValueOnce({ message: 'Password reset successful.' });
    const user = userEvent.setup();

    renderResetPasswordRoute();

    await user.type(screen.getByLabelText('New password'), 'NewStrong123!');
    await user.type(screen.getByLabelText('Confirm password'), 'NewStrong123!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(api.auth.resetPassword).toHaveBeenCalledWith('token-1234567890', { password: 'NewStrong123!' });
    expect(await screen.findByRole('status')).toHaveTextContent('Password reset successful.');
  });

  it('shows invalid link message for expired token errors', async () => {
    vi.spyOn(api.auth, 'resetPassword').mockRejectedValueOnce(
      new Error('This password reset link is invalid or has expired.'),
    );
    const user = userEvent.setup();

    renderResetPasswordRoute();

    await user.type(screen.getByLabelText('New password'), 'NewStrong123!');
    await user.type(screen.getByLabelText('Confirm password'), 'NewStrong123!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This password reset link is invalid or has expired.',
    );
  });

  it('enforces password requirements before submit', async () => {
    const resetSpy = vi.spyOn(api.auth, 'resetPassword').mockResolvedValueOnce({
      message: 'Password reset successful.',
    });
    const user = userEvent.setup();

    renderResetPasswordRoute();

    await user.type(screen.getByLabelText('New password'), 'weakpass');
    await user.type(screen.getByLabelText('Confirm password'), 'weakpass');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Password requirement not met: One uppercase letter.');
    expect(resetSpy).not.toHaveBeenCalled();
  });
});
