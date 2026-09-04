import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import CategoryBadge from '../components/CategoryBadge';
import Button from '../components/Button';
import Notice from '../components/Notice';
import FarmCard from '../components/FarmCard';
import products, { categories, countProductsByFarm } from '../data/products';
import farms from '../data/farms';
import { useCart } from '../context/CartContext';
import './Landing.css';

const STEPS = [
  {
    title: 'Browse the harvest',
    body: 'See what farms near you picked this week, with the price per kilo up front.',
  },
  {
    title: 'Order direct',
    body: 'Add to cart and check out with the farmer — no middleman markup in between.',
  },
  {
    title: 'Get it fresh',
    body: 'The farm packs your order and delivers it, usually within a day of harvest.',
  },
];

const Landing = () => {
  const { requestAdd } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [flash, setFlash] = useState('');

  // A spread across the three categories rather than the first four rows.
  const featured = [3, 9, 20, 6].map((id) => products.find((p) => p.id === id));

  function handleSearch(event) {
    event.preventDefault();
    navigate(query.trim() ? `/catalog?q=${encodeURIComponent(query.trim())}` : '/catalog');
  }

  function handleAdd(product) {
    // requestAdd sends signed-out shoppers to /login and remembers the item.
    if (requestAdd(product)) setFlash(`${product.name} added to your cart.`);
  }

  return (
    <Layout role="buyer">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Straight from the farm</p>
          <h1>Fresh produce, bought direct from the people who grew it.</h1>
          <p className="landing-lede">
            Farmstand connects you with local farms selling vegetables, fruit, and livestock at
            their own prices — so more of what you pay stays with the farmer.
          </p>

          <form className="landing-search" onSubmit={handleSearch}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for carrots, mangoes, eggs…"
              aria-label="Search products"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>

          <div className="landing-hero-actions">
            <Link to="/catalog" className="landing-link-strong">
              Browse everything
            </Link>
            <Link to="/seller/login" className="landing-link-quiet">
              Are you a farmer? Sell a product →
            </Link>
          </div>
        </div>

        <div className="landing-hero-panel">
          <div className="landing-stat">
            <span className="landing-stat-value">{products.length}</span>
            <span className="landing-stat-label">Listings this week</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">{farms.length}</span>
            <span className="landing-stat-label">Registered farms</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">0%</span>
            <span className="landing-stat-label">Middleman markup</span>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <h2>Shop by category</h2>
        </div>
        <div className="landing-categories">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/catalog?category=${encodeURIComponent(category)}`}
              className="landing-category"
            >
              <CategoryBadge category={category} />
              <span className="landing-category-count">
                {products.filter((p) => p.category === category).length} listings
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <h2>Fresh this week</h2>
          <Link to="/catalog" className="landing-link-quiet">
            See all listings →
          </Link>
        </div>

        <Notice tone="success">{flash}</Notice>

        <div className="landing-grid">
          {featured.map((product) => (
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
      </section>


      <section className="landing-section">
        <div className="landing-section-head">
          <div>
            <h2>Shop by farm</h2>
            <p className="landing-section-sub">
              {farms.length} farms accepting orders right now. Pick one to see everything they have.
            </p>
          </div>
          <Link to="/farms" className="landing-link-quiet">
            See all farms →
          </Link>
        </div>

        <div className="landing-farms">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} itemCount={countProductsByFarm(farm.id)} />
          ))}
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-section-head">
          <h2>How it works</h2>
        </div>
        <div className="landing-steps">
          {STEPS.map((step, index) => (
            <div className="landing-step" key={step.title}>
              <span className="landing-step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-sell">
        <div>
          <h2>Growing something worth selling?</h2>
          <p>List your harvest on Farmstand and set your own price. Setup takes a few minutes.</p>
        </div>
        <Link to="/seller/login" className="landing-sell-cta">
          Sell a product
        </Link>
      </section>
    </Layout>
  );
};

export default Landing;
