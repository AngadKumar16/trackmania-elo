const TIER_BASE   = { S: 900, A: 400, B: 250 }
const IMPACT_MULT = { low: 0.85, standard: 1.0, high: 1.2 }

export function getPlacementMultiplier(placement) {
  if (placement === 1)  return 1.00
  if (placement === 2)  return 0.78
  if (placement === 3)  return 0.62
  if (placement === 4)  return 0.50
  if (placement <= 6)   return 0.38
  if (placement <= 8)   return 0.28
  if (placement <= 12)  return 0.20
  if (placement <= 16)  return 0.13
  if (placement <= 24)  return 0.08
  if (placement <= 32)  return 0.05
  if (placement <= 48)  return 0.03
  return 0.01
}

export function getDecayMultiplier(tournamentDate) {
  const now = new Date()
  const date = new Date(tournamentDate)
  const diffMonths = (now - date) / (1000 * 60 * 60 * 24 * 30.44)
  if (diffMonths >= 12) return 0
  const brackets = Math.floor(diffMonths / 2)
  return parseFloat(Math.max(1.0 - brackets * 0.1, 0.1).toFixed(2))
}

export function computePoints(tier, placement, impact, date) {
  return parseFloat((
    TIER_BASE[tier] *
    getPlacementMultiplier(placement) *
    IMPACT_MULT[impact] *
    getDecayMultiplier(date)
  ).toFixed(2))
}
