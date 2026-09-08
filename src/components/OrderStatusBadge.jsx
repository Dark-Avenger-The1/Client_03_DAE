import './OrderStatusBadge.css';

// status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
const STATUS_CONFIG = {
  pending: { label: 'Pending confirmation', tone: 'status-pending' },
  confirmed: { label: 'Confirmed', tone: 'status-confirmed' },
  delivered: { label: 'Delivered', tone: 'status-delivered' },
  cancelled: { label: 'Cancelled', tone: 'status-cancelled' },
};

export default function OrderStatusBadge({ status = 'pending' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <span className={`order-status-badge ${config.tone}`}>{config.label}</span>;
}
