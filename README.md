# Bawse League 🏆

The official site for **Bawse League** — one fantasy sports group, two leagues,
and a five-year race for the G.O.A.T. title, live at
**[bawseleague.com](https://bawseleague.com)**.

- **[Champions HQ](https://bawseleague.com/champions/)** — the Champions League:
  12 managers snake-draft 11 real teams each across 7 sports (MLB, NBA, NHL,
  NFL, NCAA Football, NCAA Basketball, EPL); every championship pays a share of
  the pot. Live draft board, franchise pages, title race, expected-shares board.
- **[The League](https://bawseleague.com/league/)** — the group's 12-manager NFL
  redraft on Sleeper: standings, live matchups, the playoff race, rosters,
  power rankings.
- **[Bawse G.O.A.T.](https://bawseleague.com/goat/)** — the 2026–2030 chapter
  race combining both leagues. $300 / $200 / $100 when it closes.
- **[The pitch](https://bawseleague.com/about/)** — the page that talked the
  group into all of this, preserved.

Format adapted from a league shared on r/FFCommish. One draft a year. No
lineups. No waivers. Seven payouts.

## How it works

Static site, **no build step, no dependencies** — every page is a
self-contained HTML file sharing `assets/style.css` and `assets/api.js`. Live
data comes from the league's draft-room server (a separate private repo) via
public read-only JSON endpoints at `draft.bawseleague.com/api/public/*`.

| Path | What it is |
|---|---|
| `index.html` | Home hub — live status, section cards, trophy calendar |
| `champions/` `league/` `goat/` `about/` | The four pages above |
| `assets/` | Shared styles, API helpers, and the ESPN team-logo map |
| `dev/` | Generators: canonical 647-team dataset, logo-map builder, legacy doc builders |
| `docs/` | Original launch-era pitch/rulebook/draft-board files (historical — the site's rules page is current) |

## Deploying

Hosted on GitHub Pages with the custom domain `bawseleague.com` — **pushing to
`main` deploys the site.** Never delete the `CNAME` file.

```bash
git push origin main
```

To refresh the team logo map after teams change:

```bash
cd dev && python3 build_logos.py
```

## Notes

- Team logos hotlink from ESPN's public CDN; any 404 falls back automatically
  to a color-matched monogram badge.
- The master team list (`dev/teams_data.py`) is current for 2026–27 and needs a
  ~75-minute refresh each July (renames, relocations, promotion/relegation,
  FBS/D1 membership) — then regenerate `about/index.html` and `assets/logos.json`.
