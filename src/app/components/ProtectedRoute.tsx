import { Navigate } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';
import type { UserRole } from '../../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirect = user?.role === 'customer' ? '/customer' : '/contractor';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
