import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import './Login.css';

/*
 * Gateway page for the "Sell a product" button in the buyer header. It only
 * gets a seller account signed in and hands off to /seller — the seller side
 * itself is owned by the other half of the team.
 */
const SellerLogin = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const result =
      mode === 'signin'
        ? login({ email: form.email, password: form.password, role: 'seller' })
        : signup({ name: form.name, email: form.email, password: form.password, role: 'seller' });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/seller', { replace: true });
  }

  return (
    <Layout role="buyer">
      <div className="auth-shell">
        <div className="auth-card">
          <p className="auth-eyebrow">Seller account</p>
          <h1>{mode === 'signin' ? 'Sign in to sell' : 'Start selling on Farmstand'}</h1>
          <p className="auth-lede">
            {mode === 'signin'
              ? 'Get back to your listings, orders, and payouts.'
              : 'Register your farm, then list your first harvest.'}
          </p>

          <Notice tone="error">{error}</Notice>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label>
                <span>Farm or seller name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  required
                  autoComplete="organization"
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                autoComplete="email"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </label>

            <Button type="submit" variant="primary">
              {mode === 'signin' ? 'Sign in and open dashboard' : 'Create seller account'}
            </Button>
          </form>

          <p className="auth-switch">
            {mode === 'signin' ? 'New to selling here?' : 'Already selling with us?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
            >
              {mode === 'signin' ? 'Register your farm' : 'Sign in'}
            </button>
          </p>

          <p className="auth-alt">
            Here to buy instead? <Link to="/login">Go to the buyer sign in →</Link>
          </p>
        </div>

        <aside className="auth-aside">
          <h2>Selling on Farmstand</h2>
          <ul>
            <li>You set your own price per kilo, head, or tray.</li>
            <li>Orders reach you directly — no middleman taking a cut.</li>
            <li>Track listings and pending orders from one dashboard.</li>
          </ul>
          <p className="auth-aside-note">
            Already signed in as a seller? The header button takes you straight to your dashboard.
          </p>
        </aside>
      </div>
    </Layout>
  );
};

export default SellerLogin;
