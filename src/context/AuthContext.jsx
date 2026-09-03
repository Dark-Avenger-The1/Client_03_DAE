import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/*
 * Front-end-only auth so the buyer flow can be demoed before the backend exists.
 * Accounts live in localStorage and passwords are NOT hashed — swap the three
 * functions below for real API calls when the server is ready.
 */

const SESSION_KEY = 'dae_session';
const ACCOUNTS_KEY = 'dae_accounts';

const AuthContext = createContext(null);

function readJSON(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(localStorage, SESSION_KEY, null));

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const value = useMemo(() => {
    const accounts = () => readJSON(localStorage, ACCOUNTS_KEY, []);

    // role: 'buyer' | 'seller'
    function signup({ name, email, password, role = 'buyer' }) {
      const list = accounts();
      if (list.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: 'An account with that email already exists.' };
      }
      const account = { name, email, password, role, points: 0 };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...list, account]));
      const { password: _pw, ...safe } = account;
      setUser(safe);
      return { ok: true };
    }

    function login({ email, password, role = 'buyer' }) {
      const account = accounts().find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
      );
      if (!account) return { ok: false, error: 'We could not find an account with those details.' };
      if (account.role !== role) {
        return {
          ok: false,
          error:
            role === 'seller'
              ? 'That email is registered as a buyer account.'
              : 'That email is registered as a seller account.',
        };
      }
      const { password: _pw, ...safe } = account;
      setUser(safe);
      return { ok: true };
    }

    function logout() {
      setUser(null);
    }

    return { user, isLoggedIn: Boolean(user), signup, login, logout };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
