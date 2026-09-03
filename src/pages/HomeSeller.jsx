import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import './HomeSeller.css';

// Mock data — replace with real listings once the backend exists
const sellerProducts = [
  { id: 1, name: 'Carrots', price: 60, unit: 'kg', category: 'Vegetable' },
  { id: 2, name: 'Red Onions', price: 90, unit: 'kg', category: 'Vegetable' },
  { id: 3, name: 'Mangoes', price: 120, unit: 'kg', category: 'Fruit' },
  { id: 4, name: 'Native Chicken', price: 350, unit: 'head', category: 'Livestock' },
];

const HomeSeller = () => {
  return (
    <Layout role="seller" brandName="Farmstand" userName="Aling Nena" points={240}>
      <div className="seller-dashboard-header">
        <div>
          <h1>Your listings</h1>
          <p>Manage what you're currently offering to buyers.</p>
        </div>
        <Button variant="primary">Add product</Button>
      </div>

      <div className="seller-stats">
        <div className="stat-card">
          <span className="stat-value">{sellerProducts.length}</span>
          <span className="stat-label">Active listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">3</span>
          <span className="stat-label">Pending orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">240</span>
          <span className="stat-label">Points earned</span>
        </div>
      </div>

      <div className="seller-product-grid">
        {sellerProducts.map((product) => (
          <ProductCard key={product.id} {...product} variant="seller" />
        ))}
      </div>
    </Layout>
  );
};

export default HomeSeller;