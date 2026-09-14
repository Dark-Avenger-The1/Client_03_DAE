import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import accounts from '../data/accounts';

/*
 * Front-end-only auth so the buyer flow can be demoed before the backend exists.
 * Accounts live in localStorage and passwords are NOT hashed — swap the three
 * functions below for real API calls when the server is ready.
 *
 * Buyer and seller sessions are stored separately (dae_session_buyer /
 * dae_session_seller) so logging in as one role never touches the other.
 * `activeRole` just tracks which one `user` currently points at.
 */

const SESSION_KEYS = { buyer: 'dae_session_buyer', seller: 'dae_session_seller' };
const ACTIVE_ROLE_KEY = 'dae_active_role';
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
  const [buyerUser, setBuyerUser] = useState(() => readJSON(localStorage, SESSION_KEYS.buyer, null));
  const [sellerUser, setSellerUser] = useState(() => readJSON(localStorage, SESSION_KEYS.seller, null));
  const [activeRole, setActiveRole] = useState(() => readJSON(localStorage, ACTIVE_ROLE_KEY, null));

  // Seeds any demo account that isn't already saved, matched by email. Runs
  // every load (not just once-ever), so adding a new demo account later
  // still reaches browsers that were already seeded with an older, shorter
  // list. Never touches or removes real accounts someone signed up with.
  useEffect(() => {
    const existing = readJSON(localStorage, ACCOUNTS_KEY, []);
    const existingEmails = new Set(existing.map((a) => a.email.toLowerCase()));
    const missing = accounts.filter((a) => !existingEmails.has(a.email.toLowerCase()));
    if (missing.length > 0) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...existing, ...missing]));
    }
  }, []);

  useEffect(() => {
    if (buyerUser) localStorage.setItem(SESSION_KEYS.buyer, JSON.stringify(buyerUser));
    else localStorage.removeItem(SESSION_KEYS.buyer);
  }, [buyerUser]);

  useEffect(() => {
    if (sellerUser) localStorage.setItem(SESSION_KEYS.seller, JSON.stringify(sellerUser));
    else localStorage.removeItem(SESSION_KEYS.seller);
  }, [sellerUser]);

  useEffect(() => {
    if (activeRole) localStorage.setItem(ACTIVE_ROLE_KEY, JSON.stringify(activeRole));
    else localStorage.removeItem(ACTIVE_ROLE_KEY);
  }, [activeRole]);

  const value = useMemo(() => {
    const getAccounts = () => readJSON(localStorage, ACCOUNTS_KEY, []);

    // role: 'buyer' | 'seller'
    function signup({ name, email, password, role = 'buyer' }) {
      const list = getAccounts();
      if (list.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: 'An account with that email already exists.' };
      }
      const account = { name, email, password, role, points: 0 };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...list, account]));
      const { password: _pw, ...safe } = account;
      if (role === 'seller') setSellerUser(safe);
      else setBuyerUser(safe);
      setActiveRole(role);
      return { ok: true };
    }

    function login({ email, password, role = 'buyer' }) {
      const account = getAccounts().find(
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
      if (role === 'seller') setSellerUser(safe);
      else setBuyerUser(safe);
      setActiveRole(role);
      return { ok: true };
    }

    // Logs out one role's session only. Defaults to whichever role is
    // currently active, so existing logout() calls (no argument) keep
    // working exactly as before - the other role's session is left alone,
    // and `user` switches back to it automatically if it still exists.
    function logout(role) {
      const target = role ?? activeRole;
      if (target === 'seller') {
        setSellerUser(null);
        setActiveRole(buyerUser ? 'buyer' : null);
      } else {
        setBuyerUser(null);
        setActiveRole(sellerUser ? 'seller' : null);
      }
    }

    // Rewards balance. Always the buyer's, since points are a buyer-loyalty
    // feature - writes through to the stored account so it survives sign-out.
    function addPoints(amount) {
      if (!buyerUser || !amount) return buyerUser?.points ?? 0;

      const next = (buyerUser.points ?? 0) + amount;
      const updated = getAccounts().map((a) =>
        a.email.toLowerCase() === buyerUser.email.toLowerCase() ? { ...a, points: next } : a,
      );
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
      setBuyerUser((current) => ({ ...current, points: next }));
      return next;
    }

    const user = activeRole === 'seller' ? sellerUser : buyerUser;

    return {
      user,
      buyerUser,
      sellerUser,
      isLoggedIn: Boolean(user),
      signup,
      login,
      logout,
      addPoints,
    };
  }, [buyerUser, sellerUser, activeRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}