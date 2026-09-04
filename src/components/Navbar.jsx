import { Link } from 'react-router';
import logo from '../assets/umalink-logo.png';
import './Navbar.css';

const NAV_ITEMS = {
  buyer: [
    { label: 'Catalog', to: '/' },
    { label: 'My orders', to: '/orders' },
    { label: 'Cart', to: '/cart' },
  ],
  seller: [
    { label: 'Dashboard', to: '/seller' },
    { label: 'My listings', to: '/seller/listings' },
    { label: 'Add product', to: '/seller/add' },
    { label: 'Requests', to: '/seller/requests', badgeKey: 'pendingRequests' },
    { label: 'Analytics', to: '/seller/analytics' },
  ],
};

// role: 'buyer' | 'seller'
// pendingRequests: optional number shown as a small badge on the seller's "Requests" link
export default function Navbar({ role = 'buyer', brandName = 'UmaLink', userName, points, pendingRequests }) {
  const items = NAV_ITEMS[role] || NAV_ITEMS.buyer;
  const initials = userName ? userName.slice(0, 2).toUpperCase() : '?';

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logo} alt="" className="navbar-logo" />
        {brandName}
      </Link>

      <nav className="navbar-links">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="navbar-link">
            {item.label}
            {item.badgeKey && typeof pendingRequests === 'number' && pendingRequests > 0 && (
              <span className="navbar-link-badge">{pendingRequests}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="navbar-right">
        {role === 'buyer' && typeof points === 'number' && (
          <span className="navbar-points">{points} pts</span>
        )}
        <div className="navbar-avatar">{initials}</div>
      </div>
    </header>
  );
}
