const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { computeLeaderboard } = require('../scoring');

router.get('/', (req, res) => {
  const db = getDB();
  const months = db.prepare(`
    SELECT mb.*, p.name as player_name, p.country
    FROM monthly_bests mb
    JOIN players p ON mb.player_id = p.id
    ORDER BY mb.month DESC, mb.rank ASC
  `).all();
  res.json(months);
});

// POST /api/monthly/snapshot  body: { month: "2026-05" }
router.post('/snapshot', (req, res) => {
  const db = getDB();
  const { month } = req.body;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'month required in YYYY-MM format' });
  }

  const existing = db.prepare('SELECT id FROM monthly_bests WHERE month = ?').get(month);
  if (existing) {
    return res.status(400).json({ error: `Snapshot for ${month} already exists` });
  }

  const leaderboard = computeLeaderboard(db);
  const top3 = leaderboard.slice(0, 3);

  const stmt = db.prepare(
    'INSERT INTO monthly_bests (month, player_id, rank, score_snapshot) VALUES (?, ?, ?, ?)'
  );
  top3.forEach((entry, i) => {
    stmt.run(month, entry.player.id, i + 1, entry.score);
  });

  res.json({
    success: true,
    month,
    snapshot: top3.map(e => ({ rank: e.rank, name: e.player.name, score: e.score }))
  });
});

// DELETE a monthly snapshot (if you need to redo it)
router.delete('/:month', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM monthly_bests WHERE month = ?').run(req.params.month);
  res.json({ success: true });
});

module.exports = router;
