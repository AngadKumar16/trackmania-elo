# TM Ratings

TrackMania player rating system — GitHub Pages + Supabase.

**Live:** `https://your-username.github.io/tm-ratings/`

## Rating Formula

```
Points = Base × Placement% × Impact × Decay
Score  = Sum of best 8 results (12-month rolling window)
```

| Tier | Base | Examples |
|------|------|---------|
| S | 900 | EWC, ENC |
| A | 400 | Elite Cup, Red Bull Faster qualifiers |
| B | 250 | Overdrive, Beacon World League Div 1 |

Decay: −10% per 2-month bracket. Results older than 12 months are dropped.

---

## Setup (one-time)

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Settings → API** → copy:
   - Project URL
   - `anon` public key

### 2. GitHub Secrets

In your repo → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_BASE_PATH` | `/tm-ratings/` (replace with your repo name, including slashes) |

### 3. GitHub Pages

In your repo → **Settings → Pages**:
- Source: **GitHub Actions**

### 4. Deploy

Push to `main`. GitHub Actions will build and deploy automatically.

---

## Local development

```bash
# Create .env.local
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

npm install
npm run dev
```

---

## Liquipedia API (future)

Once approved, implement `src/lib/liquipedia.js` and add an import button to the Admin page.
The Supabase schema already has `liquipedia_id` and `liquipedia_url` columns ready.
