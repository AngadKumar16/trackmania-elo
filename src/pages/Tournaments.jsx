import { useEffect, useState } from 'react'
import { getTournaments, getTournament } from '../lib/api'
import { TierBadge, ImpactBadge } from '../components/Badge'

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected]       = useState(null)
  const [detail, setDetail]           = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    getTournaments().then(setTournaments).finally(() => setLoading(false))
  }, [])

  const openTournament = async (t) => {
    setSelected(t.id)
    setDetail(null)
    const data = await getTournament(t.id)
    setDetail(data)
  }

  if (loading) return <div className="text-gray-400 text-center py-20">Loading…</div>

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-white mb-6">Tournaments</h1>
        <div className="space-y-2">
          {tournaments.map(t => (
            <button
              key={t.id}
              onClick={() => openTournament(t)}
              className={`w-full text-left bg-[#111827] border rounded-xl px-5 py-4 flex items-center gap-4 transition-colors ${
                selected === t.id ? 'border-[#00aaff]/50' : 'border-[#1f2937] hover:border-[#374151]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{t.name}</div>
                <div className="text-gray-500 text-xs mt-0.5 font-mono">
                  {t.date}{t.prize_pool ? ` · ${t.prize_pool}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <TierBadge tier={t.tier} />
                <ImpactBadge impact={t.impact} />
              </div>
            </button>
          ))}
          {tournaments.length === 0 && (
            <div className="text-center py-16 text-gray-500">No tournaments yet.</div>
          )}
        </div>
      </div>

      {selected && (
        <div className="w-72 flex-shrink-0">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 sticky top-24">
            {detail ? (
              <>
                <h2 className="font-bold text-white mb-1">{detail.name}</h2>
                <div className="flex gap-2 mb-2">
                  <TierBadge tier={detail.tier} />
                  <ImpactBadge impact={detail.impact} />
                </div>
                <div className="text-xs text-gray-500 font-mono mb-4">{detail.date}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Results</div>
                <div className="space-y-1.5">
                  {detail.results?.sort((a, b) => a.placement - b.placement).map(r => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{r.players?.name}</span>
                      <span className="font-mono text-gray-500">
                        {r.placement_range_end
                          ? `${r.placement}–${r.placement_range_end}`
                          : `#${r.placement}`}
                      </span>
                    </div>
                  ))}
                  {detail.results?.length === 0 && (
                    <div className="text-gray-600 text-xs">No results entered</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm">Loading…</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
