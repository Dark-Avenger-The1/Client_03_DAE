import Layout from '../components/Layout';
import Button from '../components/Button';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './SellerRequests.css';

// Mock data — replace with real incoming orders once the backend exists
const requests = [
  {
    id: 'ORD-1042',
    buyerName: 'Juan Dela Cruz',
    product: 'Carrots',
    qty: '2 kg',
    address: 'Purok 3, Barangay Magugpo, Tagum City',
    status: 'pending',
  },
  {
    id: 'ORD-1039',
    buyerName: 'Maria Santos',
    product: 'Red Onions',
    qty: '3 kg',
    address: 'Barangay Visayan Village, Tagum City',
    status: 'pending',
  },
  {
    id: 'ORD-1031',
    buyerName: 'Pedro Reyes',
    product: 'Native Chicken',
    qty: '1 head',
    address: 'Apokon, Tagum City',
    status: 'confirmed',
  },
];

const SellerRequests = () => {
  return (
    <Layout role="seller" brandName="UmaLink" userName="Aling Nena" pendingRequests={2}>
      <div className="requests-header">
        <h1>Order requests</h1>
        <p>Confirm or decline incoming orders from buyers.</p>
      </div>

      <div className="requests-list">
        {requests.map((req) => (
          <div key={req.id} className="request-card">
            <div className="request-info">
              <div className="request-top-row">
                <h3>{req.buyerName}</h3>
                <OrderStatusBadge status={req.status} />
              </div>
              <p className="request-meta">{req.product} · {req.qty}</p>
              <p className="request-meta">{req.address}</p>
            </div>

            {req.status === 'pending' && (
              <div className="request-actions">
                <Button variant="primary">Confirm</Button>
                <Button variant="secondary">Decline</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default SellerRequests;
