import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const NAV_ITEMS = {
  buyer: [
    { label: 'Home', to: '/' },
    { label: 'Browse', to: '/catalog' },
    { label: 'Farms', to: '/farms' },
    { label: 'My orders', to: '/orders' },
  ],
  seller: [
    { label: 'Dashboard', to: '/seller' },
    { label: 'My listings', to: '/seller/listings' },
    { label: 'Add product', to: '/seller/add' },
    { label: 'Analytics', to: '/seller/analytics' },
  ],
};

// role: 'buyer' | 'seller'
export default function Navbar({ role = 'buyer', brandName = 'UmaLink', userName, points }) {
  const items = NAV_ITEMS[role] || NAV_ITEMS.buyer;
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  // Explicit props win so pages can render a navbar for a fixed persona.
  const displayName = userName ?? user?.name;
  const displayPoints = points ?? (role === 'buyer' ? user?.points : undefined);
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '?';

  // A seller signed in on this device goes straight to their dashboard;
  // everyone else gets the seller sign-in page first.
  const sellTarget = user?.role === 'seller' ? '/seller' : '/seller/login';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to={role === 'seller' ? '/seller' : '/'} className="navbar-brand">
        {brandName}
      </Link>

      <nav className="navbar-links">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="navbar-link">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="navbar-right">
        {role === 'buyer' && (
          <Link to={sellTarget} className="navbar-sell">
            Sell a product
          </Link>
        )}

        {role === 'buyer' && (
          <Link to="/cart" className="navbar-cart">
            Cart
            {count > 0 && <span className="navbar-cart-count">{count}</span>}
          </Link>
        )}

        {typeof displayPoints === 'number' && (
          <span className="navbar-points">{displayPoints} pts</span>
        )}

        {role === 'buyer' && !user ? (
          <Link to="/login" className="navbar-signin">
            Sign in
          </Link>
        ) : (
          <div className="navbar-account">
            <div className="navbar-avatar">{initials}</div>
            {user && (
              <button type="button" className="navbar-logout" onClick={handleLogout}>
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}