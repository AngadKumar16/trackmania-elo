-- Run this in your Supabase project → SQL Editor

-- Players
create table if not exists players (
  id         bigint generated always as identity primary key,
  name       text not null unique,
  country    text,
  liquipedia_id text,
  created_at timestamptz default now()
);

-- Tournaments
create table if not exists tournaments (
  id          bigint generated always as identity primary key,
  name        text not null,
  tier        text not null check (tier in ('S', 'A', 'B')),
  impact      text not null default 'standard' check (impact in ('low', 'standard', 'high')),
  date        date not null,
  prize_pool  text,
  liquipedia_url text
);

-- Results
create table if not exists results (
  id                  bigint generated always as identity primary key,
  player_id           bigint references players (id) on delete cascade,
  tournament_id       bigint references tournaments (id) on delete cascade,
  placement           int not null,
  placement_range_end int,
  unique (player_id, tournament_id)
);

-- Monthly HOF (immutable snapshots)
create table if not exists monthly_bests (
  id             bigint generated always as identity primary key,
  month          text not null,       -- format: "2026-05"
  player_id      bigint references players (id),
  rank           int not null,
  score_snapshot numeric not null
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Everyone can read; only authenticated users (or anon with your key) can write.
-- For a personal project, enabling anon writes is fine — change this if you
-- want to lock down the admin page later.

alter table players       enable row level security;
alter table tournaments   enable row level security;
alter table results       enable row level security;
alter table monthly_bests enable row level security;

-- Public read
create policy "public read players"       on players       for select using (true);
create policy "public read tournaments"   on tournaments   for select using (true);
create policy "public read results"       on results       for select using (true);
create policy "public read monthly_bests" on monthly_bests for select using (true);

-- Anon write (open admin — lock down later if needed)
create policy "anon write players"       on players       for all using (true) with check (true);
create policy "anon write tournaments"   on tournaments   for all using (true) with check (true);
create policy "anon write results"       on results       for all using (true) with check (true);
create policy "anon write monthly_bests" on monthly_bests for all using (true) with check (true);
