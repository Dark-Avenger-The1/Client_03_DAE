/*
 * Implements the farmer's 5-step breakeven pricing formula, exactly as
 * specified. Kept as pure functions, separate from AddProduct.jsx, so the
 * math can be tested or reused without touching the form.
 *
 * Step 1: Allocated Shared Costs = Total Shared Expenses x (Harvested Weight
 *         of Specific Product / Harvested Weight of All Products)
 * Step 2: Total Specific Product Cost = Allocated Shared Cost + Direct
 *         Traceable Costs
 * Step 3: Breakeven Price Per Kg = Total Specific Product Cost / Marketable
 *         Quantity
 * Step 4: Base Floor Price Per Kg = Breakeven Price Per Kg x 1.10
 * Step 5: Final Selling Price Per Kg = Base Floor Price + Farmer's Desired
 *         Profit Margin
 */

const TRANSACTION_FEE_MULTIPLIER = 1.10;

// Sums whichever cost fields apply to the product's category (seeds/feed/etc).
// costInputs is the raw { key: value } object AddProduct.jsx collects.
export function sumDirectTraceableCosts(costInputs) {
  return Object.values(costInputs).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

/*
 * Runs all 5 steps and returns every intermediate number, so the confirmation
 * modal can show the farmer exactly how the final price was built up, not
 * just the end result.
 *
 * Returns null if the inputs can't produce a real number (e.g. dividing by
 * zero) - the caller should treat that as "not enough info yet", not a price
 * of zero or NaN.
 */
export function calculateBreakevenPrice({
  totalSharedExpenses,
  harvestedWeightProduct,
  harvestedWeightAll,
  directTraceableCosts,
  marketableQuantity,
  profitMargin,
}) {
  const sharedExpenses = Number(totalSharedExpenses) || 0;
  const weightProduct = Number(harvestedWeightProduct) || 0;
  const weightAll = Number(harvestedWeightAll) || 0;
  const directCosts = Number(directTraceableCosts) || 0;
  const quantity = Number(marketableQuantity) || 0;
  const margin = Number(profitMargin) || 0;

  if (weightAll <= 0 || quantity <= 0) return null;

  // Step 1
  const allocatedSharedCost = sharedExpenses * (weightProduct / weightAll);
  // Step 2
  const totalSpecificCost = allocatedSharedCost + directCosts;
  // Step 3
  const breakevenPricePerKg = totalSpecificCost / quantity;
  // Step 4
  const baseFloorPrice = breakevenPricePerKg * TRANSACTION_FEE_MULTIPLIER;
  // Step 5
  const finalSellingPrice = baseFloorPrice + margin;

  return {
    allocatedSharedCost,
    totalSpecificCost,
    breakevenPricePerKg,
    baseFloorPrice,
    finalSellingPrice,
  };
}