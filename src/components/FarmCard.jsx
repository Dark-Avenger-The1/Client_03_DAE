import { Link } from 'react-router';
import CategoryBadge from './CategoryBadge';
import './FarmCard.css';

// One registered farm. Clicking through opens that farm's own storefront.
export default function FarmCard({ farm, itemCount }) {
  return (
    <Link to={`/farm/${farm.id}`} className="farm-card">
      <div className="farm-card-head">
        <div>
          <h3>{farm.name}</h3>
          <p className="farm-card-farmer">{farm.farmerName}</p>
        </div>
        <span className="farm-card-rating">★ {farm.rating}</span>
      </div>

      <p className="farm-card-description">{farm.description}</p>

      <div className="farm-card-tags">
        {farm.categories.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>

      <div className="farm-card-meta">
        <span>{farm.location}</span>
        <span>{farm.prepMinutes} min</span>
        <span>₱{farm.deliveryFee} delivery</span>
      </div>

      {typeof itemCount === 'number' && (
        <p className="farm-card-count">{itemCount} items available today</p>
      )}
    </Link>
  );
}
