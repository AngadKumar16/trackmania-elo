const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', (req, res) => {
  const db = getDB();
  const players = db.prepare('SELECT * FROM players ORDER BY name').all();
  res.json(players);
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const results = db.prepare(`
    SELECT r.*, t.name as tournament_name, t.tier, t.impact, t.date, t.prize_pool
    FROM results r
    JOIN tournaments t ON r.tournament_id = t.id
    WHERE r.player_id = ?
    ORDER BY t.date DESC
  `).all(req.params.id);

  res.json({ ...player, results });
});

router.post('/', (req, res) => {
  const db = getDB();
  const { name, country, liquipedia_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare(
      'INSERT INTO players (name, country, liquipedia_id) VALUES (?, ?, ?)'
    ).run(name, country || null, liquipedia_id || null);
    res.json({ id: info.lastInsertRowid, name, country, liquipedia_id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const db = getDB();
  const { name, country, liquipedia_id } = req.body;
  db.prepare('UPDATE players SET name=?, country=?, liquipedia_id=? WHERE id=?')
    .run(name, country, liquipedia_id, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
