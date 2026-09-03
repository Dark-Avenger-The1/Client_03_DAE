import Button from './Button';
import CategoryBadge from './CategoryBadge';
import './ProductCard.css';

// variant: 'buyer' shows "Add to order", 'seller' shows "Edit listing"
export default function ProductCard({
  name,
  price,
  unit = 'kg',
  category,
  farmerName,
  imageUrl,
  variant = 'buyer',
  onAction,
}) {
  return (
    <div className="product-card">
      <div className="product-card-tag">
        <CategoryBadge category={category} />
      </div>

      <div className="product-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="product-card-image-placeholder" />
        )}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-name">{name}</h3>
        {farmerName && <p className="product-card-farmer">{farmerName}</p>}
        <p className="product-card-price">
          ₱{price} <span>/ {unit}</span>
        </p>

        <Button variant="primary" onClick={onAction}>
          {variant === 'seller' ? 'Edit listing' : 'Add to order'}
        </Button>
      </div>
    </div>
  );
}
