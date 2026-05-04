import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { TierBadge } from '../components/Badge'

function RankDisplay({ rank }) {
  const color =
    rank === 1 ? 'text-yellow-400' :
    rank === 2 ? 'text-gray-300' :
    rank === 3 ? 'text-amber-600' : 'text-gray-500'
  return <span className={`font-mono font-bold text-sm ${color}`}>#{rank}</span>
}

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/leaderboard')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Global Rankings</h1>
        <p className="text-gray-500 text-sm mt-1">Best 8 results · 12-month rolling window · Decay: −10% per 2 months</p>
      </div>

      <div className="rounded-xl border border-[#1f2937] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d1120] text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-14">Rank</th>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-right">Events</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Best Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {data.map(entry => (
              <tr key={entry.player.id} className="bg-[#111827] hover:bg-[#1a2235] transition-colors group">
                <td className="px-4 py-4">
                  <RankDisplay rank={entry.rank} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/players/${entry.player.id}`}
                      className="font-semibold text-white group-hover:text-[#00aaff] transition-colors"
                    >
                      {entry.player.name}
                    </Link>
                    {entry.player.country && (
                      <span className="text-xs text-gray-600 font-mono">{entry.player.country}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-mono font-bold text-[#00aaff] text-lg">
                    {entry.score.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-gray-500 text-sm font-mono">
                  {entry.tournamentsPlayed}
                </td>
                <td className="px-4 py-4 text-right hidden md:table-cell">
                  {entry.bestResult ? (
                    <div className="flex items-center justify-end gap-2">
                      <TierBadge tier={entry.bestResult.tier} />
                      <span className="text-sm text-gray-400 truncate max-w-[180px]">
                        {entry.bestResult.tournament_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No players yet —{' '}
            <Link to="/admin" className="text-[#00aaff] hover:underline">add some in Admin</Link>
          </div>
        )}
      </div>
    </div>
  )
}
