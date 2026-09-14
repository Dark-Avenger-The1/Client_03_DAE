import { useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { addProduct } from '../data/products';
import { calculateBreakevenPrice, sumDirectTraceableCosts } from '../data/pricing';
import './AddProduct.css';

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

// The form's quantity units don't match ProductCard's plain unit label 1:1
// (e.g. 'liveweight' vs 'kg') - this maps one to the other.
const UNIT_LABELS = { kg: 'kg', crates: 'crate', liveweight: 'kg', headcount: 'head' };

// Example numbers per category, purely so someone testing/demoing the form
// has something realistic to type in instead of guessing values.
const SAMPLE_INPUTS = {
  Vegetable: {
    productName: 'Pechay',
    harvestedWeightProduct: '50',
    harvestedWeightAll: '200',
    totalSharedExpenses: '5000',
    costInputs: { seeds: '800', fertilizer: '600', pesticides: '300', hiredLabor: '1000', fuelTransport: '400' },
    quantityUnit: 'kg',
    marketableQuantity: '45',
    profitMargin: '15',
  },
  Fruit: {
    productName: 'Rambutan',
    harvestedWeightProduct: '80',
    harvestedWeightAll: '300',
    totalSharedExpenses: '7000',
    costInputs: { seeds: '1000', fertilizer: '900', pesticides: '500', hiredLabor: '1500', fuelTransport: '600' },
    quantityUnit: 'kg',
    marketableQuantity: '70',
    profitMargin: '20',
  },
  Livestock: {
    productName: 'Native Chicken',
    harvestedWeightProduct: '100',
    harvestedWeightAll: '400',
    totalSharedExpenses: '10000',
    costInputs: { youngAnimals: '3000', feed: '4000', veterinary: '500', electricityWater: '300', transport: '400' },
    quantityUnit: 'headcount',
    marketableQuantity: '15',
    profitMargin: '80',
  },
};

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Vegetable');
  const [productName, setProductName] = useState('');
  const [harvestedWeightProduct, setHarvestedWeightProduct] = useState('');
  const [harvestedWeightAll, setHarvestedWeightAll] = useState('');
  const [totalSharedExpenses, setTotalSharedExpenses] = useState('');
  const [costInputs, setCostInputs] = useState({});
  const [quantityUnit, setQuantityUnit] = useState(QUANTITY_UNITS['Vegetable'][0].value);
  const [marketableQuantity, setMarketableQuantity] = useState('');
  const [profitMargin, setProfitMargin] = useState('');

  const [pricing, setPricing] = useState(null); // result shown in the modal
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setCostInputs({}); // reset costs, since the fields themselves change
    setQuantityUnit(QUANTITY_UNITS[newCategory][0].value);
  };

  const handleCostChange = (key, value) => {
    setCostInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Fills every field with example numbers for the current category, so
  // there's something ready to submit without hunting for real figures.
  function fillSampleData() {
    const sample = SAMPLE_INPUTS[category];
    setProductName(sample.productName);
    setHarvestedWeightProduct(sample.harvestedWeightProduct);
    setHarvestedWeightAll(sample.harvestedWeightAll);
    setTotalSharedExpenses(sample.totalSharedExpenses);
    setCostInputs(sample.costInputs);
    setQuantityUnit(sample.quantityUnit);
    setMarketableQuantity(sample.marketableQuantity);
    setProfitMargin(sample.profitMargin);
  }

  const costFields = CATEGORY_COST_FIELDS[category];
  const quantityOptions = QUANTITY_UNITS[category];

  // Runs the 5-step formula (data/pricing.js) and opens the confirmation
  // modal - nothing is saved yet at this point.
  function handleSubmit(e) {
    e.preventDefault();
    const directTraceableCosts = sumDirectTraceableCosts(costInputs);
    const result = calculateBreakevenPrice({
      totalSharedExpenses,
      harvestedWeightProduct,
      harvestedWeightAll,
      directTraceableCosts,
      marketableQuantity,
      profitMargin,
    });
    setPricing(result); // null if there isn't enough info yet - the modal explains that
    setShowModal(true);
  }

  // Only runs when the farmer confirms inside the modal - this is the one
  // place addProduct() actually gets called.
  function handleConfirmListing() {
    addProduct({
      name: productName || 'Untitled listing',
      category,
      farmId: user?.farmId ?? null,
      unit: UNIT_LABELS[quantityUnit] ?? quantityUnit,
      stock: Number(marketableQuantity) || 0,
      description: '',
      price: pricing ? Math.round(pricing.finalSellingPrice) : undefined,
    });
    setShowModal(false);
    setSaved(true);
  }

  return (
    <Layout role="seller" userName={user?.name}>
      <div className="add-product-header">
        <h1>Add a product</h1>
        <p>Fill in your costs — the price is calculated for you when you submit.</p>
      </div>

      {saved && (
        <div className="add-product-saved">
          <p>Listing saved.</p>
          <Button variant="secondary" onClick={() => navigate('/seller/listings')}>
            View my listings
          </Button>
        </div>
      )}

      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="add-product-toolbar">
          <Button variant="secondary" type="button" onClick={fillSampleData}>
            Fill sample data ({category})
          </Button>
        </div>

        <section className="form-section">
          <h2>Product info</h2>
          <label className="form-field">
            <span>Product name</span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Pechay"
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

        <Button variant="primary" type="submit">Calculate & review price</Button>
      </form>

      {showModal && (
        <Modal
          title="Confirm your listing"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Edit inputs</Button>
              <Button variant="primary" onClick={handleConfirmListing} disabled={!pricing}>
                Confirm & list
              </Button>
            </>
          }
        >
          {pricing ? (
            <div className="pricing-breakdown">
              <div className="pricing-row">
                <span>Step 1 — Allocated shared cost</span>
                <span>₱{pricing.allocatedSharedCost.toFixed(2)}</span>
              </div>
              <div className="pricing-row">
                <span>Step 2 — Total specific product cost</span>
                <span>₱{pricing.totalSpecificCost.toFixed(2)}</span>
              </div>
              <div className="pricing-row">
                <span>Step 3 — Breakeven price per kg</span>
                <span>₱{pricing.breakevenPricePerKg.toFixed(2)}</span>
              </div>
              <div className="pricing-row">
                <span>Step 4 — Base floor price (+10%)</span>
                <span>₱{pricing.baseFloorPrice.toFixed(2)}</span>
              </div>
              <div className="pricing-row pricing-final">
                <span>Step 5 — Final selling price</span>
                <span>₱{pricing.finalSellingPrice.toFixed(2)}</span>
              </div>
              <p className="pricing-note">
                This is what "{productName || 'this listing'}" will be posted at. Rounded to the
                nearest peso when saved.
              </p>
            </div>
          ) : (
            <p className="pricing-note">
              Couldn't calculate a price — check that "harvested weight of all products" and
              "marketable quantity" are both greater than zero. You can still list it and price it
              later.
            </p>
          )}
        </Modal>
      )}
    </Layout>
  );
};

export default AddProduct;