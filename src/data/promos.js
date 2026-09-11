import { getFarmById } from './farms';
import { getProductById } from './products';

/*
 * Combo and promo deals offered by the farms. Mock data for now — replace with
 * an API call once the backend exists.
 *
 * Each promo lists the products it bundles and the single price the buyer pays
 * for the whole set. The list price is NOT written down here: it is summed from
 * the catalog below, so a promo can never drift out of step with a price change.
 *
 * type:
 *   'bogo'     — buy one take one (or three for two)
 *   'discount' — a second item drops to half price
 *   'bundle'   — a fixed basket for less than its parts
 *   'points'   — sold at list price, the reward is the points
 */
const rawPromos = [
  {
    id: 'bogo-pechay',
    type: 'bogo',
    title: 'Buy 1 Take 1 — Pechay Bundle',
    tagline: 'Pay for one bundle of pechay, carry home two.',
    farmId: 'santos-organics',
    category: 'Vegetable',
    price: 45,
    bonusPoints: 5,
    includes: [{ productId: 9, quantity: 2, note: '1 paid + 1 free' }],
    terms: 'One free bundle per set claimed. Cut the morning of hand-over, while stock lasts.',
  },
  {
    id: 'bogo-saba',
    type: 'bogo',
    title: 'Buy 1 Take 1 — Saba Banana',
    tagline: 'A kilo of saba for turon, and a second kilo on the farm.',
    farmId: 'bukid-tropikal',
    category: 'Fruit',
    price: 55,
    bonusPoints: 5,
    includes: [{ productId: 8, quantity: 2, note: '1 kg paid + 1 kg free' }],
    terms: 'Limit two sets per order. Fruit is packed green so it ripens at home.',
  },
  {
    id: 'mango-calamansi-half',
    type: 'discount',
    title: 'Mango now, calamansi at 50% off',
    tagline: 'Take a kilo of carabao mango and the calamansi drops to half price.',
    farmId: 'dela-cruz',
    category: 'Fruit',
    price: 215,
    bonusPoints: 10,
    includes: [
      { productId: 3, quantity: 1, note: 'full price' },
      { productId: 4, quantity: 1, note: '50% off' },
    ],
    terms: 'The discount applies to the calamansi only, and only inside this combo.',
  },
  {
    id: 'highland-salad-box',
    type: 'bundle',
    title: 'Highland salad box',
    tagline: 'Broccoli, carrots and cabbage picked in Benguet cold-season air.',
    farmId: 'highland-greens',
    category: 'Vegetable',
    price: 230,
    bonusPoints: 20,
    includes: [
      { productId: 12, quantity: 1 },
      { productId: 13, quantity: 1 },
      { productId: 14, quantity: 1 },
    ],
    terms: 'Packed as one crate. The co-op harvests to order, so allow two hours of prep.',
  },
  {
    id: 'ulam-starter',
    type: 'bundle',
    title: 'Ulam starter pack',
    tagline: 'Eggplant, squash and red onions — a week of home cooking sorted.',
    farmId: 'reyes',
    category: 'Vegetable',
    price: 175,
    bonusPoints: 10,
    includes: [
      { productId: 17, quantity: 1 },
      { productId: 18, quantity: 1 },
      { productId: 16, quantity: 1 },
    ],
    terms: 'Onions are cured and keep for weeks. Squash is sold whole or halved on request.',
  },
  {
    id: 'pineapple-3for2',
    type: 'bogo',
    title: 'Queen pineapple — 3 for the price of 2',
    tagline: 'Three small, intensely sweet pineapples grown on volcanic soil.',
    farmId: 'bukid-tropikal',
    category: 'Fruit',
    price: 170,
    bonusPoints: 8,
    includes: [{ productId: 6, quantity: 3, note: '2 paid + 1 free' }],
    terms: 'Fruit is graded by hand, so sizes inside a set will vary a little.',
  },
  {
    id: 'chicken-eggs-half',
    type: 'discount',
    title: 'Native chicken, eggs at 50% off',
    tagline: 'Buy a free-range native chicken and take a tray of eggs for half.',
    farmId: 'villamor',
    category: 'Livestock',
    price: 540,
    bonusPoints: 30,
    includes: [
      { productId: 20, quantity: 1, note: 'full price' },
      { productId: 21, quantity: 1, note: '50% off' },
    ],
    terms: 'Chicken is dressed on request at no extra cost. Trays hold 30 eggs.',
  },
  {
    id: 'tomato-beans-half',
    type: 'discount',
    title: 'Tomatoes with beans at 50% off',
    tagline: 'A kilo of vine-ripened cherry tomatoes brings the beans down to half.',
    farmId: 'santos-organics',
    category: 'Vegetable',
    price: 165,
    bonusPoints: 8,
    includes: [
      { productId: 11, quantity: 1, note: 'full price' },
      { productId: 10, quantity: 1, note: '50% off' },
    ],
    terms: 'Both are cooled before packing. Best used within four days of hand-over.',
  },
  {
    id: 'double-points-eggs',
    type: 'points',
    title: 'Double points — free-range eggs',
    tagline: 'Same price as always, but this tray pays back 25 points.',
    farmId: 'villamor',
    category: 'Livestock',
    price: 240,
    bonusPoints: 25,
    includes: [{ productId: 21, quantity: 1, note: 'earns 25 points' }],
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
      name: product.name,
      unit: product.unit,
      listPrice: product.price,
      lineTotal: product.price * line.quantity,
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
    farmName: farm.name,
    farmLocation: farm.location,
    farmerName: `${farm.name} · ${farm.location}`,
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
