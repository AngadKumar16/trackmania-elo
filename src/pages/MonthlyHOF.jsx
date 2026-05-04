import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMonthlyBests } from '../lib/api'

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_STYLES = [
  'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  'bg-gray-500/10  border-gray-500/20  text-gray-300',
  'bg-amber-700/10 border-amber-700/20 text-amber-600'
]

export default function MonthlyHOF() {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMonthlyBests().then(data => {
      const g = {}
      data.forEach(entry => {
        if (!g[entry.month]) g[entry.month] = []
        g[entry.month].push(entry)
      })
      setGrouped(g)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400 text-center py-20">Loading…</div>

  const months = Object.keys(grouped).sort().reverse()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Monthly Hall of Fame</h1>
      <p className="text-gray-500 text-sm mb-8">
        Top 3 players each month, frozen at month-end. Starting May 2026.
      </p>

      {months.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No snapshots yet.{' '}
          <Link to="/admin" className="text-[#00aaff] hover:underline">
            Take one in Admin
          </Link>{' '}
          at the end of each month.
        </div>
      )}

      <div className="space-y-6">
        {months.map(month => {
          const label = new Date(month + '-02').toLocaleDateString('en-US', {
            month: 'long', year: 'numeric'
          })
          return (
            <div key={month} className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">{label}</h2>
              <div className="grid grid-cols-3 gap-3">
                {grouped[month].map(entry => {
                  const style  = RANK_STYLES[entry.rank - 1]
                  const medal  = MEDALS[entry.rank - 1]
                  return (
                    <div key={entry.rank} className={`border rounded-xl p-4 ${style}`}>
                      <div className="text-xl mb-1">{medal}</div>
                      <div className="font-bold text-white">{entry.players?.name}</div>
                      {entry.players?.country && (
                        <div className="text-xs opacity-60 font-mono mt-0.5">{entry.players.country}</div>
                      )}
                      <div className="font-mono text-sm mt-2 opacity-80">
                        {parseFloat(entry.score_snapshot).toFixed(1)} pts
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
