import { getFarmById } from './farms';

// Real product photos sourced from Wikimedia Commons (stable, hotlink-safe
// URLs via Special:FilePath - confirmed against actual Commons file pages).
const wm = (filename) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;

// Seed catalog - written into localStorage once, the first time the app
// runs with no products saved yet. After that, localStorage is the source
// of truth: this array is never read again on its own.
//
// Real farmers supplied by the client, all in Tagum City, Davao del Norte.
const seedProducts = [
  { id: 1, name: 'Pechay', price: 45, unit: 'bundle', category: 'Vegetable', farmId: 'weekend-farmers', stock: 60, description: 'Crisp, farm-fresh pechay at an affordable price.', imageUrl: wm('Bok Choy.JPG') },
  { id: 2, name: 'Lettuce', price: 60, unit: 'head', category: 'Vegetable', farmId: 'yamies-hydroponic', stock: 50, description: 'Hydroponically grown lettuce, clean and pesticide-free.', imageUrl: wm('Lettuce Mini Heads (7331119710).jpg') },
  { id: 3, name: 'Coconuts', price: 25, unit: 'piece', category: 'Fruit', farmId: 'francisco-coconut', stock: 100, description: 'Fresh whole coconuts, harvested to order.', imageUrl: wm('Cocos nucifera (fruits).jpg') },
  { id: 4, name: 'Eggplant', price: 65, unit: 'kg', category: 'Vegetable', farmId: 'dalaniel-eggplant', stock: 45, description: 'Glossy purple eggplant, picked at peak size.', imageUrl: wm('Eggplant aubergine brinjal.jpg') },
  { id: 5, name: 'Rice', price: 55, unit: 'kg', category: 'Vegetable', farmId: 'burgos-rice', stock: 200, description: 'Locally milled rice, sold fresh from the farm.', imageUrl: wm('Rice grains (IRRI).jpg') },
  { id: 6, name: 'Bangus (Milkfish)', price: 180, unit: 'kg', category: 'Livestock', farmId: 'bermino-bangus', stock: 40, description: 'Fresh bangus straight from the fishpond.', imageUrl: wm("Milkfish (Chanos chanos) locally called 'bangus' in a Philippine market.jpg") },
  { id: 7, name: 'Bangus (Milkfish)', price: 180, unit: 'kg', category: 'Livestock', farmId: 'mendez-bangus', stock: 40, description: 'Fresh bangus straight from the fishpond.', imageUrl: wm("Milkfish (Chanos chanos) locally called 'bangus' in a Philippine market.jpg") },
  { id: 8, name: 'Tilapia', price: 140, unit: 'kg', category: 'Livestock', farmId: 'manganaon-tilapia', stock: 40, description: 'Fresh tilapia straight from the fishpond.', imageUrl: wm('Fresh tilapia.jpg') },
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
//
// Also self-heals: if NONE of the stored products reference a farm that
// still exists in farms.js, the underlying farm/product data was replaced
// (exactly what just happened) - stale localStorage from before would
// otherwise silently break anything that assumes farmName is a string,
// like Catalog's search. In that case, reseed fresh instead of returning
// data that's entirely orphaned.
function readRawProducts() {
  const existing = readJSON(PRODUCTS_KEY, null);
  if (!existing) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seedProducts));
    return seedProducts;
  }
  const stillValid = existing.some((p) => getFarmById(p.farmId));
  if (!stillValid) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seedProducts));
    return seedProducts;
  }
  return existing;
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
// Filters out any product whose farm no longer exists, as a second line of
// defense on top of the reseed check above.
export function getAllProducts() {
  return readRawProducts()
    .filter((p) => getFarmById(p.farmId))
    .map(joinWithFarm);
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