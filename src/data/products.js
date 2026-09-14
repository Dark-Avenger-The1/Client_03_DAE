import { getFarmById } from './farms';

// Real product photos sourced from Wikimedia Commons (stable, hotlink-safe
// URLs via Special:FilePath - no fetching/guessing of upload hash paths
// needed). Confirmed against actual Commons file pages, not generated.
const wm = (filename) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;

// Seed catalog - written into localStorage once, the first time the app
// runs with no products saved yet. After that, localStorage is the source
// of truth: this array is never read again on its own.
const seedProducts = [
  // --- Vegetable (Tagum Greens + Carmen Harvest) ---
  { id: 1, name: 'Pechay', price: 45, unit: 'bundle', category: 'Vegetable', farmId: 'tagum-greens', stock: 70, description: 'Crisp pechay bundles, washed and cooled the morning of harvest.', imageUrl: wm('Bok Choy.JPG') },
  { id: 2, name: 'Eggplant', price: 65, unit: 'kg', category: 'Vegetable', farmId: 'tagum-greens', stock: 55, description: 'Long purple eggplant, glossy and seedless, picked at peak size.', imageUrl: wm('Eggplant aubergine brinjal.jpg') },
  { id: 3, name: 'Kalabasa (Squash)', price: 50, unit: 'kg', category: 'Vegetable', farmId: 'tagum-greens', stock: 90, description: 'Dense orange-fleshed squash, sweet in ginataan or soup.', imageUrl: wm('Kalabasa (Calabaza) squash from the Philippines.jpg') },
  { id: 4, name: 'Sitaw (String Beans)', price: 55, unit: 'kg', category: 'Vegetable', farmId: 'carmen-harvest', stock: 40, description: 'Yardlong beans cut fresh each morning, crisp and stringless.', imageUrl: wm('Achinga - asparagus bean.jpg') },
  { id: 5, name: 'Kamote (Sweet Potato)', price: 40, unit: 'kg', category: 'Vegetable', farmId: 'carmen-harvest', stock: 60, description: 'Orange-fleshed kamote, good boiled, fried, or roasted.', imageUrl: wm('Camotli-Camote-Sweet potato.png') },

  // --- Fruit (Panabo Banana + Samal Orchard) ---
  { id: 6, name: 'Cavendish Banana', price: 55, unit: 'kg', category: 'Fruit', farmId: 'panabo-banana', stock: 120, description: "Export-grade Cavendish from the country's banana capital, hand-cut in bunches.", imageUrl: wm('Cavendish Banana DS.jpg') },
  { id: 7, name: 'Saba Banana', price: 45, unit: 'kg', category: 'Fruit', farmId: 'panabo-banana', stock: 80, description: 'Firm saba, ideal for turon, banana-cue, or ripening on the counter.', imageUrl: wm('Cavendish Banana DS.jpg') },
  { id: 8, name: 'Durian', price: 220, unit: 'kg', category: 'Fruit', farmId: 'samal-orchard', stock: 25, description: 'Creamy Samal-grown durian, sealed for transport straight off the boat.', imageUrl: wm('Durian Fruit.JPG') },
  { id: 9, name: 'Rambutan', price: 90, unit: 'kg', category: 'Fruit', farmId: 'samal-orchard', stock: 45, description: 'Sweet, juicy rambutan sold by the cluster.', imageUrl: wm('Rambutan Fruit.jpg') },
  { id: 10, name: 'Pomelo', price: 130, unit: 'kg', category: 'Fruit', farmId: 'samal-orchard', stock: 30, description: 'Pink-fleshed pomelo, sweet with just enough bite. Sold whole.', imageUrl: wm('Pomelo fruit.jpg') },

  // --- Livestock (Kapalong Livestock + Carmen Harvest) ---
  { id: 11, name: 'Native Chicken (live)', price: 400, unit: 'head', category: 'Livestock', farmId: 'kapalong-livestock', stock: 20, description: 'Free-range native chicken raised without growth boosters.', imageUrl: wm('Free Range Chickens.jpg') },
  { id: 12, name: 'Fattened Hog', price: 11000, unit: 'head', category: 'Livestock', farmId: 'kapalong-livestock', stock: 5, description: 'Pasture-raised hog, roughly 90-110 kg live weight.', imageUrl: wm('Sus scrofa domesticus - Piétrain pig - Hamburg, Tierpark Hagenbeck.jpg') },
  { id: 13, name: 'Free-range Eggs', price: 220, unit: 'tray', category: 'Livestock', farmId: 'carmen-harvest', stock: 35, description: 'A tray of 30 eggs from pasture-raised hens.', imageUrl: wm('Eggs in basket 2020 G1.jpg') },
  { id: 14, name: 'Native Goat', price: 6200, unit: 'head', category: 'Livestock', farmId: 'carmen-harvest', stock: 8, description: 'Backyard-raised native goat, grass-fed and dewormed on schedule.', imageUrl: wm('Goat Picture.jpg') },
];

const PRODUCTS_KEY = 'dae_products';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// The raw, un-joined records exactly as stored - seeds localStorage once,
// on the very first read, then always reads from there after.
function readRawProducts() {
  const existing = readJSON(PRODUCTS_KEY, null);
  if (existing) return existing;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seedProducts));
  return seedProducts;
}

// Joins a raw product with its farm's details, same fields the UI already
// expects (farmName, farmLocation, farmRating, farmerName).
function joinWithFarm(product) {
  const farm = getFarmById(product.farmId);
  return {
    ...product,
    farmName: farm?.name ?? null,
    farmLocation: farm?.location ?? null,
    farmRating: farm?.rating ?? null,
    farmerName: farm ? `${farm.name} - ${farm.location}` : null,
  };
}

// Always reads fresh from localStorage - call this (not a cached array) so
// a product added by a seller shows up the next time a page reads it.
export function getAllProducts() {
  return readRawProducts().map(joinWithFarm);
}

export function getProductById(id) {
  return getAllProducts().find((p) => String(p.id) === String(id));
}

export function getProductsByFarm(farmId) {
  return getAllProducts().filter((p) => p.farmId === farmId);
}

export function countProductsByFarm(farmId) {
  return getProductsByFarm(farmId).length;
}

// Appends a new product and persists it. Pass a raw product object (no
// farmName/farmLocation/etc - those get joined on read). `price` is
// optional; leave it out for a listing that's still pending pricing.
export function addProduct(rawProduct) {
  const current = readRawProducts();
  const nextId = current.length ? Math.max(...current.map((p) => p.id)) + 1 : 1;
  const withId = { id: nextId, ...rawProduct };
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify([...current, withId]));
  return joinWithFarm(withId);
}

export const categories = ['Vegetable', 'Fruit', 'Livestock'];