const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, convertInchesToTwip,
} = require('docx');
const fs = require('fs');

const ACCENT = '1F4E79';   // deep blue
const GOLD = 'B8860B';
const GRAY = '595959';

const numbering = {
  config: [
    {
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.2) } } },
      }],
    },
    {
      reference: 'rules',
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } },
      }],
    },
  ],
};

const pageProps = {
  page: {
    size: { width: 12240, height: 15840 },
    margin: { top: 1080, bottom: 1080, left: 1260, right: 1260 },
  },
};

const styles = {
  default: {
    document: { run: { font: 'Calibri', size: 22 }, paragraph: { spacing: { after: 90, line: 244 } } },
    heading1: { run: { font: 'Calibri', size: 32, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 120 } } },
    heading2: { run: { font: 'Calibri', size: 26, bold: true, color: ACCENT }, paragraph: { spacing: { before: 150, after: 80 } } },
  },
};

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] }); }
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })] });
}
function bullet(text, boldLead) {
  const runs = [];
  if (boldLead) {
    runs.push(new TextRun({ text: boldLead, bold: true }));
    runs.push(new TextRun({ text: text }));
  } else {
    runs.push(new TextRun({ text }));
  }
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: runs });
}
function rule(text, boldLead) {
  const runs = [];
  if (boldLead) runs.push(new TextRun({ text: boldLead + ' ', bold: true }));
  runs.push(new TextRun({ text }));
  return new Paragraph({ numbering: { reference: 'rules', level: 0 }, children: runs, spacing: { after: 100 } });
}
function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT } },
    spacing: { after: 160 },
    children: [],
  });
}

function simpleTable(headers, rows, colWidthsIn) {
  const total = colWidthsIn.reduce((a, b) => a + b, 0);
  const widths = colWidthsIn.map(w => Math.round(convertInchesToTwip(w)));
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((htext, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ACCENT },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: htext, bold: true, color: 'FFFFFF', size: 20 })] })],
    })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((cell, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? 'FFFFFF' : 'EDF2F8' },
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 20 })] })],
    })),
  }));
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...bodyRows],
  });
}

// ============ PITCH DOC ============
const pitchChildren = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [new TextRun({ text: 'BAWSE LEAGUE', bold: true, size: 52, color: ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'The Championship League — our next era', italics: true, size: 26, color: GRAY })],
  }),
  divider(),

  h2('The pitch'),
  p('We’re resetting the league anyway — so instead of running back another season of waiver claims and Sunday-morning lineup panic, we become something better: a league where we draft real teams across seven sports and win money every time one of them wins a championship. Draft once a year. Root for a year. That’s the whole job.'),

  h2('How it works'),
  bullet(' — 10 of us snake-draft real teams from 7 leagues: MLB, NBA, NHL, NFL, NCAA Football, NCAA Basketball, and the English Premier League.', 'One draft'),
  bullet(' — 11 picks each, ~110 teams owned across the group. Late-round picks get exactly as desperate and hilarious as you’re imagining.', '11 roster spots'),
  bullet(' — every championship is worth 1/7th of the prize pool. Seven trophies, seven payouts. Win the Super Bowl AND the Premier League? You’re double-dipping.', '7 championships'),
  bullet(' — no lineups, no waivers, no Tuesday-night roster anxiety. Your only in-season moves are trades, which are always open and get absolutely unhinged around playoff time.', 'Zero maintenance'),
  bullet(' — championship futures odds for all 647 teams are baked into the draft board, so you don’t need to follow all seven sports to draft like you do.', 'Scouting included'),
  bullet(' — lose your last team in a league? You owe the group chat a video of you taking a shot. That’s it. That’s the punishment.', 'The shot rule'),

  h2('Why this beats another fantasy football season'),
  bullet('Year-round action: there is a live championship race in every month of the season — the group chat never goes dark in February.'),
  bullet('Lowest time cost of any fantasy format — roughly 3 hours per YEAR — with the highest trash-talk-per-hour ratio.'),
  bullet('It’s proven: the format comes from a league on r/FFCommish that’s thrived for 2+ years, and other groups who copied it loved it enough to report back.'),
  bullet('Nobody quits in Week 6. There’s no 1–5 team — everyone owns a contender in SOME sport until deep into the year.'),

  h2('The timeline'),
];

