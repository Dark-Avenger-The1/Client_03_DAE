import Layout from '../components/Layout';
import './SellerAnalytics.css';

// Mock data — replace with real order/sales data once the backend exists
const weeklySales = [
  { day: 'Mon', amount: 620 },
  { day: 'Tue', amount: 450 },
  { day: 'Wed', amount: 890 },
  { day: 'Thu', amount: 710 },
  { day: 'Fri', amount: 980 },
  { day: 'Sat', amount: 1240 },
  { day: 'Sun', amount: 760 },
];

const topProducts = [
  { name: 'Native Chicken', unitsSold: 22, revenue: 7700 },
  { name: 'Mangoes', unitsSold: 60, revenue: 7200 },
  { name: 'Carrots', unitsSold: 84, revenue: 5040 },
];

const totalRevenue = weeklySales.reduce((sum, d) => sum + d.amount, 0);
const totalOrders = 47;
const unitsSold = 212;
const avgOrderValue = Math.round(totalRevenue / totalOrders);
const maxDay = Math.max(...weeklySales.map((d) => d.amount));

const SellerAnalytics = () => {
  return (
    <Layout role="seller" brandName="Farmstand" userName="Aling Nena">
      <div className="analytics-header">
        <h1>Your business at a glance</h1>
        <p>A simple look at how your listings are doing this week.</p>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <span className="stat-value">₱{totalRevenue.toLocaleString()}</span>
          <span className="stat-label">Revenue this week</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalOrders}</span>
          <span className="stat-label">Orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{unitsSold}</span>
          <span className="stat-label">Units sold</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">₱{avgOrderValue}</span>
          <span className="stat-label">Average order value</span>
        </div>
      </div>

      <div className="analytics-section">
        <h2>Sales this week</h2>
        <div className="sales-chart">
          {weeklySales.map((d) => (
            <div key={d.day} className="sales-bar-wrap">
              <div
                className="sales-bar"
                style={{ height: `${(d.amount / maxDay) * 100}%` }}
                title={`₱${d.amount}`}
              />
              <span className="sales-bar-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h2>Your best sellers</h2>
        <div className="top-products">
          {topProducts.map((p, i) => (
            <div key={p.name} className="top-product-row">
              <span className="top-product-rank">{i + 1}</span>
              <span className="top-product-name">{p.name}</span>
              <span className="top-product-units">{p.unitsSold} sold</span>
              <span className="top-product-revenue">₱{p.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SellerAnalytics;