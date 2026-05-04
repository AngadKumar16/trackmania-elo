const tierColors = {
  S: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  A: 'bg-blue-500/20  text-blue-400  border-blue-500/30',
  B: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
}

const impactColors = {
  high:     'bg-green-500/20 text-green-400  border-green-500/30',
  standard: 'bg-gray-500/20  text-gray-400   border-gray-500/30',
  low:      'bg-red-500/20   text-red-400    border-red-500/30'
}

export function TierBadge({ tier }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${tierColors[tier]}`}>
      {tier}
    </span>
  )
}

export function ImpactBadge({ impact }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${impactColors[impact]}`}>
      {impact}
    </span>
  )
}