const timelineTable = simpleTable(
  ['When', 'What'],
  [
    ['This week', 'Vote in the chat; we lock rules, entry fee, and draft order'],
    ['Late July 2026 (next 2 weeks)', 'DRAFT NIGHT — the All-Star break just passed: every other league is idle, MLB is half over. Peak information, zero games'],
    ['Aug 2026 – June 2027', 'Season one: seven championships, seven payouts, one champion group chat'],
    ['July 2027 (All-Star break)', 'Draft #2 — the permanent annual slot'],
  ],
  [2.3, 5.2],
);

const pitchClose = [
  new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'The ask: ', bold: true }), new TextRun('reply in the chat with a simple in/out by this weekend — we draft in two weeks. Ten yeses and Bawse League enters its championship era. Full rulebook is attached; the draft board and odds cheatsheet are already built.')] }),
];

// ============ RULEBOOK ============
const rb = [];
rb.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 40 },
  children: [new TextRun({ text: 'BAWSE LEAGUE', bold: true, size: 48, color: ACCENT })],
}));
rb.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 60 },
  children: [new TextRun({ text: 'Official Championship League Rulebook', size: 28, color: GRAY })],
}));
rb.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 160 },
  children: [new TextRun({ text: 'Version 1.1 — Draft for league ratification • July 2026', italics: true, size: 20, color: GRAY })],
}));
rb.push(divider());

rb.push(h1('1. Overview and Spirit'));
rb.push(rule('Bawse League is a Championship League: each manager drafts a portfolio of real-life teams across seven sports competitions, and wins a share of the prize pool for every championship one of their teams wins.'));
rb.push(rule('The spirit of the league is maximum fun, minimum homework. When a situation isn’t covered by these rules, the resolution that is funnier and keeps more people engaged wins.'));

rb.push(h1('2. Membership and Entry Fee'));
rb.push(rule('The league consists of 10 managers.'));
rb.push(rule('Each manager pays an entry fee (amount set by league vote before the draft) into the prize pool. The pool pays out per Section 8. No fee, no picks.'));
rb.push(rule('If a manager leaves mid-season, their roster is frozen; any championships their teams win pay out to the remaining managers’ pool split evenly, unless the league votes to let a replacement buy in and inherit the roster.'));

rb.push(h1('3. The Seven Championships'));
rb.push(p('The following competitions and title deciders are in play each season:', { italics: true }));
rb.push(simpleTable(
  ['League', 'Championship that pays'],
  [
    ['MLB', 'World Series champion'],
    ['NBA', 'NBA Finals champion'],
    ['NHL', 'Stanley Cup champion'],
    ['NFL', 'Super Bowl champion'],
    ['NCAA Football (FBS)', 'College Football Playoff national champion'],
    ['NCAA Men’s Basketball (D1)', 'NCAA Tournament champion'],
    ['English Premier League', 'Premier League title winner'],
  ],
  [2.6, 4.9],
));
rb.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun('')] }));
rb.push(rule('The league year runs from Draft Day until the last of the seven champions is crowned (historically mid-to-late June).'));
rb.push(rule('The Master Team List is updated each summer by the Commissioner for renames, relocations, promotion/relegation (EPL), and schools moving in or out of FBS/Division I.'));

rb.push(h1('4. The Draft'));
rb.push(rule('The draft is held annually during or just after the MLB All-Star break, when all seven competitions are between seasons or paused. Season one drafts in late July 2026.'));
rb.push(rule('Format: snake draft, 11 rounds, 110 total picks. Draft order for season one is randomized live in the group chat; in later seasons, reverse order of prior-season winnings, ties broken by randomization.'));
rb.push(rule('Any team from any of the seven leagues may be taken with any pick. There are no positional requirements and no per-league minimums or maximums.'));
rb.push(rule('A team may only be owned by one manager. The draft sheet flags duplicate picks in red; a duplicate pick is void and must be re-made on the spot.'));
rb.push(rule('Pick clock: 2 minutes per pick for rounds 1–5, 1 minute for rounds 6–11, enforced only as aggressively as the room demands.'));

