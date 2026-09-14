/*
 * The rewards programme, in one place so the checkout and the "How to earn
 * points" pop-up can never describe two different sets of rules.
 *
 * Buyers earn on what they spend. Sellers earn on how well they serve an
 * order — the farm side has nothing to spend, so the currency there is
 * reliability: answer fast, hand over on time, keep the listing honest.
 */

// One point for every ₱200 of goods. Delivery fees do not count towards it.
export const PESOS_PER_POINT = 200;

export function pointsForSpend(amount) {
  return Math.floor(amount / PESOS_PER_POINT);
}

// Bonus points printed on a combo are per set, so two sets pay twice.
export function pointsForItems(items = []) {
  return items.reduce((sum, item) => sum + (item.bonusPoints ?? 0) * item.quantity, 0);
}

export const BUYER_RULES = [
  {
    points: '+1 pt',
    title: `Every ₱${PESOS_PER_POINT} you spend`,
    detail: 'Counted on the goods in an order, rounded down. Delivery fees are excluded.',
    live: true,
  },
  {
    points: '+5 to +30',
    title: 'Claim a combo deal',
    detail: 'Every promo prints its own bonus on the card, on top of what you save.',
    live: true,
  },
  {
    points: '+25',
    title: 'Double-point listings',
    detail: 'Some farms flag a listing for double points. They rotate every week.',
    live: true,
  },
  {
    points: '+10',
    title: 'Review an order you received',
    detail: 'Rate the farm after hand-over. One review per order.',
  },
  {
    points: '+50',
    title: 'Invite a neighbour who orders',
    detail: 'Both of you get the points once their first order is handed over.',
  },
];

export const SELLER_RULES = [
  {
    points: '+15',
    title: 'Publish a new listing',
    detail: 'Awarded when you submit a product with its costing filled in.',
    live: true,
  },
  {
    points: '+10',
    title: 'Confirm an order within 2 hours',
    detail: 'The clock starts when the buyer places it, not when you open the app.',
  },
  {
    points: '+25',
    title: 'Hand over on time',
    detail: 'Delivered or collected inside the window you promised the buyer.',
  },
  {
    points: '+20',
    title: 'Earn a 5-star review',
    detail: 'Paid once per order, when the buyer rates the hand-over.',
  },
  {
    points: '+40',
    title: 'Join a combo or promo',
    detail: 'Put one of your products into a farm combo on the buyer side.',
  },
  {
    points: '+30',
    title: 'Update your stock every week',
    detail: 'Keep every active listing accurate for seven straight days.',
  },
];

export const BUYER_REWARDS = [
  '₱50 off any order at 100 points',
  'Free delivery from one farm at 250 points',
  'First pick of limited harvests at 500 points',
];

export const SELLER_REWARDS = [
  'A lower service fee on your next 10 orders at 150 points',
  'Featured placement in Browse for a week at 300 points',
  'A verified farm badge on your listings at 600 points',
];

export function rulesFor(role) {
  return role === 'seller' ? SELLER_RULES : BUYER_RULES;
}

export function rewardsFor(role) {
  return role === 'seller' ? SELLER_REWARDS : BUYER_REWARDS;
}

/*
 * Redemption side - added so checkout can offer "pay with points" as a
 * method, not just award them. Derived from the buyer's own "₱50 off any
 * order at 100 points" reward above (50 / 100 = ₱0.50 per point), so paying
 * fully with points uses the same rate that reward already implies, instead
 * of inventing a second, inconsistent one.
 */
export const POINT_REDEMPTION_VALUE = 0.5;

export function pointsNeededForTotal(total) {
  return Math.ceil(total / POINT_REDEMPTION_VALUE);
}