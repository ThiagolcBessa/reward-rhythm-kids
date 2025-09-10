import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-kid-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login with returnTo parameter
  if (!user) {
    const currentPath = window.location.pathname;
    const returnTo = encodeURIComponent(currentPath);
    return <Navigate to={`${redirectTo}?returnTo=${returnTo}`} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({ children, redirectTo = '/' }: PublicRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-kid-primary" />
      </div>
    );
  }

  // If authenticated, check for returnTo parameter or redirect to default
  if (user) {
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo) {
      return <Navigate to={decodeURIComponent(returnTo)} replace />;
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  // If not authenticated, render the public content
  return <>{children}</>;
};