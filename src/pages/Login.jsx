import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const REASONS = {
  cart: 'Almost there — sign in to add that item to your cart.',
  account: 'Sign in to see this part of your account.',
  order: 'Sign in to place your order.',
};

const Login = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const next = searchParams.get('next') || '/';
  const reason = REASONS[searchParams.get('reason')];

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
        ? login({ email: form.email, password: form.password, role: 'buyer' })
        : signup({ name: form.name, email: form.email, password: form.password, role: 'buyer' });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Anything the shopper tried to add while signed out is applied by CartProvider.
    navigate(next, { replace: true });
  }

  return (
    <Layout role="buyer" brandName="Farmstand">
      <div className="auth-shell">
        <div className="auth-card">
          <p className="auth-eyebrow">Buyer account</p>
          <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-lede">
            {mode === 'signin'
              ? 'Sign in to fill your cart and track your orders.'
              : 'It takes a minute, and you only need it when you order.'}
          </p>

          <Notice tone="info">{reason}</Notice>
          <Notice tone="error">{error}</Notice>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  required
                  autoComplete="name"
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
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="auth-switch">
            {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <p className="auth-alt">
            Selling instead of buying? <Link to="/seller/login">Go to the seller sign in →</Link>
          </p>
        </div>

        <aside className="auth-aside">
          <h2>Why an account?</h2>
          <ul>
            <li>Your cart stays put between visits.</li>
            <li>Farms need a name and delivery address to pack an order.</li>
            <li>You can follow each order from harvest to doorstep.</li>
          </ul>
          <p className="auth-aside-note">
            Browsing stays open to everyone — you only sign in when you order.
          </p>
        </aside>
      </div>
    </Layout>
  );
};

export default Login;
