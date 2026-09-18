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
 * ids below match the current real-farmer catalog (data/products.js,
 * data/farms.js) - Tagum City farms supplied by the client.
 *
 * Only 'bogo' and 'points' types appear here on purpose: every farm now
 * sells exactly one product, so 'discount'/'bundle' (which need two
 * different products from the same farm) can't be built without mixing
 * farms - and Combos.jsx shows one pickup location per promo, so a mixed
 * combo would show the wrong address for half its items.
 *
 * type:
 *   'bogo'   - buy one take one (or three for two)
 *   'points' - sold at list price, the reward is the points
 */
const rawPromos = [
  {
    id: 'bogo-pechay',
    type: 'bogo',
    title: 'Buy 1 Take 1 — Pechay',
    tagline: 'Pay for one bundle of pechay, carry home two.',
    farmId: 'weekend-farmers',
    category: 'Vegetable',
    price: 45,
    bonusPoints: 5,
    includes: [{ productId: 1, quantity: 2, note: '1 paid + 1 free' }],
    terms: 'One free bundle per set claimed. While stock lasts.',
  },
  {
    id: 'bogo-lettuce',
    type: 'bogo',
    title: 'Buy 1 Take 1 — Lettuce',
    tagline: 'A head of hydroponic lettuce for your salad, and a second one free.',
    farmId: 'yamies-hydroponic',
    category: 'Vegetable',
    price: 60,
    bonusPoints: 6,
    includes: [{ productId: 2, quantity: 2, note: '1 head paid + 1 head free' }],
    terms: 'Limit two sets per order. Cut fresh the morning of hand-over.',
  },
  {
    id: 'coconut-3for2',
    type: 'bogo',
    title: 'Coconuts — 3 for the price of 2',
    tagline: 'Fresh whole coconuts, one extra on the house.',
    farmId: 'francisco-coconut',
    category: 'Fruit',
    price: 50,
    bonusPoints: 5,
    includes: [{ productId: 3, quantity: 3, note: '2 paid + 1 free' }],
    terms: 'Coconuts are harvested to order, so allow some prep time.',
  },
  {
    id: 'points-eggplant',
    type: 'points',
    title: 'Bonus points — eggplant',
    tagline: 'Same price as always, but this order pays back extra points.',
    farmId: 'dalaniel-eggplant',
    category: 'Vegetable',
    price: 65,
    bonusPoints: 15,
    includes: [{ productId: 4, quantity: 1, note: 'earns 15 points' }],
    terms: 'Points land on your account the moment the order is placed.',
  },
  {
    id: 'points-rice',
    type: 'points',
    title: 'Bonus points — rice (5kg)',
    tagline: 'Stock up on rice and earn a solid points bonus for it.',
    farmId: 'burgos-rice',
    category: 'Vegetable',
    price: 275,
    bonusPoints: 30,
    includes: [{ productId: 5, quantity: 5, note: 'earns 30 points' }],
    terms: 'Points land on your account the moment the order is placed.',
  },
  {
    id: 'bogo-bangus-bermino',
    type: 'bogo',
    title: 'Buy 1kg Take 1kg — Bangus',
    tagline: 'A kilo of bangus for the table, and a second kilo on the house.',
    farmId: 'bermino-bangus',
    category: 'Livestock',
    price: 180,
    bonusPoints: 20,
    includes: [{ productId: 6, quantity: 2, note: '1 kg paid + 1 kg free' }],
    terms: 'One free kilo per set claimed. Fresh from the fishpond, while stock lasts.',
  },
  {
    id: 'points-bangus-mendez',
    type: 'points',
    title: 'Bonus points — bangus',
    tagline: 'Same price as always, but this order pays back extra points.',
    farmId: 'mendez-bangus',
    category: 'Livestock',
    price: 180,
    bonusPoints: 20,
    includes: [{ productId: 7, quantity: 1, note: 'earns 20 points' }],
    terms: 'Points land on your account the moment the order is placed.',
  },
  {
    id: 'tilapia-3for2',
    type: 'bogo',
    title: 'Tilapia — 3kg for the price of 2kg',
    tagline: 'Fresh tilapia from the fishpond, one kilo free.',
    farmId: 'manganaon-tilapia',
    category: 'Livestock',
    price: 280,
    bonusPoints: 20,
    includes: [{ productId: 8, quantity: 3, note: '2 kg paid + 1 kg free' }],
    terms: 'Fish is graded by hand, so weights inside a set will vary a little.',
  },
];

// Labels the Combos page prints on badges and filter chips.
export const PROMO_TYPES = {
  bogo: 'Buy 1 take 1',
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