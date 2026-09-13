import { useMemo } from 'react';
import { Link } from 'react-router';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getProductsByFarm } from '../data/products';
import './HomeSeller.css';

const HomeSeller = () => {
  const { user } = useAuth();

  const myProducts = useMemo(
    () => (user?.farmId ? getProductsByFarm(user.farmId) : []),
    [user?.farmId],
  );

  const active = myProducts.filter((p) => typeof p.price === 'number');
  const pending = myProducts.filter((p) => typeof p.price !== 'number');

  return (
    <Layout role="seller" userName={user?.name}>
      <div className="seller-dashboard-header">
        <div>
          <h1>Your listings</h1>
          <p>Manage what you're currently offering to buyers.</p>
        </div>
        <Link to="/seller/add">
          <Button variant="primary">Add product</Button>
        </Link>
      </div>

      <div className="seller-stats">
        <Link to="/seller/listings?status=active" className="stat-card stat-card-link">
          <span className="stat-value">{active.length}</span>
          <span className="stat-label">Active listings</span>
        </Link>
        <Link to="/seller/listings?status=pending" className="stat-card stat-card-link">
          <span className="stat-value">{pending.length}</span>
          <span className="stat-label">Pending pricing</span>
        </Link>
      </div>

      {myProducts.length > 0 ? (
        <div className="seller-product-grid">
          {myProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} {...product} variant="seller" />
          ))}
        </div>
      ) : (
        <p className="listings-empty">
          {user?.farmId
            ? "You haven't listed anything yet."
            : "Your account isn't linked to a farm yet, so there's nothing to show here."}
        </p>
      )}
    </Layout>
  );
};

export default HomeSeller;