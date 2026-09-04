import { Link } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import './NearbyFarmers.css';

// In the real app this comes from the route (e.g. /product/:productName/farmers).
// Hardcoded here since this page isn't wired to real routing/data yet.
const productName = 'Carrots';

// Mock data — every nearby farmer carrying this product gets a fair shot,
// not just the closest or cheapest one. Sorted by distance for convenience only.
const nearbyFarmers = [
  { id: 1, farmName: "Aling Nena's Farm", distanceKm: 2.4, price: 60, availableQty: '40 kg' },
  { id: 2, farmName: 'Mang Tomas Farm', distanceKm: 5.1, price: 55, availableQty: '25 kg' },
  { id: 3, farmName: 'Green Valley Farm', distanceKm: 8.7, price: 65, availableQty: '60 kg' },
];

const NearbyFarmers = () => {
  return (
    <Layout role="buyer" brandName="UmaLink" userName="Juan" points={120}>
      <div className="nearby-header">
        <h1>{productName} near you</h1>
        <p>These farmers currently have {productName.toLowerCase()} available. Pick whichever works best for you.</p>
      </div>

      <div className="nearby-farmer-list">
        {nearbyFarmers.map((farmer) => (
          <div key={farmer.id} className="nearby-farmer-card">
            <div className="nearby-farmer-info">
              <h3>{farmer.farmName}</h3>
              <p className="nearby-farmer-meta">
                {farmer.distanceKm} km away · {farmer.availableQty} available
              </p>
            </div>
            <div className="nearby-farmer-price">₱{farmer.price} <span>/ kg</span></div>
            <Link to="/cart">
              <Button variant="primary">Choose this farmer</Button>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default NearbyFarmers;
