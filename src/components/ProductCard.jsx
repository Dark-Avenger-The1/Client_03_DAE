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
  farmId,
  imageUrl,
  variant = 'buyer',
  actionLabel,
  to,
  onAction,
}) {
  const label = actionLabel ?? (variant === 'seller' ? 'Edit listing' : 'Add to order');
  const isPending = variant === 'buyer' && typeof price !== 'number';

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
        {farmerName && (
          farmId && variant === 'buyer' ? (
            <Link to={`/farm/${farmId}`} className="product-card-farmer product-card-farmer-link">
              {farmerName}
            </Link>
          ) : (
            <p className="product-card-farmer">{farmerName}</p>
          )
        )}
        <p className="product-card-price">
          {typeof price === 'number' ? (
            <>₱{price} <span>/ {unit}</span></>
          ) : (
            <span className="product-card-price-pending">Price pending</span>
          )}
        </p>

        <Button variant="primary" onClick={onAction} disabled={isPending}>
          {isPending ? 'Pricing pending' : label}
        </Button>
      </div>
    </div>
  );
}