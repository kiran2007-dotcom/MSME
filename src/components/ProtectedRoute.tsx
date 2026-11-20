import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useBusiness } from '../hooks/useBusiness.tsx';
import { FullPageLoader } from './ui/Primitives.tsx';

export function ProtectedRoute({
  children,
  requireBusiness = true,
}: {
  children: ReactNode;
  requireBusiness?: boolean;
}) {
  const { firebaseUser, authReady, profileLoaded } = useAuth();
  const { memberships, membershipsLoaded } = useBusiness();
  const location = useLocation();

  if (!authReady || (firebaseUser && (!profileLoaded || !membershipsLoaded))) {
    return <FullPageLoader label="Verifying workspace session..." />;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireBusiness && memberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, authReady, profileLoaded } = useAuth();
  const { memberships, membershipsLoaded } = useBusiness();

  if (!authReady || (firebaseUser && (!profileLoaded || !membershipsLoaded))) {
    return <FullPageLoader label="Loading session..." />;
  }

  if (firebaseUser) {
    return <Navigate to={memberships.length > 0 ? '/app' : '/onboarding'} replace />;
  }

  return <>{children}</>;
}
