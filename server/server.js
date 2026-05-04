const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB, getDB } = require('./db');
const { computeLeaderboard } = require('./scoring');
const playersRouter = require('./routes/players');
const tournamentsRouter = require('./routes/tournaments');
const resultsRouter = require('./routes/results');
const monthlyRouter = require('./routes/monthly');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB();

app.use('/api/players', playersRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/monthly', monthlyRouter);

app.get('/api/leaderboard', (req, res) => {
  try {
    const db = getDB();
    const leaderboard = computeLeaderboard(db);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`TM Ratings server running on http://localhost:${PORT}`));
