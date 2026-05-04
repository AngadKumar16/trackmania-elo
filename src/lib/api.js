import { supabase } from './supabase'
import { computePoints } from '../utils/scoring'

// ── Players ───────────────────────────────────────────────────────────────────

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function addPlayer({ name, country, liquipedia_id }) {
  const { data, error } = await supabase
    .from('players')
    .insert({ name, country: country || null, liquipedia_id: liquipedia_id || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

// ── Tournaments ───────────────────────────────────────────────────────────────

export async function getTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function getTournament(id) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, results(*, players(name, country))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function addTournament({ name, tier, impact, date, prize_pool, liquipedia_url }) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({ name, tier, impact: impact || 'standard', date, prize_pool: prize_pool || null, liquipedia_url: liquipedia_url || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTournament(id) {
  const { error } = await supabase.from('tournaments').delete().eq('id', id)
  if (error) throw error
}

// ── Results ───────────────────────────────────────────────────────────────────

export async function getAllResults() {
  const { data, error } = await supabase
    .from('results')
    .select('*, players(name, country), tournaments(name, tier, impact, date)')
    .order('tournament_id', { ascending: false })
  if (error) throw error
  return data
}

export async function addResult({ player_id, tournament_id, placement, placement_range_end }) {
  const { data, error } = await supabase
    .from('results')
    .insert({
      player_id,
      tournament_id,
      placement,
      placement_range_end: placement_range_end || null
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteResult(id) {
  const { error } = await supabase.from('results').delete().eq('id', id)
  if (error) throw error
}

// ── Leaderboard (computed entirely on client) ─────────────────────────────────

export async function getLeaderboard() {
  // Single joined query — players + all results + tournament details
  const { data: players, error: pe } = await supabase.from('players').select('*')
  if (pe) throw pe

  const { data: results, error: re } = await supabase
    .from('results')
    .select('*, tournaments(id, name, tier, impact, date)')
  if (re) throw re

  const leaderboard = players.map(player => {
    const playerResults = results
      .filter(r => r.player_id === player.id)
      .map(r => {
        const t = r.tournaments
        const effectivePlacement = r.placement_range_end
          ? Math.max(r.placement, r.placement_range_end)
          : r.placement
        return {
          ...r,
          tournament_name: t.name,
          tier:   t.tier,
          impact: t.impact,
          date:   t.date,
          livePoints: computePoints(t.tier, effectivePlacement, t.impact, t.date)
        }
      })

    const sorted         = [...playerResults].sort((a, b) => b.livePoints - a.livePoints)
    const countingResults = sorted.slice(0, 8)
    const score          = parseFloat(countingResults.reduce((s, r) => s + r.livePoints, 0).toFixed(2))

    return {
      player,
      score,
      results: playerResults,
      countingResults,
      bestResult:       sorted[0] || null,
      tournamentsPlayed: playerResults.length
    }
  })

  return leaderboard
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

// ── Player profile ────────────────────────────────────────────────────────────

export async function getPlayerWithResults(id) {
  const { data, error } = await supabase
    .from('players')
    .select('*, results(*, tournaments(name, tier, impact, date, prize_pool))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ── Monthly HOF ───────────────────────────────────────────────────────────────

export async function getMonthlyBests() {
  const { data, error } = await supabase
    .from('monthly_bests')
    .select('*, players(name, country)')
    .order('month', { ascending: false })
    .order('rank')
  if (error) throw error
  return data
}

export async function takeMonthlySnapshot(month) {
  // Check if already exists
  const { data: existing } = await supabase
    .from('monthly_bests')
    .select('id')
    .eq('month', month)
    .limit(1)

  if (existing?.length > 0) {
    throw new Error(`Snapshot for ${month} already exists`)
  }

  const leaderboard = await getLeaderboard()
  const top3 = leaderboard.slice(0, 3)

  const rows = top3.map((e, i) => ({
    month,
    player_id:      e.player.id,
    rank:           i + 1,
    score_snapshot: e.score
  }))

  const { error } = await supabase.from('monthly_bests').insert(rows)
  if (error) throw error

  return top3.map(e => ({ rank: e.rank, name: e.player.name, score: e.score }))
}
