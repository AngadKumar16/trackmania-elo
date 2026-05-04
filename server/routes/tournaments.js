const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', (req, res) => {
  const db = getDB();
  const tournaments = db.prepare('SELECT * FROM tournaments ORDER BY date DESC').all();
  res.json(tournaments);
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Not found' });

  const results = db.prepare(`
    SELECT r.*, p.name as player_name, p.country
    FROM results r
    JOIN players p ON r.player_id = p.id
    WHERE r.tournament_id = ?
    ORDER BY r.placement ASC
  `).all(req.params.id);

  res.json({ ...tournament, results });
});

router.post('/', (req, res) => {
  const db = getDB();
  const { name, tier, impact, date, liquipedia_url, prize_pool } = req.body;
  if (!name || !tier || !date) return res.status(400).json({ error: 'name, tier, date required' });
  try {
    const info = db.prepare(
      'INSERT INTO tournaments (name, tier, impact, date, liquipedia_url, prize_pool) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, tier, impact || 'standard', date, liquipedia_url || null, prize_pool || null);
    res.json({ id: info.lastInsertRowid, name, tier, impact, date });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const db = getDB();
  const { name, tier, impact, date, liquipedia_url, prize_pool } = req.body;
  db.prepare(
    'UPDATE tournaments SET name=?, tier=?, impact=?, date=?, liquipedia_url=?, prize_pool=? WHERE id=?'
  ).run(name, tier, impact, date, liquipedia_url, prize_pool, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM tournaments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
