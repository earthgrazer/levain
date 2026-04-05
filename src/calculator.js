/**
 * Pure calculation function. No side effects.
 *
 * Variables follow the spec naming:
 *   S  = starterWeight (grams)
 *   H  = starter hydration (water/flour ratio, decimal)
 *   P  = starter as fraction of total dough weight (decimal)
 *   R  = desired dough hydration (water/flour ratio, decimal)
 *
 * @param {Object} inputs
 * @param {number} inputs.starterWeight     - grams
 * @param {number} inputs.starterHydration  - percentage (e.g. 100 for 100%)
 * @param {number} inputs.starterPercentage - starter weight as % of total dough weight (e.g. 20 for 20%)
 * @param {number} inputs.doughHydration    - percentage (e.g. 80 for 80%)
 * @param {number} inputs.saltPercentage    - percentage of total flour weight (e.g. 2 for 2%)
 * @returns {Object} results
 */
export function calculate({ starterWeight, starterHydration, starterPercentage, doughHydration, saltPercentage }) {
  const warnings = []

  if (!starterWeight || !isFinite(starterWeight) || starterWeight <= 0) {
    return {
      addFlour: null,
      addWater: null,
      salt: null,
      totalFlour: null,
      totalDoughWeight: null,
      warnings: ['Enter a valid starter weight to calculate.'],
    }
  }

  const H = starterHydration / 100
  const P = starterPercentage / 100
  const R = doughHydration / 100
  const saltPct = saltPercentage / 100
  const S = starterWeight

  // Step 1: decompose starter into flour and water
  const S_flour = S / (1 + H)
  const S_water = S * H / (1 + H)

  // Step 2: total dough weight — starter is fraction P of total dough weight
  const D = S / P

  // Step 3: total flour and water in final dough
  // Constraints: F_total + W_total = D, and W_total / F_total = R
  const F_total = D / (1 + R)
  const W_total = D * R / (1 + R)

  // Step 4: amounts to add (subtract starter's contribution)
  const F_add = F_total - S_flour
  const W_add = W_total - S_water

  // Salt is a percentage of total flour
  const salt = F_total * saltPct

  if (W_add < 0) {
    warnings.push('Starter is wetter than target dough hydration — no water to add.')
  }
  if (F_add < 0) {
    warnings.push('Starter already contributes more flour than the target requires — try a lower starter percentage.')
  }

  const clampedFlour = Math.max(0, F_add)
  const clampedWater = Math.max(0, W_add)

  return {
    addFlour: Math.round(clampedFlour),
    addWater: Math.round(clampedWater),
    salt: parseFloat(salt.toFixed(1)),
    totalFlour: parseFloat(F_total.toFixed(1)),
    totalDoughWeight: Math.round(D + salt),
    warnings,
  }
}