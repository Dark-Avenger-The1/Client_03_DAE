import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Notice from '../components/Notice';
import products, { categories } from '../data/products';
import { useCart } from '../context/CartContext';
import './Catalog.css';

const SORTS = {
  featured: { label: 'Featured', compare: null },
  'price-asc': { label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', compare: (a, b) => b.price - a.price },
  name: { label: 'Name (A–Z)', compare: (a, b) => a.name.localeCompare(b.name) },
};

const Catalog = () => {
  const { requestAdd } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [flash, setFlash] = useState('');

  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';

  // The URL is the single source of truth so a filtered view can be shared.
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.farmerName.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });

    const compare = SORTS[sort]?.compare;
    return compare ? [...list].sort(compare) : list;
  }, [query, category, sort]);

  function handleAdd(product) {
    if (requestAdd(product)) setFlash(`${product.name} added to your cart.`);
  }

  return (
    <Layout role="buyer">
      <div className="catalog-head">
        <div>
          <h1>Browse the harvest</h1>
          <p>{visible.length} listing{visible.length === 1 ? '' : 's'} available right now.</p>
        </div>
      </div>

      <div className="catalog-filters">
        <input
          type="search"
          className="catalog-search"
          value={query}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder="Search products or farms"
          aria-label="Search products"
        />

        <div className="catalog-chips">
          <button
            type="button"
            className={`catalog-chip ${category === '' ? 'is-active' : ''}`}
            onClick={() => updateParam('category', '')}
          >
            All
          </button>
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              className={`catalog-chip ${category === option ? 'is-active' : ''}`}
              onClick={() => updateParam('category', option)}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="catalog-sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            {Object.entries(SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Notice tone="success">{flash}</Notice>

      {visible.length === 0 ? (
        <div className="catalog-empty">
          <h2>Nothing matches that yet</h2>
          <p>Try a different word, or clear the filters to see every listing.</p>
        </div>
      ) : (
        <div className="catalog-grid">
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
      )}
    </Layout>
  );
};

export default Catalog;
