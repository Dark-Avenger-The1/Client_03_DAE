import farms, { getFarmById } from './farms';

// Mock catalog shared by the buyer pages — replace with an API call once the
// backend exists. Each row names the farm that grows it; the farm's own details
// are joined in below so pages never have to look them up twice.
const rawProducts = [
  // --- Fruit ---
  { id: 1, name: 'Sweet Papaya', price: 75, unit: 'kg', category: 'Fruit', farmId: 'santos-organics', stock: 40, description: 'Solo papaya picked at the blush stage so it ripens sweet on your counter.' },
  { id: 2, name: 'Lakatan Banana', price: 95, unit: 'kg', category: 'Fruit', farmId: 'santos-organics', stock: 60, description: 'Firm, aromatic lakatan cut in hands the morning they go out.' },
  { id: 3, name: 'Carabao Mango', price: 180, unit: 'kg', category: 'Fruit', farmId: 'dela-cruz', stock: 30, description: 'Tree-ripened carabao mangoes, hand picked and packed the same day.' },
  { id: 4, name: 'Calamansi', price: 70, unit: 'kg', category: 'Fruit', farmId: 'dela-cruz', stock: 55, description: 'Juicy calamansi for drinks, sawsawan, and marinades. Thin skinned and heavy.' },
  { id: 5, name: 'Pomelo', price: 140, unit: 'kg', category: 'Fruit', farmId: 'dela-cruz', stock: 25, description: 'Pink-fleshed pomelo, sweet with just enough bite. Sold whole.' },
  { id: 6, name: 'Queen Pineapple', price: 85, unit: 'piece', category: 'Fruit', farmId: 'bukid-tropikal', stock: 48, description: 'Small, intensely sweet queen pineapple grown on volcanic soil.' },
  { id: 7, name: 'Durian', price: 250, unit: 'kg', category: 'Fruit', farmId: 'bukid-tropikal', stock: 18, description: 'Puyat variety durian, creamy and mild. Packed sealed for transport.' },
  { id: 8, name: 'Saba Banana', price: 55, unit: 'kg', category: 'Fruit', farmId: 'bukid-tropikal', stock: 80, description: 'Firm saba, ideal for turon, banana cue, or ripening on the counter.' },

  // --- Vegetable ---
  { id: 9, name: 'Pechay Bundle', price: 45, unit: 'bundle', category: 'Vegetable', farmId: 'santos-organics', stock: 70, description: 'Crisp pechay tied in generous bundles, washed and cooled before packing.' },
  { id: 10, name: 'Baguio Beans', price: 90, unit: 'kg', category: 'Vegetable', farmId: 'santos-organics', stock: 35, description: 'Snap beans harvested at dawn and kept cool the whole way to your door.' },
  { id: 11, name: 'Cherry Tomatoes', price: 120, unit: 'kg', category: 'Vegetable', farmId: 'santos-organics', stock: 28, description: 'Vine-ripened cherry tomatoes, sweet enough to eat straight from the punnet.' },
  { id: 12, name: 'Broccoli', price: 160, unit: 'kg', category: 'Vegetable', farmId: 'highland-greens', stock: 22, description: 'Tight, deep-green heads grown in Benguet cold season air.' },
  { id: 13, name: 'Carrots', price: 60, unit: 'kg', category: 'Vegetable', farmId: 'highland-greens', stock: 45, description: 'Sweet highland carrots pulled the morning of delivery. Good for soups and juicing.' },
  { id: 14, name: 'Cabbage', price: 70, unit: 'kg', category: 'Vegetable', farmId: 'highland-greens', stock: 50, description: 'Dense Scorpio cabbage that keeps for weeks in a cool pantry.' },
  { id: 15, name: 'Bell Pepper', price: 180, unit: 'kg', category: 'Vegetable', farmId: 'highland-greens', stock: 20, description: 'Thick-walled red and green peppers, graded by hand.' },
  { id: 16, name: 'Red Onions', price: 90, unit: 'kg', category: 'Vegetable', farmId: 'reyes', stock: 120, description: 'Cured red onions with a firm bite. Stores well for weeks in a dry pantry.' },
  { id: 17, name: 'Eggplant', price: 65, unit: 'kg', category: 'Vegetable', farmId: 'reyes', stock: 65, description: 'Long purple eggplant, glossy and seedless. Straight from the rice-field plots.' },
  { id: 18, name: 'Squash', price: 50, unit: 'kg', category: 'Vegetable', farmId: 'reyes', stock: 90, description: 'Kalabasa with dense orange flesh — sweet in ginataan or soup.' },
  { id: 19, name: 'Kangkong Bundle', price: 30, unit: 'bundle', category: 'Vegetable', farmId: 'bukid-tropikal', stock: 100, description: 'Tender water spinach cut fresh each morning and bundled by hand.' },

  // --- Livestock ---
  { id: 20, name: 'Native Chicken (live)', price: 420, unit: 'head', category: 'Livestock', farmId: 'villamor', stock: 24, description: 'Free-range native chicken raised without growth boosters. Dressed on request.' },
  { id: 21, name: 'Free-range Eggs', price: 240, unit: 'tray', category: 'Livestock', farmId: 'villamor', stock: 40, description: 'A tray of 30 eggs from pasture-raised hens. Deep orange yolks.' },
  { id: 22, name: 'Fattened Hog', price: 11500, unit: 'head', category: 'Livestock', farmId: 'villamor', stock: 6, description: 'Pasture-raised hog, roughly 90–110 kg live weight. Inspected before release.' },
  { id: 23, name: 'Itik Duck', price: 380, unit: 'head', category: 'Livestock', farmId: 'villamor', stock: 30, description: 'Native itik raised on open pasture — for adobo, balut, or breeding stock.' },
  { id: 24, name: 'Native Goat', price: 6500, unit: 'head', category: 'Livestock', farmId: 'reyes', stock: 8, description: 'Backyard-raised native goat, grass-fed and dewormed on schedule.' },
  { id: 25, name: 'Dressed Chicken', price: 280, unit: 'head', category: 'Livestock', farmId: 'reyes', stock: 35, description: 'Cleaned and chilled the same morning, roughly 1.2–1.5 kg per bird.' },
];

// Join each product with its farm once, so cards and cart lines can read the
// farm's name and location without another lookup.
const products = rawProducts.map((product) => {
  const farm = getFarmById(product.farmId);
  return {
    ...product,
    farmName: farm.name,
    farmLocation: farm.location,
    farmRating: farm.rating,
    // What ProductCard prints under the product name.
    farmerName: `${farm.name} · ${farm.location}`,
  };
});

export const categories = ['Vegetable', 'Fruit', 'Livestock'];

export function getProductById(id) {
  return products.find((p) => String(p.id) === String(id));
}

export function getProductsByFarm(farmId) {
  return products.filter((p) => p.farmId === farmId);
}

export function countProductsByFarm(farmId) {
  return getProductsByFarm(farmId).length;
}

export { farms };
export default products;
