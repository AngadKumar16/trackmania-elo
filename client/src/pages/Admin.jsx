import { useEffect, useState } from 'react'
import axios from 'axios'

// ── tiny reusable components ──────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 mb-5">
      <h2 className="text-white font-bold text-base mb-1">{title}</h2>
      {subtitle && <p className="text-gray-500 text-xs mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 py-2 text-white text-sm ' +
  'focus:outline-none focus:border-[#00aaff] placeholder-gray-700 transition-colors'

function Input({ label, ...props }) {
  return <Field label={label}><input className={inputCls} {...props} /></Field>
}

function Select({ label, children, ...props }) {
  return (
    <Field label={label}>
      <select className={inputCls} {...props}>{children}</select>
    </Field>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled }) {
  const base = 'px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer'
  const v = {
    primary:   'bg-[#00aaff] text-[#0a0e1a] hover:bg-blue-300',
    danger:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    secondary: 'bg-[#1f2937] text-gray-300 hover:bg-[#374151]'
  }
  return <button className={`${base} ${v[variant]}`} onClick={onClick} disabled={disabled}>{children}</button>
}

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="fixed bottom-6 right-6 bg-[#111827] border border-[#00aaff]/40 text-[#00aaff] text-sm px-4 py-2 rounded-lg shadow-xl z-50">
      {msg}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function Admin() {
  const [players,     setPlayers]     = useState([])
  const [tournaments, setTournaments] = useState([])
  const [results,     setResults]     = useState([])
  const [toast,       setToast]       = useState('')

  const [newPlayer,     setNP] = useState({ name: '', country: '' })
  const [newTournament, setNT] = useState({ name: '', tier: 'A', impact: 'standard', date: '', prize_pool: '' })
  const [newResult,     setNR] = useState({ player_id: '', tournament_id: '', placement: '', placement_range_end: '' })
  const [snapMonth,     setSM] = useState('')

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const refresh = () => {
    axios.get('/api/players').then(r => setPlayers(r.data))
    axios.get('/api/tournaments').then(r => setTournaments(r.data))
    axios.get('/api/results').then(r => setResults(r.data))
  }

  useEffect(() => { refresh() }, [])

  // Add player
  const addPlayer = async () => {
    if (!newPlayer.name.trim()) return
    await axios.post('/api/players', newPlayer)
    setNP({ name: '', country: '' })
    notify('Player added ✓')
    refresh()
  }

  // Add tournament
  const addTournament = async () => {
    if (!newTournament.name.trim() || !newTournament.date) return
    await axios.post('/api/tournaments', newTournament)
    setNT({ name: '', tier: 'A', impact: 'standard', date: '', prize_pool: '' })
    notify('Tournament added ✓')
    refresh()
  }

  // Add result
  const addResult = async () => {
    if (!newResult.player_id || !newResult.tournament_id || !newResult.placement) return
    try {
      const r = await axios.post('/api/results', {
        player_id:          parseInt(newResult.player_id),
        tournament_id:      parseInt(newResult.tournament_id),
        placement:          parseInt(newResult.placement),
        placement_range_end: newResult.placement_range_end
          ? parseInt(newResult.placement_range_end)
          : null
      })
      notify(`Result added — ${r.data.points_earned} pts ✓`)
      setNR({ player_id: '', tournament_id: '', placement: '', placement_range_end: '' })
      refresh()
    } catch (e) {
      notify(`Error: ${e.response?.data?.error || e.message}`)
    }
  }

  // Delete result
  const deleteResult = async id => {
    await axios.delete(`/api/results/${id}`)
    notify('Result deleted')
    refresh()
  }

  // Monthly snapshot
  const triggerSnapshot = async () => {
    if (!snapMonth) return
    try {
      const r = await axios.post('/api/monthly/snapshot', { month: snapMonth })
      notify(`Snapshot saved for ${r.data.month} ✓`)
    } catch (e) {
      notify(`Error: ${e.response?.data?.error || e.message}`)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Admin</h1>
      <Toast msg={toast} />

      {/* Add Player */}
      <Section title="Add Player">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input label="Name" value={newPlayer.name} onChange={e => setNP(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Epos" />
          <Input label="Country code" value={newPlayer.country} onChange={e => setNP(p => ({ ...p, country: e.target.value }))} placeholder="e.g. FR" />
        </div>
        <Btn onClick={addPlayer}>Add Player</Btn>
      </Section>

      {/* Add Tournament */}
      <Section title="Add Tournament">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <Input label="Name" value={newTournament.name} onChange={e => setNT(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Elite Cup 2026: France" />
          </div>
          <Select label="Tier" value={newTournament.tier} onChange={e => setNT(p => ({ ...p, tier: e.target.value }))}>
            <option value="S">S — EWC, ENC (900 pts base)</option>
            <option value="A">A — Elite Cup, Red Bull Faster (400 pts)</option>
            <option value="B">B — Overdrive, Beacon (250 pts)</option>
          </Select>
          <Select label="Impact" value={newTournament.impact} onChange={e => setNT(p => ({ ...p, impact: e.target.value }))}>
            <option value="low">Low ×0.85 — Key players absent</option>
            <option value="standard">Standard ×1.0 — Normal field</option>
            <option value="high">High ×1.2 — Elite field / qualifies to S</option>
          </Select>
          <Input label="Date" type="date" value={newTournament.date} onChange={e => setNT(p => ({ ...p, date: e.target.value }))} />
          <Input label="Prize pool (optional)" value={newTournament.prize_pool} onChange={e => setNT(p => ({ ...p, prize_pool: e.target.value }))} placeholder="e.g. $1,500" />
        </div>
        <Btn onClick={addTournament}>Add Tournament</Btn>
      </Section>

      {/* Add Result */}
      <Section title="Add Result">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Select label="Player" value={newResult.player_id} onChange={e => setNR(p => ({ ...p, player_id: e.target.value }))}>
            <option value="">Select player…</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Tournament" value={newResult.tournament_id} onChange={e => setNR(p => ({ ...p, tournament_id: e.target.value }))}>
            <option value="">Select tournament…</option>
            {tournaments.map(t => <option key={t.id} value={t.id}>[{t.tier}] {t.name}</option>)}
          </Select>
          <Input
            label="Placement"
            type="number" min="1"
            value={newResult.placement}
            onChange={e => setNR(p => ({ ...p, placement: e.target.value }))}
            placeholder="e.g. 4"
          />
          <Input
            label="Range end (for ties)"
            type="number" min="1"
            value={newResult.placement_range_end}
            onChange={e => setNR(p => ({ ...p, placement_range_end: e.target.value }))}
            placeholder="e.g. 8 (for 7th–8th)"
          />
        </div>
        <Btn onClick={addResult}>Add Result</Btn>
      </Section>

      {/* Results log */}
      <Section title="All Results" subtitle="Dimmed results don't count toward player score (not in top 8).">
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {results.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-[#0a0e1a] rounded-lg px-3 py-2">
              <div className="min-w-0">
                <span className="text-white font-medium text-sm">{r.player_name}</span>
                <span className="text-gray-600 text-xs mx-2">·</span>
                <span className="text-gray-400 text-xs truncate">{r.tournament_name}</span>
                <span className="text-gray-600 text-xs mx-2">·</span>
                <span className="text-gray-500 text-xs font-mono">
                  {r.placement_range_end ? `${r.placement}–${r.placement_range_end}` : `${r.placement}th`}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <span className="font-mono text-[#00aaff] text-sm">{r.points_earned?.toFixed(1)}</span>
                <Btn variant="danger" onClick={() => deleteResult(r.id)}>✕</Btn>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="text-gray-600 text-sm text-center py-6">No results yet</div>
          )}
        </div>
      </Section>

      {/* Monthly snapshot */}
      <Section
        title="Monthly Snapshot"
        subtitle="Freezes the current top 3 as the HOF record for that month. Run at the end of each month. Cannot be overwritten."
      >
        <div className="flex gap-3 items-end">
          <div className="w-44">
            <Input label="Month" type="month" value={snapMonth} onChange={e => setSM(e.target.value)} />
          </div>
          <Btn onClick={triggerSnapshot} disabled={!snapMonth}>Take Snapshot</Btn>
        </div>
      </Section>

      {/* Players list */}
      <Section title="Players">
        <div className="grid grid-cols-2 gap-2">
          {players.map(p => (
            <div key={p.id} className="bg-[#0a0e1a] rounded-lg px-3 py-2 text-sm flex justify-between items-center">
              <span className="text-white">{p.name}</span>
              {p.country && <span className="text-gray-600 font-mono text-xs">{p.country}</span>}
            </div>
          ))}
          {players.length === 0 && <div className="text-gray-600 text-sm col-span-2">No players yet</div>}
        </div>
      </Section>
    </div>
  )
}
