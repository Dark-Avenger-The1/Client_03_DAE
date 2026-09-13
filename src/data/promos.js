import { getFarmById } from './farms';
import { getProductById } from './products';

/*
 * Combo and promo deals offered by the farms. Mock data for now - replace with
 * an API call once the backend exists.
 *
 * Each promo lists the products it bundles and the single price the buyer pays
 * for the whole set. The list price is NOT written down here: it is summed from
 * the catalog below, so a promo can never drift out of step with a price change.
 *
 * ids below match the current Davao del Norte catalog (data/products.js,
 * data/farms.js) - rewritten from the original placeholder version, which
 * referenced products/farms that no longer exist and crashed on load.
 *
 * type:
 *   'bogo'     - buy one take one (or three for two)
 *   'discount' - a second item drops to half price
 *   'bundle'   - a fixed basket for less than its parts
 *   'points'   - sold at list price, the reward is the points
 */
const rawPromos = [
  {
    id: 'bogo-pechay',
    type: 'bogo',
    title: 'Buy 1 Take 1 — Pechay',
    tagline: 'Pay for one bundle of pechay, carry home two.',
    farmId: 'tagum-greens',
    category: 'Vegetable',
    price: 45,
    bonusPoints: 5,
    includes: [{ productId: 1, quantity: 2, note: '1 paid + 1 free' }],
    terms: 'One free bundle per set claimed. Cut the morning of hand-over, while stock lasts.',
  },
  {
    id: 'bogo-saba',
    type: 'bogo',
    title: 'Buy 1 Take 1 — Saba Banana',
    tagline: 'A kilo of saba for turon, and a second kilo on the farm.',
    farmId: 'panabo-banana',
    category: 'Fruit',
    price: 45,
    bonusPoints: 5,
    includes: [{ productId: 7, quantity: 2, note: '1 kg paid + 1 kg free' }],
    terms: 'Limit two sets per order. Fruit is packed green so it ripens at home.',
  },
  {
    id: 'durian-rambutan-half',
    type: 'discount',
    title: 'Durian now, rambutan at 50% off',
    tagline: 'Take a kilo of Samal durian and the rambutan drops to half price.',
    farmId: 'samal-orchard',
    category: 'Fruit',
    price: 265,
    bonusPoints: 12,
    includes: [
      { productId: 8, quantity: 1, note: 'full price' },
      { productId: 9, quantity: 1, note: '50% off' },
    ],
    terms: 'The discount applies to the rambutan only, and only inside this combo.',
  },
  {
    id: 'tagum-veggie-box',
    type: 'bundle',
    title: 'Tagum vegetable box',
    tagline: 'Pechay, eggplant and kalabasa picked the same morning.',
    farmId: 'tagum-greens',
    category: 'Vegetable',
    price: 140,
    bonusPoints: 12,
    includes: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
      { productId: 3, quantity: 1 },
    ],
    terms: 'Packed as one crate. The farm harvests to order, so allow some prep time.',
  },
  {
    id: 'sitaw-kamote-combo',
    type: 'bundle',
    title: 'Sitaw & kamote combo',
    tagline: 'String beans and sweet potato - a couple of home-cooked meals sorted.',
    farmId: 'carmen-harvest',
    category: 'Vegetable',
    price: 80,
    bonusPoints: 8,
    includes: [
      { productId: 4, quantity: 1 },
      { productId: 5, quantity: 1 },
    ],
    terms: 'Kamote keeps for weeks in a cool pantry. Sitaw is cut fresh the same day.',
  },
  {
    id: 'rambutan-3for2',
    type: 'bogo',
    title: 'Rambutan — 3 for the price of 2',
    tagline: 'Sweet, juicy rambutan sold by the cluster, one cluster free.',
    farmId: 'samal-orchard',
    category: 'Fruit',
    price: 180,
    bonusPoints: 10,
    includes: [{ productId: 9, quantity: 3, note: '2 paid + 1 free' }],
    terms: 'Fruit is graded by hand, so cluster sizes inside a set will vary a little.',
  },
  {
    id: 'chicken-bonus-points',
    type: 'points',
    title: 'Bonus points — native chicken',
    tagline: 'Same price as always, but this order pays back extra points.',
    farmId: 'kapalong-livestock',
    category: 'Livestock',
    price: 400,
    bonusPoints: 20,
    includes: [{ productId: 11, quantity: 1, note: 'earns 20 points' }],
    terms: 'Points land on your account the moment the order is placed.',
  },
  {
    id: 'kalabasa-eggplant-half',
    type: 'discount',
    title: 'Kalabasa now, eggplant at 50% off',
    tagline: 'A kilo of squash brings the eggplant down to half price.',
    farmId: 'tagum-greens',
    category: 'Vegetable',
    price: 82,
    bonusPoints: 8,
    includes: [
      { productId: 3, quantity: 1, note: 'full price' },
      { productId: 2, quantity: 1, note: '50% off' },
    ],
    terms: 'Both are cooled before packing. Best used within a few days of hand-over.',
  },
  {
    id: 'double-points-eggs',
    type: 'points',
    title: 'Double points — free-range eggs',
    tagline: 'Same price as always, but this tray pays back 25 points.',
    farmId: 'carmen-harvest',
    category: 'Livestock',
    price: 220,
    bonusPoints: 25,
    includes: [{ productId: 13, quantity: 1, note: 'earns 25 points' }],
    terms: 'Points land on your account the moment the order is placed.',
  },
];

// Labels the Combos page prints on badges and filter chips.
export const PROMO_TYPES = {
  bogo: 'Buy 1 take 1',
  discount: 'Half-price add-on',
  bundle: 'Bundle',
  points: 'Bonus points',
};

// Join each promo with its farm and the catalog rows it bundles, then work out
// what the same basket would cost at list price.
const promos = rawPromos.map((promo) => {
  const farm = getFarmById(promo.farmId);

  const items = promo.includes.map((line) => {
    const product = getProductById(line.productId);
    return {
      ...line,
      name: product?.name ?? 'Unknown product',
      unit: product?.unit ?? '',
      listPrice: product?.price ?? 0,
      lineTotal: (product?.price ?? 0) * line.quantity,
    };
  });

  const originalPrice = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const savings = originalPrice - promo.price;

  return {
    ...promo,
    items,
    originalPrice,
    savings,
    savingsPercent: originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0,
    typeLabel: PROMO_TYPES[promo.type],
    farmName: farm?.name ?? 'Unknown farm',
    farmLocation: farm?.location ?? '',
    farmerName: farm ? `${farm.name} - ${farm.location}` : 'Unknown farm',
  };
});

export function getPromoById(id) {
  return promos.find((p) => p.id === id);
}

/*
 * A promo goes into the cart as one line of its own, priced as a set, so the
 * cart and the order history read the same way as any other item.
 */
export function promoAsCartItem(promo) {
  return {
    id: `combo-${promo.id}`,
    name: promo.title,
    price: promo.price,
    unit: 'set',
    category: promo.category,
    farmId: promo.farmId,
    farmName: promo.farmName,
    farmerName: promo.farmerName,
    bonusPoints: promo.bonusPoints,
    isCombo: true,
  };
}

export default promos;