// ═══════════════════════════════════════════════════════
// IPL MUN SIMULATION ENGINE — Cricket-Accurate Logic
// ═══════════════════════════════════════════════════════

const ENGINE = (() => {

// ─── PHASE DEFINITIONS ───────────────────────────────
const PHASES = {
  POWERPLAY:  { overs: [0,5],   name: 'Powerplay',  fieldRestriction: 2 },
  MIDDLE:     { overs: [6,14],  name: 'Middle',      fieldRestriction: 5 },
  DEATH:      { overs: [15,19], name: 'Death',       fieldRestriction: 5 },
};

function getPhase(over) {
  if (over <= 5)  return 'POWERPLAY';
  if (over <= 14) return 'MIDDLE';
  return 'DEATH';
}

// ─── ROLE DEFINITIONS ────────────────────────────────
const ROLE_CONFIG = {
  'BAT':    { canBat: true,  canBowl: false, battingOrder: 'top',    bowlMax: 0 },
  'WK':     { canBat: true,  canBowl: false, battingOrder: 'top',    bowlMax: 0 },
  'WK-BAT': { canBat: true,  canBowl: false, battingOrder: 'top',    bowlMax: 0 },
  'AR':     { canBat: true,  canBowl: true,  battingOrder: 'middle', bowlMax: 4 },
  'ALL':    { canBat: true,  canBowl: true,  battingOrder: 'middle', bowlMax: 4 },
  'BOWL':   { canBat: true,  canBowl: true,  battingOrder: 'tail',   bowlMax: 4 },
  'PACE':   { canBat: true,  canBowl: true,  battingOrder: 'tail',   bowlMax: 4 },
  'SPIN':   { canBat: true,  canBowl: true,  battingOrder: 'tail',   bowlMax: 4 },
};

function getRoleConfig(role) {
  return ROLE_CONFIG[role?.toUpperCase()] || ROLE_CONFIG['BAT'];
}

// ─── BATTING ORDER BUILDER ────────────────────────────
function buildBattingOrder(xi) {
  const order = ['top', 'middle', 'tail'];
  const sorted = [];
  for (const tier of order) {
    const inTier = xi.filter(p => getRoleConfig(p.role).battingOrder === tier);
    // Within tier, sort by batting_rating desc
    inTier.sort((a, b) => (b.batting_rating || b.form || 70) - (a.batting_rating || a.form || 70));
    sorted.push(...inTier);
  }
  // Fill any unslotted players
  const slotted = new Set(sorted.map(p => p.id));
  xi.filter(p => !slotted.has(p.id)).forEach(p => sorted.push(p));
  return sorted.slice(0, 11);
}

// ─── BOWLING ROTATION BUILDER ─────────────────────────
function buildBowlingRotation(fieldingXI, totalOvers = 20) {
  // Only players who can bowl
  const bowlers = fieldingXI.filter(p => getRoleConfig(p.role).canBowl);
  if (!bowlers.length) return fieldingXI.slice(0, 5).map(p => ({ ...p }));

  // Each bowler max 4 overs; need 20 overs total
  // Assign quota: prioritise BOWL/PACE/SPIN, then AR/ALL
  bowlers.forEach(b => {
    b.bowlOversLeft = Math.min(4, getRoleConfig(b.role).bowlMax);
    b.bowlOversDone = 0;
    b.inningsWkts = 0;
    b.inningsRuns = 0;
    b.inningsBalls = 0;
  });
  return bowlers;
}

function selectBowler(bowlers, over, lastBowlerId, innings) {
  // Cannot bowl same bowler consecutive
  const eligible = bowlers.filter(b =>
    b.bowlOversLeft > 0 && b.id !== lastBowlerId
  );
  if (!eligible.length) return bowlers.find(b => b.bowlOversLeft > 0) || bowlers[0];

  const phase = getPhase(over);
  // Prefer pace in death/powerplay, spin in middle
  let preferred;
  if (phase === 'POWERPLAY' || phase === 'DEATH') {
    preferred = eligible.filter(b => b.bowling_type === 'PACE' || b.role === 'PACE');
  } else {
    preferred = eligible.filter(b => b.bowling_type === 'SPIN' || b.role === 'SPIN');
  }
  if (!preferred.length) preferred = eligible;

  // Sort by bowling_rating desc
  preferred.sort((a, b) => (b.bowling_rating || 60) - (a.bowling_rating || 60));

  // Add some randomness — top 2-3 compete
  const pool = preferred.slice(0, Math.min(3, preferred.length));
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── BALL OUTCOME CALCULATOR ──────────────────────────
function simulateBall(batter, bowler, phase, conditions, pitchState, innings) {
  if (!batter || !bowler) return { runs: 0, outcome: '0', event: null };

  const batRating = clamp((batter.batting_rating || batter.form || 70), 40, 99);
  const bowlRating = clamp((bowler.bowling_rating || bowler.form || 65), 40, 99);

  // Phase modifiers
  const phaseMod = {
    POWERPLAY: { bat: 0.08,  bowl: -0.04, wkt: -0.02 },
    MIDDLE:    { bat: 0.0,   bowl: 0.0,   wkt: 0.0   },
    DEATH:     { bat: 0.12,  bowl: -0.08, wkt: 0.04  },
  }[phase] || { bat: 0, bowl: 0, wkt: 0 };

  // Pitch modifiers
  const pitchMod = conditions.pitchMod || 0; // +ve favours batting
  const dewMod   = (innings === 2 && conditions.dew && conditions.timeOfDay === 'night') ? 0.06 : 0;
  const spinMod  = conditions.spinAssist || 0;  // fraction 0-1
  const paceMod  = conditions.paceAssist || 0;

  // Bowler type advantage
  const bowlerTypeAdv = (() => {
    const bt = (bowler.bowling_type || '').toUpperCase();
    if ((bt === 'SPIN' || bt === 'LEG-SPIN' || bt === 'OFF-SPIN') && spinMod > 0.6) return -0.05;
    if ((bt === 'PACE' || bt === 'FAST' || bt === 'FAST-MEDIUM') && paceMod > 0.6) return -0.05;
    return 0;
  })();

  // Net batting dominance: 0 = even, +ve = bat favoured
  const netBat = clamp(
    (batRating - bowlRating) / 100 +
    phaseMod.bat + pitchMod + dewMod + bowlerTypeAdv,
    -0.4, 0.4
  );

  // === WICKET PROBABILITY ===
  // Base wicket rate per ball in T20 is ~5.5% across all phases
  let wktProb = 0.055 + phaseMod.wkt - netBat * 0.15 - bowlerTypeAdv * 0.5;
  wktProb = clamp(wktProb, 0.02, 0.18);

  // === DOT BALL PROBABILITY ===
  let dotProb = 0.35 - netBat * 0.25;
  dotProb = clamp(dotProb, 0.15, 0.55);

  // === EXTRAS ===
  const extraProb = 0.04;

  // === SCORING DISTRIBUTION ===
  // After wkt and dot, distribute 1,2,3,4,6
  const remaining = 1 - wktProb - dotProb - extraProb;

  // Probability weights for scoring shots — calibrated to IPL avg ~8.5 rpo
  const w1 = 0.38, w2 = 0.18, w3 = 0.04;
  const w4 = clamp(0.13 + netBat * 0.12 + (phase === 'DEATH' ? 0.04 : 0), 0.08, 0.25);
  const w6 = clamp(0.07 + netBat * 0.10 + (phase === 'DEATH' ? 0.06 : 0) +
    (batter.six_hitter ? 0.05 : 0), 0.03, 0.20);
  const wTotal = w1 + w2 + w3 + w4 + w6;

  const p1 = remaining * (w1 / wTotal);
  const p2 = remaining * (w2 / wTotal);
  const p3 = remaining * (w3 / wTotal);
  const p4 = remaining * (w4 / wTotal);
  const p6 = remaining * (w6 / wTotal);

  const r = Math.random();
  let cum = 0;

  if ((cum += wktProb) > r)  return { runs: 0, outcome: 'W',  isWicket: true };
  if ((cum += dotProb) > r)  return { runs: 0, outcome: '0' };
  if ((cum += extraProb) > r) {
    const extra = Math.random() < 0.6 ? 'WD' : 'NB';
    return { runs: 1, outcome: extra, isExtra: true, extraType: extra };
  }
  if ((cum += p1) > r) return { runs: 1, outcome: '1' };
  if ((cum += p2) > r) return { runs: 2, outcome: '2' };
  if ((cum += p3) > r) return { runs: 3, outcome: '3' };
  if ((cum += p4) > r) return { runs: 4, outcome: '4', isBoundary: true };
  return { runs: 6, outcome: '6', isBoundary: true, isSix: true };
}

// ─── INNINGS SIMULATOR ────────────────────────────────
function simulateInnings(battingXIRaw, fieldingXIRaw, target, conditions, inningsNum) {
  const battingOrder = buildBattingOrder([...battingXIRaw]);
  const bowlers = buildBowlingRotation([...fieldingXIRaw]);

  // Init batter states
  const batters = battingOrder.map(p => ({
    ...p,
    runs: 0, balls: 0, fours: 0, sixes: 0, out: false,
    dismissal: '', bowler: null,
    strikeRate: () => p.balls > 0 ? (p.runs / p.balls * 100).toFixed(1) : '0.0',
  }));

  let totalRuns = 0, totalWkts = 0, totalBalls = 0, extras = 0;
  let strikerIdx = 0, nonStrikerIdx = 1;
  let lastBowlerId = null;
  const overByOver = [];
  const fallOfWickets = [];
  const events = [];
  let currentBowler = null;
  let overRuns = 0, overBalls = 0;

  const pitchState = { wear: conditions.pitchWear || 1, dusty: conditions.pitchWear > 3 };

  const maxBalls = 120; // 20 overs

  for (let ball = 0; ball < maxBalls; ball++) {
    const over = Math.floor(ball / 6);
    const ballInOver = ball % 6;
    const phase = getPhase(over);

    if (totalWkts >= 10) break;
    if (target && totalRuns >= target) break;

    // New over — rotate bowler
    if (ballInOver === 0) {
      overRuns = 0; overBalls = 0;
      currentBowler = selectBowler(bowlers, over, lastBowlerId, inningsNum);
      if (!currentBowler) break;
      lastBowlerId = currentBowler.id;
      currentBowler.bowlOversLeft--;
      currentBowler.bowlOversDone++;
    }

    const striker = batters[strikerIdx];
    if (!striker || striker.out) {
      // Find next batter
      const next = batters.findIndex((b, i) => i > strikerIdx && !b.out && b.balls === 0);
      if (next < 0) break;
      strikerIdx = next;
      continue;
    }

    const result = simulateBall(striker, currentBowler, phase, conditions, pitchState, inningsNum);

    if (result.isExtra) {
      totalRuns += result.runs; extras += result.runs;
      currentBowler.inningsRuns += result.runs;
      overRuns += result.runs;
      events.push({ over: over + 1, ball: ballInOver + 1, text: `${result.outcome} — ${result.runs} run`, type: 'extra' });
      ball--; // extras don't count as a legal ball
      totalBalls++; // but do count in real overs
      continue;
    }

    // Legal ball
    totalBalls++;
    overBalls++;
    striker.balls++;
    currentBowler.inningsBalls++;
    totalRuns += result.runs;
    striker.runs += result.runs;
    currentBowler.inningsRuns += result.runs;
    overRuns += result.runs;

    if (result.isSix)      { striker.sixes++; events.push({ over: over+1, ball: ballInOver+1, text: `SIX! ${striker.name} launches one over deep midwicket!`, type: 'six' }); }
    if (result.isBoundary && !result.isSix) { striker.fours++; events.push({ over: over+1, ball: ballInOver+1, text: `FOUR! ${striker.name} drives through covers!`, type: 'four' }); }

    if (result.isWicket) {
      striker.out = true;
      striker.dismissal = randomDismissal(currentBowler);
      striker.bowler = currentBowler.name;
      currentBowler.inningsWkts++;
      totalWkts++;
      fallOfWickets.push({ runs: totalRuns, wkt: totalWkts, batter: striker.name, over: over + 1, ball: ballInOver + 1 });
      events.push({ over: over+1, ball: ballInOver+1, text: `WICKET! ${striker.name} ${striker.dismissal} b ${currentBowler.name} — ${totalRuns}/${totalWkts}`, type: 'wicket' });

      // Milestone alert
      if (totalWkts >= 10) break;

      // New batter
      const nextIdx = batters.findIndex((b, i) => i > strikerIdx && !b.out);
      if (nextIdx < 0) break;
      strikerIdx = nextIdx;
    }

    // Check 50/100 milestones
    const prevRuns = striker.runs - result.runs;
    if (prevRuns < 50 && striker.runs >= 50) events.push({ over: over+1, ball: ballInOver+1, text: `FIFTY! ${striker.name} reaches 50 off ${striker.balls} balls!`, type: 'milestone' });
    if (prevRuns < 100 && striker.runs >= 100) events.push({ over: over+1, ball: ballInOver+1, text: `CENTURY! ${striker.name} reaches 100 off ${striker.balls} balls!`, type: 'milestone' });

    // Rotate strike on odd runs
    if (result.runs % 2 !== 0) {
      [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
    }

    // End of over — rotate strike
    if ((ball + 1) % 6 === 0) {
      [strikerIdx, nonStrikerIdx] = [nonStrikerIdx, strikerIdx];
      overByOver.push({ over: over + 1, runs: overRuns, wkts: currentBowler.inningsWkts, bowler: currentBowler.name });
    }

    // Check target
    if (target && totalRuns >= target) break;
  }

  const oversCompleted = Math.floor(totalBalls / 6);
  const ballsRemainder = totalBalls % 6;
  const oversStr = ballsRemainder > 0 ? `${oversCompleted}.${ballsRemainder}` : `${oversCompleted}.0`;

  // Compile bowler figures
  const bowlingCard = bowlers.map(b => ({
    name: b.name,
    overs: Math.floor(b.inningsBalls / 6) + (b.inningsBalls % 6 > 0 ? `.${b.inningsBalls % 6}` : '.0'),
    maidens: 0,
    runs: b.inningsRuns,
    wickets: b.inningsWkts,
    economy: b.inningsBalls > 0 ? ((b.inningsRuns / (b.inningsBalls / 6))).toFixed(2) : '0.00',
    role: b.role,
    id: b.id,
  })).filter(b => b.overs !== '0.0');

  return {
    runs: totalRuns, wickets: totalWkts, balls: totalBalls, extras,
    oversStr, overByOver, fallOfWickets, events,
    battingCard: batters.filter(b => b.balls > 0 || b.out).map(b => ({
      name: b.name, runs: b.runs, balls: b.balls,
      fours: b.fours, sixes: b.sixes,
      strikeRate: b.balls > 0 ? (b.runs / b.balls * 100).toFixed(1) : '0.0',
      dismissal: b.out ? b.dismissal : 'not out',
      bowler: b.bowler || '',
      id: b.id, role: b.role,
    })),
    bowlingCard,
  };
}

// ─── DISMISSAL TYPES ─────────────────────────────────
function randomDismissal(bowler) {
  const bowlerType = (bowler?.bowling_type || '').toUpperCase();
  const types = ['caught', 'bowled', 'lbw', 'caught & bowled', 'stumped', 'run out'];
  const weights = bowlerType === 'SPIN'
    ? [0.35, 0.15, 0.20, 0.08, 0.12, 0.10]
    : [0.40, 0.22, 0.18, 0.07, 0.03, 0.10];
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < types.length; i++) {
    cum += weights[i];
    if (r < cum) return types[i];
  }
  return 'caught';
}

// ─── MATCH RESULT ─────────────────────────────────────
function determineResult(inn1, inn2, batFirstTeam, fieldFirstTeam) {
  if (inn2.runs >= inn1.runs + 1) {
    const wktsLeft = 10 - inn2.wickets;
    const ballsLeft = 120 - inn2.balls;
    return { winner: fieldFirstTeam, margin: `${wktsLeft} wicket${wktsLeft !== 1 ? 's' : ''}`, detail: `${ballsLeft} balls remaining` };
  } else if (inn1.runs === inn2.runs) {
    return { winner: null, margin: 'Tie', detail: 'Super Over needed' };
  } else {
    const diff = inn1.runs - inn2.runs;
    return { winner: batFirstTeam, margin: `${diff} run${diff !== 1 ? 's' : ''}`, detail: '' };
  }
}

// ─── FULL MATCH SIMULATOR ─────────────────────────────
function simulateMatch(teamA, teamB, venue, conditions) {
  const toss = Math.random() < 0.5 ? 'A' : 'B';
  const electedTo = conditions.tossElect || (Math.random() < 0.55 ? 'bat' : 'bowl');
  const batFirst = (toss === 'A' && electedTo === 'bat') || (toss === 'B' && electedTo === 'bowl') ? teamA : teamB;
  const bowlFirst = batFirst === teamA ? teamB : teamA;

  const conds = {
    pitchMod: ({'Batting': 0.10, 'Spin': -0.06, 'Pace': -0.04, 'Balanced': 0.0}[venue.pitch] || 0),
    spinAssist: (venue.spin || 50) / 100,
    paceAssist: (venue.pace || 50) / 100,
    dew: venue.dew,
    timeOfDay: conditions.timeOfDay || 'night',
    pitchWear: conditions.pitchWear || 2,
  };

  const batXI  = batFirst.xi  || batFirst.players || [];
  const fieldXI = bowlFirst.xi || bowlFirst.players || [];

  const inn1 = simulateInnings(batXI, fieldXI, null, conds, 1);
  const inn2 = simulateInnings(fieldXI, batXI, inn1.runs + 1, { ...conds, pitchWear: Math.min(5, conds.pitchWear + 1) }, 2);

  const result = determineResult(inn1, inn2, batFirst, bowlFirst);

  // MoM — highest composite score
  const allBatters = [...inn1.battingCard, ...inn2.battingCard];
  const allBowlers = [...inn1.bowlingCard, ...inn2.bowlingCard];
  let momScore = -1, mom = null;
  allBatters.forEach(b => {
    const s = b.runs * 1.5 + b.fours * 0.5 + b.sixes * 2 + (parseFloat(b.strikeRate) > 150 ? 10 : 0);
    if (s > momScore) { momScore = s; mom = b; }
  });
  allBowlers.forEach(b => {
    const s = b.wickets * 25 + Math.max(0, 8 - parseFloat(b.economy)) * 5;
    if (s > momScore) { momScore = s; mom = b; }
  });

  return {
    tossWinner: toss === 'A' ? teamA.name : teamB.name,
    tossElect: electedTo,
    batFirst: batFirst.name, bowlFirst: bowlFirst.name,
    inn1: { team: batFirst.name, ...inn1 },
    inn2: { team: bowlFirst.name, ...inn2 },
    result, mom, venue: venue.name,
  };
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

return { simulateMatch, simulateInnings, buildBattingOrder, buildBowlingRotation, getPhase };
})();