import { Link, useSearchParams } from 'react-router';
import Layout from '../components/Layout';
import Notice from '../components/Notice';
import { useCart } from '../context/CartContext';
import './Orders.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const Orders = () => {
  const { orders } = useCart();
  const [searchParams] = useSearchParams();
  const placed = searchParams.get('placed');
  const placedOrder = orders.find((o) => o.id === placed);

  return (
    <Layout role="buyer" brandName="Farmstand">
      <div className="orders-head">
        <h1>My orders</h1>
        <p>Every order you've placed, newest first.</p>
      </div>

      <Notice tone="success">
        {placed &&
          (placedOrder?.method === 'pickup'
            ? `Order ${placed} is reserved. Collect it at the farm once they confirm.`
            : `Order ${placed} is in. The farm will confirm it shortly.`)}
      </Notice>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders yet</h2>
          <p>When you check out, your orders show up here with their status.</p>
          <Link to="/catalog" className="orders-empty-cta">
            Browse the harvest
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isPickup = order.method === 'pickup';
            const contact = order.contact ?? {};

            return (
              <article className="order-card" key={order.id}>
                <header className="order-card-head">
                  <div>
                    <h2>{order.id}</h2>
                    <p>Placed {formatDate(order.placedAt)}</p>
                  </div>
                  <div className="order-card-badges">
                    <span className={`order-method ${isPickup ? 'is-pickup' : ''}`}>
                      {isPickup ? 'Pick up' : 'Delivery'}
                    </span>
                    <span className="order-status">{order.status}</span>
                  </div>
                </header>

                <ul className="order-lines">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.name} · {item.quantity} {item.unit}
                        {item.farmName && <em> — {item.farmName}</em>}
                      </span>
                      <span>₱{item.price * item.quantity}</span>
                    </li>
                  ))}
                  {order.deliveryFee > 0 && (
                    <li className="order-line-fee">
                      <span>Delivery ({order.farms?.length ?? 1} farm)</span>
                      <span>₱{order.deliveryFee}</span>
                    </li>
                  )}
                </ul>

                <footer className="order-card-foot">
                  <div className="order-fulfillment">
                    {isPickup ? (
                      <>
                        <span className="order-label">Pick up at</span>
                        {order.farms?.map((farm) => (
                          <div className="order-pickup" key={farm.farmId}>
                            <p className="order-pickup-farm">{farm.name}</p>
                            <p>{farm.pickupAddress}</p>
                            <p className="order-pickup-hours">{farm.pickupHours}</p>
                          </div>
                        ))}
                        <p className="order-contact">
                          Collected by {contact.fullName}
                          {contact.phone && ` · ${contact.phone}`}
                          {contact.preferredDate && ` · on ${contact.preferredDate}`}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="order-label">Deliver to</span>
                        <p>{contact.address ?? order.deliverTo}</p>
                        {(contact.fullName || contact.phone) && (
                          <p className="order-contact">
                            {contact.fullName}
                            {contact.phone && ` · ${contact.phone}`}
                          </p>
                        )}
                      </>
                    )}

                    {(contact.notes || order.note) && (
                      <p className="order-note">Note: {contact.notes ?? order.note}</p>
                    )}
                  </div>

                  <p className="order-total">₱{order.total}</p>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Orders;