rb.push(h1('5. Rosters and Ownership'));
rb.push(rule('Rosters lock at the end of the draft. There are no waivers, free agency, or pickups of any kind during the season. Teams nobody drafted simply stay unowned for the league year.'));
rb.push(rule('You own the team, not the players. Trades, firings, injuries, and scandals within a real-life team are your problem and everyone else’s entertainment.'));
rb.push(rule('If a real-life team relocates or renames mid-season, ownership follows the franchise.'));
rb.push(rule('Teams ineligible for their league’s postseason (e.g., transitional FBS or D1 members) are owned but cannot pay out — they count for shot-rule survival only.'));

rb.push(h1('6. Trades'));
rb.push(rule('Trades between managers are open from the end of the draft until each involved team’s championship is decided. Yes, you can trade a team during its championship series — that’s where legends are made.'));
rb.push(rule('Trades may involve any number of teams on either side. Side agreements involving future draft position are allowed if announced publicly; cash considerations are not.'));
rb.push(rule('A trade is official when both managers confirm it in the group chat and the Commissioner logs it on the sheet. No vetoes — lopsided trades are content.'));

rb.push(h1('7. Payouts'));
rb.push(rule('The prize pool is divided into seven equal shares — one per championship.'));
rb.push(rule('When a championship is won, the manager who owns that team (at the moment the title is decided) collects that share immediately. One manager can win multiple shares.'));
rb.push(rule('If a championship is won by a team no manager owns, that share rolls over into the next season’s prize pool.'));
rb.push(rule('If a competition fails to crown a champion (lockout, cancellation), that share is refunded to all managers equally.'));
rb.push(rule('If a title is vacated after the fact, the payout stands as awarded on the night. We are not litigating the NCAA’s paperwork.'));

rb.push(h1('8. The Shot Rule'));
rb.push(rule('When a manager’s last remaining team in any league is mathematically eliminated from (or loses) that league’s championship, they owe the group chat a video of themselves taking a shot within 48 hours.'));
rb.push(rule('Non-drinkers may substitute an equivalently undignified forfeit approved by league vote (hot sauce is the traditional alternative).'));
rb.push(rule('The shot rule is social glue, not law. Chronic non-compliance is punishable by group-chat roasting only.'));

rb.push(h1('9. Edge Cases and Rulings'));
rb.push(rule('EPL relegation: a drafted club relegated during the league year is simply dead weight — it stays on the roster. The Master Team List for the next draft reflects the new 20-club Premier League.'));
rb.push(rule('If two owned teams meet in a final, the shot rule and payouts resolve per team, not per manager.'));
rb.push(rule('Anything not covered here is resolved by Commissioner ruling, subject to override by a 7-of-10 league vote.'));

rb.push(h1('10. Commissioner and Amendments'));
rb.push(rule('The Commissioner maintains the draft sheet, master team list, trade log, and payout ledger (~75 minutes of work per year, allegedly).'));
rb.push(rule('Rule amendments require a majority vote (6 of 10) held between the end of one league year and the next draft. No rule changes mid-season.'));
rb.push(new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Seven trophies. One group chat. Good luck.', italics: true, color: GOLD, size: 24 })] }));

const pitchDoc = new Document({
  numbering, styles,
  sections: [{ properties: pageProps, children: [...pitchChildren, timelineTable, ...pitchClose] }],
});
const ruleDoc = new Document({
  numbering, styles,
  sections: [{ properties: pageProps, children: rb }],
});

Packer.toBuffer(pitchDoc).then(b => fs.writeFileSync('Bawse League - The Pitch.docx', b))
  .then(() => Packer.toBuffer(ruleDoc))
  .then(b => fs.writeFileSync('Bawse League - Official Rulebook.docx', b))
  .then(() => console.log('done'));
