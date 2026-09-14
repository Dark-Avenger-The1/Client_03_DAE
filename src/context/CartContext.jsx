import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { getFarmById } from '../data/farms';
import { pointsForSpend, pointsForItems } from '../data/points';

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
// Shared across every account on this browser - the fake-backend stand-in
// that lets a seller "see" orders placed by any buyer, and lets a buyer see
// the seller's confirmation reflected back. A real backend would replace
// this with an actual per-farm orders query.
const FEED_KEY = 'dae_order_feed';

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
  const { id, name, price, unit, category, farmId, farmName, farmerName } = product;
  return [
    ...list,
    { id, name, price, unit, category, farmId, farmName, farmerName, quantity },
  ];
}

export function CartProvider({ children }) {
  const { user, addPoints } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFeed, setOrderFeed] = useState(() => readJSON(localStorage, FEED_KEY, []));
  // Whose cart is currently held in state. It is state rather than a ref on
  // purpose: it only matches the signed-in account from the render where items
  // already holds the loaded cart, which keeps the save effects below from
  // writing the empty initial state over a stored cart.
  const [hydratedFor, setHydratedFor] = useState(null);

  // Load this account's cart and orders, then apply anything they tried to add
  // while signed out. Writing the merge straight back keeps this idempotent, so
  // React's double-invoked effects in development can't drop the pending item.
  useEffect(() => {
    if (!user) {
      setHydratedFor(null);
      setItems([]);
      setOrders([]);
      return;
    }

    const stored = readJSON(localStorage, cartKey(user.email), []);
    const pending = readJSON(sessionStorage, PENDING_KEY, null);
    const merged = pending ? mergeItem(stored, pending.product, pending.quantity) : stored;

    if (pending) {
      sessionStorage.removeItem(PENDING_KEY);
      localStorage.setItem(cartKey(user.email), JSON.stringify(merged));
    }

    setItems(merged);
    setOrders(readJSON(localStorage, ordersKey(user.email), []));
    setHydratedFor(user.email);
  }, [user]);

  useEffect(() => {
    if (user && hydratedFor === user.email) {
      localStorage.setItem(cartKey(user.email), JSON.stringify(items));
    }
  }, [items, user, hydratedFor]);

  useEffect(() => {
    if (user && hydratedFor === user.email) {
      localStorage.setItem(ordersKey(user.email), JSON.stringify(orders));
    }
  }, [orders, user, hydratedFor]);

  useEffect(() => {
    localStorage.setItem(FEED_KEY, JSON.stringify(orderFeed));
  }, [orderFeed]);

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
    // paymentMethod: 'cash' | 'gcash' | 'points'
    function placeOrder({ method, contact, paymentMethod = 'cash' }) {
      if (!user || items.length === 0) return null;

      const deliveryFee = method === 'delivery' ? deliveryTotal : 0;
      const order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        placedAt: new Date().toISOString(),
        status: method === 'pickup' ? 'Ready for pick up' : 'Awaiting confirmation',
        method,
        paymentMethod,
        items,
        itemsTotal: subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
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

      // Delivery orders need a farm to confirm them - drop a copy in the
      // shared feed so a seller session on this browser can see and act on
      // it. Pickup orders skip this; they're already "Ready for pick up".
      if (method === 'delivery') {
        setOrderFeed((current) => [
          { ...order, buyerEmail: user.email, buyerName: user.name },
          ...current,
        ]);
      }

      // Earn points on what you spend - unless you just paid WITH points,
      // which would be circular. Combo bonus points (data/points.js) stack
      // on top of the base spend rate.
      if (paymentMethod !== 'points') {
        const earned = pointsForSpend(subtotal) + pointsForItems(items);
        if (earned > 0) addPoints(earned);
      }

      return order;
    }

    // Every farmId represented anywhere in the feed - lets a seller check
    // "is anything here for my farm" without walking every order by hand.
    function pendingCountForFarm(farmId) {
      if (!farmId) return 0;
      return orderFeed.filter(
        (o) => o.status === 'Awaiting confirmation' && o.farms?.some((f) => f.farmId === farmId),
      ).length;
    }

    // Orders that include at least one item from this farm.
    function feedForFarm(farmId) {
      if (!farmId) return [];
      return orderFeed.filter((o) => o.farms?.some((f) => f.farmId === farmId));
    }

    // The one place an order's status actually changes. Updates the shared
    // feed AND writes the same change back into that buyer's own order
    // history, so /orders reflects it - that write-back IS the "notify the
    // buyer" mechanism, since there's no push notification system here.
    function updateFeedOrderStatus(orderId, status) {
      setOrderFeed((current) => current.map((o) => (o.id === orderId ? { ...o, status } : o)));

      const target = orderFeed.find((o) => o.id === orderId);
      if (!target) return;
      const buyerOrders = readJSON(localStorage, ordersKey(target.buyerEmail), []);
      const updated = buyerOrders.map((o) => (o.id === orderId ? { ...o, status } : o));
      localStorage.setItem(ordersKey(target.buyerEmail), JSON.stringify(updated));
      if (user && user.email === target.buyerEmail) {
        setOrders(updated);
      }
    }

    // Named helpers for each real transition a seller can make, so the UI
    // reads as actions ("confirm this order") rather than raw status strings.
    const confirmFeedOrder = (orderId) =>
      updateFeedOrderStatus(orderId, 'Confirmed — preparing for delivery');
    const declineFeedOrder = (orderId) => updateFeedOrderStatus(orderId, 'Declined by farm');
    const markOutForDelivery = (orderId) => updateFeedOrderStatus(orderId, 'Out for delivery');
    const markDelivered = (orderId) => updateFeedOrderStatus(orderId, 'Delivered');

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
      orderFeed,
      pendingCountForFarm,
      feedForFarm,
      confirmFeedOrder,
      declineFeedOrder,
      markOutForDelivery,
      markDelivered,
    };
  }, [items, orders, user, navigate, location.pathname, orderFeed, addPoints]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}