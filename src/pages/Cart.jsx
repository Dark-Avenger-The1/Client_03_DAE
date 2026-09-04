import { useState } from 'react';
import { Link } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import './Cart.css';

// Mock data — replace with real cart state once the backend exists
const cartItems = [
  { id: 1, name: 'Carrots', farmName: "Aling Nena's Farm", qty: 2, unit: 'kg', price: 60 },
  { id: 2, name: 'Mangoes', farmName: 'Green Valley Farm', qty: 1, unit: 'kg', price: 120 },
];

const deliveryFee = 50;

const Cart = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal + deliveryFee;

  return (
    <Layout role="buyer" brandName="UmaLink" userName="Juan" points={120}>
      <h1 className="cart-title">Your cart</h1>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div>
              <h3>{item.name}</h3>
              <p className="cart-item-meta">{item.farmName} · {item.qty} {item.unit}</p>
            </div>
            <span className="cart-item-price">₱{item.qty * item.price}</span>
          </div>
        ))}
      </div>

      <div className="cart-section">
        <h2>Delivery details</h2>
        <label className="form-field">
          <span>Full name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" />
        </label>
        <label className="form-field">
          <span>Delivery address</span>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Barangay, City" />
        </label>
      </div>

      <div className="cart-section">
        <h2>Payment method</h2>
        <div className="payment-options">
          <label className={`payment-option ${paymentMethod === 'cod' ? 'payment-option-active' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
            />
            Cash on delivery
          </label>
          <label className={`payment-option ${paymentMethod === 'gcash' ? 'payment-option-active' : ''}`}>
            <input
              type="radio"
              name="payment"
              value="gcash"
              checked={paymentMethod === 'gcash'}
              onChange={() => setPaymentMethod('gcash')}
            />
            GCash
          </label>
        </div>
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>₱{subtotal}</span>
        </div>
        <div className="cart-summary-row">
          <span>Delivery fee</span>
          <span>₱{deliveryFee}</span>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <span>Total</span>
          <span>₱{total}</span>
        </div>
      </div>

      <Link to="/payment-confirmation">
        <Button variant="primary">Place order</Button>
      </Link>
    </Layout>
  );
};

export default Cart;
