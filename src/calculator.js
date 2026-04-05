/**
 * Pure calculation function. No side effects.
 * @param {Object} inputs
 * @param {number} inputs.starterWeight - grams
 * @param {number} inputs.starterHydration - percentage (e.g. 100 for 100%)
 * @param {number} inputs.starterPercentage - starter flour as % of total flour (e.g. 20 for 20%)
 * @param {number} inputs.doughHydration - percentage (e.g. 80 for 80%)
 * @param {number} inputs.saltPercentage - percentage (e.g. 2 for 2%)
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

  const sH = starterHydration / 100
  const sPct = starterPercentage / 100
  const dH = doughHydration / 100
  const saltPct = saltPercentage / 100

  const starterFlour = starterWeight / (1 + sH)
  const starterWater = starterWeight - starterFlour

  const totalFlour = starterFlour / sPct
  const totalWater = totalFlour * dH

  const addFlour = totalFlour - starterFlour
  const addWater = totalWater - starterWater
  const salt = totalFlour * saltPct

  if (addWater < 0) {
    warnings.push('Starter is wetter than target dough hydration — no water to add.')
  }
  if (addFlour < 0) {
    warnings.push('Starter flour already exceeds target ratio — try a higher starter percentage.')
  }

  const clampedFlour = Math.max(0, addFlour)
  const clampedWater = Math.max(0, addWater)

  return {
    addFlour: Math.round(clampedFlour),
    addWater: Math.round(clampedWater),
    salt: parseFloat(salt.toFixed(1)),
    totalFlour: parseFloat(totalFlour.toFixed(1)),
    totalDoughWeight: Math.round(starterWeight + clampedFlour + clampedWater + salt),
    warnings,
  }
}