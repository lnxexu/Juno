import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { api } from '../services/api';

const passwordRules = [
  { label: 'At least 8 characters', regex: /^.{8,}$/ },
  { label: 'One uppercase letter', regex: /[A-Z]/ },
  { label: 'One lowercase letter', regex: /[a-z]/ },
  { label: 'One number', regex: /[0-9]/ },
  { label: 'One special character', regex: /[^A-Za-z0-9]/ },
];

export function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const missingToken = useMemo(() => !token || token.trim().length === 0, [token]);

  const validateForm = () => {
    if (!password || !confirmPassword) {
      return 'Password and confirmation are required.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    const failedRule = passwordRules.find((rule) => !rule.regex.test(password));
    if (failedRule) {
      return `Password requirement not met: ${failedRule.label}.`;
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (missingToken) {
      setSubmitError('This password reset link is invalid or has expired.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.auth.resetPassword(token as string, { password });
      setSuccessMessage(response.message);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = (error as Error).message;
      if (message.toLowerCase().includes('invalid or has expired')) {
        setSubmitError('This password reset link is invalid or has expired.');
        return;
      }

      setSubmitError(message || 'Unable to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Card className="shadow-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">Set a new password</CardTitle>
            <CardDescription>
              Enter a strong password to regain access to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {submitError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {submitError}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  role="status"
                >
                  {successMessage}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting || missingToken}>
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Back to{' '}
                <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
