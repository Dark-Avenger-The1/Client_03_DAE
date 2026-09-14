import Layout from '../components/Layout';
import Button from '../components/Button';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './SellerRequests.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Maps the buyer-facing order.status strings to the small set OrderStatusBadge
// understands, so a real status always renders something sensible.
function badgeStatus(status) {
  if (status === 'Awaiting confirmation') return 'pending';
  if (status === 'Declined by farm') return 'cancelled';
  if (status === 'Delivered') return 'delivered';
  if (status?.startsWith('Confirmed') || status === 'Out for delivery') return 'confirmed';
  return 'confirmed';
}

// Every stage still needing seller action is "open"; Delivered/Declined are
// end states and move to the "Already handled" list below.
function isOpen(status) {
  return status === 'Awaiting confirmation'
    || status === 'Confirmed — preparing for delivery'
    || status === 'Out for delivery';
}

/*
 * A seller's incoming orders - only the ones that include something from
 * their own farm, read from the shared feed CartContext writes to. There's
 * no real backend yet, so "shared feed" only works within one browser: a
 * seller only sees orders placed by a buyer on this same device.
 */
const SellerRequests = () => {
  const { user } = useAuth();
  const { feedForFarm, confirmFeedOrder, declineFeedOrder, markOutForDelivery, markDelivered } =
    useCart();

  const myFeed = user?.farmId ? feedForFarm(user.farmId) : [];
  const open = myFeed.filter((o) => isOpen(o.status));
  const handled = myFeed.filter((o) => !isOpen(o.status));

  return (
    <Layout role="seller" userName={user?.name}>
      <div className="requests-header">
        <h1>Order requests</h1>
        <p>Confirm or decline orders from buyers that include your products.</p>
      </div>

      {!user?.farmId && (
        <Notice tone="info">Your account isn't linked to a farm yet, so there's nothing to show here.</Notice>
      )}

      {user?.farmId && myFeed.length === 0 && (
        <Notice tone="info">No orders yet — place a delivery order from the buyer side to see it appear here.</Notice>
      )}

      {open.length > 0 && (
        <div className="requests-list">
          {open.map((order) => (
            <div key={order.id} className="request-card">
              <div className="request-info">
                <div className="request-top-row">
                  <h3>{order.buyerName}</h3>
                  <OrderStatusBadge status={badgeStatus(order.status)} />
                </div>
                <p className="request-meta">Order {order.id} · Placed {formatDate(order.placedAt)}</p>
                <ul className="request-items">
                  {order.items
                    .filter((item) => item.farmId === user.farmId)
                    .map((item) => (
                      <li key={item.id}>{item.name} · {item.quantity} {item.unit}</li>
                    ))}
                </ul>
                <p className="request-total">₱{order.total} total · paying via {order.paymentMethod ?? 'cash'}</p>
              </div>

              <div className="request-actions">
                {order.status === 'Awaiting confirmation' && (
                  <>
                    <Button variant="primary" onClick={() => confirmFeedOrder(order.id)}>
                      Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => declineFeedOrder(order.id)}>
                      Decline
                    </Button>
                  </>
                )}
                {order.status === 'Confirmed — preparing for delivery' && (
                  <Button variant="primary" onClick={() => markOutForDelivery(order.id)}>
                    Mark out for delivery
                  </Button>
                )}
                {order.status === 'Out for delivery' && (
                  <Button variant="primary" onClick={() => markDelivered(order.id)}>
                    Mark delivered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {handled.length > 0 && (
        <>
          <h2 className="requests-subheading">Already handled</h2>
          <div className="requests-list">
            {handled.map((order) => (
              <div key={order.id} className="request-card request-card-done">
                <div className="request-info">
                  <div className="request-top-row">
                    <h3>{order.buyerName}</h3>
                    <OrderStatusBadge status={badgeStatus(order.status)} />
                  </div>
                  <p className="request-meta">Order {order.id} · Placed {formatDate(order.placedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default SellerRequests;