import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Wraps buyer-only routes: signed-out visitors are sent to sign in and
// returned here afterwards.
export default function RequireAuth({ children, reason = 'account' }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?next=${next}&reason=${reason}`} replace />;
  }

  return children;
}
