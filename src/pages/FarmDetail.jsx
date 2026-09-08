import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import CategoryBadge from '../components/CategoryBadge';
import Notice from '../components/Notice';
import { getFarmById } from '../data/farms';
import { getProductsByFarm } from '../data/products';
import { useCart } from '../context/CartContext';
import './FarmDetail.css';

// One farm's storefront: everything this farm is selling, addable to the cart
// from here so a shopper can fill a basket from a single farm in one pass.
const FarmDetail = () => {
  const { id } = useParams();
  const { requestAdd } = useCart();
  const [category, setCategory] = useState('');
  const [flash, setFlash] = useState('');

  const farm = getFarmById(id);
  const farmProducts = useMemo(() => (farm ? getProductsByFarm(farm.id) : []), [farm]);

  const visible = category ? farmProducts.filter((p) => p.category === category) : farmProducts;

  if (!farm) {
    return (
      <Layout role="buyer">
        <div className="farm-missing">
          <h1>We can't find that farm</h1>
          <p>It may have stopped accepting orders.</p>
          <Link to="/farms" className="farm-back">
            ← Back to all farms
          </Link>
        </div>
      </Layout>
    );
  }

  function handleAdd(product) {
    // requestAdd sends signed-out shoppers to /login and remembers the item.
    if (requestAdd(product)) setFlash(`${product.name} added to your cart.`);
  }

  return (
    <Layout role="buyer">
      <Link to="/farms" className="farm-back">
        ← All farms
      </Link>

      <header className="farm-hero">
        <div className="farm-hero-main">
          <div className="farm-hero-title">
            <h1>{farm.name}</h1>
            <span className="farm-hero-rating">★ {farm.rating}</span>
          </div>
          <p className="farm-hero-farmer">{farm.farmerName}</p>
          <p className="farm-hero-description">{farm.description}</p>

          <div className="farm-hero-tags">
            {farm.categories.map((c) => (
              <CategoryBadge key={c} category={c} />
            ))}
          </div>
        </div>

        <dl className="farm-hero-facts">
          <div>
            <dt>Location</dt>
            <dd>{farm.location}</dd>
          </div>
          <div>
            <dt>Prep time</dt>
            <dd>{farm.prepMinutes} min</dd>
          </div>
          <div>
            <dt>Delivery fee</dt>
            <dd>₱{farm.deliveryFee}</dd>
          </div>
          <div>
            <dt>Pick up at</dt>
            <dd>
              {farm.pickupAddress}
              <span className="farm-hero-hours">{farm.pickupHours}</span>
            </dd>
          </div>
        </dl>
      </header>

      <div className="farm-products-head">
        <h2>{farmProducts.length} items available today</h2>
        <div className="farm-filter-chips">
          <button
            type="button"
            className={`farm-chip ${category === '' ? 'is-active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {farm.categories.map((option) => (
            <button
              key={option}
              type="button"
              className={`farm-chip ${category === option ? 'is-active' : ''}`}
              onClick={() => setCategory(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <Notice tone="success">{flash}</Notice>

      <div className="farm-products-grid">
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            variant="buyer"
            actionLabel="Add to cart"
            to={`/product/${product.id}`}
            onAction={() => handleAdd(product)}
          />
        ))}
      </div>
    </Layout>
  );
};

export default FarmDetail;
