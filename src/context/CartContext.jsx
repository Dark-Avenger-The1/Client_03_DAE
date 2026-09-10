import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { getFarmById } from '../data/farms';
import { pointsForItems, pointsForSpend } from '../data/points';

/*
 * Cart + orders, stored per account in localStorage.
 *
 * The gate the buyer flow depends on lives in requestAdd(): a signed-out
 * shopper is parked at /login and the item they clicked is remembered, then
 * added for them automatically once they sign in.
 *
 * A cart can hold items from several farms at once, so lines are grouped by
 * farm — checkout needs that to charge one delivery fee per farm, or to list
 * one pick-up point per farm.
 */

const PENDING_KEY = 'dae_pending_item';
const cartKey = (email) => `dae_cart_${email}`;
const ordersKey = (email) => `dae_orders_${email}`;

const CartContext = createContext(null);

function readJSON(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Pure so the loader and requestAdd stay in step.
function mergeItem(list, product, quantity) {
  const existing = list.find((i) => i.id === product.id);
  if (existing) {
    return list.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
  }
  // bonusPoints and isCombo are only set on combo lines; plain products leave
  // them undefined and simply earn on what they cost.
  const { id, name, price, unit, category, farmId, farmName, farmerName, bonusPoints, isCombo } =
    product;
  return [
    ...list,
    { id, name, price, unit, category, farmId, farmName, farmerName, bonusPoints, isCombo, quantity },
  ];
}

export function CartProvider({ children }) {
  const { user, addPoints } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  // Whose cart is currently held in state. It is state rather than a ref on
  // purpose: it only matches the signed-in account from the render where items
  // already holds the loaded cart, which keeps the save effects below from
  // writing the empty initial state over a stored cart.
  const [hydratedFor, setHydratedFor] = useState(null);

  // The account, identified by email rather than by the user object. Checkout
  // credits reward points, which replaces that object — keying the loader on it
  // would reload the pre-checkout cart and drop the order just placed.
  const email = user?.email ?? null;

  // Load this account's cart and orders, then apply anything they tried to add
  // while signed out. Writing the merge straight back keeps this idempotent, so
  // React's double-invoked effects in development can't drop the pending item.
  useEffect(() => {
    if (!email) {
      setHydratedFor(null);
      setItems([]);
      setOrders([]);
      return;
    }

    const stored = readJSON(localStorage, cartKey(email), []);
    const pending = readJSON(sessionStorage, PENDING_KEY, null);
    const merged = pending ? mergeItem(stored, pending.product, pending.quantity) : stored;

    if (pending) {
      sessionStorage.removeItem(PENDING_KEY);
      localStorage.setItem(cartKey(email), JSON.stringify(merged));
    }

    setItems(merged);
    setOrders(readJSON(localStorage, ordersKey(email), []));
    setHydratedFor(email);
  }, [email]);

  useEffect(() => {
    if (email && hydratedFor === email) {
      localStorage.setItem(cartKey(email), JSON.stringify(items));
    }
  }, [items, email, hydratedFor]);

  useEffect(() => {
    if (email && hydratedFor === email) {
      localStorage.setItem(ordersKey(email), JSON.stringify(orders));
    }
  }, [orders, email, hydratedFor]);

  const value = useMemo(() => {
    // Returns true when the item went in, false when the shopper was sent to sign in.
    function requestAdd(product, quantity = 1) {
      if (!user) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ product, quantity }));
        navigate(`/login?next=${encodeURIComponent(location.pathname)}&reason=cart`);
        return false;
      }
      setItems((current) => mergeItem(current, product, quantity));
      return true;
    }

    function removeItem(id) {
      setItems((current) => current.filter((i) => i.id !== id));
    }

    function setQuantity(id, quantity) {
      if (quantity < 1) return removeItem(id);
      setItems((current) => current.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }

    function clearCart() {
      setItems([]);
    }

    // One entry per farm represented in the cart.
    const farmGroups = [];
    for (const item of items) {
      let group = farmGroups.find((g) => g.farmId === item.farmId);
      if (!group) {
        group = { farmId: item.farmId, farm: getFarmById(item.farmId), items: [], subtotal: 0 };
        farmGroups.push(group);
      }
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    }

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Delivery is charged once per farm, since each farm ships its own crates.
    const deliveryTotal = farmGroups.reduce((sum, g) => sum + (g.farm?.deliveryFee ?? 0), 0);

    // method: 'delivery' | 'pickup'
    function placeOrder({ method, contact }) {
      if (!user || items.length === 0) return null;

      const deliveryFee = method === 'delivery' ? deliveryTotal : 0;

      // Rewards: the goods earn 1 point per ₱200, and any combo in the cart adds
      // the bonus printed on its card. Delivery fees do not earn.
      const basePoints = pointsForSpend(subtotal);
      const bonusPoints = pointsForItems(items);
      const pointsEarned = basePoints + bonusPoints;

      const order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        placedAt: new Date().toISOString(),
        status: method === 'pickup' ? 'Ready for pick up' : 'Awaiting confirmation',
        method,
        items,
        itemsTotal: subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        basePoints,
        bonusPoints,
        pointsEarned,
        contact,
        // Snapshot the farm details so an old order still reads correctly if a
        // farm later changes its address or fee.
        farms: farmGroups.map((g) => ({
          farmId: g.farmId,
          name: g.farm?.name,
          location: g.farm?.location,
          pickupAddress: g.farm?.pickupAddress,
          pickupHours: g.farm?.pickupHours,
          prepMinutes: g.farm?.prepMinutes,
          deliveryFee: method === 'delivery' ? g.farm?.deliveryFee ?? 0 : 0,
          subtotal: g.subtotal,
        })),
      };

      setOrders((current) => [order, ...current]);
      setItems([]);
      if (pointsEarned > 0) addPoints(pointsEarned);
      return order;
    }

    return {
      items,
      orders,
      count,
      subtotal,
      farmGroups,
      deliveryTotal,
      requestAdd,
      setQuantity,
      removeItem,
      clearCart,
      placeOrder,
    };
  }, [items, orders, user, addPoints, navigate, location.pathname]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

