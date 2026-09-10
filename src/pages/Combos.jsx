import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import CategoryBadge from '../components/CategoryBadge';
import Notice from '../components/Notice';
import promos, { PROMO_TYPES, promoAsCartItem } from '../data/promos';
import { useCart } from '../context/CartContext';
import { PESOS_PER_POINT } from '../data/points';
import './Combos.css';

const FILTERS = [{ value: 'all', label: 'All deals' }].concat(
  Object.entries(PROMO_TYPES).map(([value, label]) => ({ value, label })),
);

const Combos = () => {
  const { requestAdd } = useCart();
  const [filter, setFilter] = useState('all');
  const [flash, setFlash] = useState('');

  const visible = useMemo(
    () => (filter === 'all' ? promos : promos.filter((promo) => promo.type === filter)),
    [filter],
  );

  // A combo joins the cart as a single set-priced line, so the sign-in gate and
  // the farm grouping behave exactly as they do for a normal product.
  function handleClaim(promo) {
    if (requestAdd(promoAsCartItem(promo))) {
      setFlash(`${promo.title} added to your cart — worth ${promo.bonusPoints} bonus points.`);
    }
  }

  return (
    <Layout role="buyer">
      <section className="combos-hero">
        <p className="combos-eyebrow">Combos &amp; promos</p>
        <h1>Deals straight from the farms</h1>
        <p className="combos-hero-sub">
          Buy 1 take 1 sets, half-price add-ons and baskets priced under their parts. Every combo
          also pays bonus points on top of the 1 point you earn per ₱{PESOS_PER_POINT} spent.
        </p>
      </section>

      <div className="combos-filters" role="group" aria-label="Filter deals by type">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`combos-chip ${filter === option.value ? 'is-active' : ''}`}
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Notice tone="success">{flash}</Notice>

      <div className="combos-grid">
        {visible.map((promo) => (
          <article className={`combo-card is-${promo.type}`} key={promo.id}>
            <header className="combo-card-head">
              <span className="combo-type">{promo.typeLabel}</span>
              <CategoryBadge category={promo.category} />
            </header>

            <h2 className="combo-title">{promo.title}</h2>
            <p className="combo-tagline">{promo.tagline}</p>

            <Link to={`/farm/${promo.farmId}`} className="combo-farm">
              {promo.farmName} · {promo.farmLocation}
            </Link>

            <ul className="combo-items">
              {promo.items.map((item) => (
                <li key={item.productId}>
                  <span className="combo-item-qty">{item.quantity}×</span>
                  <span className="combo-item-name">
                    {item.name} <em>/ {item.unit}</em>
                  </span>
                  {item.note && <span className="combo-item-note">{item.note}</span>}
                </li>
              ))}
            </ul>

            <div className="combo-pricing">
              <span className="combo-price">₱{promo.price}</span>
              {promo.savings > 0 && (
                <>
                  <span className="combo-was">₱{promo.originalPrice}</span>
                  <span className="combo-save">Save ₱{promo.savings}</span>
                </>
              )}
            </div>

            <p className="combo-points">+{promo.bonusPoints} bonus points per set</p>
            <p className="combo-terms">{promo.terms}</p>

            <Button variant="primary" onClick={() => handleClaim(promo)}>
              Add combo to cart
            </Button>
          </article>
        ))}
      </div>
    </Layout>
  );
};

export default Combos;
