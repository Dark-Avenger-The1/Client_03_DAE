import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import CategoryBadge from '../components/CategoryBadge';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const { items, subtotal, farmGroups, deliveryTotal, setQuantity, removeItem, placeOrder } =
    useCart();
  const navigate = useNavigate();

  // 'delivery' | 'pickup'
  const [method, setMethod] = useState('delivery');
  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    phone: '',
    address: '',
    preferredDate: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const deliveryFee = method === 'delivery' ? deliveryTotal : 0;
  const total = subtotal + deliveryFee;

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function handleCheckout(event) {
    event.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const contact =
      method === 'delivery'
        ? { fullName: form.fullName, phone: form.phone, address: form.address, notes: form.notes }
        : {
            fullName: form.fullName,
            phone: form.phone,
            preferredDate: form.preferredDate,
            notes: form.notes,
          };

    const order = placeOrder({ method, contact });
    if (!order) {
      setError('We could not place that order. Please try again.');
      return;
    }
    navigate(`/orders?placed=${order.id}`);
  }

  if (items.length === 0) {
    return (
      <Layout role="buyer">
        <div className="cart-empty">
          <h1>Your cart is empty</h1>
          <p>Signed in as {user.name} — everything you add is saved to your account.</p>
          <Link to="/catalog" className="cart-empty-cta">
            Browse the harvest
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="buyer" brandName="Farmstand">
      <div className="cart-head">
        <h1>Your cart</h1>
        <p>
          {items.length} listing{items.length === 1 ? '' : 's'} from {farmGroups.length} farm
          {farmGroups.length === 1 ? '' : 's'}.
        </p>
      </div>

      <Notice tone="error">{error}</Notice>

      <div className="cart-shell">
        <div className="cart-items">
          {/* Grouped by farm: each farm packs and hands over its own crate. */}
          {farmGroups.map((group) => (
            <section className="cart-group" key={group.farmId}>
              <header className="cart-group-head">
                <div>
                  <Link to={`/farm/${group.farmId}`} className="cart-group-name">
                    {group.farm?.name}
                  </Link>
                  <p>{group.farm?.location}</p>
                </div>
                <span className="cart-group-subtotal">₱{group.subtotal}</span>
              </header>

              {group.items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-thumb" data-category={item.category} />

                  <div className="cart-item-info">
                    <CategoryBadge category={item.category} />
                    <h3>
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h3>
                    <p className="cart-item-unit">
                      ₱{item.price} / {item.unit}
                    </p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease ${item.name}`}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <p className="cart-item-line-total">₱{item.price * item.quantity}</p>

                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>

        <form className="cart-summary" onSubmit={handleCheckout}>
          <h2>Checkout</h2>

          <div className="fulfillment-toggle" role="group" aria-label="Fulfillment method">
            <button
              type="button"
              className={`fulfillment-option ${method === 'delivery' ? 'is-active' : ''}`}
              onClick={() => setMethod('delivery')}
              aria-pressed={method === 'delivery'}
            >
              Delivery
            </button>
            <button
              type="button"
              className={`fulfillment-option ${method === 'pickup' ? 'is-active' : ''}`}
              onClick={() => setMethod('pickup')}
              aria-pressed={method === 'pickup'}
            >
              Pick up
            </button>
          </div>

          {method === 'pickup' ? (
            <>
              <p className="cart-method-note">
                Collect your order at the {farmGroups.length > 1 ? 'farms' : 'farm'} below. No
                delivery fee.
              </p>

              <div className="pickup-points">
                {farmGroups.map((group) => (
                  <div className="pickup-point" key={group.farmId}>
                    <h3>{group.farm?.name}</h3>
                    <p className="pickup-address">{group.farm?.pickupAddress}</p>
                    <p className="pickup-hours">{group.farm?.pickupHours}</p>
                    <p className="pickup-ready">
                      Ready about {group.farm?.prepMinutes} min after confirmation
                    </p>
                  </div>
                ))}
              </div>

              <label className="cart-field">
                <span>Who is collecting?</span>
                <input type="text" value={form.fullName} onChange={update('fullName')} required />
              </label>

              <label className="cart-field">
                <span>Contact number</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="09XX XXX XXXX"
                  required
                />
              </label>

              <label className="cart-field">
                <span>Preferred pick-up date (optional)</span>
                <input type="date" value={form.preferredDate} onChange={update('preferredDate')} />
              </label>
            </>
          ) : (
            <>
              <p className="cart-method-note">
                Each farm delivers its own crate, so the fee is charged per farm.
              </p>

              <label className="cart-field">
                <span>Full name</span>
                <input type="text" value={form.fullName} onChange={update('fullName')} required />
              </label>

              <label className="cart-field">
                <span>Contact number</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="09XX XXX XXXX"
                  required
                />
              </label>

              <label className="cart-field">
                <span>Delivery address</span>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={update('address')}
                  placeholder="House number, street, barangay, city"
                  required
                />
              </label>
            </>
          )}

          <label className="cart-field">
            <span>Note for the farm (optional)</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={update('notes')}
              placeholder={
                method === 'pickup'
                  ? 'Arrival time, vehicle, who to look for…'
                  : 'Landmark, gate instructions, preferred day…'
              }
            />
          </label>

          <div className="cart-totals">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal}</span>
            </div>

            {method === 'delivery' ? (
              <>
                {farmGroups.map((group) => (
                  <div className="cart-summary-row cart-summary-sub" key={group.farmId}>
                    <span>Delivery — {group.farm?.name}</span>
                    <span>₱{group.farm?.deliveryFee}</span>
                  </div>
                ))}
                <div className="cart-summary-row">
                  <span>Delivery total</span>
                  <span>₱{deliveryTotal}</span>
                </div>
              </>
            ) : (
              <div className="cart-summary-row">
                <span>Delivery</span>
                <span>₱0 — pick up</span>
              </div>
            )}

            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>₱{total}</span>
            </div>
          </div>

          <Button type="submit" variant="primary">
            {method === 'pickup' ? 'Reserve for pick up' : 'Place order'}
          </Button>

          <p className="cart-summary-note">
            Ordering as {user.name} ({user.email}). You pay the farm on{' '}
            {method === 'pickup' ? 'pick up' : 'delivery'}.
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Cart;
