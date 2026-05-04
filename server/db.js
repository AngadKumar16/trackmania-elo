const Database = require('better-sqlite3');
const path = require('path');

let db;

function getDB() {
  if (!db) {
    db = new Database(path.join(__dirname, 'ratings.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      liquipedia_id TEXT,
      country TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tier TEXT CHECK(tier IN ('S', 'A', 'B')) NOT NULL,
      impact TEXT CHECK(impact IN ('low', 'standard', 'high')) DEFAULT 'standard',
      date DATE NOT NULL,
      liquipedia_url TEXT,
      prize_pool TEXT
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
      tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
      placement INTEGER NOT NULL,
      placement_range_end INTEGER,
      points_earned REAL,
      UNIQUE(player_id, tournament_id)
    );

    CREATE TABLE IF NOT EXISTS monthly_bests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      player_id INTEGER REFERENCES players(id),
      rank INTEGER NOT NULL,
      score_snapshot REAL
    );
  `);
  console.log('Database initialized');
}

module.exports = { getDB, initDB };
