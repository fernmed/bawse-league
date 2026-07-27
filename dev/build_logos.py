#!/usr/bin/env python3
"""Build assets/logos.json: our team id ("LEAGUE:Name") -> ESPN logo URL.

Fetches ESPN's public team lists for all seven leagues and name-matches them
against the canonical dataset in teams_data.py. Misses are simply absent from
the output — the site falls back to league-colored monogram badges, so partial
coverage (especially deep D1 basketball) is fine. Standard library only.

Run from dev/:  python3 build_logos.py
"""
import json
import urllib.request
from pathlib import Path

from teams_data import LEAGUES

ESPN = "https://site.api.espn.com/apis/site/v2/sports"
SOURCES = {
    "MLB": f"{ESPN}/baseball/mlb/teams?limit=50",
    "NBA": f"{ESPN}/basketball/nba/teams?limit=50",
    "NHL": f"{ESPN}/hockey/nhl/teams?limit=50",
    "NFL": f"{ESPN}/football/nfl/teams?limit=50",
    "NCAAF": f"{ESPN}/football/college-football/teams?limit=1000",
    "NCAAM": f"{ESPN}/basketball/mens-college-basketball/teams?limit=1000",
    "EPL": f"{ESPN}/soccer/eng.1/teams?limit=50",
}

# Our name -> ESPN displayName/location for the known awkward ones.
ALIASES = {
    "Miami (FL)": "Miami Hurricanes",
    "Miami (OH)": "Miami (OH) RedHawks",
    "Ole Miss": "Ole Miss Rebels",
    "UConn": "Connecticut Huskies",
    "Athletics": "Oakland Athletics",  # in case ESPN still carries the old name
    "Los Angeles Clippers": "LA Clippers",
    "Appalachian State": "App State",
    "San Jose State": "San José State",
    "ULM": "UL Monroe",
    "Albany": "UAlbany",
    "Grambling State": "Grambling",
    "LIU": "Long Island University",
    "Queens (NC)": "Queens University",
    "Saint Mary's (CA)": "Saint Mary's",
    "Seattle": "Seattle U",
    "Southeastern Louisiana": "SE Louisiana",
    "Southern Indiana": "USI",
    "USC Upstate": "South Carolina Upstate",
    "UTRGV": "UT Rio Grande Valley",
    "West Florida": "UWF",
}


def norm(name):
    return "".join(c for c in name.lower().replace("&", "and") if c.isalnum())


def fetch_teams(url):
    request = urllib.request.Request(url, headers={"Accept": "application/json",
                                                   "User-Agent": "bawseleague-logo-build"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read())
    teams = []
    for sport in payload.get("sports", []):
        for league in sport.get("leagues", []):
            for entry in league.get("teams", []):
                team = entry.get("team") or {}
                logos = team.get("logos") or []
                if not logos:
                    continue
                teams.append({
                    "displayName": team.get("displayName") or "",
                    "shortDisplayName": team.get("shortDisplayName") or "",
                    "location": team.get("location") or "",
                    "nickname": team.get("nickname") or "",
                    "logo": logos[0].get("href"),
                })
    return teams


def build_lookup(espn_teams):
    """Normalized name -> logo. Keys claimed by two different logos are
    ambiguous and dropped rather than guessed."""
    lookup, ambiguous = {}, set()
    for team in espn_teams:
        keys = {norm(k) for k in (team["displayName"], team["shortDisplayName"],
                                  team["location"], team["nickname"],
                                  f"{team['location']} {team['nickname']}") if k}
        for key in keys:
            if not key:
                continue
            if key in lookup and lookup[key] != team["logo"]:
                ambiguous.add(key)
            else:
                lookup[key] = team["logo"]
    for key in ambiguous:
        lookup.pop(key, None)
    return lookup


def main():
    out = {}
    for league, teams, _ in LEAGUES:
        url = SOURCES[league]
        try:
            lookup = build_lookup(fetch_teams(url))
        except Exception as error:
            print(f"{league}: fetch failed ({error}) — skipped")
            continue
        hits = 0
        for name in teams:
            key = norm(ALIASES.get(name, name))
            logo = lookup.get(key) or lookup.get(norm(name))
            if logo:
                out[f"{league}:{name}"] = logo
                hits += 1
        print(f"{league}: {hits}/{len(teams)} logos matched")
    target = Path(__file__).resolve().parent.parent / "assets" / "logos.json"
    target.write_text(json.dumps(out, indent=0, sort_keys=True))
    print(f"wrote {target} ({len(out)} teams)")


if __name__ == "__main__":
    main()
