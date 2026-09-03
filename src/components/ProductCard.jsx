import { Link } from 'react-router';
import Button from './Button';
import CategoryBadge from './CategoryBadge';
import './ProductCard.css';

// variant: 'buyer' shows "Add to order", 'seller' shows "Edit listing".
// actionLabel overrides that wording; `to` makes the image and name a link.
export default function ProductCard({
  name,
  price,
  unit = 'kg',
  category,
  farmerName,
  imageUrl,
  variant = 'buyer',
  actionLabel,
  to,
  onAction,
}) {
  const label = actionLabel ?? (variant === 'seller' ? 'Edit listing' : 'Add to order');

  const media = imageUrl ? (
    <img src={imageUrl} alt={name} />
  ) : (
    <div className="product-card-image-placeholder" data-category={category} />
  );

  return (
    <div className="product-card">
      <div className="product-card-tag">
        <CategoryBadge category={category} />
      </div>

      <div className="product-card-image">
        {to ? <Link to={to}>{media}</Link> : media}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-name">
          {to ? <Link to={to}>{name}</Link> : name}
        </h3>
        {farmerName && <p className="product-card-farmer">{farmerName}</p>}
        <p className="product-card-price">
          ₱{price} <span>/ {unit}</span>
        </p>

        <Button variant="primary" onClick={onAction}>
          {label}
        </Button>
      </div>
    </div>
  );
}
