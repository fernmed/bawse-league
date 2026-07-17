# Bawse League 🏆

The official site for **Bawse League** — a championship league where 10 managers draft
real teams across 7 sports (MLB, NBA, NHL, NFL, NCAA Football, NCAA Basketball, EPL)
and win a share of the pot every time one of their teams wins a championship.

Format adapted from a league shared on r/FFCommish. One draft a year. No lineups.
No waivers. Seven payouts.

## What's in this repo

| Path | What it is |
|---|---|
| `index.html` | The entire site — one self-contained file (no build step, no dependencies) |
| `docs/Bawse League - The Pitch.docx` | One-page pitch for the group |
| `docs/Bawse League - Official Rulebook.docx` | Rulebook v1.0 (35 rules, ready for ratification) |
| `docs/Bawse League - Draft Board.xlsx` | Draft-night tool: snake board, dropdowns, dup detection, live tracker, odds cheatsheet |

## Deploy to GitHub Pages (~5 minutes)

1. Create a new **public** repo on GitHub (e.g. `bawse-league`).
2. Upload everything in this folder: **Add file → Upload files** (or push with git, below).
3. In the repo: **Settings → Pages → Build and deployment**, set Source to
   **Deploy from a branch**, pick `main` and `/ (root)`, then Save.
4. Wait a minute or two. The site is live at
   `https://<your-username>.github.io/bawse-league/`.

Pushing with git instead of the web uploader:

```bash
cd bawse-league-site
git init
git add .
git commit -m "Launch Bawse League site"
git remote add origin https://github.com/<your-username>/bawse-league.git
git push -u origin main
```

## Updating the site

Edit or replace `index.html` and push (or re-upload). GitHub Pages redeploys
automatically within a couple of minutes.

## Notes

- Team logos hotlink from ESPN's public CDN. If one ever 404s, the card
  automatically falls back to a color-matched monogram badge.
- Odds shown are a July 2026 snapshot (sourced from public sportsbook futures) —
  spot-check big movers the week of the draft.
- The master team list is current for 2026–27 (incl. EPL promotion/relegation and
  new FBS members). It needs a ~75-minute refresh each summer before the draft.

## Roadmap

- [ ] Live shared draft room (real-time picks from 10 devices)
- [ ] Standings & payout ledger
- [ ] Trade log
- [ ] Side Pots: best ball companion leagues + season-long Bawse Cup leaderboard
