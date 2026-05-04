const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { computePoints } = require('../scoring');

router.get('/', (req, res) => {
  const db = getDB();
  const results = db.prepare(`
    SELECT r.*, p.name as player_name, t.name as tournament_name, t.tier, t.impact, t.date
    FROM results r
    JOIN players p ON r.player_id = p.id
    JOIN tournaments t ON r.tournament_id = t.id
    ORDER BY t.date DESC
  `).all();
  res.json(results);
});

router.post('/', (req, res) => {
  const db = getDB();
  const { player_id, tournament_id, placement, placement_range_end } = req.body;
  if (!player_id || !tournament_id || !placement) {
    return res.status(400).json({ error: 'player_id, tournament_id, placement required' });
  }

  const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournament_id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  // Use worst placement for ranges (conservative scoring)
  const effectivePlacement = placement_range_end
    ? Math.max(parseInt(placement), parseInt(placement_range_end))
    : parseInt(placement);

  const points = computePoints(tournament.tier, effectivePlacement, tournament.impact, tournament.date);

  try {
    const info = db.prepare(
      'INSERT INTO results (player_id, tournament_id, placement, placement_range_end, points_earned) VALUES (?, ?, ?, ?, ?)'
    ).run(player_id, tournament_id, placement, placement_range_end || null, points);
    res.json({ id: info.lastInsertRowid, points_earned: points });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const db = getDB();
  const { placement, placement_range_end } = req.body;
  const result = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });

  const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.tournament_id);
  const effectivePlacement = placement_range_end
    ? Math.max(parseInt(placement), parseInt(placement_range_end))
    : parseInt(placement);
  const points = computePoints(tournament.tier, effectivePlacement, tournament.impact, tournament.date);

  db.prepare('UPDATE results SET placement=?, placement_range_end=?, points_earned=? WHERE id=?')
    .run(placement, placement_range_end || null, points, req.params.id);
  res.json({ success: true, points_earned: points });
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
