import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PointsModal from './PointsModal';
import logo from '../assets/umalink-logo.png';
import './Navbar.css';

const NAV_ITEMS = {
  buyer: [
    { label: 'Home', to: '/' },
    { label: 'Browse', to: '/catalog' },
    { label: 'Combos', to: '/combos' },
    { label: 'Farms', to: '/farms' },
    { label: 'My orders', to: '/orders' },
  ],
  seller: [
    { label: 'Dashboard', to: '/seller' },
    { label: 'My listings', to: '/seller/listings' },
    { label: 'Add product', to: '/seller/add' },
    { label: 'Requests', to: '/seller/requests' },
    { label: 'Analytics', to: '/seller/analytics' },
  ],
};

// role: 'buyer' | 'seller'
export default function Navbar({ role = 'buyer', brandName = 'UmaLink', userName, points }) {
  const items = NAV_ITEMS[role] || NAV_ITEMS.buyer;
  const { user, logout } = useAuth();
  const { count, orders, pendingCountForFarm } = useCart();
  const navigate = useNavigate();
  const [pointsOpen, setPointsOpen] = useState(false);
  // Explicit props win so pages can render a navbar for a fixed persona.
  const displayName = userName ?? user?.name;
  // Both sides of the market carry a balance, so the chip shows for whoever is
  // signed in, and pressing it opens the rules that apply to their role.
  const displayPoints = points ?? (role === 'buyer' ? user?.points : undefined);
  const pointsRole = user?.role ?? role;
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '?';

  // Buyer's own orders still waiting on a farm to confirm; seller's orders
  // waiting on them to confirm. Whichever applies to the current nav.
  const pendingBuyerCount = orders.filter((o) => o.status === 'Awaiting confirmation').length;
  const pendingSellerCount = user?.farmId ? pendingCountForFarm(user.farmId) : 0;

  // A seller signed in on this device goes straight to their dashboard;
  // everyone else gets the seller sign-in page first.
  const sellTarget = user?.role === 'seller' ? '/seller' : '/seller/login';

  function handleLogout() {
    setPointsOpen(false);
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to={role === 'seller' ? '/seller' : '/'} className="navbar-brand">
        <img src={logo} alt="" className="navbar-logo" />
        {brandName}
      </Link>

      <nav className="navbar-links">
        {items.map((item) => {
          const badgeCount =
            item.to === '/orders' ? pendingBuyerCount
            : item.to === '/seller/requests' ? pendingSellerCount
            : 0;
          return (
            <Link key={item.to} to={item.to} className="navbar-link">
              {item.label}
              {badgeCount > 0 && <span className="navbar-link-badge">{badgeCount}</span>}
            </Link>
          );
        })}
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
          <button
            type="button"
            className="navbar-points"
            onClick={() => setPointsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={pointsOpen}
            title="See how to earn more points"
          >
            {displayPoints} pts
          </button>
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

      {pointsOpen && (
        <PointsModal
          role={pointsRole}
          points={displayPoints ?? 0}
          onClose={() => setPointsOpen(false)}
        />
      )}
    </header>
  );
}