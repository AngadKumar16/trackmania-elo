# TM Ratings

A TrackMania player rating system based on tournament placements, tier weighting, impact multipliers, and time decay.

## Rating Formula

```
Points = Base × Placement% × Impact × Decay
Final Score = Sum of best 8 results (rolling 12 months)
```

### Tiers
| Tier | Base | Examples |
|------|------|---------|
| S | 900 | EWC, ENC |
| A | 400 | Elite Cup, Red Bull Faster qualifiers |
| B | 250 | Overdrive, Beacon World League Div 1 |

### Placement Multipliers
1st: 100% · 2nd: 78% · 3rd: 62% · 4th: 50% · 5-6th: 38% · 7-8th: 28% · 9-12th: 20% · 13-16th: 13% · 17-24th: 8% · 25-32nd: 5% · 33-48th: 3% · 49+: 1%

### Impact Multipliers
Low: ×0.85 · Standard: ×1.0 · High: ×1.2

### Time Decay
10% per 2-month bracket. Results older than 12 months are dropped.

## Setup

```bash
# Install all dependencies
npm run install:all

# Run dev (server + client concurrently)
npm run dev
```

Server: http://localhost:3001  
Client: http://localhost:5173

## Environment Variables

Create a `.env` file in the root:
```
PORT=3001
LIQUIPEDIA_KEY=your_key_here
```

## Liquipedia API

Once your API access is approved, implement `server/liquipedia.js` and connect the import flow in Admin.
