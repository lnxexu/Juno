import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const hasAttemptedBootstrap = useRef(false);
  const hasShownErrorToast = useRef(false);

  useEffect(() => {
    if (!hasAttemptedBootstrap.current && !user && !isLoading) {
      hasAttemptedBootstrap.current = true;
      void fetchUser();
    }
  }, [fetchUser, isLoading, user]);

  useEffect(() => {
    if (error && !hasShownErrorToast.current) {
      hasShownErrorToast.current = true;
      toast.error('Unable to validate your session. Please sign in again.');
    }

    if (!error) {
      hasShownErrorToast.current = false;
    }
  }, [error]);

  if (isLoading || (!user && !hasAttemptedBootstrap.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Checking your session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}