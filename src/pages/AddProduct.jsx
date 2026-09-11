import { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Notice from '../components/Notice';
import { useAuth } from '../context/AuthContext';
import './AddProduct.css';

// What a seller earns for publishing a listing — see data/points.js.
const LISTING_POINTS = 15;

const CATEGORIES = ['Vegetable', 'Fruit', 'Livestock'];

// Direct traceable costs differ by category, per the farmer's cost formula
const CATEGORY_COST_FIELDS = {
  Vegetable: [
    { key: 'seeds', label: 'Seeds (₱)' },
    { key: 'fertilizer', label: 'Fertilizer (₱)' },
    { key: 'pesticides', label: 'Pesticides (₱)' },
    { key: 'hiredLabor', label: 'Hired Labor (₱)' },
    { key: 'fuelTransport', label: 'Fuel / Transport (₱)' },
  ],
  Fruit: [
    { key: 'seeds', label: 'Seeds (₱)' },
    { key: 'fertilizer', label: 'Fertilizer (₱)' },
    { key: 'pesticides', label: 'Pesticides (₱)' },
    { key: 'hiredLabor', label: 'Hired Labor (₱)' },
    { key: 'fuelTransport', label: 'Fuel / Transport (₱)' },
  ],
  Livestock: [
    { key: 'youngAnimals', label: 'Cost of Young Animals (₱)' },
    { key: 'feed', label: 'Feed (₱)' },
    { key: 'veterinary', label: 'Veterinary / Medicines (₱)' },
    { key: 'electricityWater', label: 'Electricity / Water (₱)' },
    { key: 'transport', label: 'Transport (₱)' },
  ],
};

// Marketable quantity is measured differently for crops vs livestock
const QUANTITY_UNITS = {
  Vegetable: [
    { value: 'kg', label: 'Kilograms' },
    { value: 'crates', label: 'Crates' },
  ],
  Fruit: [
    { value: 'kg', label: 'Kilograms' },
    { value: 'crates', label: 'Crates' },
  ],
  Livestock: [
    { value: 'liveweight', label: 'Live Weight (kg)' },
    { value: 'headcount', label: 'Head Count' },
  ],
};

const AddProduct = () => {
  const { addPoints } = useAuth();
  const [flash, setFlash] = useState({ tone: 'success', text: '' });
  const [category, setCategory] = useState('Vegetable');
  const [productName, setProductName] = useState('');
  const [harvestedWeightProduct, setHarvestedWeightProduct] = useState('');
  const [harvestedWeightAll, setHarvestedWeightAll] = useState('');
  const [totalSharedExpenses, setTotalSharedExpenses] = useState('');
  const [costInputs, setCostInputs] = useState({});
  const [quantityUnit, setQuantityUnit] = useState(QUANTITY_UNITS['Vegetable'][0].value);
  const [marketableQuantity, setMarketableQuantity] = useState('');
  const [profitMargin, setProfitMargin] = useState('');

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setCostInputs({}); // reset costs, since the fields themselves change
    setQuantityUnit(QUANTITY_UNITS[newCategory][0].value);
  };

  const handleCostChange = (key, value) => {
    setCostInputs((prev) => ({ ...prev, [key]: value }));
  };

  const costFields = CATEGORY_COST_FIELDS[category];
  const quantityOptions = QUANTITY_UNITS[category];

  // Pricing still happens elsewhere; what this does now is credit the reward
  // points a published listing earns the farm.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      setFlash({ tone: 'error', text: 'Give the product a name before submitting it.' });
      return;
    }
    const total = addPoints(LISTING_POINTS);
    setFlash({
      tone: 'success',
      text: `${productName.trim()} submitted for pricing. +${LISTING_POINTS} points — you now have ${total}.`,
    });
  };

  return (
    <Layout role="seller" userName="Aling Nena">
      <div className="add-product-header">
        <h1>Add a product</h1>
        <p>These details feed into your standard price — the numbers only, nothing calculated here yet.</p>
      </div>

      <Notice tone={flash.tone}>{flash.text}</Notice>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Product info</h2>
          <label className="form-field">
            <span>Product name</span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Carrots"
            />
          </label>

          <label className="form-field">
            <span>Category</span>
            <select value={category} onChange={handleCategoryChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="form-section">
          <h2>Shared expense allocation</h2>
          <div className="form-row">
            <label className="form-field">
              <span>Harvested weight of this product (kg)</span>
              <input
                type="number"
                value={harvestedWeightProduct}
                onChange={(e) => setHarvestedWeightProduct(e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="form-field">
              <span>Harvested weight of all products (kg)</span>
              <input
                type="number"
                value={harvestedWeightAll}
                onChange={(e) => setHarvestedWeightAll(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>
          <label className="form-field">
            <span>Total shared expenses (₱)</span>
            <input
              type="number"
              value={totalSharedExpenses}
              onChange={(e) => setTotalSharedExpenses(e.target.value)}
              placeholder="0"
            />
          </label>
        </section>

        <section className="form-section">
          <h2>Direct costs — {category}</h2>
          <div className="form-row form-row-wrap">
            {costFields.map((field) => (
              <label className="form-field" key={field.key}>
                <span>{field.label}</span>
                <input
                  type="number"
                  value={costInputs[field.key] || ''}
                  onChange={(e) => handleCostChange(field.key, e.target.value)}
                  placeholder="0"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Marketable quantity</h2>
          <div className="form-row">
            <label className="form-field">
              <span>Measured in</span>
              <select value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)}>
                {quantityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Quantity</span>
              <input
                type="number"
                value={marketableQuantity}
                onChange={(e) => setMarketableQuantity(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <h2>Your desired profit</h2>
          <label className="form-field">
            <span>Desired profit margin per kg (₱)</span>
            <input
              type="number"
              value={profitMargin}
              onChange={(e) => setProfitMargin(e.target.value)}
              placeholder="0"
            />
          </label>
        </section>

        <Button variant="primary" type="submit">Submit for pricing</Button>
      </form>
    </Layout>
  );
};

export default AddProduct;