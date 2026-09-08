import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Wraps protected routes: signed-out visitors are sent to sign in and
// returned here afterwards. Pass role="seller" to also gate by account type —
// wrong-role visitors are sent to the seller sign-in instead of the buyer one.
export default function RequireAuth({ children, reason = 'account', role }) {
  const { user } = useAuth();
  const location = useLocation();
  const loginPath = role === 'seller' ? '/seller/login' : '/login';

  if (!user) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`${loginPath}?next=${next}&reason=${reason}`} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
}