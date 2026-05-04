import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { TierBadge, ImpactBadge } from '../components/Badge'
import { computePoints } from '../utils/scoring'

export default function PlayerProfile() {
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [lbEntry, setLbEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`/api/players/${id}`),
      axios.get('/api/leaderboard')
    ]).then(([p, lb]) => {
      setPlayer(p.data)
      setLbEntry(lb.data.find(e => e.player.id === parseInt(id)) || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>
  if (!player)  return <div className="text-red-400 text-center py-20">Player not found</div>

  const countingIds = new Set(lbEntry?.countingResults?.map(r => r.id) || [])

  // Recompute live points for each result
  const results = player.results.map(r => ({
    ...r,
    livePoints: computePoints(
      r.tier,
      r.placement_range_end ? Math.max(r.placement, r.placement_range_end) : r.placement,
      r.impact,
      r.date
    )
  }))

  const chartData = results
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(r => ({
      name: r.tournament_name.length > 20 ? r.tournament_name.slice(0, 20) + '…' : r.tournament_name,
      pts: r.livePoints,
      counting: countingIds.has(r.id)
    }))

  return (
    <div>
      <Link to="/" className="text-[#00aaff] text-sm hover:underline inline-block mb-6">
        ← Back to Rankings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{player.name}</h1>
          {player.country && <p className="text-gray-500 mt-1">{player.country}</p>}
        </div>
        {lbEntry && (
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-[#00aaff]">{lbEntry.score.toFixed(1)}</div>
            <div className="text-gray-500 text-sm">Rank #{lbEntry.rank}</div>
            <div className="text-gray-600 text-xs mt-1">
              {Math.min(results.length, 8)} of {results.length} results counting
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Points per Tournament (green = counting toward score)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 10 }} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#00aaff' }}
              />
              <Bar dataKey="pts" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.counting ? '#00aaff' : '#1f2937'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Results table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1f2937]">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tournament History
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-4 py-2 text-left">Tournament</th>
              <th className="px-4 py-2 text-center">Tier</th>
              <th className="px-4 py-2 text-center">Impact</th>
              <th className="px-4 py-2 text-center">Place</th>
              <th className="px-4 py-2 text-right">Pts (live)</th>
              <th className="px-4 py-2 text-right">In top 8</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {results.map(r => {
              const counting = countingIds.has(r.id)
              return (
                <tr
                  key={r.id}
                  className={`transition-opacity ${counting ? 'opacity-100' : 'opacity-35 hover:opacity-60'}`}
                >
                  <td className="px-4 py-3">
                    <div className="text-white text-sm font-medium">{r.tournament_name}</div>
                    <div className="text-gray-600 text-xs font-mono">{r.date}</div>
                  </td>
                  <td className="px-4 py-3 text-center"><TierBadge tier={r.tier} /></td>
                  <td className="px-4 py-3 text-center"><ImpactBadge impact={r.impact} /></td>
                  <td className="px-4 py-3 text-center text-gray-300 font-mono text-sm">
                    {r.placement_range_end
                      ? `${r.placement}–${r.placement_range_end}`
                      : `${r.placement}`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#00aaff]">
                    {r.livePoints.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {counting
                      ? <span className="text-green-400 text-sm">✓</span>
                      : <span className="text-gray-700 text-sm">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {results.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No results yet</div>
        )}
      </div>
    </div>
  )
}
