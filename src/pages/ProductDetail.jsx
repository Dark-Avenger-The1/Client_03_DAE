import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import CategoryBadge from '../components/CategoryBadge';
import ProductCard from '../components/ProductCard';
import Notice from '../components/Notice';
import products, { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requestAdd } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [flash, setFlash] = useState('');

  const product = getProductById(id);

  if (!product) {
    return (
      <Layout role="buyer" brandName="Farmstand">
        <div className="product-missing">
          <h1>We can't find that listing</h1>
          <p>It may have sold out or been taken down by the farm.</p>
          <Link to="/catalog" className="product-back">
            ← Back to browsing
          </Link>
        </div>
      </Layout>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  function handleAdd() {
    if (requestAdd(product, quantity)) setFlash(`${quantity} ${product.unit} of ${product.name} added to your cart.`);
  }

  function handleBuyNow() {
    if (requestAdd(product, quantity)) navigate('/cart');
  }

  return (
    <Layout role="buyer" brandName="Farmstand">
      <Link to="/catalog" className="product-back">
        ← Back to browsing
      </Link>

      <Notice tone="success">{flash}</Notice>

      <div className="product-detail">
        <div className="product-detail-image">
          <div className="product-detail-placeholder" data-category={product.category} />
        </div>

        <div className="product-detail-info">
          <CategoryBadge category={product.category} />
          <h1>{product.name}</h1>
          <p className="product-detail-farmer">Sold by {product.farmerName}</p>
          <p className="product-detail-price">
            ₱{product.price} <span>/ {product.unit}</span>
          </p>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-detail-stock">
            {product.stock} {product.unit} available
          </p>

          <div className="product-detail-actions">
            <div className="quantity-stepper">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <Button variant="primary" onClick={handleAdd}>
              Add to cart
            </Button>
            <Button variant="secondary" onClick={handleBuyNow}>
              Buy now
            </Button>
          </div>

          <p className="product-detail-note">
            You'll need an account to place an order — we'll ask you to sign in at checkout.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="product-related">
          <h2>More {product.category.toLowerCase()} listings</h2>
          <div className="product-related-grid">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                {...item}
                variant="buyer"
                actionLabel="Add to cart"
                to={`/product/${item.id}`}
                onAction={() => {
                  if (requestAdd(item)) setFlash(`${item.name} added to your cart.`);
                }}
              />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
