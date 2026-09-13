import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getProductsByFarm } from '../data/products';
import './MyListing.css';

const TABS = [
  { value: 'active', label: 'Active listings' },
  { value: 'pending', label: 'Pending pricing' },
];

const MyListings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') === 'pending' ? 'pending' : 'active';

  // Only this seller's own farm - not every listing in the marketplace.
  const myProducts = useMemo(
    () => (user?.farmId ? getProductsByFarm(user.farmId) : []),
    [user?.farmId],
  );

  const active = myProducts.filter((p) => typeof p.price === 'number');
  const pending = myProducts.filter((p) => typeof p.price !== 'number');
  const visible = status === 'pending' ? pending : active;

  function setStatus(next) {
    const params = new URLSearchParams(searchParams);
    params.set('status', next);
    setSearchParams(params, { replace: true });
  }

  return (
    <Layout role="seller" userName={user?.name}>
      <div className="listings-header">
        <div>
          <h1>Manage your listings</h1>
          <p>
            {user?.farmId
              ? 'Everything your farm currently has posted for buyers to see.'
              : "Your account isn't linked to a farm yet, so there's nothing to show here."}
          </p>
        </div>
        <Link to="/seller/add">
          <Button variant="primary">Add product</Button>
        </Link>
      </div>

      <div className="listings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`listings-tab ${status === tab.value ? 'listings-tab-active' : ''}`}
            onClick={() => setStatus(tab.value)}
          >
            {tab.label} ({tab.value === 'active' ? active.length : pending.length})
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="listings-grid">
          {visible.map((product) => (
            <ProductCard key={product.id} {...product} variant="seller" />
          ))}
        </div>
      ) : (
        <p className="listings-empty">
          {status === 'pending' ? 'Nothing waiting on a price right now.' : 'No active listings yet.'}
        </p>
      )}
    </Layout>
  );
};

export default MyListings;