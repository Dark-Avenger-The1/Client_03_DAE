import { Link } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './PaymentConfirmation.css';

// Mock data — replace with the real placed order once the backend exists
const order = {
  id: 'ORD-1042',
  items: [
    { name: 'Carrots', farmName: "Aling Nena's Farm", qty: 2, unit: 'kg' },
    { name: 'Mangoes', farmName: 'Green Valley Farm', qty: 1, unit: 'kg' },
  ],
  total: 290,
  address: 'Purok 3, Barangay Magugpo, Tagum City',
  paymentMethod: 'Cash on delivery',
};

const PaymentConfirmation = () => {
  return (
    <Layout role="buyer" brandName="UmaLink" userName="Juan" points={120}>
      <div className="confirmation-card">
        <OrderStatusBadge status="pending" />
        <h1>Order sent!</h1>
        <p className="confirmation-note">
          Your order has been sent to the farmer(s) for confirmation. You'll be notified once they accept.
        </p>

        <div className="confirmation-details">
          <div className="confirmation-row">
            <span>Order ID</span>
            <span>{order.id}</span>
          </div>
          {order.items.map((item) => (
            <div className="confirmation-row" key={item.name}>
              <span>{item.name} ({item.qty} {item.unit})</span>
              <span>{item.farmName}</span>
            </div>
          ))}
          <div className="confirmation-row">
            <span>Delivery address</span>
            <span>{order.address}</span>
          </div>
          <div className="confirmation-row">
            <span>Payment method</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="confirmation-row confirmation-total">
            <span>Total</span>
            <span>₱{order.total}</span>
          </div>
        </div>

        <Link to="/">
          <Button variant="secondary">Back to catalog</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default PaymentConfirmation;
