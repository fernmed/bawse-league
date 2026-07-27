# Bawse League Site — Project Context

Read this first. It's the handoff file for continuing work on this project in
Claude Code (or any Claude session). Last updated: July 27, 2026.

## What this project is

The **public site at bawseleague.com** for Fern's fantasy sports group — one
site, three live sections plus the archived pitch:

| Page | What it is |
|---|---|
| `/` (`index.html`) | **Home hub** — live status chips, three section cards, trophy calendar, in-season matchup band. |
| `/champions/` | **Champions HQ** — the Champions League (11 real teams each across 7 sports, 12 managers): live draft board + pick feed, franchise pages (real version of the old mock), title race, still-alive counts, expected-shares board, payout ledger, corrected rules. |
| `/league/` | **The League** — the group's 12-manager NFL redraft on Sleeper: standings (movement arrows once history accrues), weekly matchups with starter breakdowns, playoff race, manager rosters, transactions/trending/injuries, power rankings (auto-appears after 3 weeks). |
| `/chapter/` | **Chapter Champion** (renamed from "Bawse G.O.A.T." July 27, 2026; points are **Bawse Points/BPs**) — the five-year chapter race (2026–2030): combined scoreboard (unlocks via `goat_map.json`, see below), live season projection, chapter timeline. Pays $300/$200/$100. `/goat/` is a redirect stub; the API endpoint and config files keep the internal `goat` name. |
| `/about/` | The original launch-page pitch/explainer, preserved (draft demo, odds tables, FAQ). |

**League facts (July 2026, current):** 12 managers. Champions League has **no
trades, no All-Undrafted bundles, no shot rule** — rosters lock at the draft;
the only in-season events are real-world eliminations/titles. Undrafted
champions' shares roll into next season's pot. Chapter Champion scoring (in Bawse Points): redraft final
playoff finish = 12..1 BPs, each CL title = 1 BP. Money: the CL has NO
entry fee — $280/season from the group's accumulated pot, $40/share, all five
chapter seasons funded; the main league has a $100 buy-in ($1,200 pool paying $660/$360/$180). The docx rulebooks in `docs/` predate all of this — the site's
`/champions/#rules` section is the canonical ruleset.

## Architecture

Static, **no build step, no dependencies** — GitHub Pages from this repo
(`fernmed/bawse-league`, public). **Pushing to `main` deploys the site.**
Custom domain `bawseleague.com` (never delete `CNAME`; DNS + HTTPS are done).

All live data comes from the **draft room server** (separate private repo
`../bawse-league-draft-room/`, deployed at `draft.bawseleague.com`) through
four unauthenticated read-only CORS endpoints:
`/api/public/champions`, `/api/public/league`, `/api/public/league/scoreboard`
(60s cache, for gameday polling), `/api/public/goat`. See that repo's
CLAUDE.md before touching the server. The endpoints allow localhost origins,
so local previews get real production data.

Shared code:
- `assets/style.css` — design tokens (navy/gold) + shared components
  (nav, owner cards, status pills, league tag colors). `/about/` keeps its own
  inline copy of the tokens — sync token changes both places.
- `assets/api.js` — `apiGet()` (with cache-busting `bust` option for live
  polling), `CHAMP`/`LEAGUE_ORDER` metadata, `logoHTML()` with monogram
  fallback, `impliedProb()`, `escapeHTML()`, `timeAgo()`.
- `assets/logos.json` — 643/647 team logos matched from ESPN by
  `dev/build_logos.py` (rerun after teams change; misses fall back to
  league-colored monograms).

Page conventions: each page is one self-contained HTML file with inline
page-specific CSS/JS; polls its API every 5 min (20–60s when something is
live); offseason/empty states are first-class; all user-visible strings from
the API go through `escapeHTML()`.

## The dev/ folder

- `dev/teams_data.py` — THE canonical 647-team dataset + July 2026 odds.
  The xlsx, the about page, and the draft room's `teams.json` all descend from
  it (the draft room has its own byte-identical copy in `scripts/` — keep them
  in sync; unifying them is an open punch-list item).
- `dev/site_template.html` — template for **`about/index.html`** (the pitch
  page) with `/*__DATA__*/` and `/*__ODDS__*/` tokens. For copy tweaks, edit
  both the template and `about/index.html` so they don't drift.
- `dev/build_logos.py` — regenerates `assets/logos.json` from ESPN's public
  team APIs (network required; run from `dev/`).
- `dev/make_sheet.py` / `dev/make_docs.js` — legacy generators for the docx/xlsx
  in `docs/` (all stale vs. current rules; regenerate only if the league asks).

## Commissioner data hooks (live in the DRAFT ROOM repo, not here)

- `config/goat_map.json` — manager name → Sleeper team name; unlocks the
  Chapter Champion combined scoreboard. `.example` file has all 12 names.
- `config/goat_seasons.json` — finalized past seasons, one entry per year.
- CL season pot defaults to $280 server-side (`CL_SEASON_POT` env overrides) —
  dollar amounts appear on the site automatically.
- Eliminations/titles: commissioner Telegram commands `/eliminated`,
  `/champion`, `/revive` — the site reflects them within 5 minutes.

## Annual maintenance (each July before the CL draft)

- Refresh `dev/teams_data.py` (renames, relocations, EPL promotion/relegation,
  FBS/D1 membership) and the odds snapshot; regenerate `about/index.html`,
  `assets/logos.json`, and the draft room's `teams.json`.
- New Sleeper league ID goes in the Render dashboard each August (draft room).

## Conventions & cautions

- League naming: **"Bawse League"** = the NFL redraft (the Sleeper league is
  literally named that); **"Champions League"** = the 7-sport championship
  format (working name was "Bawse Champions"; loose stale docs under that name
  sit in the parent folder). The site brand "BAWSE LEAGUE" covers everything.
- The parent folder is Fern's project folder; this subfolder is the repo root.
- Money/rules decisions (entry fee, amendments) belong to the league vote —
  never change them unilaterally in site copy.
- No localStorage/sessionStorage anywhere; keep it that way.
