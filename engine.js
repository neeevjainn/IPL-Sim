/* ================================================================
   IPL MUN — SIMULATION ENGINE  (engine.js)
   Pure functions only — no DOM, no state references.
   Form rating (0-100) and injury proneness are used here.
   ================================================================ */
'use strict';

/* ── RNG ── */
function makeRNG(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Pitch modifiers ── */
const PITCH_MOD = {
  flat:     { paceMul: 0.93, spinMul: 0.93, runMul: 1.14, wktMul: 0.86, label: 'Flat Belter' },
  dry:      { paceMul: 0.90, spinMul: 1.22, runMul: 0.94, wktMul: 1.10, label: 'Dry Turner' },
  green:    { paceMul: 1.18, spinMul: 0.93, runMul: 0.91, wktMul: 1.14, label: 'Green Top' },
  balanced: { paceMul: 1.00, spinMul: 1.00, runMul: 1.00, wktMul: 1.00, label: 'Balanced' },
};

/* ── Phase modifiers ── */
const PHASE_MOD = {
  powerplay: { boundary: 1.22, wkt: 1.06, dot: 0.88 },
  middle:    { boundary: 0.84, wkt: 0.91, dot: 1.12 },
  death:     { boundary: 1.48, wkt: 1.36, dot: 0.70 },
};

function phaseOf(over) {
  return over < 6 ? 'powerplay' : over < 16 ? 'middle' : 'death';
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function isBowler(p) { return p.role === 'PACE' || p.role === 'SPIN' || p.role === 'ALL'; }

/* ── Form multiplier: form 50 = normal (×1.0), 100 = +30%, 0 = -30% ── */
function formMul(form) {
  return 0.70 + clamp(form, 0, 100) / 100 * 0.60;
}

/* ── Effective ratings with form applied ── */
function effBat(p)  { return clamp(Math.round(p.ratings.bat  * formMul(p.form ?? 50)), 10, 99); }
function effBowl(p) { return clamp(Math.round(p.ratings.bowl * formMul(p.form ?? 50)), 10, 99); }

/* ── Sample from weight map ── */
function sampleOutcome(w, rnd) {
  let total = 0;
  for (const k in w) total += w[k];
  let r = rnd() * total;
  for (const k in w) { r -= w[k]; if (r <= 0) return k; }
  return '0';
}

/* ── Simulate one ball ── */
function simulateBall(ctx, rnd) {
  const { batter, bowler, pitch, over, aggression, chase } = ctx;
  const batSkill  = effBat(batter)   / 100;
  const bowlSkill = effBowl(bowler)  / 100;

  const pm  = PHASE_MOD[phaseOf(over)];
  const pp  = PITCH_MOD[pitch] || PITCH_MOD.balanced;
  const agg = clamp(aggression, 0, 100);

  const aB = 0.72 + (agg / 100) * 0.85;
  const aW = 0.85 + (agg / 100) * 0.40;
  const aD = 1.22 - (agg / 100) * 0.55;

  const typeMul = bowler.role === 'SPIN' ? pp.spinMul
                : bowler.role === 'PACE' ? pp.paceMul : 1;

  const w = {
    '0': 36  * pm.dot      * aD,
    '1': 33  * (0.85 + batSkill * 0.35),
    '2': 7   * (0.75 + batSkill * 0.50),
    '3': 0.6,
    '4': 10.5 * pm.boundary * aB * pp.runMul * (0.55 + batSkill * 0.90),
    '6': 4.4  * pm.boundary * aB * pp.runMul * (0.40 + batSkill * 1.00),
    'W': 4.0  * pm.wkt      * aW * pp.wktMul * typeMul
             * (1.25 - batSkill * 0.50) * (0.65 + bowlSkill * 0.70),
  };

  // Bowler vs batter duel adjustment
  const duel = bowlSkill - batSkill;
  w['4'] *= (1 - duel * 0.30);
  w['6'] *= (1 - duel * 0.34);
  w['0'] *= (1 + duel * 0.22);
  w['W'] *= (1 + duel * 0.30);

  // Chase pressure
  if (chase && chase.ballsLeft > 0) {
    const rr = (chase.target - chase.scored) / (chase.ballsLeft / 6);
    if      (rr > 13) { w['4'] *= 1.30; w['6'] *= 1.45; w['W'] *= 1.22; w['0'] *= 0.78; }
    else if (rr > 10) { w['4'] *= 1.15; w['6'] *= 1.20; w['W'] *= 1.10; w['0'] *= 0.90; }
    else if (rr < 6)  { w['0'] *= 1.18; w['6'] *= 0.82; w['W'] *= 0.85; }
  }

  for (const k in w) if (w[k] < 0) w[k] = 0;

  // Extras
  const er = rnd();
  if (er < 0.020) return 'wd';
  if (er < 0.027) return 'nb';
  return sampleOutcome(w, rnd);
}

/* ── Batting order ── */
function battingOrder(players) {
  const xi = players.slice(0, 11);
  const score = p => {
    let s = effBat(p);
    if (p.role === 'BAT' || p.role === 'WK') s += 20;
    if (p.role === 'ALL') s += 5;
    if (p.role === 'PACE' || p.role === 'SPIN') s -= 30;
    return s;
  };
  return [...xi].sort((a, b) => score(b) - score(a));
}

/* ── Bowling attack (up to 6 bowlers) ── */
function bowlingAttack(players) {
  const xi = players.slice(0, 11);
  const bowlers = xi.filter(isBowler).sort((a, b) => effBowl(b) - effBowl(a));
  if (bowlers.length >= 5) return bowlers.slice(0, 6);
  const extras = xi.filter(p => !isBowler(p)).sort((a, b) => effBowl(b) - effBowl(a));
  return [...bowlers, ...extras].slice(0, Math.max(5, bowlers.length));
}

/* ── Dismissal type ── */
function dismissalType(rnd, bowler) {
  const r = rnd();
  if (bowler.role === 'SPIN') {
    if (r < 0.30) return 'stumped';
    if (r < 0.55) return 'caught';
    if (r < 0.75) return 'lbw';
    if (r < 0.90) return 'bowled';
    return 'run out';
  }
  if (r < 0.50) return 'caught';
  if (r < 0.68) return 'bowled';
  if (r < 0.82) return 'lbw';
  if (r < 0.90) return 'caught behind';
  return 'run out';
}

/* ── Simulate one innings ── */
function simulateInnings({ batting, bowling, pitch, target, rnd, maxOvers = 20 }) {
  const order   = battingOrder(batting.players);
  const bowlers = bowlingAttack(bowling.players);

  // Scorecards
  const bat  = {};
  const bowl = {};
  order.forEach(p => bat[p.id]   = { id: p.id, name: p.name, r: 0, b: 0, fours: 0, sixes: 0, out: false, how: '', bowlerName: '' });
  bowlers.forEach(p => bowl[p.id] = { id: p.id, name: p.name, balls: 0, runs: 0, wkts: 0, maidens: 0, wd: 0, nb: 0 });

  const phases = { powerplay: { r: 0, w: 0 }, middle: { r: 0, w: 0 }, death: { r: 0, w: 0 } };
  const fow   = [];

  let total = 0, wk = 0, legalBalls = 0;
  let striker = order[0], non = order[1], nextIdx = 2;
  const maxPerBowler = Math.ceil(maxOvers / 5) * 6;
  let lastBowler = null;

  function pickBowler() {
    const elig = bowlers.filter(b => bowl[b.id].balls < maxPerBowler && b.id !== lastBowler);
    const pool = elig.length ? elig : bowlers.filter(b => bowl[b.id].balls < maxPerBowler);
    if (!pool.length) return bowlers[0];
    const wts = pool.map(b => Math.pow(effBowl(b) / 100 + 0.2, 2));
    let tot = wts.reduce((a, c) => a + c, 0), r = rnd() * tot;
    for (let i = 0; i < pool.length; i++) { r -= wts[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  outer:
  for (let over = 0; over < maxOvers; over++) {
    if (wk >= 10) break;
    const bowler = pickBowler();
    lastBowler = bowler.id;
    const phase  = phaseOf(over);
    let overRuns = 0, overLegal = 0;

    for (let b = 0; b < 6; ) {
      if (wk >= 10) break outer;
      if (target != null && total >= target) break outer;

      const chase = target != null
        ? { target, scored: total, ballsLeft: maxOvers * 6 - legalBalls }
        : null;

      const outcome = simulateBall({ batter: striker, bowler, pitch, over, aggression: batting.aggression, chase }, rnd);

      if (outcome === 'wd') {
        total++; overRuns++;
        bowl[bowler.id].runs++; bowl[bowler.id].wd++;
        continue;
      }
      if (outcome === 'nb') {
        total++; overRuns++;
        bowl[bowler.id].runs++; bowl[bowler.id].nb++;
        continue;
      }

      b++; overLegal++; legalBalls++;
      bat[striker.id].b++;
      bowl[bowler.id].balls++;

      if (outcome === 'W') {
        wk++;
        bat[striker.id].out = true;
        bat[striker.id].how = dismissalType(rnd, bowler);
        bat[striker.id].bowlerName = bowler.name;
        bowl[bowler.id].wkts++;
        phases[phase].w++;
        fow.push({ wkt: wk, runs: total, batter: striker.name });
        if (nextIdx < order.length) { striker = order[nextIdx++]; }
        else break outer;
        continue;
      }

      const runs = parseInt(outcome, 10);
      total += runs; overRuns += runs;
      bat[striker.id].r += runs;
      bowl[bowler.id].runs += runs;
      phases[phase].r += runs;
      if (runs === 4) bat[striker.id].fours++;
      if (runs === 6) bat[striker.id].sixes++;
      if (runs % 2 === 1) { const tmp = striker; striker = non; non = tmp; }
    }

    if (overRuns === 0 && overLegal === 6) bowl[bowler.id].maidens++;
    { const tmp = striker; striker = non; non = tmp; }
  }

  const overs = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;
  return {
    teamId: batting.id, teamName: batting.name,
    runs: total, wickets: wk, balls: legalBalls, overs,
    batting:  order.map(p => bat[p.id]),
    bowling:  bowlers.map(p => bowl[p.id]).filter(b => b.balls > 0 || b.wd || b.nb),
    phases, fow,
  };
}

/* ── Super Over ── */
function simulateSuperOver(A, B, pitch, rnd) {
  function oneOver(bat, bowl) {
    const bats   = battingOrder(bat.players).slice(0, 3);
    const bowler = bowlingAttack(bowl.players)[0];
    let runs = 0, wkts = 0, sixes = 0, si = 0;
    for (let b = 0; b < 6 && wkts < 2; b++) {
      const o = simulateBall({ batter: bats[si], bowler, pitch, over: 19, aggression: 95, chase: null }, rnd);
      if (o === 'wd' || o === 'nb') { runs++; b--; continue; }
      if (o === 'W')  { wkts++; si = Math.min(si + 1, bats.length - 1); continue; }
      const r = parseInt(o, 10); runs += r;
      if (r === 6) sixes++;
    }
    return { runs, wkts, sixes };
  }
  const a = oneOver(A, B), b = oneOver(B, A);
  const winnerId = a.runs > b.runs ? A.id : b.runs > a.runs ? B.id : (a.sixes >= b.sixes ? A.id : B.id);
  return { a, b, winnerId };
}

/* ── Simulate full match ── */
function simulateMatch({ home, away, venue, seed }) {
  const rnd   = makeRNG(seed >>> 0);
  const pitch = (venue && venue.pitch) || 'balanced';

  // Toss
  const tosWinner  = rnd() < 0.5 ? home : away;
  const tosLoser   = tosWinner.id === home.id ? away : home;
  const pp         = PITCH_MOD[pitch] || PITCH_MOD.balanced;
  const batsFirst  = rnd() < (pitch === 'flat' ? 0.58 : 0.42) ? tosWinner : tosLoser;
  const bowlsFirst = batsFirst.id === home.id ? away : home;

  const inn1 = simulateInnings({ batting: batsFirst,  bowling: bowlsFirst, pitch, target: null,           rnd });
  const inn2 = simulateInnings({ batting: bowlsFirst, bowling: batsFirst,  pitch, target: inn1.runs + 1,  rnd });

  let result;
  if      (inn2.runs >  inn1.runs) result = { winnerId: bowlsFirst.id, method: 'wickets', margin: 10 - inn2.wickets, super: false };
  else if (inn1.runs >  inn2.runs) result = { winnerId: batsFirst.id,  method: 'runs',    margin: inn1.runs - inn2.runs,  super: false };
  else {
    const so = simulateSuperOver(batsFirst, bowlsFirst, pitch, rnd);
    result = { winnerId: so.winnerId, method: 'super over', margin: 0, super: true, superOver: so };
  }

  const motm = pickMOTM(inn1, inn2, result.winnerId, home, away);

  return {
    homeId: home.id, awayId: away.id,
    venueId: venue ? venue.id : null,
    pitch,
    toss: { winnerId: tosWinner.id, decision: batsFirst.id === tosWinner.id ? 'bat' : 'bowl' },
    battedFirstId: batsFirst.id,
    inn1, inn2, result, motm, seed,
  };
}

/* ── Player of the Match ── */
function pickMOTM(inn1, inn2, winnerId, home, away) {
  const teamOf = id =>
    home.players.some(p => p.id === id) ? home.id :
    away.players.some(p => p.id === id) ? away.id : null;

  const contrib = {};
  [inn1, inn2].forEach(inn => {
    inn.batting.forEach(b => { contrib[b.id] = (contrib[b.id] || 0) + b.r + b.sixes * 2 + b.fours; });
    inn.bowling.forEach(b => { contrib[b.id] = (contrib[b.id] || 0) + b.wkts * 22 - b.runs * 0.4 + b.maidens * 8; });
  });
  for (const id in contrib) if (teamOf(id) === winnerId) contrib[id] += 12;

  let best = null, bv = -Infinity;
  for (const id in contrib) if (contrib[id] > bv) { bv = contrib[id]; best = id; }
  return best;
}

/* ── NRR ── */
function computeNRR(teamId, results) {
  let rf = 0, bf = 0, ra = 0, ba = 0;
  for (const m of results) {
    if (m.homeId !== teamId && m.awayId !== teamId) continue;
    const ours   = m.inn1.teamId === teamId ? m.inn1 : m.inn2.teamId === teamId ? m.inn2 : null;
    const theirs = m.inn1.teamId === teamId ? m.inn2 : m.inn1;
    if (!ours) continue;
    rf += ours.runs;   bf += ours.wickets   >= 10 ? 120 : ours.balls;
    ra += theirs.runs; ba += theirs.wickets  >= 10 ? 120 : theirs.balls;
  }
  if (!bf || !ba) return 0;
  return +((rf / (bf / 6)) - (ra / (ba / 6))).toFixed(3);
}

/* ── Generate playing XI from squad ── */
function autoXI(squad) {
  const avail = squad.filter(p => !p.injured);
  const byRole = r => avail.filter(p => p.role === r)
    .sort((a, b) => (effBat(b) + effBowl(b)) - (effBat(a) + effBowl(a)));

  const xi = [];
  const take = (arr, n) => { for (let i = 0; i < n && i < arr.length; i++) xi.push(arr[i]); };
  take(byRole('WK'),   1);
  take(byRole('BAT'),  4);
  take(byRole('ALL'),  2);
  take(byRole('PACE'), 2);
  take(byRole('SPIN'), 2);
  // Fill to 11
  if (xi.length < 11) {
    const chosen = new Set(xi.map(p => p.id));
    avail.filter(p => !chosen.has(p.id))
         .sort((a, b) => (effBat(b) + effBowl(b)) - (effBat(a) + effBowl(a)))
         .forEach(p => { if (xi.length < 11) xi.push(p); });
  }
  return xi.slice(0, 11).map(p => p.id);
}

/* ── Build engine-team object from app team ── */
function buildEngineTeam(team, allPlayers) {
  const xiIds = (team.xi && team.xi.length === 11) ? team.xi : autoXI(allPlayers.filter(p => p.teamId === team.id));
  return {
    id: team.id,
    name: team.name,
    players: xiIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean),
    aggression: team.aggression || 55,
  };
}

/* ── Injury processing ── */
/*
  Called once between rounds.
  Uses injuryProne (0-100):
    proneness 50 => ~8% base chance per round
    proneness 0  => ~0% (almost never)
    proneness 100 => ~16%
  Fixed duration: 1 match.
*/
function processRoundInjuries(players, currentRound) {
  const log = [];
  players.forEach(p => {
    if (!p.teamId) return;
    // Recover from last round's injury
    if (p.injured && p.injuryGames > 0) {
      p.injuryGames--;
      if (p.injuryGames <= 0) {
        p.injured  = false;
        p.fitness  = 100;
        log.push({ type: 'recover', id: p.id, name: p.name });
      }
    }
  });

  // New injuries
  players.forEach(p => {
    if (!p.teamId || p.injured) return;
    const prone  = clamp(p.injuryProne ?? 30, 0, 100);
    const chance = (prone / 100) * 0.16; // 0% to 16%
    if (Math.random() < chance) {
      p.injured     = true;
      p.injuryGames = 1; // Fixed: 1 match
      p.fitness     = 45;
      log.push({ type: 'injury', id: p.id, name: p.name, team: p.teamId });
    }
  });
  return log;
}

/* ── Form update between rounds ── */
/*
  Each player's form drifts ±10-15 per round (random walk).
  Bounded 5–95. Players who were MOTM get a +10 boost.
*/
function updatePlayerForms(players, motmIds = new Set()) {
  players.forEach(p => {
    if (!p.teamId) return;
    const current = p.form ?? 50;
    const drift   = (Math.random() - 0.5) * 26; // ±13
    const boost   = motmIds.has(p.id) ? 10 : 0;
    p.form = clamp(Math.round(current + drift + boost), 5, 95);
  });
}

/* ── Hash seed from string ── */
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}