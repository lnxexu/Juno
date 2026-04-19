import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { router } from './routes';

export default function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AppErrorBoundary>
  );
}