import { useState } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import './MyListing.css';

// Mock data — replace with real listings once the backend exists
const allListings = [
  { id: 1, name: 'Carrots', price: 60, unit: 'kg', category: 'Vegetable' },
  { id: 2, name: 'Red Onions', price: 90, unit: 'kg', category: 'Vegetable' },
  { id: 3, name: 'Ampalaya', price: 70, unit: 'kg', category: 'Vegetable' },
  { id: 4, name: 'Mangoes', price: 120, unit: 'kg', category: 'Fruit' },
  { id: 5, name: 'Bananas', price: 50, unit: 'kg', category: 'Fruit' },
  { id: 6, name: 'Kalamansi', price: 80, unit: 'kg', category: 'Fruit' },
  { id: 7, name: 'Native Chicken', price: 350, unit: 'head', category: 'Livestock' },
  { id: 8, name: 'Duck Eggs', price: 12, unit: 'pc', category: 'Livestock' },
];

const CATEGORIES = ['All', 'Vegetable', 'Fruit', 'Livestock'];

const MyListings = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const visibleListings =
    activeCategory === 'All'
      ? allListings
      : allListings.filter((item) => item.category === activeCategory);

  return (
    <Layout role="seller" brandName="Farmstand" userName="Aling Nena" points={240}>
      <div className="listings-header">
        <div>
          <h1>Manage your listings</h1>
          <p>Everything you currently have posted for buyers to see.</p>
        </div>
        <Button variant="primary">Add product</Button>
      </div>

      <div className="listings-tabs">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`listings-tab ${activeCategory === category ? 'listings-tab-active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {visibleListings.length > 0 ? (
        <div className="listings-grid">
          {visibleListings.map((product) => (
            <ProductCard key={product.id} {...product} variant="seller" />
          ))}
        </div>
      ) : (
        <p className="listings-empty">No listings in this category yet.</p>
      )}
    </Layout>
  );
};

export default MyListings;