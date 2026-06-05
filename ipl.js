'use strict';
/* ═══════════════════════════════════════════════════════
   IPL MUN Season Manager v3.2 — Clean Single-Source JS
   No duplicate functions. Complete rewrite.
   ═══════════════════════════════════════════════════════ */

/* ──────────────────── 1. CONSTANTS ──────────────────── */
const VENUES = [
  {id:'wankhede',    name:'Wankhede Stadium',          city:'Mumbai',     pitch:'bat'},
  {id:'chinnaswamy', name:'M. Chinnaswamy Stadium',     city:'Bengaluru',  pitch:'bat'},
  {id:'eden',        name:'Eden Gardens',               city:'Kolkata',    pitch:'bat'},
  {id:'chepauk',     name:'M.A. Chidambaram Stadium',   city:'Chennai',    pitch:'spin'},
  {id:'rajiv',       name:'Rajiv Gandhi Intl.',         city:'Hyderabad',  pitch:'spin'},
  {id:'sawai',       name:'Sawai Mansingh Stadium',     city:'Jaipur',     pitch:'spin'},
  {id:'mohali',      name:'PCA Stadium',                city:'Mohali',     pitch:'pace'},
  {id:'dharamsala',  name:'HPCA Stadium',               city:'Dharamsala', pitch:'pace'},
  {id:'ekana',       name:'Ekana Cricket Stadium',      city:'Lucknow',    pitch:'pace'},
  {id:'narendra',    name:'Narendra Modi Stadium',      city:'Ahmedabad',  pitch:'balanced'},
  {id:'arun',        name:'Arun Jaitley Stadium',       city:'Delhi',      pitch:'balanced'},
  {id:'barsapara',   name:'Barsapara Cricket Stadium',  city:'Guwahati',   pitch:'balanced'},
];
const PITCH_LABELS = {bat:'🌟 Batting Paradise', spin:'🌀 Spin Friendly', pace:'💨 Pace Heaven', balanced:'⚖️ Balanced'};
const PITCH_MODS   = {
  bat:     {six:1.18, four:1.18, wkt:0.88, spinBonus:0,    paceBonus:0},
  spin:    {six:0.92, four:0.92, wkt:1.05, spinBonus:0.08, paceBonus:0},
  pace:    {six:1.05, four:1.10, wkt:1.05, spinBonus:0,    paceBonus:0.07},
  balanced:{six:1.00, four:1.00, wkt:1.00, spinBonus:0,    paceBonus:0},
};
const TEAM_COLORS = ['#ff6b1a','#3b82f6','#10b981','#a855f7','#f43f5e','#06b6d4','#f5c842','#14b8a6','#ec4899','#84cc16'];

/* ──────────────────── 2. STATE ──────────────────── */
function freshState() {
  return {
    v: '3.2',
    season: {
      name:'IPL MUN Season 1', status:'setup',
      adminPassword:'chair2025',
      currentMD:0, totalMDs:14,
      tradeEvery:2, crisisMD:0, crisisFired:false,
    },
    cfg: {numTeams:8, budget:90},
    teams:   [],
    players: [],
    venues:  VENUES.map(v => ({...v})),
    schedule:[],
    matches: [],
    auction: {pool:[], unsold:[], log:[], lot:0, round:1, drawn:0, current:null},
    codes:   {},
    tradeLog:[],
    playoffs:null,
    stats: {bat:{}, bowl:{}, field:{}, mom:{}, milestones:[]},
    liveSession:null,
  };
}

let S  = freshState();
let ME = {role:null, teamId:null};
let UI = {page:null, sidebarOpen:true, xiAdmin:{teamId:null, sel:[]}, statTab:'batting', pollTimer:null};

/* ──────────────────── 3. PERSISTENCE ──────────────────── */
const SK = 'ipl_mun_v32';

function save() {
  try { localStorage.setItem(SK, JSON.stringify(S)); }
  catch(e) { toast('Storage full — export a backup first.','warn'); }
}

function load() {
  try {
    const raw = localStorage.getItem(SK);
    if (raw) { S = patch(JSON.parse(raw)); return true; }
  } catch(e) {}
  return false;
}

function patch(s) {
  const d = freshState();
  s.v       = d.v;
  s.venues  = s.venues  || d.venues;
  s.season  = {...d.season,  ...s.season};
  s.cfg     = {...d.cfg,     ...s.cfg};
  s.auction = {...d.auction, ...s.auction};
  s.stats   = {...d.stats,   ...s.stats};
  s.teams   = (s.teams  ||[]).map(t => ({
    aggression:60, locked:false, xi:[], points:0,
    wins:0, losses:0, ties:0, played:0, nrr:0, form:[],
    players:[], spent:0, ...t
  }));
  s.players = (s.players||[]).map(p => ({
    injured:false, injuredMDs:0, suspended:false,
    price:0, injuryProne:false, ...p
  }));
  if (!s.codes)    s.codes    = {};
  if (!s.tradeLog) s.tradeLog = [];
  if (!s.playoffs) s.playoffs = null;
  if (!s.liveSession) s.liveSession = null;
  return s;
}

function exportState() {
  const json = JSON.stringify(S);
  try {
    const c = LZString.compressToEncodedURIComponent(json);
    dlFile(`ipl_mun_${(S.season.name||'season').replace(/\s+/g,'_')}.ipl`, c, 'text/plain');
    toast('Exported!','success');
  } catch(e) { dlFile('ipl_mun.json', json, 'application/json'); }
}

function importState() { id('import-file').click(); }

document.addEventListener('change', e => {
  if (e.target.id !== 'import-file') return;
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      let d = ev.target.result;
      try { d = LZString.decompressFromEncodedURIComponent(d); } catch(_) {}
      S = patch(JSON.parse(d));
      save(); toast('Imported!','success'); fullRefresh();
    } catch(err) { toast('Import failed — invalid file.','error'); }
  };
  r.readAsText(f);
});

function dlFile(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], {type}));
  a.download = name; a.click();
}

function generateShareLink() {
  const slim = JSON.parse(JSON.stringify(S));
  (slim.matches||[]).forEach(m => { delete m.inn1?.log; delete m.inn2?.log; });
  const url = `${location.origin}${location.pathname}?s=${LZString.compressToEncodedURIComponent(JSON.stringify(slim))}`;
  const inp = id('share-url-input');
  if (inp) inp.value = url;
  id('admin-share-url')?.classList.remove('hidden');
  const qrImg = id('admin-qr-img'), qrBox = id('admin-qr');
  if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`;
  if (qrBox) qrBox.classList.remove('hidden');
  toast('Share link generated!','success');
}

function copyShareUrl() {
  navigator.clipboard.writeText(id('share-url-input')?.value || '')
    .then(() => toast('Link copied!','success'));
}

function loadFromURL() {
  const p = new URLSearchParams(location.search).get('s');
  if (!p) return false;
  try { S = patch(JSON.parse(LZString.decompressFromEncodedURIComponent(p))); save(); return true; }
  catch(e) { return false; }
}

/* ──────────────────── 4. AUTH ──────────────────── */
function loginSwitchTab(tab) {
  ['admin','delegate'].forEach(t => {
    q(`[data-tab="${t}"]`).classList.toggle('active', t === tab);
    id(`login-panel-${t}`).classList.toggle('hidden', t !== tab);
  });
}

function loginAsAdmin() {
  const pwd = id('admin-password').value;
  const err = id('admin-login-error');
  if (pwd !== S.season.adminPassword) {
    err.textContent = 'Wrong password.'; err.classList.remove('hidden');
    id('admin-password').value = ''; return;
  }
  ME = {role:'admin', teamId:null};
  err.classList.add('hidden');
  launch();
}

function loginAsDelegate() {
  const tid  = id('delegate-team-select').value;
  const code = id('delegate-team-code').value.toUpperCase().trim();
  const err  = id('delegate-login-error');
  if (!tid)  { err.textContent='Select your team.';             err.classList.remove('hidden'); return; }
  if (!code) { err.textContent='Enter your 4-char team code.';  err.classList.remove('hidden'); return; }
  if (S.codes[tid] !== code) { err.textContent='Invalid code — ask the chair.'; err.classList.remove('hidden'); return; }
  ME = {role:'delegate', teamId:tid};
  err.classList.add('hidden');
  launch();
}

function fillDelegateTeams() {
  const sel = id('delegate-team-select'); if (!sel) return;
  sel.innerHTML = '<option value="">— Select team —</option>';
  S.teams.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id; o.textContent = t.name; sel.appendChild(o);
  });
}

function logout() {
  ME = {role:null, teamId:null};
  clearInterval(UI.pollTimer); UI.pollTimer = null;
  id('app').classList.add('hidden');
  id('screen-login').classList.add('active');
  id('admin-password').value = '';
}

function launch() {
  id('screen-login').classList.remove('active');
  const app = id('app');
  app.classList.remove('hidden');
  app.setAttribute('data-role', ME.role);
  applyRole();
  fullRefresh();
  // Navigate to best starting page
  if (ME.role === 'admin') {
    const p = S.season.status === 'setup' ? 'setup' : S.season.status === 'auction' ? 'auction' : 'matchday';
    navTo(p);
  } else {
    navTo('live');
    if (S.liveSession?.blobId) startPoll();
  }
}

function applyRole() {
  const admin = ME.role === 'admin';
  qa('.admin-only').forEach(el => el.classList.toggle('hidden', !admin));
  id('header-team-pill').classList.toggle('hidden', !ME.teamId);
  if (ME.teamId) {
    const t = team(ME.teamId);
    if (t) {
      id('header-team-name').textContent = t.name;
      id('header-team-color').style.background = t.color;
    }
  }
}

/* ──────────────────── 5. NAVIGATION ──────────────────── */
function navTo(page) { go(page); }

function go(page) {
  qa('.page').forEach(p => p.classList.remove('active'));
  qa('.nav-tab').forEach(t => t.classList.remove('active'));
  const pEl = id(`page-${page}`), tEl = q(`[data-page="${page}"]`);
  if (pEl) pEl.classList.add('active');
  if (tEl) tEl.classList.add('active');
  UI.page = page;
  renderPage(page);
}

function renderPage(page) {
  const map = {
    setup:rSetup, auction:rAuction, matchday:rMatchday,
    live:rLive, strategy:rStrategy, points:rPoints,
    scorecards:rScorecards, stats:rStats, reports:rReports,
    admin:rAdmin,
  };
  if (map[page]) map[page]();
}

function fullRefresh() {
  rSidebar(); rHeader(); fillDelegateTeams();
  if (UI.page) renderPage(UI.page);
}

function toggleSidebar() {
  UI.sidebarOpen = !UI.sidebarOpen;
  id('sidebar').classList.toggle('collapsed', !UI.sidebarOpen);
}

function rHeader() {
  id('header-season-name').textContent = S.season.name;
  const ind = id('header-md-indicator');
  if (S.season.currentMD > 0) {
    ind.classList.remove('hidden');
    id('header-md-num').textContent   = S.season.currentMD;
    id('header-md-total').textContent = S.season.totalMDs;
  } else ind.classList.add('hidden');
}

function rSidebar() {
  const el = id('sidebar-standings');
  const sorted = standings();
  if (!sorted.length) { el.innerHTML = '<div class="sidebar-empty">Season not started</div>'; return; }
  const n = S.teams.length;
  el.innerHTML = sorted.map((t, i) => {
    const pos = i+1;
    const nrr = (t.nrr >= 0 ? '+' : '') + (t.nrr||0).toFixed(3);
    const cls = ['standings-row', pos<=4?'qualify':'', pos>n-2?'danger':'', t.id===ME.teamId?'own-team':''].filter(Boolean).join(' ');
    return `<div class="${cls}"><span class="sr-pos">${pos}</span><span class="sr-pip" style="background:${t.color}"></span><span class="sr-name">${esc(t.short||t.name)}</span><span class="sr-pts">${t.points}</span><span class="sr-nrr">${nrr}</span></div>`;
  }).join('');
  const oc = orangeCap(), pc = purpleCap();
  id('sidebar-caps').innerHTML =
    (oc ? `<div class="cap-mini"><span class="cap-mini-icon">🟠</span>${esc(oc.name)}</div>` : '') +
    (pc ? `<div class="cap-mini"><span class="cap-mini-icon">🟣</span>${esc(pc.name)}</div>` : '');
}

/* ──────────────────── 6. SETUP PAGE ──────────────────── */
function rSetup() {
  id('cfg-season-name').value    = S.season.name;
  id('cfg-admin-password').value = S.season.adminPassword;
  id('cfg-auction-budget').value = S.cfg.budget;
  id('cfg-num-teams').value      = S.cfg.numTeams;
  rTeamBuilder(); rVenueList();
}

function rTeamBuilder() {
  const el = id('team-builder-list');
  if (!S.teams.length) { el.innerHTML = '<div class="team-builder-empty">No teams — click "Add Team".</div>'; return; }
  el.innerHTML = S.teams.map((t, i) => `
    <div class="team-builder-row">
      <input class="form-input" type="text" placeholder="Team name" value="${esc(t.name)}"
             oninput="S.teams[${i}].name=this.value">
      <input class="form-input" type="text" placeholder="Short (MI)" value="${esc(t.short||'')}" maxlength="4"
             oninput="S.teams[${i}].short=this.value">
      <select class="form-select" onchange="S.teams[${i}].venueId=this.value">
        <option value="">Home venue</option>
        ${S.venues.map(v => `<option value="${v.id}" ${v.id===t.venueId?'selected':''}>${esc(v.name)}</option>`).join('')}
      </select>
      <input type="color" class="team-color-swatch" value="${t.color||'#ff6b1a'}"
             oninput="S.teams[${i}].color=this.value">
      <button class="btn btn-danger btn-sm" onclick="rmTeam(${i})">✕</button>
    </div>`).join('');
}

function addTeamRow() {
  S.teams.push({
    id: `t_${Date.now()}_${rCode(5)}`,
    name: `Team ${S.teams.length+1}`, short: '',
    color: TEAM_COLORS[S.teams.length % TEAM_COLORS.length],
    venueId:'', budget:S.cfg.budget, spent:0,
    players:[], xi:[], aggression:60, locked:false,
    points:0, wins:0, losses:0, ties:0, played:0, nrr:0, form:[],
  });
  rTeamBuilder();
}

function rmTeam(i) { S.teams.splice(i, 1); rTeamBuilder(); }

function rVenueList() {
  id('venue-list').innerHTML = S.venues.map((v, i) => `
    <div class="venue-row">
      <div class="venue-name">${esc(v.name)}, ${esc(v.city)}</div>
      <select class="form-select" onchange="S.venues[${i}].pitch=this.value;rVenueList()">
        ${['bat','spin','pace','balanced'].map(pt => `<option value="${pt}" ${v.pitch===pt?'selected':''}>${pt[0].toUpperCase()+pt.slice(1)}</option>`).join('')}
      </select>
      <span class="pitch-badge ${v.pitch}">${PITCH_LABELS[v.pitch]||v.pitch}</span>
    </div>`).join('');
}

function switchImport(tab) {
  qa('.import-tab').forEach(t => t.classList.toggle('active', t.dataset.import===tab));
  id('import-csv').classList.toggle('hidden', tab !== 'csv');
  id('import-sheets').classList.toggle('hidden', tab !== 'sheets');
}

function parsePlayerImport() {
  const raw = id('player-csv').value.trim();
  if (!raw) { toast('Paste CSV data first.','warn'); return; }
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const hdr   = lines[0].toLowerCase().split(',').map(h => h.trim());
  const gi    = k => hdr.indexOf(k);
  const parsed = lines.slice(1).map((ln, i) => {
    const c = ln.split(',').map(x => x.trim());
    return {
      id:    `p_${Date.now()}_${i}`,
      name:  c[gi('name')]   || c[0] || `Player ${i+1}`,
      role: (c[gi('role')]   || 'BAT').toUpperCase(),
      bat:   parseInt(c[gi('bat')]   || c[gi('batting')]  || c[2]) || 50,
      bowl:  parseInt(c[gi('bowl')]  || c[gi('bowling')]  || c[3]) || 30,
      field: parseInt(c[gi('field')] || c[gi('fielding')] || c[4]) || 60,
      keep:  parseInt(c[gi('keep')]  || c[gi('keeping')]  || c[5]) || 0,
      base:  parseFloat(c[gi('baseprice')] || c[gi('base price')] || c[6]) || 1.0,
      price:0, teamId:null, injured:false, injuredMDs:0, suspended:false, injuryProne:false,
    };
  }).filter(p => p.name && p.name.trim());
  window._preview = parsed;
  const prev = id('import-preview');
  prev.classList.remove('hidden');
  prev.innerHTML = `<table class="sc-table" style="margin-top:10px">
    <thead><tr><th>Name</th><th>Role</th><th>Bat</th><th>Bowl</th><th>Field</th><th>Base ₹Cr</th></tr></thead>
    <tbody>${parsed.map(p => `<tr><td>${esc(p.name)}</td><td><span class="squad-player-role-badge ${p.role}">${p.role}</span></td><td>${p.bat}</td><td>${p.bowl}</td><td>${p.field}</td><td>${p.base}</td></tr>`).join('')}</tbody>
  </table><p style="margin-top:8px;font-size:11px;color:var(--text2)">${parsed.length} players found.</p>`;
  toast(`${parsed.length} players parsed.`, 'info');
}

function confirmPlayerImport() {
  if (!window._preview) { toast('Preview first.','warn'); return; }
  S.players = window._preview;
  S.auction.pool = S.players.map(p => p.id);
  window._preview = null;
  save(); toast(`${S.players.length} players imported!`, 'success');
}

async function fetchSheets() {
  const url = id('sheets-url').value.trim();
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) { toast('Invalid Sheets URL.','error'); return; }
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`);
    id('player-csv').value = await res.text();
    switchImport('csv'); parsePlayerImport();
  } catch(e) { toast("Couldn't fetch — make sure it's public.",'error'); }
}

function finaliseSetup() {
  S.season.name          = id('cfg-season-name').value.trim() || 'IPL MUN';
  S.season.adminPassword = id('cfg-admin-password').value     || S.season.adminPassword;
  S.cfg.budget           = parseFloat(id('cfg-auction-budget').value) || 90;
  S.cfg.numTeams         = parseInt(id('cfg-num-teams').value) || 8;

  if (S.teams.length < 2)  { toast('Add at least 2 teams.','warn'); return; }
  if (!S.players.length)   { toast('Import players first.','warn'); return; }

  // Check for duplicate names
  const names = S.teams.map(t => t.name.toLowerCase().trim());
  if (names.some((n, i) => names.indexOf(n) !== i)) { toast('Duplicate team names — rename them.','error'); return; }

  // Warn if not enough players
  if (S.players.length < S.teams.length * 11) {
    if (!confirm(`Only ${S.players.length} players for ${S.teams.length} teams (need ${S.teams.length*11}). Continue?`)) return;
  }

  S.teams.forEach(t => { t.budget = S.cfg.budget; t.spent = 0; });
  genSchedule();

  // Init stats for all players
  S.players.forEach(p => {
    S.stats.bat[p.id]   = {r:0, b:0, fours:0, sixes:0, hs:0, fifties:0, hundreds:0, matches:0, outs:0};
    S.stats.bowl[p.id]  = {wkts:0, runs:0, balls:0, maidens:0, matches:0, fiveW:0, best:'0/0'};
    S.stats.field[p.id] = {catches:0, stumpings:0, runOuts:0};
    S.stats.mom[p.id]   = 0;
  });

  S.teams.forEach(t => { if (!S.codes[t.id]) S.codes[t.id] = rCode(4); });
  S.season.status    = 'auction';
  S.season.currentMD = 0;
  S.season.crisisMD  = Math.ceil(S.season.totalMDs * 0.75);

  save(); toast('Setup saved — proceed to Auction.', 'success');
  rHeader(); navTo('auction');
}

/* ──────────────────── 7. SCHEDULE ──────────────────── */
function genSchedule() {
  const ids = S.teams.map(t => t.id);
  S.season.totalMDs = (ids.length - 1) * 2;
  S.schedule = [];
  const rounds = rrPairs(ids);
  const allRounds = [...rounds, ...rounds.map(r => r.map(([a,b]) => [b,a]))];
  allRounds.forEach((round, idx) => {
    const md = idx + 1;
    S.schedule.push({
      md,
      fixtures: round.map(([tA, tB]) => {
        const home = S.teams.find(t => t.id === tA);
        const vid  = home?.venueId || S.venues[idx % S.venues.length]?.id;
        return {id:`f${md}_${tA}_${tB}`, tA, tB, venueId:vid, result:null};
      }),
    });
  });
}

function rrPairs(ids) {
  const list = [...ids];
  if (list.length % 2 !== 0) list.push('BYE');
  const rounds = [];
  for (let r = 0; r < list.length - 1; r++) {
    const round = [];
    for (let i = 0; i < list.length / 2; i++) {
      const a = list[i], b = list[list.length - 1 - i];
      if (a !== 'BYE' && b !== 'BYE') round.push([a, b]);
    }
    rounds.push(round);
    list.splice(1, 0, list.pop());
  }
  return rounds;
}

/* ──────────────────── 8. AUCTION ──────────────────── */
function rAuction() {
  // Build auction UI if needed (first visit or after reset)
  if (!id('auction-bidding-zone')) buildAuctionUI();
  upAuctionHeader(); rBudgets(); rPool(); rAuctionLog(); checkReauction();
  // Restore current bidding state
  if (S.auction.current) {
    const p = player(S.auction.current);
    if (p) showBid(p); else { S.auction.current = null; clearBid(); }
  } else clearBid();
}

function buildAuctionUI() {
  id('page-auction').innerHTML = `
  <div class="page-header">
    <h1 class="page-title">Auction</h1>
    <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
      <span class="auction-round-pill" id="a-round-pill">Round 1</span>
      <span style="font-family:var(--fm);font-size:11px;color:var(--text3)" id="a-meta"></span>
    </div>
  </div>

  <div id="reauction-banner" class="reauction-banner hidden">
    <div class="reauction-icon">🔄</div>
    <div>
      <div class="reauction-title">Round <span id="ra-from"></span> Complete</div>
      <div class="reauction-sub"><span id="ra-count"></span> players unsold</div>
    </div>
    <div class="reauction-actions">
      <button class="btn btn-primary" onclick="startReauction()">Start Re-auction Round</button>
      <button class="btn btn-secondary" onclick="finaliseAuction()">Skip Unsold &amp; Finalise</button>
    </div>
  </div>

  <div class="auction-layout">
    <div class="auction-main">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🎰 Draw Lot</h2>
          <span style="font-family:var(--fm);font-size:10px;color:var(--text3)">
            Lot <span id="a-lot-cur">0</span> / <span id="a-lot-tot">0</span>
          </span>
        </div>
        <div class="card-body" style="text-align:center;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
          <div id="a-idle" style="color:var(--text3)">
            <div style="font-size:44px;margin-bottom:8px">🎰</div>
            <div style="font-size:13px">Press Draw to reveal a player</div>
          </div>
          <div id="auction-reveal-stage" class="hidden" style="width:100%;max-width:320px">
            <div class="auction-lot-card" style="margin:0 auto">
              <div class="lot-card-inner" id="lot-inner">
                <div class="lot-card-front"><span class="lot-number">LOT <span id="a-lot-num">?</span></span></div>
                <div class="lot-card-back">
                  <div class="auction-player-reveal">
                    <div id="ar-role" class="player-reveal-role"></div>
                    <div id="ar-name" class="player-reveal-name"></div>
                    <div id="ar-stats" class="player-reveal-stats"></div>
                    <div class="player-reveal-base">Base: ₹<span id="ar-base">0</span> Cr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-large btn-primary" onclick="drawNextLot()">🎰 Draw Next Lot</button>
        </div>
      </div>

      <div id="auction-bidding-zone" class="card hidden" style="border-color:rgba(255,140,0,0.30)">
        <div class="card-header" style="background:rgba(255,107,26,0.05)">
          <h2 class="card-title">🏏 Now Bidding — <span id="bid-player-name" style="color:var(--ipl2)"></span></h2>
          <span id="bid-lot-badge" style="font-family:var(--fm);font-size:10px;color:var(--text3)"></span>
        </div>
        <div class="card-body">
          <div id="bid-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"></div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Final Price <span class="form-unit">₹ Cr</span></label>
            <input id="bid-price" class="form-input" type="number" step="0.25" min="0"
                   style="font-size:22px;font-weight:700;color:var(--gold);font-family:var(--fm);max-width:200px">
          </div>
          <div style="font-family:var(--fm);font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);font-weight:700;margin-bottom:8px">Select Team:</div>
          <div id="bid-teams" class="auction-team-assign-grid"></div>
          <div id="bid-err" class="login-error hidden" style="margin-top:10px"></div>
          <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
            <button class="btn btn-large btn-primary" onclick="confirmAssign()">✓ Confirm Assignment</button>
            <button class="btn btn-large btn-secondary" onclick="markUnsold()">✕ Mark Unsold</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📝 Auction Log</h2>
          <span id="a-log-count" class="card-badge">0</span>
        </div>
        <div id="a-log" class="auction-log-list"><div class="list-empty">No assignments yet.</div></div>
      </div>
    </div>

    <div class="auction-sidebar">
      <div class="card">
        <div class="card-header"><h2 class="card-title">💰 Budgets</h2></div>
        <div id="a-budgets" class="auction-budget-list"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">👤 Pool</h2>
          <span id="a-pool-count" class="card-badge">0</span>
        </div>
        <div id="a-pool" class="auction-pool-list"></div>
      </div>
      <div id="a-unsold-card" class="card hidden" style="border-color:rgba(244,63,94,.2)">
        <div class="card-header">
          <h2 class="card-title" style="color:var(--red)">✕ Unsold</h2>
          <span id="a-unsold-count" class="card-badge" style="color:var(--red)">0</span>
        </div>
        <div id="a-unsold" class="auction-pool-list"></div>
      </div>
      <button class="btn btn-primary btn-block" onclick="finaliseAuction()" style="margin-top:6px">Finalise Auction →</button>
    </div>
  </div>`;
}

function upAuctionHeader() {
  const tot = S.auction.pool.length + S.auction.log.length + S.auction.unsold.length;
  se('a-round-pill', `Round ${S.auction.round}`);
  se('a-meta', `${S.auction.drawn} drawn · ${S.auction.unsold.length} unsold · ${S.auction.pool.length} left`);
  se('a-lot-cur', S.auction.lot);
  se('a-lot-tot', tot);
}

function rBudgets() {
  const el = id('a-budgets'); if (!el) return;
  el.innerHTML = S.teams.map(t => {
    const pct = Math.min(100, (t.budget / S.cfg.budget) * 100);
    const cls = pct < 10 ? 'danger' : pct < 30 ? 'low' : '';
    return `<div class="budget-row">
      <span class="budget-pip" style="background:${t.color}"></span>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <span class="budget-team-name">${esc(t.short||t.name)}</span>
          <span class="budget-amount">₹${t.budget.toFixed(1)}Cr</span>
        </div>
        <div class="budget-track"><div class="budget-fill ${cls}" style="width:${pct}%"></div></div>
        <div style="font-family:var(--fm);font-size:9px;color:var(--text3);margin-top:2px">${t.players.length} signed</div>
      </div>
    </div>`;
  }).join('') || '<div class="list-empty">No teams.</div>';
}

function rPool() {
  const poolEl = id('a-pool'), countEl = id('a-pool-count');
  const unsoldEl = id('a-unsold'), unsoldCard = id('a-unsold-card'), unsoldCount = id('a-unsold-count');
  if (!poolEl) return;
  if (countEl) countEl.textContent = S.auction.pool.length;
  poolEl.innerHTML = S.auction.pool.map(pid => {
    const p = player(pid); if (!p) return '';
    const active = pid === S.auction.current;
    return `<div class="pool-player-row" ${active?'style="background:var(--ipl-dim);border-left:2px solid var(--ipl2)"':''}>
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span style="flex:1">${esc(p.name)}${active?'<span style="color:var(--ipl2);font-size:9px;margin-left:4px">▶</span>':''}</span>
      <span style="font-family:var(--fm);font-size:10px;color:var(--text3)">₹${p.base}Cr</span>
    </div>`;
  }).join('') || '<div class="list-empty">Pool empty.</div>';

  if (unsoldCard) unsoldCard.classList.toggle('hidden', !S.auction.unsold.length);
  if (unsoldCount) unsoldCount.textContent = S.auction.unsold.length;
  if (unsoldEl) {
    unsoldEl.innerHTML = S.auction.unsold.map(pid => {
      const p = player(pid); if (!p) return '';
      return `<div class="pool-player-row" style="opacity:0.6">
        <span class="squad-player-role-badge ${p.role}">${p.role}</span>
        <span style="flex:1">${esc(p.name)}</span>
        <span style="font-family:var(--fm);font-size:10px;color:var(--text3)">₹${p.base}Cr</span>
      </div>`;
    }).join('') || '<div class="list-empty">None.</div>';
  }
}

function rAuctionLog() {
  const el = id('a-log'), cnt = id('a-log-count'); if (!el) return;
  if (cnt) cnt.textContent = S.auction.log.length;
  if (!S.auction.log.length) { el.innerHTML = '<div class="list-empty">No assignments yet.</div>'; return; }
  el.innerHTML = [...S.auction.log].reverse().map(e => {
    const p = player(e.pid), t = team(e.tid);
    return `<div class="auction-log-entry">
      <span class="log-player">${p ? esc(p.name) : '?'}</span>
      <span class="log-team" style="color:${t?.color||'var(--text2)'}">${t ? esc(t.short||t.name) : '—'}</span>
      <span class="log-price">₹${e.price}Cr</span>
      ${e.round > 1 ? `<span style="font-family:var(--fm);font-size:9px;color:var(--text3)">R${e.round}</span>` : ''}
    </div>`;
  }).join('');
}

function checkReauction() {
  const banner = id('reauction-banner'); if (!banner) return;
  const show = !S.auction.pool.length && S.auction.unsold.length && !S.auction.current;
  banner.classList.toggle('hidden', !show);
  if (show) { se('ra-from', S.auction.round); se('ra-count', S.auction.unsold.length); }
}

function drawNextLot() {
  if (S.auction.current) { showBidErr('Assign or mark unsold the current player first.'); return; }
  if (!S.auction.pool.length) { checkReauction(); toast('Pool empty.','warn'); return; }
  const idx = Math.floor(Math.random() * S.auction.pool.length);
  const pid = S.auction.pool[idx];
  const p   = player(pid);
  if (!p) { S.auction.pool.splice(idx, 1); save(); drawNextLot(); return; }

  S.auction.current = pid;
  S.auction.lot++;
  S.auction.drawn = (S.auction.drawn || 0) + 1;

  // Show reveal animation
  const idle  = id('a-idle'), stage = id('auction-reveal-stage'), inner = id('lot-inner');
  if (idle)  idle.style.display = 'none';
  if (stage) stage.classList.remove('hidden');
  if (inner) { inner.classList.remove('flipped'); void inner.offsetWidth; fillReveal(p); setTimeout(() => inner.classList.add('flipped'), 80); }
  se('a-lot-num', S.auction.lot);

  showBid(p); upAuctionHeader(); rPool(); save();
}

function fillReveal(p) {
  se('ar-role', p.role);
  id('ar-role').className = `player-reveal-role squad-player-role-badge ${p.role}`;
  se('ar-name', p.name);
  se('ar-base', p.base);
  const bars = [{l:'BAT',v:p.bat,c:'var(--role-bat)'},{l:'BOWL',v:p.bowl,c:'var(--role-pace)'},{l:'FLD',v:p.field,c:'var(--green)'}];
  if (p.role === 'WK') bars.push({l:'KEEP',v:p.keep,c:'var(--role-wk)'});
  id('ar-stats').innerHTML = bars.map(b =>
    `<div class="reveal-bar-row"><span class="reveal-bar-label">${b.l}</span><div class="reveal-bar-track"><div class="reveal-bar-fill" style="background:${b.c};width:0" data-v="${b.v}"></div></div><span class="reveal-bar-value">${b.v}</span></div>`
  ).join('');
  setTimeout(() => qa('.reveal-bar-fill').forEach(b => b.style.width = b.dataset.v + '%'), 700);
}

function showBid(p) {
  const zone = id('auction-bidding-zone'); if (!zone) return;
  zone.classList.remove('hidden');
  se('bid-player-name', p.name);
  se('bid-lot-badge', `LOT ${S.auction.lot}`);
  const chips = [{l:'BAT',v:p.bat},{l:'BOWL',v:p.bowl},{l:'FLD',v:p.field}];
  if (p.role === 'WK') chips.push({l:'KEEP',v:p.keep});
  id('bid-chips').innerHTML =
    `<span class="squad-player-role-badge ${p.role}">${p.role}</span>` +
    chips.map(c => `<span style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:3px 10px;font-family:var(--fm);font-size:10px;display:inline-flex;gap:5px"><span style="color:var(--text3)">${c.l}</span><strong>${c.v}</strong></span>`).join('');
  id('bid-price').value = p.base;
  id('bid-teams').innerHTML = S.teams.map(t =>
    `<button class="team-assign-btn" data-tid="${t.id}" onclick="selBidTeam(this,'${t.id}')">
      <span class="budget-pip" style="background:${t.color}"></span>
      <span style="flex:1;text-align:left">${esc(t.short||t.name)}</span>
      <span class="team-assign-budget">₹${t.budget.toFixed(1)}Cr</span>
    </button>`
  ).join('');
  hideBidErr();
}

function clearBid() {
  id('auction-bidding-zone')?.classList.add('hidden');
  S.auction.current = null;
  const stage = id('auction-reveal-stage'), inner = id('lot-inner'), idle = id('a-idle');
  if (stage) stage.classList.add('hidden');
  if (inner) inner.classList.remove('flipped');
  if (idle)  idle.style.display = '';
}

function selBidTeam(btn, tid) {
  qa('#bid-teams .team-assign-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected'); hideBidErr();
}
function showBidErr(msg) { const e = id('bid-err'); if (e) { e.textContent = msg; e.classList.remove('hidden'); } }
function hideBidErr()    { id('bid-err')?.classList.add('hidden'); }

function confirmAssign() {
  const pid = S.auction.current;
  if (!pid) { showBidErr('Draw a player first.'); return; }
  const p = player(pid);
  if (!p)  { showBidErr('Player not found.'); S.auction.current = null; return; }
  const selBtn = q('#bid-teams .team-assign-btn.selected');
  if (!selBtn) { showBidErr('Select a team.'); return; }
  const tid = selBtn.dataset.tid;
  const t   = team(tid);
  if (!t)  { showBidErr('Team not found.'); return; }
  const price = parseFloat(id('bid-price').value);
  if (isNaN(price) || price <= 0) { showBidErr('Enter a valid price.'); return; }
  if (price < p.base)   { showBidErr(`Price below base ₹${p.base}Cr.`); return; }
  if (price > t.budget) { showBidErr(`${t.name} only has ₹${t.budget.toFixed(2)}Cr.`); return; }

  p.teamId = tid; p.price = price;
  if (!t.players.includes(pid)) t.players.push(pid);
  t.budget = parseFloat((t.budget - price).toFixed(2));
  t.spent  = parseFloat(((t.spent||0) + price).toFixed(2));
  S.auction.pool = S.auction.pool.filter(i => i !== pid);
  S.auction.log.push({pid, tid, price, lot:S.auction.lot, round:S.auction.round});
  S.auction.current = null;

  save(); clearBid(); rAuction();
  toast(`${p.name} → ${t.name} for ₹${price}Cr`, 'success');
}

function markUnsold() {
  const pid = S.auction.current;
  if (!pid) { showBidErr('Draw a player first.'); return; }
  const p = player(pid) || {name: pid};
  S.auction.pool   = S.auction.pool.filter(i => i !== pid);
  if (!S.auction.unsold.includes(pid)) S.auction.unsold.push(pid);
  S.auction.current = null;
  save(); clearBid(); rAuction();
  toast(`${p.name} marked unsold.`, 'info');
}

function startReauction() {
  if (!S.auction.unsold.length) { toast('No unsold players.','warn'); return; }
  S.auction.round++;
  S.auction.drawn  = 0;
  S.auction.pool   = [...S.auction.unsold];
  S.auction.unsold = [];
  S.auction.current = null;
  save(); rAuction();
  toast(`Re-auction Round ${S.auction.round} — ${S.auction.pool.length} players.`, 'success');
}

function finaliseAuction() {
  const rem = S.auction.pool.length + S.auction.unsold.length;
  if (rem > 0 && !confirm(`${rem} players unassigned. Finalise anyway?`)) return;
  S.auction.current = null;

  // Mark 1 injury-prone player per team (randomly from lower-rated half)
  S.teams.forEach(t => {
    const tPlayers = S.players.filter(p => p.teamId === t.id)
      .sort((a, b) => (a.bat+a.bowl+a.field) - (b.bat+b.bowl+b.field));
    if (tPlayers.length > 0) {
      const maxIdx = Math.max(1, Math.floor(tPlayers.length * 0.5));
      const idx = Math.floor(Math.random() * maxIdx);
      tPlayers[idx].injuryProne = true;
    }
  });

  S.season.status    = 'league';
  S.season.currentMD = 1;
  save(); toast('Auction finalised — Season begins!', 'success');
  rHeader(); navTo('matchday');
}

/* ──────────────────── 9. SIMULATION ENGINE ──────────────────── */

function playingXI(t) {
  if (!t) return [];
  // Start with confirmed XI, filter injured/suspended
  let xi = (t.xi||[]).filter(pid => {
    const p = player(pid); return p && !p.injured && !p.suspended;
  });
  // Fill gaps from squad
  if (xi.length < 11) {
    const used = new Set(xi);
    const bench = S.players
      .filter(p => p.teamId === t.id && !p.injured && !p.suspended && !used.has(p.id))
      .sort((a, b) => (b.bat+b.bowl+b.field) - (a.bat+a.bowl+a.field));
    while (xi.length < 11 && bench.length) xi.push(bench.shift().id);
  }
  return xi.slice(0, 11);
}

function ball({ isPP, over, pm, adB, adBow, homeBonus, batter, bowler, wkts, rn, bl }) {
  // Base probabilities
  let p6=0.07, p4=0.12, p2=0.08, p1=0.32, p0=0.30, pW=0.10, pWd=0.025, pNb=0.01;

  // Aggression modifiers
  p6  = Math.max(0, p6 + adB * 0.12);
  p4  = Math.max(0, p4 + adB * 0.10);
  pW  = Math.max(0.03, pW + adB * 0.08 + adBow * 0.06);

  // Phase modifiers (over is 0-indexed)
  if (isPP) {
    p6*=1.10; p4*=1.20; p1*=0.75; p0*=0.80; pW*=0.88;
  } else if (over >= 6 && over <= 13) {
    // Middle overs — consolidation
    p6*=0.82; p4*=0.92; p0*=1.12; pW*=1.05;
  } else if (over >= 14 && over <= 15) {
    // Pre-death — acceleration
    p6*=1.18; p4*=1.12; p0*=0.88; pW*=1.10;
  } else {
    // Death overs 16-20 — high risk, high reward
    p6*=1.40; p4*=1.22; p0*=0.62; pW*=1.18; p1*=0.72;
  }

  // Pitch type
  p6 *= pm.six; p4 *= pm.four; pW *= pm.wkt;
  if (bowler?.role === 'SPIN') pW = Math.min(0.32, pW + pm.spinBonus);
  if (bowler?.role === 'PACE') pW = Math.min(0.32, pW + pm.paceBonus);

  // Batter quality (0–100 scale)
  if (batter) {
    const q = Math.min(1, (batter.bat + homeBonus) / 100);
    p6 *= 0.72 + q * 0.56;
    p4 *= 0.78 + q * 0.44;
    pW *= 1.28 - q * 0.56;
  }

  // Bowler quality
  if (bowler) {
    const q = Math.min(1, bowler.bowl / 100);
    pW *= 0.72 + q * 0.56;
    p6 *= 1.18 - q * 0.36;
  }

  // Chase pressure
  if (rn !== null && bl > 0) {
    const rr = rn / (bl / 6);
    if      (rr > 15) { p6*=1.55; pW*=1.32; p0*=0.48; }
    else if (rr > 12) { p6*=1.35; pW*=1.25; p0*=0.62; }
    else if (rr >  9) { p6*=1.15; p4*=1.10; p0*=0.80; }
    else if (rr <  5) { p0*=1.32; p6*=0.78; pW*=0.90; }
  }

  // Wickets in hand pressure
  if      (wkts >= 8) { pW*=1.22; p6*=0.78; }
  else if (wkts >= 6) { pW*=1.10; }

  // Normalize and sample
  const tot = p6+p4+p2+p1+p0+pW+pWd+pNb;
  const rv  = Math.random() * tot;
  let a = 0;
  if ((a+=p6)  > rv) return {r:6};
  if ((a+=p4)  > rv) return {r:4};
  if ((a+=p2)  > rv) return {r:2};
  if ((a+=p1)  > rv) return {r:1};
  if ((a+=p0)  > rv) return {r:0};
  if ((a+=pW)  > rv) return {r:0, w:true, how:randDismissal()};
  if ((a+=pWd) > rv) return {r:1, wd:true, extra:true};
  return {r:1, nb:true, extra:true};
}

function simInnings(batT, bowlT, batters, bowlers, venue, target) {
  const pm    = PITCH_MODS[venue?.pitch || 'balanced'];
  const adB   = ((batT.aggression  || 60) - 60) / 100;  // -0.4 to +0.4
  const adBow = ((bowlT.aggression || 60) - 60) / 100;
  const homeB = batT.venueId === venue?.id ? 3 : 0;

  let runs = 0, wkts = 0, balls = 0;
  const phases = { pp:{r:0,w:0}, mid:{r:0,w:0}, death:{r:0,w:0} };
  const bPl = {}, bwPl = {}, fow = [], log = [];

  batters.forEach(pid => bPl[pid]  = {r:0, b:0, fours:0, sixes:0, out:false, how:''});
  bowlers.forEach(pid => bwPl[pid] = {r:0, b:0, wkts:0, maidens:0});

  // Bowler rotation — max 4 overs each, sorted by bowling skill
  const bq = [...bowlers].sort((a, b) => (player(b)?.bowl||50) - (player(a)?.bowl||50));
  const bowlerOvers = {};
  let bqPtr = 0;

  function pickBowler() {
    for (let i = 0; i < bq.length; i++) {
      const idx = (bqPtr + i) % bq.length;
      const pid = bq[idx];
      if ((bowlerOvers[pid]||0) < 4) {
        bowlerOvers[pid] = (bowlerOvers[pid]||0) + 1;
        bqPtr = (idx + 1) % bq.length;
        return pid;
      }
    }
    // All bowlers exceeded max — just cycle (edge case with <5 bowlers)
    const pid = bq[bqPtr % bq.length];
    bqPtr = (bqPtr + 1) % bq.length;
    return pid;
  }

  let b1   = batters[0] || null;
  let b2   = batters[1] || null;
  let bIdx = 2;

  for (let ov = 0; ov < 20; ov++) {
    if (wkts >= 10 || (target !== null && runs >= target)) break;
    const isPP    = ov < 6;
    const phase   = ov < 6 ? 'pp' : ov < 15 ? 'mid' : 'death';
    const bowler  = pickBowler();
    let ovR = 0;

    for (let bl = 0; bl < 6; bl++) {
      if (wkts >= 10 || (target !== null && runs >= target)) break;
      balls++;
      const o = ball({
        isPP, over:ov, pm, adB, adBow, homeBonus:homeB,
        batter : b1 ? player(b1) : null,
        bowler : bowler ? player(bowler) : null,
        wkts,
        rn : target !== null ? target - runs : null,
        bl : 120 - balls,
      });

      runs += o.r; ovR += o.r;
      phases[phase].r += o.r;
      log.push({ov, bl, r:o.r, w:!!o.w, wd:!!o.wd, nb:!!o.nb});

      if (!o.extra && b1 && bPl[b1]) {
        bPl[b1].b++; bPl[b1].r += o.r;
        if (o.r === 4) bPl[b1].fours++;
        if (o.r === 6) bPl[b1].sixes++;
      }
      if (!o.extra && bwPl[bowler]) {
        bwPl[bowler].b++; bwPl[bowler].r += o.r;
      }

      if (o.w) {
        wkts++; phases[phase].w++;
        if (b1 && bPl[b1]) { bPl[b1].out = true; bPl[b1].how = o.how || 'out'; }
        if (bwPl[bowler]) bwPl[bowler].wkts++;
        fow.push({w:wkts, r:runs, ov:ov+1, bl:bl+1});
        b1 = bIdx < batters.length ? batters[bIdx++] : null;
      }

      if (o.r % 2 === 1) { const t = b1; b1 = b2; b2 = t; }
    }

    if (ovR === 0 && bwPl[bowler]) bwPl[bowler].maidens++;
    { const t = b1; b1 = b2; b2 = t; }  // rotate at end of over
    if (target !== null && runs >= target) break;
  }

  const overs  = parseFloat((Math.floor(balls/6) + (balls%6)*0.1).toFixed(1));
  const wides  = log.filter(b => b.wd).length;
  const noBalls= log.filter(b => b.nb).length;
  const byes   = Math.floor(Math.random() * 3);
  const legByes= Math.floor(Math.random() * 4);
  const extras = wides + noBalls + byes + legByes;

  return {
    tId:batT.id, runs:runs+byes+legByes, wkts, overs, log, fow,
    phases,
    ppR:phases.pp.r, ppW:phases.pp.w,
    bPl, bwPl,
    extras, extrasDetail:{wides, noBalls, byes, legByes},
  };
}

function simMatch(fix) {
  const tA = team(fix.tA), tB = team(fix.tB);
  const venue = ven(fix.venueId) || S.venues[Math.floor(Math.random()*S.venues.length)];
  const xiA = playingXI(tA), xiB = playingXI(tB);

  const tossWin = Math.random() < 0.5 ? tA : tB;
  const tossDec = Math.random() < 0.5 ? 'bat' : 'field';

  let bat1, fld1, batXI1, bowlXI1;
  if ((tossWin.id===tA.id && tossDec==='bat') || (tossWin.id===tB.id && tossDec==='field')) {
    bat1=tA; fld1=tB; batXI1=xiA; bowlXI1=xiB;
  } else {
    bat1=tB; fld1=tA; batXI1=xiB; bowlXI1=xiA;
  }

  const inn1 = simInnings(bat1, fld1, batXI1, bowlXI1, venue, null);
  const inn2 = simInnings(fld1, bat1, bowlXI1, batXI1, venue, inn1.runs + 1);

  let winId, desc, so = false;
  if (inn2.runs >= inn1.runs + 1) {
    const wktsLeft = 10 - inn2.wkts;
    winId = fld1.id; desc = `won by ${wktsLeft} wkt${wktsLeft!==1?'s':''}`;
  } else if (inn2.runs < inn1.runs) {
    const margin = inn1.runs - inn2.runs;
    winId = bat1.id; desc = `won by ${margin} run${margin!==1?'s':''}`;
  } else {
    // Tie → Super Over
    const soR = simSuperOver(bat1, fld1);
    winId = soR.win; desc = 'won the Super Over'; so = true;
  }

  const momId = pickMoM(inn1, inn2, winId);
  if (S.stats.mom[momId] !== undefined) S.stats.mom[momId]++;

  return {
    id:fix.id, md:S.season.currentMD,
    tA:tA.id, tB:tB.id, venueId:venue.id,
    tossWin:tossWin.id, tossDec,
    inn1, inn2,
    winId, desc, so,
    momPlayerId:momId,
    ts:Date.now(),
  };
}

function simSuperOver(tA, tB) {
  const soInning = () => {
    let r=0, w=0, s=0;
    for (let i=0; i<6 && w<2; i++) {
      const x = Math.random();
      if      (x < 0.12) { r+=6; s++; }
      else if (x < 0.27) { r+=4; }
      else if (x < 0.38) { w++; }
      else if (x < 0.62) { r+=1; }
    }
    return {r, w, s};
  };
  const a = soInning(), b = soInning();
  const win = a.r > b.r ? tA.id : b.r > a.r ? tB.id : a.s >= b.s ? tA.id : tB.id;
  return {a, b, win};
}

function randDismissal() {
  return ['bowled','caught','lbw','caught & bowled','run out','stumped'][Math.floor(Math.random()*6)];
}

function pickMoM(inn1, inn2, winId) {
  const score = (pid) => {
    const b1 = inn1.bPl[pid]||{}, b2 = inn2.bPl[pid]||{};
    const w1 = inn1.bwPl[pid]||{}, w2 = inn2.bwPl[pid]||{};
    const batScore = (b1.r||0) + (b2.r||0) + (b1.fours||0)*0.3 + (b1.sixes||0)*0.5 + (b2.fours||0)*0.3 + (b2.sixes||0)*0.5;
    const bowlScore = ((w1.wkts||0) + (w2.wkts||0)) * 18 - ((w1.r||0) + (w2.r||0)) * 0.05;
    return batScore + bowlScore;
  };

  const allPids = new Set([
    ...Object.keys(inn1.bPl||{}), ...Object.keys(inn2.bPl||{}),
    ...Object.keys(inn1.bwPl||{}), ...Object.keys(inn2.bwPl||{}),
  ]);

  let best = null, mx = -Infinity;
  allPids.forEach(pid => {
    // Slight preference for winning team
    const p = player(pid);
    const bonus = (p?.teamId === winId) ? 5 : 0;
    const s = score(pid) + bonus;
    if (s > mx) { mx = s; best = pid; }
  });
  return best;
}

function recalcNRR() {
  S.teams.forEach(t => { t._rf=0; t._ro=0; t._ra=0; t._rao=0; });
  S.matches.forEach(m => {
    const b  = team(m.inn1.tId), bw = team(m.inn2.tId);
    if (b)  { b._rf +=m.inn1.runs; b._ro +=Math.max(m.inn1.overs,0.1); b._ra +=m.inn2.runs; b._rao+=Math.max(m.inn2.overs,0.1); }
    if (bw) { bw._rf+=m.inn2.runs; bw._ro+=Math.max(m.inn2.overs,0.1); bw._ra+=m.inn1.runs; bw._rao+=Math.max(m.inn1.overs,0.1); }
  });
  S.teams.forEach(t => {
    t.nrr = t._ro > 0 ? parseFloat(((t._rf/t._ro) - (t._ra/t._rao)).toFixed(3)) : 0;
    delete t._rf; delete t._ro; delete t._ra; delete t._rao;
  });
}

function applyResult(result) {
  const winT = team(result.winId);
  const losId = result.winId === result.tA ? result.tB : result.tA;
  const losT  = team(losId);
  if (winT) { winT.points+=2; winT.wins++; winT.played++; winT.form=[...(winT.form||[]).slice(-4),'W']; }
  if (losT) { losT.losses++;  losT.played++; losT.form=[...(losT.form||[]).slice(-4),'L']; }
  recalcNRR();

  const seen = new Set();
  [result.inn1, result.inn2].forEach(inn => {
    Object.entries(inn.bPl||{}).forEach(([pid,s]) => {
      const bs = S.stats.bat[pid]; if (!bs) return;
      if (!seen.has(`bat_${pid}`)) { bs.matches++; seen.add(`bat_${pid}`); }
      bs.r+=s.r; bs.b+=s.b; bs.fours+=s.fours; bs.sixes+=s.sixes;
      if (s.r > bs.hs) bs.hs = s.r;
      if (s.r >= 100) bs.hundreds++;
      else if (s.r >= 50) bs.fifties++;
      if (s.out) bs.outs++;
      if (s.r >= 50) {
        const mk = `ms_${pid}_${result.id}_${s.r}`;
        if (!seen.has(mk)) {
          seen.add(mk);
          S.stats.milestones.push({type:s.r>=100?'century':'fifty', pid, matchId:result.id, val:`${s.r}(${s.b})`, md:result.md});
        }
      }
    });
    Object.entries(inn.bwPl||{}).forEach(([pid,s]) => {
      const bw = S.stats.bowl[pid]; if (!bw) return;
      if (!seen.has(`bowl_${pid}`)) { bw.matches++; seen.add(`bowl_${pid}`); }
      bw.wkts+=s.wkts; bw.runs+=s.r; bw.balls=(bw.balls||0)+s.b; bw.maidens+=s.maidens;
      if (s.wkts >= 5) {
        const mk = `5w_${pid}_${result.id}`;
        if (!seen.has(mk)) {
          seen.add(mk); bw.fiveW++;
          S.stats.milestones.push({type:'fiveWickets', pid, matchId:result.id, val:`${s.wkts}/${s.r}`, md:result.md});
        }
      }
      const [nb,nr] = (bw.best||'0/99').split('/').map(Number);
      if (s.wkts > nb || (s.wkts === nb && s.r < nr)) bw.best = `${s.wkts}/${s.r}`;
    });
  });
}

function checkMilestones(result) {
  const recent = S.stats.milestones.filter(m => m.matchId === result.id);
  const best = recent.find(m => m.type==='century') || recent.find(m => m.type==='fiveWickets') || recent.find(m => m.type==='fifty');
  if (!best) return;
  const p = player(best.pid); if (!p) return;
  const typeMap = {century:'century', fifty:'fifty', fiveWickets:'fiveWkt'};
  setTimeout(() => showMilestoneOv(typeMap[best.type]||'fifty', p, best.val), 1200);
}


/* ──────────────────── 10. MATCHDAY PAGE ──────────────────── */
function curSched() { return S.schedule.find(s => s.md === S.season.currentMD) || null; }

function rMatchday() {
  if (S.season.status === 'playoffs') { rMatchdayPlayoffs(); return; }
  const md = S.season.currentMD;
  if (!md) { se('matchday-badge','—'); return; }
  se('matchday-badge', `MD ${md} / ${S.season.totalMDs}`);

  const sched   = curSched();
  const allDone = sched?.fixtures.every(f => f.result);
  const anyDone = sched?.fixtures.some(f => f.result);
  const allXI   = S.teams.every(t => t.xi && t.xi.length === 11);
  const allLock  = S.teams.every(t => t.locked);

  const phase = allDone ? 'results' : anyDone ? 'simulate' : allLock && allXI ? 'toss' : allXI ? 'xi' : 'strategy';
  const phases = ['strategy','xi','toss','simulate','results'];
  qa('.phase-step').forEach(el => {
    const idx = phases.indexOf(phase), pidx = phases.indexOf(el.dataset.phase);
    el.classList.toggle('active', el.dataset.phase === phase);
    el.classList.toggle('done',   pidx < idx);
  });

  rMDVenues(); rMDStrategy(); rMDXI(); rMDInjuries(); rMDFixtures();
  id('matchday-postmd-card').classList.toggle('hidden', !allDone);

  const tradeOpen = md > 1 && md % S.season.tradeEvery === 1;
  const tradeEl = id('trade-window-status');
  if (tradeEl) {
    tradeEl.textContent = tradeOpen ? `🟢 Trade window OPEN — go to Admin → Trade Desk.` : `🔒 Trade window closed. Opens next at MD ${nextTradeWindow()}.`;
    tradeEl.className   = `trade-status${tradeOpen?' open':''}`;
  }
}

function rMatchdayPlayoffs() {
  se('matchday-badge', '🏆 Playoffs');
  const simCard = id('matchday-sim-card');
  if (simCard) simCard.innerHTML = `<div class="card-header"><h2 class="card-title">⚡ Playoffs</h2></div><div class="card-body"><p style="color:var(--text2);margin-bottom:12px">Manage playoff matches from Admin → Playoffs Bracket.</p><button class="btn btn-primary" onclick="navTo('admin')">Go to Playoffs →</button></div>`;
}

function rMDVenues() {
  const sched = curSched(), el = id('matchday-venues-row'); if (!el) return;
  if (!sched) { el.innerHTML = ''; return; }
  el.innerHTML = sched.fixtures.map(fix => {
    const v=ven(fix.venueId), tA=team(fix.tA), tB=team(fix.tB), pt=v?.pitch||'balanced';
    return `<div class="venue-card pitch-${pt}">
      <div class="venue-card-venue">${v ? esc(v.name) : 'TBD'}</div>
      <div class="venue-card-city">${v ? esc(v.city) : ''}</div>
      <div class="venue-card-footer">
        <span class="venue-matchup">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</span>
        <span class="pitch-badge ${pt}">${PITCH_LABELS[pt]||pt}</span>
      </div>
    </div>`;
  }).join('');
}

function rMDStrategy() {
  const el = id('matchday-strategy-grid'); if (!el) return;
  el.innerHTML = S.teams.map(t => {
    const pct = ((t.aggression-20)/80*100).toFixed(1);
    return `<div class="strategy-team-row">
      <span class="strategy-team-pip" style="background:${t.color}"></span>
      <span class="strategy-team-name">${esc(t.short||t.name)}</span>
      <div class="strategy-slider-mini"><div class="strategy-slider-thumb" style="left:${pct}%"></div></div>
      <span class="strategy-agg-value">${t.aggression}</span>
      <span class="strategy-status-badge ${t.locked?'locked':'pending'}">${t.locked?'Locked':'Pending'}</span>
      <button class="btn btn-secondary btn-sm" onclick="openXIAdmin('${t.id}')">Set XI</button>
    </div>`;
  }).join('');
}

function rMDXI() {
  const el = id('matchday-xi-grid'); if (!el) return;
  el.innerHTML = S.teams.map(t => {
    const done = t.xi && t.xi.length === 11;
    return `<div class="xi-confirm-btn ${done?'confirmed':''}" onclick="openXIAdmin('${t.id}')">
      <span class="xi-team-name">${esc(t.short||t.name)}</span>
      <span class="xi-confirm-status">${done ? `✓ XI Set (${t.xi.length})` : '⏳ Not Set'}</span>
    </div>`;
  }).join('');
  const ready = S.teams.filter(t => t.xi && t.xi.length === 11).length;
  id('matchday-xi-status').innerHTML = `<span>${ready}/${S.teams.length} teams ready</span>${ready===S.teams.length?'<span style="color:var(--green);margin-left:8px">✓ All set</span>':''}`;
}

function rMDInjuries() {
  const el = id('matchday-injury-list'); if (!el) return;
  const inj = S.players.filter(p => p.injured || p.suspended);
  if (!inj.length) { el.innerHTML = '<div class="list-empty">No injuries.</div>'; return; }
  el.innerHTML = inj.map(p => {
    const t = team(p.teamId);
    const status = p.injured ? 'Season Out 🔴' : `Out ${p.injuredMDs} MD`;
    return `<div class="injury-item">
      <span class="injury-icon">${p.injuryProne ? '⚠️' : '🤕'}</span>
      <span class="injury-player-name">${esc(p.name)}</span>
      <span class="injury-team" style="color:${t?.color||'var(--text2)'}">${t ? esc(t.short||t.name) : ''}</span>
      <span class="injury-duration">${status}</span>
    </div>`;
  }).join('');
}

function rMDFixtures() {
  const sched = curSched(), el = id('sim-fixtures-list'); if (!el) return;
  if (!sched) { el.innerHTML = '<div class="list-empty">No matchday scheduled.</div>'; return; }
  el.innerHTML = sched.fixtures.map(fix => {
    const tA=team(fix.tA), tB=team(fix.tB), done=!!fix.result;
    const win = done ? team(fix.result.winId) : null;
    return `<div class="sim-fixture-row">
      <span class="sim-fixture-matchup">
        <span style="color:${tA?.color||'var(--text)'}">${esc(tA?.short||tA?.name||'?')}</span>
        <span style="color:var(--text3)"> vs </span>
        <span style="color:${tB?.color||'var(--text)'}">${esc(tB?.short||tB?.name||'?')}</span>
      </span>
      ${done
        ? `<span class="sim-fixture-status complete">✓ ${win ? esc(win.short||win.name) : 'done'}</span>`
        : `<span class="sim-fixture-status pending">Pending</span><button class="btn btn-secondary btn-sm" onclick="simOne('${fix.id}')">Simulate</button>`}
    </div>`;
  }).join('');
}

/* ── XI Admin Modal ── */
function openXIAdmin(tid) {
  UI.xiAdmin = {teamId:tid, sel:[...(team(tid)?.xi||[])]};
  const t = team(tid); if (!t) return;
  id('modal-xi-admin-team-name').textContent = t.name;
  rXIAdminSquad(t); upXIAdminCount();
  id('modal-backdrop').classList.remove('hidden');
  id('modal-xi-admin').classList.remove('hidden');
}

function rXIAdminSquad(t) {
  const squad = S.players.filter(p => p.teamId === t.id)
    .sort((a,b) => (b.bat+b.bowl+b.field)-(a.bat+a.bowl+a.field));
  id('modal-xi-admin-squad').innerHTML = squad.map(p => {
    const sel = UI.xiAdmin.sel.includes(p.id);
    const inj = p.injured || p.suspended;
    return `<div class="squad-player-card${sel?' selected':''}${inj?' injured':''}" data-pid="${p.id}" data-role="${p.role}" onclick="toggleXIAdmin('${p.id}')">
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span class="squad-player-name">${esc(p.name)}${inj?'<span class="squad-player-injury-tag">🤕</span>':''}</span>
      <span class="squad-player-ratings">🏏${p.bat} 🎯${p.bowl} 🧤${p.field}</span>
    </div>`;
  }).join('');
}

function toggleXIAdmin(pid) {
  const p = player(pid); if (!p || p.injured || p.suspended) return;
  const idx = UI.xiAdmin.sel.indexOf(pid);
  if (idx !== -1) UI.xiAdmin.sel.splice(idx, 1);
  else {
    if (UI.xiAdmin.sel.length >= 11) { toast('XI full — remove a player first.','warn'); return; }
    UI.xiAdmin.sel.push(pid);
  }
  qa('#modal-xi-admin-squad .squad-player-card').forEach(el =>
    el.classList.toggle('selected', UI.xiAdmin.sel.includes(el.dataset.pid))
  );
  upXIAdminCount();
}

function upXIAdminCount() {
  const n = UI.xiAdmin.sel.length;
  se('modal-xi-admin-count', n);
  id('btn-confirm-xi-admin').disabled = (n !== 11);
  const badge = id('modal-xi-count-badge');
  if (badge) badge.classList.toggle('complete', n === 11);
}

function filterAdminSquad(role) {
  qa('#modal-xi-admin-squad .squad-player-card').forEach(el =>
    el.classList.toggle('hidden-by-filter', role !== 'all' && el.dataset.role !== role)
  );
  qa('#modal-xi-admin .filter-pill').forEach(p =>
    p.classList.toggle('active', p.dataset.filter === role)
  );
}

function autoPickAdminXI() {
  const t = team(UI.xiAdmin.teamId); if (!t) return;
  UI.xiAdmin.sel = playingXI(t);
  rXIAdminSquad(t); upXIAdminCount();
  toast('Auto-picked best available XI.','success');
}

function clearAdminXI() {
  UI.xiAdmin.sel = [];
  const t = team(UI.xiAdmin.teamId); if (t) rXIAdminSquad(t);
  upXIAdminCount();
}

function confirmXIAdmin() {
  const t = team(UI.xiAdmin.teamId); if (!t || UI.xiAdmin.sel.length !== 11) return;
  t.xi = [...UI.xiAdmin.sel];
  save(); closeXIAdminModal(); rMDXI(); rMatchday(); rStrategy();
  toast(`XI set for ${t.name}!`, 'success');
}

function closeXIAdminModal() {
  id('modal-backdrop').classList.add('hidden');
  id('modal-xi-admin').classList.add('hidden');
  UI.xiAdmin = {teamId:null, sel:[]};
}

function lockAllStrategies() {
  S.teams.forEach(t => t.locked = true);
  save(); rMDStrategy(); rStrategy();
  id('strategy-lock-banner')?.classList.remove('hidden');
  toast('All strategies locked — ready to simulate!','success');
}

/* ── Simulation Control ── */
function simulateAllMatches() {
  const sched = curSched(); if (!sched) return;
  const pending = sched.fixtures.filter(f => !f.result);
  if (!pending.length) { checkMDComplete(); return; }
  const notReady = S.teams.filter(t => !t.xi || t.xi.length < 11);
  if (notReady.length) {
    const names = notReady.map(t => t.short||t.name).join(', ');
    if (!confirm(`XI not set for: ${names}. Auto-pick will be used. Continue?`)) return;
  }
  const tA = team(pending[0].tA), tB = team(pending[0].tB);
  const run = () => runStaggered(pending, 0);
  if (tA && tB) showTossOv(tA, tB, run); else run();
}

function runStaggered(fixtures, idx) {
  if (idx >= fixtures.length) { checkMDComplete(); return; }
  simOne(fixtures[idx].id, () => setTimeout(() => runStaggered(fixtures, idx+1), 400));
}

function simulateNextMatch() {
  const sched = curSched(); if (!sched) return;
  const fix = sched.fixtures.find(f => !f.result);
  if (!fix) { checkMDComplete(); return; }
  const tA = team(fix.tA), tB = team(fix.tB);
  if (tA && tB) showTossOv(tA, tB, () => simOne(fix.id)); else simOne(fix.id);
}

function simOne(fixId, onDone) {
  const sched = curSched(); if (!sched) return;
  const fix = sched.fixtures.find(f => f.id === fixId);
  if (!fix || fix.result) { if (onDone) onDone(); return; }
  const result = simMatch(fix);
  fix.result = result;
  S.matches.push(result);
  applyResult(result);
  save(); rMDFixtures(); rLive(); rSidebar();
  const win = team(result.winId);
  toast(`${win?.name||'?'} ${result.desc}${result.so?' (Super Over!)':''}`, 'success');
  if (result.so) {
    const tA = team(result.tA), tB = team(result.tB);
    setTimeout(() => showSuperOverOv(tA, tB), 500);
  }
  checkMilestones(result);
  if (onDone) setTimeout(onDone, 300);
}

function checkMDComplete() {
  const sched = curSched(); if (!sched) return;
  if (sched.fixtures.every(f => f.result)) {
    id('matchday-postmd-card')?.classList.remove('hidden');
    toast('All matches done! Run injury rolls then advance.','success');
  }
}

/* ── Injury System ── */
function rollInjuries() {
  // Clear expired suspensions
  S.players.forEach(p => {
    if (p.suspended && p.injuredMDs > 0) {
      p.injuredMDs--;
      if (p.injuredMDs === 0) p.suspended = false;
    }
  });

  const md = S.season.currentMD;

  // Crisis event at 3/4 of season
  if (md === S.season.crisisMD && !S.season.crisisFired) {
    fireSeasonCrisis();
    S.season.crisisFired = true;
  }

  // Roll: ~1-2 injuries every 3-4 matchdays
  // Per matchday: 40% chance of 1, 15% chance of 2, 45% chance of none
  const roll = Math.random();
  const numInjuries = roll < 0.15 ? 2 : roll < 0.40 ? 1 : 0;
  const results = [];

  if (numInjuries > 0) {
    // Prefer injury-prone players, then random others
    const prone  = S.players.filter(p => p.injuryProne && p.teamId && !p.injured && !p.suspended);
    const others = S.players.filter(p => !p.injuryProne && p.teamId && !p.injured && !p.suspended);
    prone.sort(() => Math.random() - 0.5);
    others.sort(() => Math.random() - 0.5);
    const candidates = [...prone, ...others];

    for (let i = 0; i < Math.min(numInjuries, candidates.length); i++) {
      const p = candidates[i];
      p.suspended  = true;
      p.injuredMDs = Math.random() < 0.3 ? 2 : 1;
      const dur    = p.injuredMDs === 1 ? '1 matchday' : '2 matchdays';
      const t      = team(p.teamId);
      results.push(`🤕 ${p.name} (${t?.short||t?.name||'?'})${p.injuryProne?' ⚠️':''} — out for ${dur}`);
    }
  }

  const el = id('injury-roll-results');
  if (el) {
    el.innerHTML = results.length
      ? results.map(r => `<div class="injury-item"><span>${esc(r)}</span></div>`).join('')
      : '<p style="color:var(--green);font-size:12px;padding:8px 0">✓ No injuries this matchday.</p>';
  }

  save(); rMDInjuries();
  toast(results.length ? `${results.length} injury${results.length>1?'s':''} this matchday.` : 'No injuries this matchday.', results.length ? 'warn' : 'success');
}

function fireSeasonCrisis() {
  const available = S.players.filter(p => p.teamId && !p.injured && !p.suspended);
  if (!available.length) return;
  const victim = available[Math.floor(Math.random() * available.length)];
  const victimTeam = team(victim.teamId);
  victim.injured   = true;   // permanent — season-ending
  victim.suspended = false;
  victim.injuredMDs = 0;
  setTimeout(() => showCrisisOv(victim, victimTeam), 500);
}

function advanceMatchday() {
  const next = S.season.currentMD + 1;
  S.teams.forEach(t => { t.locked = false; });   // unlock for next MD
  if (next > S.season.totalMDs) {
    S.season.status = 'playoffs';
    setupPlayoffs();
    save();
    id('matchday-postmd-card')?.classList.add('hidden');
    toast('League stage complete! Playoffs bracket set up.','success');
    navTo('admin'); return;
  }
  S.season.currentMD = next;
  id('matchday-postmd-card')?.classList.add('hidden');
  const isTradeWindow = next > 1 && next % S.season.tradeEvery === 1;
  if (isTradeWindow) toast(`MD ${next}: Trade window OPEN! Admin → Trade Desk.`,'info',5000);
  if (S.liveSession?.autoPush) pushState();
  save(); rHeader(); rMatchday(); rSidebar();
  toast(`Matchday ${next} ready.`,'success');
}

function nextTradeWindow() {
  for (let md = (S.season.currentMD||1)+1; md <= S.season.totalMDs; md++) {
    if (md > 1 && md % S.season.tradeEvery === 1) return md;
  }
  return 'N/A';
}


/* ──────────────────── 11. LIVE PAGE ──────────────────── */
function rLive() {
  const sched   = curSched();
  const liveEl  = id('live-matches-grid');
  const idleEl  = id('live-idle-state');
  const ownEl   = id('live-own-match');
  id('live-md-label').textContent = S.season.currentMD ? `Matchday ${S.season.currentMD}` : '';

  if (!sched || ['setup','auction'].includes(S.season.status)) {
    liveEl.innerHTML = '';
    idleEl.classList.remove('hidden'); ownEl.classList.add('hidden');
    se('live-idle-msg', S.season.status === 'playoffs' ? 'Playoffs in progress — see Admin.' : 'Waiting for matchday to begin.');
    return;
  }
  idleEl.classList.add('hidden');
  liveEl.innerHTML = sched.fixtures.map(f => renderMatchCard(f)).join('') ||
    '<div class="list-empty">Awaiting simulation…</div>';
  id('nav-live-badge')?.classList.toggle('hidden', sched.fixtures.every(f => f.result));

  if (ME.teamId) {
    const own = sched.fixtures.find(f => f.tA === ME.teamId || f.tB === ME.teamId);
    if (own) {
      ownEl.classList.remove('hidden');
      id('live-own-match-card').innerHTML = renderMatchCard(own, true);
    } else ownEl.classList.add('hidden');
  } else ownEl.classList.add('hidden');
}

function renderMatchCard(fix, featured=false) {
  const tA = team(fix.tA), tB = team(fix.tB), r = fix.result;
  const cls = ['live-match-card', featured?'featured':'', r?'complete':''].filter(Boolean).join(' ');

  if (!r) return `<div class="${cls}">
    <div class="lmc-header">
      <div class="lmc-teams">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</div>
      <span style="font-family:var(--fm);font-size:10px;color:var(--text3)">Upcoming</span>
    </div>
    <div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Awaiting simulation…</div>
  </div>`;

  const i1  = r.inn1, i2 = r.inn2;
  const bt1 = team(i1.tId), bt2 = team(i2.tId);
  const win = team(r.winId);
  const v   = ven(r.venueId);

  const topBat = inn => {
    const e = Object.entries(inn.bPl||{}).sort((a,b) => b[1].r-a[1].r);
    if (!e.length) return '—';
    const [pid,s] = e[0];
    const nm = player(pid)?.name || '?';
    const last = nm.split(' ').pop();
    return `${esc(last)} ${s.r}(${s.b})${s.sixes>1?` · ${s.sixes}×6`:''}`;
  };

  const topBowl = inn => {
    const e = Object.entries(inn.bwPl||{}).filter(([,s]) => s.wkts>0)
      .sort((a,b) => b[1].wkts-a[1].wkts || a[1].r-b[1].r);
    if (!e.length) return '—';
    const [pid,s] = e[0];
    const nm = player(pid)?.name || '?';
    return `${esc(nm.split(' ').pop())} ${s.wkts}/${s.r}`;
  };

  const phaseBar = inn => {
    const ph = inn.phases || {};
    const tot = Math.max(inn.runs, 1);
    return `<div class="phase-row">
      ${['pp','mid','death'].map(k => {
        const p = ph[k]||{r:0,w:0};
        const flex = Math.max(4, Math.round((p.r/tot)*100));
        const label = k==='pp'?'PP':k==='mid'?'Mid':'Death';
        return `<div class="phase-seg ${k}-seg" style="flex:${flex}">
          <div class="phase-seg-label">${label}</div>
          <div class="phase-seg-score">${p.r}/${p.w}</div>
        </div>`;
      }).join('')}
    </div>`;
  };

  return `<div class="${cls}">
    <div class="lmc-header">
      <div class="lmc-teams">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</div>
      ${v ? `<span class="pitch-badge ${v.pitch}" style="font-size:8px;padding:2px 7px">${PITCH_LABELS[v.pitch]||v.pitch}</span>` : ''}
    </div>
    <div class="lmc-body">
      <!-- Innings 1 -->
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:2px">
        <span style="font-weight:700;font-size:11px;color:${bt1?.color||'var(--text)'};flex-shrink:0">${esc(bt1?.short||bt1?.name||'?')}</span>
        <span style="font-family:var(--fm);font-size:22px;font-weight:700;line-height:1">${i1.runs}/${i1.wkts}</span>
        <span style="font-family:var(--fm);font-size:10px;color:var(--text2)">${ovStr(i1.overs)} ov</span>
        <span style="font-size:10px;color:var(--text3);flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${topBat(i1)}</span>
      </div>
      ${phaseBar(i1)}
      <!-- Innings 2 -->
      <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px;margin-bottom:2px">
        <span style="font-weight:700;font-size:11px;color:${bt2?.color||'var(--text)'};flex-shrink:0">${esc(bt2?.short||bt2?.name||'?')}</span>
        <span style="font-family:var(--fm);font-size:22px;font-weight:700;line-height:1">${i2.runs}/${i2.wkts}</span>
        <span style="font-family:var(--fm);font-size:10px;color:var(--text2)">${ovStr(i2.overs)} ov</span>
        <span style="font-size:10px;color:var(--text3);flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${topBat(i2)}</span>
      </div>
      ${phaseBar(i2)}
      <!-- Bowlers summary -->
      <div style="font-size:10px;color:var(--text2);padding-top:6px;border-top:1px solid var(--bdr);margin-top:6px">
        🎯 ${topBowl(i1)} &nbsp;|&nbsp; ${topBowl(i2)}
      </div>
    </div>
    <div class="lmc-result" style="color:${win?.color||'var(--gold)'}">
      ${esc(win?.name||'?')} — ${esc(r.desc)}${r.so?' <span style="color:var(--gold)">⚡ (Super Over)</span>':''}
    </div>
  </div>`;
}

function ovStr(o) {
  const f = Math.floor(o), b = Math.round((o - f) * 10);
  return `${f}.${b}`;
}

/* ──────────────────── 12. STRATEGY PAGE (Admin only) ──────────────────── */
function rStrategy() {
  if (ME.role !== 'admin') { navTo('live'); return; }
  const el = id('strategy-content'); if (!el) return;
  const locked = S.teams.every(t => t.locked);
  id('strategy-lock-banner')?.classList.toggle('hidden', !locked);

  el.innerHTML = S.teams.map(t => {
    const pct = ((t.aggression-20)/80*100).toFixed(1);
    const xiOk = t.xi && t.xi.length === 11;
    const opp  = (() => {
      const sched = curSched();
      const fix = sched?.fixtures.find(f => f.tA===t.id||f.tB===t.id);
      const oppId = fix ? (fix.tA===t.id?fix.tB:fix.tA) : null;
      return oppId ? team(oppId) : null;
    })();
    return `<div class="strategy-team-card">
      <div class="strategy-team-card-header">
        <span class="budget-pip" style="background:${t.color}"></span>
        <span class="strategy-team-card-name">${esc(t.short||t.name)}</span>
        <span class="strategy-status-badge ${t.locked?'locked':'pending'}">${t.locked?'🔒 Locked':'⏳ Pending'}</span>
      </div>
      ${opp ? `<div style="font-size:11px;color:var(--text2);margin-bottom:8px">vs <strong style="color:${opp.color}">${esc(opp.name)}</strong></div>` : ''}
      <div style="margin-bottom:10px">
        <label class="form-label" style="display:flex;justify-content:space-between">
          <span>Aggression</span>
          <span id="agg-val-${t.id}" style="color:var(--ipl2);font-family:var(--fm)">${t.aggression}</span>
        </label>
        <input type="range" class="aggression-slider" min="20" max="100" step="5" value="${t.aggression}"
               ${t.locked?'disabled':''}
               oninput="setTeamAggression('${t.id}',this.value)">
        <div class="aggression-effect-breakdown" style="margin-top:6px">
          ${aggTags(t.aggression)}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="xi-status-mini ${xiOk?'ok':'pending'}">${xiOk?'✓ XI Ready':'⏳ XI Pending'}</span>
        <button class="btn btn-secondary btn-sm" onclick="openXIAdmin('${t.id}')">Set XI</button>
        ${!t.locked ? `<button class="btn btn-sm btn-primary" onclick="lockTeamStrategy('${t.id}')">Lock</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function aggTags(v) {
  const d = (v - 60) / 100;
  const f = (x, dec=0) => (x >= 0 ? '+' : '') + x.toFixed(dec) + '%';
  return `<span class="effect-tag ${d>0?'up':d<0?'down':'neu'}">6s ${f(d*12)}</span>
          <span class="effect-tag ${d>0?'up':d<0?'down':'neu'}">4s ${f(d*10)}</span>
          <span class="effect-tag ${d>0?'down':'up'}">Wkts ${f(d*8)}</span>`;
}

function setTeamAggression(tid, val) {
  const t = team(tid); if (!t || t.locked) return;
  t.aggression = parseInt(val);
  se(`agg-val-${tid}`, val);
  const breakdown = q(`[data-tid="${tid}"] .aggression-effect-breakdown`);
  // Update in place without full re-render
  const card = q(`.strategy-team-card:has([oninput*="${tid}"])`);
  if (card) {
    const bd = card.querySelector('.aggression-effect-breakdown');
    if (bd) bd.innerHTML = aggTags(parseInt(val));
  }
}

function lockTeamStrategy(tid) {
  const t = team(tid); if (!t) return;
  t.locked = true; save(); rStrategy();
  toast(`${t.name} strategy locked.`,'success');
}


/* ──────────────────── 13. POINTS TABLE ──────────────────── */
function rPoints() {
  const sorted = standings();
  id('points-md-label').textContent = S.season.currentMD ? `After MD ${S.season.currentMD}` : 'Pre-season';
  const tbody = id('points-table-body');
  if (!sorted.length) {
    tbody.innerHTML = '<tr class="table-empty-row"><td colspan="9">Season not started.</td></tr>';
    rScheduleList(); return;
  }
  const n = sorted.length;
  const maxNRR = Math.max(...sorted.map(t => Math.abs(t.nrr||0)), 0.5);
  tbody.innerHTML = sorted.map((t, i) => {
    const pos=i+1, q=pos<=4, d=pos>n-2, own=t.id===ME.teamId;
    const nrr=(t.nrr||0), nrrStr=(nrr>=0?'+':'')+nrr.toFixed(3);
    const nrrPct = Math.min(100, (Math.abs(nrr)/maxNRR)*100);
    const form   = (t.form||[]).slice(-5);
    const dots   = Array.from({length:5},(_,j) => form[j]||'na')
      .map(f => `<div class="form-dot ${f==='W'?'W':f==='L'?'L':f==='T'?'T':'na'}"></div>`).join('');
    const rowCls = [q?'qualify-zone':'', d?'danger-zone':'', own?'own-team':''].filter(Boolean).join(' ');
    return `<tr class="${rowCls}">
      <td><span class="pt-pos">${pos}</span></td>
      <td><div class="pt-team-cell"><span class="pt-team-pip" style="background:${t.color}"></span><span class="pt-team-name">${esc(t.name)}</span>${own?'<span class="pt-team-code">◀</span>':''}</div></td>
      <td class="col-num">${t.played}</td>
      <td class="col-num">${t.wins}</td>
      <td class="col-num">${t.losses}</td>
      <td class="col-num">${t.ties||0}</td>
      <td class="col-num pt-pts" style="color:var(--ipl2);font-weight:700">${t.points}</td>
      <td class="col-nrr">
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
          <span class="pt-nrr ${nrr>=0?'positive':'negative'}">${nrrStr}</span>
          <div style="width:38px;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${nrrPct}%;background:${nrr>=0?'var(--green)':'var(--red)'};border-radius:2px"></div>
          </div>
        </div>
      </td>
      <td><div class="form-strip">${dots}</div></td>
    </tr>`;
  }).join('');
  rScheduleList();
}

function rScheduleList() {
  const el = id('schedule-list-view'); if (!el) return;
  if (!S.schedule.length) { el.innerHTML = '<div class="list-empty" style="padding:16px">Schedule not yet generated.</div>'; return; }
  el.innerHTML = S.schedule.map(s => {
    const cur = s.md === S.season.currentMD;
    const tw  = s.md > 1 && s.md % S.season.tradeEvery === 1;
    return `<div class="schedule-md-group" ${cur?'style="background:rgba(255,107,26,0.025)"':''}>
      <div class="schedule-md-label">
        MD ${s.md}${cur?'<span style="color:var(--ipl2);margin-left:6px">● Now</span>':''}
        ${tw?'<span style="color:var(--green);font-size:9px;margin-left:6px">TRADE WINDOW</span>':''}
      </div>
      ${s.fixtures.map(f => {
        const tA=team(f.tA), tB=team(f.tB), v=ven(f.venueId);
        const res = f.result ? `<span style="color:${team(f.result.winId)?.color||'var(--text2)'}">${esc(team(f.result.winId)?.short||'?')} won</span>` : '—';
        return `<div class="schedule-fixture">
          <span class="schedule-matchup">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</span>
          <span class="schedule-venue">${v ? esc(v.name) : 'TBD'}</span>
          <span class="schedule-result">${res}</span>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function scheduleView(type) {
  id('schedule-list-view').classList.toggle('hidden', type !== 'list');
  id('schedule-gantt-view').classList.toggle('hidden', type !== 'gantt');
  qa('.view-toggle').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase() === type));
  if (type === 'gantt') renderGantt();
}

function renderGantt() {
  const el = id('schedule-gantt-view'); if (!el) return;
  const mds = S.season.totalMDs || 0;
  if (!mds) { el.innerHTML = '<div class="list-empty" style="padding:16px">Generate schedule in Setup first.</div>'; return; }
  const colW = Math.max(24, Math.min(38, Math.floor((el.clientWidth - 100) / mds)));
  const mdNums = Array.from({length:mds}, (_,i) => i+1);
  let html = `<div style="overflow-x:auto;padding:8px 0"><div style="display:grid;grid-template-columns:86px repeat(${mds},${colW}px);gap:2px;min-width:${86+mds*(colW+2)}px">`;
  html += `<div style="font-family:var(--fm);font-size:9px;color:var(--text3);padding:2px 4px;display:flex;align-items:center">Team</div>`;
  mdNums.forEach(n => {
    const isCur = n === S.season.currentMD;
    html += `<div style="font-family:var(--fm);font-size:8px;color:${isCur?'var(--ipl2)':'var(--text3)'};text-align:center;font-weight:${isCur?700:400};padding:2px 0">${n}</div>`;
  });
  S.teams.forEach(t => {
    html += `<div style="font-size:10px;font-weight:600;display:flex;align-items:center;gap:4px;padding:2px 4px;overflow:hidden">
      <span style="width:6px;height:6px;border-radius:50%;background:${t.color};flex-shrink:0"></span>
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.short||t.name)}</span>
    </div>`;
    mdNums.forEach(md => {
      const s = S.schedule.find(x => x.md === md);
      const f = s?.fixtures.find(x => x.tA===t.id||x.tB===t.id);
      let bg='var(--bg3)', border='';
      if (f) {
        if (f.result) {
          bg = f.result.winId===t.id ? 'rgba(16,185,129,0.55)' : 'rgba(244,63,94,0.45)';
        } else {
          bg='rgba(255,107,26,0.18)'; border='border:1px solid rgba(255,107,26,0.35);';
        }
      }
      const opp = f ? team(f.tA===t.id?f.tB:f.tA) : null;
      const title = f ? (f.result ? (f.result.winId===t.id?'Won':'Lost')+' vs '+(opp?.name||'?') : 'vs '+(opp?.name||'?')) : 'No fixture';
      html += `<div style="height:20px;background:${bg};border-radius:3px;${border}cursor:default" title="${title}"></div>`;
    });
  });
  html += `</div></div>
  <div style="display:flex;gap:14px;margin-top:8px;padding:0 8px;font-family:var(--fm);font-size:9px;color:var(--text3)">
    <span><span style="display:inline-block;width:10px;height:10px;background:rgba(16,185,129,0.55);border-radius:2px;margin-right:4px"></span>Won</span>
    <span><span style="display:inline-block;width:10px;height:10px;background:rgba(244,63,94,0.45);border-radius:2px;margin-right:4px"></span>Lost</span>
    <span><span style="display:inline-block;width:10px;height:10px;background:rgba(255,107,26,0.18);border:1px solid rgba(255,107,26,0.35);border-radius:2px;margin-right:4px"></span>Upcoming</span>
  </div>`;
  el.innerHTML = html;
}

/* ──────────────────── 14. SCORECARDS ──────────────────── */
let _sc = null;

function rScorecards() {
  const tabs = id('scorecard-match-tabs');
  if (!S.matches.length) {
    tabs.innerHTML = '<div class="selector-empty">No completed matches yet.</div>';
    id('scorecard-content').classList.add('hidden'); return;
  }
  const sorted = [...S.matches].sort((a,b) => b.ts - a.ts);
  tabs.innerHTML = sorted.map((m,i) => {
    const tA=team(m.tA), tB=team(m.tB);
    const own = ME.teamId && (m.tA===ME.teamId||m.tB===ME.teamId);
    return `<button class="sc-match-tab${own?' own-team':''}${i===0?' active':''}" onclick="showSC('${m.id}',this)">
      MD${m.md}: ${esc(tA?.short||'?')} v ${esc(tB?.short||'?')}
    </button>`;
  }).join('');
  showSC(sorted[0].id, tabs.firstElementChild);
}

function showSC(mid, btn) {
  if (btn) { qa('.sc-match-tab').forEach(t => t.classList.remove('active')); btn.classList.add('active'); }
  _sc = S.matches.find(m => m.id === mid); if (!_sc) return;
  id('scorecard-content').classList.remove('hidden');
  rSCHeader(_sc);
  id('sc-super-over-tab').classList.toggle('hidden', !_sc.so);
  switchInnings(1);
}

function rSCHeader(m) {
  const tA=team(m.tA), tB=team(m.tB), v=ven(m.venueId), win=team(m.winId);
  id('sc-match-header').innerHTML = `
    <div class="sc-match-result">
      <span style="color:${win?.color||'var(--gold)'}">${esc(win?.name||'?')}</span> — ${esc(m.desc)}
    </div>
    <div class="sc-match-meta">
      <span>🎲 Toss: ${esc(team(m.tossWin)?.name||'?')} elected to ${m.tossDec}</span>
      <span>🏟️ ${v ? esc(v.name+', '+v.city) : '—'}</span>
      <span>MD ${m.md}</span>
      ${m.so?'<span style="color:var(--gold)">⚡ Super Over</span>':''}
    </div>`;
}

function switchInnings(num) {
  qa('.innings-tab').forEach(t => t.classList.toggle('active', String(t.dataset.innings)===String(num)));
  if (!_sc) return;
  const inn  = num===1 ? _sc.inn1 : num===2 ? _sc.inn2 : null; if (!inn) return;
  const bowlInn = num===1 ? _sc.inn2 : _sc.inn1;
  rBatTable(inn); rBowlTable(inn, bowlInn);
  rPhaseBreakdown(_sc.inn1, _sc.inn2);
  rFoW(inn); rPPSummary(inn); rMoM(_sc);
}

function rBatTable(inn) {
  const t = team(inn.tId);
  id('sc-batting-team-name').textContent = t?.name||'';
  const rows = Object.entries(inn.bPl||{}).map(([pid,s]) => ({p:player(pid),s})).filter(e => e.p);
  id('sc-batting-body').innerHTML = rows.map(({p,s},i) => {
    const sr   = s.b>0 ? ((s.r/s.b)*100).toFixed(1) : '0.0';
    const own  = ME.teamId && p.teamId===ME.teamId;
    const mile = s.r>=100?'💯':s.r>=50?'⭐':'';
    return `<tr class="${i===0&&s.r>0?'top-score':''}${own?' own-player':''}">
      <td>${esc(p.name)} ${mile}</td>
      <td class="sc-col-dismissal">${s.out ? esc(s.how||'out') : '<em style="color:var(--green)">not out</em>'}</td>
      <td style="font-weight:${s.r>=50?700:400};color:${s.r>=100?'var(--gold)':s.r>=50?'var(--ipl2)':'inherit'}">${s.r}</td>
      <td>${s.b}</td><td>${s.fours}</td><td>${s.sixes}</td><td>${sr}</td>
    </tr>`;
  }).join('');
  const ed = inn.extrasDetail||{};
  const parts = [];
  if (ed.wides)   parts.push(`W ${ed.wides}`);
  if (ed.noBalls) parts.push(`NB ${ed.noBalls}`);
  if (ed.byes)    parts.push(`B ${ed.byes}`);
  if (ed.legByes) parts.push(`LB ${ed.legByes}`);
  id('sc-batting-extras').innerHTML = `
    <tr class="sc-total-row"><td colspan="2">Total</td><td>${inn.runs}</td><td colspan="2">${inn.wkts} wkts</td><td colspan="2">${ovStr(inn.overs)} ov</td></tr>
    <tr><td colspan="7" style="font-size:11px;color:var(--text2)">Extras: ${inn.extras||0}${parts.length?` (${parts.join(', ')})`:''}</td></tr>`;
}

function rBowlTable(battingInn, bowlingInn) {
  const t = team(bowlingInn.tId);
  id('sc-bowling-team-name').textContent = t?.name||'';
  const rows = Object.entries(battingInn.bwPl||{}).map(([pid,s]) => ({p:player(pid),s})).filter(e => e.p);
  id('sc-bowling-body').innerHTML = rows.map(({p,s},i) => {
    const ov  = `${Math.floor(s.b/6)}.${s.b%6}`;
    const eco = s.b>0 ? ((s.r/s.b)*6).toFixed(2) : '0.00';
    return `<tr class="${i===0&&s.wkts>0?'top-wicket':''}">
      <td>${esc(p.name)}</td><td>${ov}</td><td>${s.maidens}</td>
      <td>${s.r}</td>
      <td style="font-weight:${s.wkts>=3?700:400};color:${s.wkts>=5?'var(--purple)':s.wkts>=3?'var(--blue)':'inherit'}">${s.wkts}</td>
      <td>${eco}</td><td>0</td><td>0</td>
    </tr>`;
  }).join('');
}

function rPhaseBreakdown(inn1, inn2) {
  const el = id('sc-phase-breakdown'); if (!el) return;
  const phRow = (inn, label, color) => {
    const ph = inn.phases||{};
    const phases = [
      {k:'pp',    lbl:'Powerplay (1-6)',     r:ph.pp?.r||0,    w:ph.pp?.w||0},
      {k:'mid',   lbl:'Middle (7-15)',       r:ph.mid?.r||0,   w:ph.mid?.w||0},
      {k:'death', lbl:'Death (16-20)',       r:ph.death?.r||0, w:ph.death?.w||0},
    ];
    return `<div style="margin-bottom:12px">
      <div style="font-weight:700;font-size:12px;color:${color};margin-bottom:6px">${label}</div>
      <div style="display:flex;gap:6px">
        ${phases.map(p => `<div class="phase-seg ${p.k}-seg" style="flex:1;height:40px;padding:4px 8px;display:flex;flex-direction:column;justify-content:center">
          <div style="font-family:var(--fm);font-size:8px;opacity:0.7;text-transform:uppercase;letter-spacing:.06em">${p.lbl}</div>
          <div style="font-family:var(--fm);font-size:14px;font-weight:700">${p.r}/${p.w}</div>
        </div>`).join('')}
      </div>
    </div>`;
  };
  const t1 = team(inn1.tId), t2 = team(inn2.tId);
  el.innerHTML = phRow(inn1, `${t1?.name||'Team 1'} batting`, t1?.color||'var(--ipl2)') + phRow(inn2, `${t2?.name||'Team 2'} batting`, t2?.color||'var(--ipl2)');
}

function rFoW(inn) {
  id('sc-fow').innerHTML = (inn.fow||[]).map(f => `<span class="sc-fow-item">${f.w}-${f.r} (${f.ov}.${f.bl})</span>`).join('')
    || '<span style="color:var(--text3);font-size:11px">No wickets fell.</span>';
}

function rPPSummary(inn) {
  const ppRate = inn.ppR && inn.ppR > 0 ? ((inn.ppR||0)/6).toFixed(2) : '0.00';
  id('sc-pp-summary').innerHTML = `
    <div class="sc-pp-stat">Runs: <strong>${inn.ppR||0}</strong></div>
    <div class="sc-pp-stat">Wickets: <strong>${inn.ppW||0}</strong></div>
    <div class="sc-pp-stat">Run Rate: <strong>${ppRate}</strong></div>`;
}

function rMoM(m) {
  const el = id('sc-mom'); if (!el) return;
  const pid = m.momPlayerId || m.mom;
  const p   = player(pid);
  if (!p) { el.innerHTML = '<span style="color:var(--text3)">—</span>'; return; }
  const bs  = m.inn1.bPl[pid] || m.inn2.bPl[pid] || {};
  const bw  = m.inn1.bwPl[pid] || m.inn2.bwPl[pid] || {};
  const stat = bs.r > 0 ? `${bs.r} runs (${bs.b} balls)` : bw.wkts > 0 ? `${bw.wkts}/${bw.r}` : '—';
  el.innerHTML = `<div class="sc-mom-player">
    <span class="mom-icon">⭐</span>
    <div>
      <div class="mom-name">${esc(p.name)}</div>
      <div class="mom-perf">${esc(stat)}</div>
    </div>
  </div>`;
}

function downloadScorecard() {
  if (!_sc) return;
  const tA = team(_sc.tA), tB = team(_sc.tB);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Scorecard MD${_sc.md}</title>
    <style>body{font-family:sans-serif;padding:20px;color:#222}table{width:100%;border-collapse:collapse;margin-bottom:16px}th,td{border:1px solid #ccc;padding:6px 10px;font-size:12px}th{background:#f5f5f5}h2{margin:20px 0 8px}</style></head>
    <body>${id('scorecard-content').innerHTML}</body></html>`;
  dlFile(`md${_sc.md}_${tA?.short||'A'}_v_${tB?.short||'B'}.html`, html, 'text/html');
  toast('Scorecard downloaded!','success');
}


/* ──────────────────── 15. STATS ──────────────────── */
function rStats() { rCaps(); switchStatTab(UI.statTab||'batting'); }

function rCaps() {
  const oc = orangeCap(), pc = purpleCap();
  se('orange-cap-holder', oc ? oc.name : '—'); se('orange-cap-stat', oc ? `${oc.runs} runs` : '');
  se('purple-cap-holder', pc ? pc.name : '—'); se('purple-cap-stat', pc ? `${pc.wkts} wickets` : '');
}

function switchStatTab(tab) {
  UI.statTab = tab;
  qa('.stat-tab').forEach(b => b.classList.toggle('active', b.dataset.stat === tab));
  qa('.stat-panel').forEach(p => p.classList.toggle('active', p.id === `stats-${tab}-panel`));
  if (tab==='batting')    rStatBat();
  if (tab==='bowling')    rStatBowl();
  if (tab==='fielding')   rStatField();
  if (tab==='sixes')      rStatSixes();
  if (tab==='milestones') rMilestones();
  // Clear search
  const si = id('stat-search'); if (si) si.value = '';
}

function filterCurrentStats(val) {
  const tableMap = {batting:'stat-batting-table', bowling:'stat-bowling-table', fielding:'stat-fielding-table', sixes:'stat-sixes-table'};
  const tid = tableMap[UI.statTab]; if (!tid) return;
  const v = val.toLowerCase().trim();
  qa(`#${tid} tbody tr`).forEach(row => {
    const name = row.cells[1]?.textContent.toLowerCase()||'';
    const tm   = row.cells[2]?.textContent.toLowerCase()||'';
    row.style.display = (!v || name.includes(v) || tm.includes(v)) ? '' : 'none';
  });
}

function rStatBat() {
  const rows = S.players.filter(p => p.teamId).map(p => ({p, s:S.stats.bat[p.id]||{}}))
    .filter(({s}) => (s.matches||0)>0).sort((a,b) => (b.s.r||0)-(a.s.r||0));
  id('stat-batting-body').innerHTML = rows.map(({p,s},i) => {
    const avg = s.outs>0 ? (s.r/s.outs).toFixed(1) : (s.r||0);
    const sr  = s.b>0 ? ((s.r/s.b)*100).toFixed(1) : '0.0';
    const t   = team(p.teamId), own = p.teamId===ME.teamId;
    return `<tr class="${i===0?'stat-leader':''}${own?' own-player':''}">
      <td>${i+1}</td>
      <td><span style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:${t?.color||'var(--text3)'}"></span>${esc(p.name)}${p.injuryProne?'<span title="Injury-prone" style="margin-left:3px;font-size:9px">⚠️</span>':''}</span></td>
      <td>${esc(t?.short||t?.name||'')}</td><td>${s.matches||0}</td>
      <td style="font-weight:700;color:var(--ipl2)">${s.r||0}</td>
      <td>${s.hs||0}</td><td>${avg}</td><td>${sr}</td>
      <td>${s.fifties||0}</td><td>${s.hundreds||0}</td><td>${s.sixes||0}</td><td>${s.fours||0}</td>
    </tr>`;
  }).join('') || '<tr class="table-empty-row"><td colspan="12">No batting data yet.</td></tr>';
}

function rStatBowl() {
  const rows = S.players.filter(p => p.teamId).map(p => ({p, s:S.stats.bowl[p.id]||{}}))
    .filter(({s}) => (s.matches||0)>0).sort((a,b) => (b.s.wkts||0)-(a.s.wkts||0));
  const ovs  = s => s.balls ? parseFloat((Math.floor(s.balls/6)+(s.balls%6)*0.1).toFixed(1)) : 0;
  const eco  = s => s.balls>0 ? ((s.runs/s.balls)*6).toFixed(2) : '0.00';
  const avg  = s => s.wkts>0 ? (s.runs/s.wkts).toFixed(1) : '—';
  id('stat-bowling-body').innerHTML = rows.map(({p,s},i) => {
    const t=team(p.teamId), own=p.teamId===ME.teamId;
    return `<tr class="${i===0?'stat-leader':''}${own?' own-player':''}">
      <td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(t?.short||t?.name||'')}</td><td>${s.matches||0}</td>
      <td style="font-weight:700;color:var(--purple)">${s.wkts||0}</td>
      <td>${s.runs||0}</td><td>${ovs(s)}</td><td>${avg(s)}</td><td>${eco(s)}</td>
      <td>${esc(s.best||'0/0')}</td><td>${s.fiveW||0}</td>
    </tr>`;
  }).join('') || '<tr class="table-empty-row"><td colspan="11">No bowling data yet.</td></tr>';
}

function rStatField() {
  const rows = S.players.filter(p => p.teamId).map(p => ({p, s:S.stats.field[p.id]||{}}))
    .filter(({s}) => (s.catches||0)+(s.stumpings||0)+(s.runOuts||0)>0)
    .sort((a,b) => ((b.s.catches||0)+(b.s.stumpings||0))-((a.s.catches||0)+(a.s.stumpings||0)));
  id('stat-fielding-body').innerHTML = rows.map(({p,s},i) =>
    `<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(team(p.teamId)?.short||'')}</td><td>${s.catches||0}</td><td>${s.stumpings||0}</td><td>${s.runOuts||0}</td></tr>`
  ).join('') || '<tr class="table-empty-row"><td colspan="6">No fielding data yet.</td></tr>';
}

function rStatSixes() {
  const rows = S.players.filter(p => p.teamId).map(p => ({p, s:S.stats.bat[p.id]||{}}))
    .filter(({s}) => (s.sixes||0)>0).sort((a,b) => (b.s.sixes||0)-(a.s.sixes||0));
  id('stat-sixes-body').innerHTML = rows.map(({p,s},i) =>
    `<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(team(p.teamId)?.short||'')}</td><td style="font-weight:700;color:var(--gold)">${s.sixes||0}</td><td>${s.fours||0}</td></tr>`
  ).join('') || '<tr class="table-empty-row"><td colspan="5">No sixes data yet.</td></tr>';
}

function rMilestones() {
  const icons = {century:'💯', fifty:'⭐', fiveWickets:'🎳'};
  id('milestones-list').innerHTML = (S.stats.milestones||[]).length
    ? [...S.stats.milestones].reverse().map(m => {
        const p = player(m.pid);
        return `<div class="milestone-entry">
          <span class="milestone-entry-icon">${icons[m.type]||'🌟'}</span>
          <div class="milestone-entry-detail">
            <div class="milestone-entry-name">${p ? esc(p.name) : '?'} — ${esc(m.type)}</div>
            <div class="milestone-entry-stat">${esc(String(m.val||''))}</div>
          </div>
          <span class="milestone-entry-md">MD ${m.md}</span>
        </div>`;
      }).join('')
    : '<div class="list-empty">No milestones yet.</div>';
}

function exportStatsCsv(type) {
  let rows = [];
  if (type === 'batting') {
    rows = [['Name','Team','M','Runs','HS','Avg','SR','50s','100s','6s','4s']];
    S.players.filter(p => p.teamId).forEach(p => {
      const s = S.stats.bat[p.id]||{};
      const avg = s.outs>0?(s.r/s.outs).toFixed(1):'—', sr=s.b>0?((s.r/s.b)*100).toFixed(1):'0.0';
      rows.push([p.name,team(p.teamId)?.name||'',s.matches||0,s.r||0,s.hs||0,avg,sr,s.fifties||0,s.hundreds||0,s.sixes||0,s.fours||0]);
    });
  } else {
    rows = [['Name','Team','M','Wkts','Runs','Overs','Avg','Econ','Best','5W']];
    S.players.filter(p => p.teamId).forEach(p => {
      const s = S.stats.bowl[p.id]||{};
      const ov=s.balls?parseFloat((Math.floor(s.balls/6)+(s.balls%6)*0.1).toFixed(1)):0;
      const avg=s.wkts>0?(s.runs/s.wkts).toFixed(1):'—', eco=s.balls>0?((s.runs/s.balls)*6).toFixed(2):'0.00';
      rows.push([p.name,team(p.teamId)?.name||'',s.matches||0,s.wkts||0,s.runs||0,ov,avg,eco,s.best||'0/0',s.fiveW||0]);
    });
  }
  dlFile(`ipl_${type}_stats.csv`, rows.map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'), 'text/csv');
  toast(`${type} stats CSV downloaded!`,'success');
}

/* ──────────────────── 16. REPORTS / ANALYTICS ──────────────────── */
function rReports() {
  rReportsOverview(); rReportsRosters();
}

function rReportsOverview() {
  const el = id('reports-overview'); if (!el) return;
  if (!S.teams.length) { el.innerHTML = '<div class="list-empty">Season not started yet.</div>'; return; }
  const sorted  = standings();
  const injCount = S.players.filter(p => p.injured||p.suspended).length;
  const oc = orangeCap(), pc = purpleCap();
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:12px">
      <div style="background:var(--bg3);border-radius:var(--r);padding:10px;text-align:center">
        <div style="font-family:var(--fm);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">Matchday</div>
        <div style="font-family:var(--fd);font-size:22px;font-weight:700;color:var(--ipl2)">${S.season.currentMD||0}/${S.season.totalMDs}</div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--r);padding:10px;text-align:center">
        <div style="font-family:var(--fm);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">Matches</div>
        <div style="font-family:var(--fd);font-size:22px;font-weight:700;color:var(--green)">${S.matches.length}</div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--r);padding:10px;text-align:center">
        <div style="font-family:var(--fm);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">Injuries</div>
        <div style="font-family:var(--fd);font-size:22px;font-weight:700;color:${injCount>0?'var(--red)':'var(--green)'}">${injCount}</div>
      </div>
      <div style="background:var(--bg3);border-radius:var(--r);padding:10px;text-align:center">
        <div style="font-family:var(--fm);font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.10em;margin-bottom:4px">Leaders</div>
        <div style="font-size:11px;margin-top:2px">🟠 ${esc(oc?.name||'—')}</div>
        <div style="font-size:11px;margin-top:2px">🟣 ${esc(pc?.name||'—')}</div>
      </div>
    </div>
    ${sorted.slice(0,4).map((t,i) =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg3);border-radius:var(--r);margin-bottom:4px">
        <span style="font-family:var(--fm);font-size:11px;color:var(--text3);width:16px">${i+1}</span>
        <span style="width:8px;height:8px;border-radius:50%;background:${t.color};flex-shrink:0"></span>
        <span style="font-size:12px;font-weight:600;flex:1">${esc(t.name)}</span>
        <span style="font-family:var(--fm);font-size:12px;color:var(--ipl2);font-weight:700">${t.points}</span>
        <span style="font-family:var(--fm);font-size:10px;color:var(--text2)">${(t.nrr>=0?'+':'')+t.nrr.toFixed(3)}</span>
      </div>`
    ).join('')}`;
}

function rReportsRosters() {
  const el = id('reports-rosters'); if (!el) return;
  if (!S.teams.length) { el.innerHTML = '<div class="list-empty">No teams yet.</div>'; return; }

  // Team filter pills
  const filterEl = id('reports-team-filter');
  if (filterEl && !filterEl.children.length) {
    filterEl.innerHTML = `<button class="filter-pill active" data-tf="all" onclick="filterReportsTeam('all')">All</button>` +
      S.teams.map(t => `<button class="filter-pill" data-tf="${t.id}" onclick="filterReportsTeam('${t.id}')" style="border-color:${t.color}40">${esc(t.short||t.name)}</button>`).join('');
  }

  el.innerHTML = S.teams.map(t => {
    const players = S.players.filter(p => p.teamId === t.id)
      .sort((a,b) => (b.bat+b.bowl+b.field)-(a.bat+a.bowl+a.field));
    if (!players.length) return '';
    return `<div class="reports-team-section" data-team="${t.id}" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid ${t.color}40">
        <span style="width:12px;height:12px;border-radius:50%;background:${t.color}"></span>
        <span style="font-family:var(--fd);font-size:16px;font-weight:700">${esc(t.name)}</span>
        <span style="font-size:11px;color:var(--text2)">${t.points} pts · ₹${t.spent?.toFixed(1)||0}Cr spent · Budget left: ₹${t.budget?.toFixed(1)||0}Cr</span>
      </div>
      <div style="overflow-x:auto">
        <table class="roster-table">
          <thead><tr><th>Player</th><th>Role</th><th>BAT</th><th>BOWL</th><th>FLD</th><th>KEEP</th><th>Price</th><th>Status</th><th>Season</th></tr></thead>
          <tbody>
            ${players.map(p => {
              const bs = S.stats.bat[p.id]||{}, bw=S.stats.bowl[p.id]||{};
              const inj = p.injured ? '🔴 Season Out' : p.suspended ? `🟡 MD-${p.injuredMDs}` : '🟢';
              const prone = p.injuryProne ? ' ⚠️' : '';
              const seasonStat = (bs.r||0)>0 ? `${bs.r}R, ${bs.fifties||0}×50` : (bw.wkts||0)>0 ? `${bw.wkts}W` : '—';
              return `<tr>
                <td style="font-weight:600">${esc(p.name)}${prone}</td>
                <td><span class="squad-player-role-badge ${p.role}">${p.role}</span></td>
                <td class="rating-cell" style="color:var(--role-bat)">${p.bat}</td>
                <td class="rating-cell" style="color:var(--role-pace)">${p.bowl}</td>
                <td class="rating-cell" style="color:var(--green)">${p.field}</td>
                <td class="rating-cell" style="color:var(--role-wk)">${p.keep||0}</td>
                <td style="font-family:var(--fm);font-size:10px;color:var(--gold)">₹${p.price||p.base}Cr</td>
                <td style="font-size:11px">${inj}</td>
                <td style="font-family:var(--fm);font-size:10px;color:var(--text2)">${seasonStat}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }).join('');
}

function filterReportsTeam(tid) {
  qa('.reports-team-section').forEach(el => el.style.display = (tid==='all'||el.dataset.team===tid)?'':'none');
  qa('[data-tf]').forEach(b => b.classList.toggle('active', b.dataset.tf===tid));
}

function downloadAnalytics() {
  const sorted = standings();
  const ptRows = sorted.map((t,i) => `<tr>
    <td>${i+1}</td>
    <td style="font-weight:bold;color:${t.color}">${t.name}</td>
    <td>${t.played}</td><td>${t.wins}</td><td>${t.losses}</td>
    <td style="font-weight:bold">${t.points}</td>
    <td>${(t.nrr>=0?'+':'')+t.nrr.toFixed(3)}</td>
    <td>${(t.form||[]).slice(-5).join(' ')}</td>
  </tr>`).join('');

  const venueRows = S.venues.map(v => `<tr><td>${v.name}</td><td>${v.city}</td><td>${PITCH_LABELS[v.pitch]||v.pitch}</td></tr>`).join('');

  const teamSections = S.teams.map(t => {
    const players = S.players.filter(p => p.teamId===t.id)
      .sort((a,b) => (b.bat+b.bowl+b.field)-(a.bat+a.bowl+a.field));
    const rows = players.map(p => {
      const bs=S.stats.bat[p.id]||{}, bw=S.stats.bowl[p.id]||{};
      const inj = p.injured?'🔴 SEASON OUT':p.suspended?`🟡 Out ${p.injuredMDs} MD`:'🟢 Available';
      return `<tr>
        <td>${p.name}${p.injuryProne?' ⚠️':''}</td>
        <td style="font-weight:bold">${p.role}</td>
        <td>${p.bat}</td><td>${p.bowl}</td><td>${p.field}</td><td>${p.keep||0}</td>
        <td>₹${p.price||p.base}Cr</td>
        <td>${bs.r||0}R / ${bw.wkts||0}W</td>
        <td>${inj}</td>
      </tr>`;
    }).join('');
    return `<h2 style="color:${t.color};border-left:4px solid ${t.color};padding-left:10px;margin-top:24px">${t.name} (${t.short||''})</h2>
    <p style="font-size:12px;color:#666;margin-bottom:8px">${t.points} pts · ${t.wins}W ${t.losses}L · NRR ${(t.nrr>=0?'+':'')+t.nrr.toFixed(3)} · Budget: ₹${t.budget?.toFixed(1)||0}Cr remaining</p>
    <table><thead><tr style="background:#f0f0f0"><th>Player</th><th>Role</th><th>BAT</th><th>BOWL</th><th>FLD</th><th>KEEP</th><th>Price</th><th>Season</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');

  const oc=orangeCap(), pc=purpleCap();
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${S.season.name} — Analytics Report</title>
<style>
body{font-family:Arial,sans-serif;padding:20px;color:#1a1a1a;max-width:1100px;margin:0 auto;line-height:1.5}
h1{font-size:26px;border-bottom:3px solid #ff6b1a;padding-bottom:10px;color:#ff6b1a}
h2{font-size:17px;margin-top:20px}
h3{font-size:14px;color:#555;margin:14px 0 4px}
table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}
th,td{border:1px solid #ddd;padding:6px 9px;text-align:left}
th{background:#f4f4f4;font-weight:bold}
tr:nth-child(even){background:#fafafa}
.badge{display:inline-block;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:bold}
.tip{background:#fff8e1;border-left:3px solid #ffc107;padding:8px 12px;margin:8px 0;font-size:12px}
@media print{body{padding:10px}h2{page-break-before:auto}}
</style></head>
<body>
<h1>📊 ${S.season.name} — Analytics Report</h1>
<p style="color:#666;font-size:12px">Generated: ${new Date().toLocaleString()} | Matchday ${S.season.currentMD||0}/${S.season.totalMDs} | ${S.matches.length} matches played</p>
<div style="display:flex;gap:20px;flex-wrap:wrap;margin:12px 0">
  <div style="background:#fff3e0;padding:10px 16px;border-radius:8px;border-left:4px solid #ff8f00"><strong>🟠 Orange Cap:</strong> ${oc?oc.name+' ('+oc.runs+' runs)':'—'}</div>
  <div style="background:#f3e5f5;padding:10px 16px;border-radius:8px;border-left:4px solid #7b1fa2"><strong>🟣 Purple Cap:</strong> ${pc?pc.name+' ('+pc.wkts+' wkts)':'—'}</div>
</div>
<h2>📊 Points Table</h2>
<table><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th><th>Form</th></tr></thead><tbody>${ptRows}</tbody></table>
<h2>🏟️ Venue &amp; Pitch Guide</h2>
<table><thead><tr><th>Venue</th><th>City</th><th>Pitch Type</th></tr></thead><tbody>${venueRows}</tbody></table>
<div class="tip"><strong>Strategy by Pitch:</strong> Batting Paradise → bat first, push aggression. Spin Friendly → pick 2+ spinners, consider fielding first. Pace Heaven → your pacers bowl early, elect to field. Balanced → go with squad strengths.</div>
<div class="tip"><strong>Aggression Guide:</strong> 20-39 Cautious | 40-59 Calculated | 60 Balanced | 61-79 Attacking | 80-100 Ultra (high risk/reward). ⚠️ = injury-prone player. 🔴 = season out. 🟡 = temporarily injured.</div>
<h2>👥 Team Rosters &amp; Player Ratings</h2>
${teamSections}
</body></html>`;

  dlFile(`${S.season.name.replace(/\s+/g,'_')}_analytics.html`, html, 'text/html');
  toast('Full analytics report downloaded!','success');
}


/* ──────────────────── 17. ADMIN PAGE ──────────────────── */
function rAdmin() {
  rTeamCodes(); rTradeDeskSelects(); rTradeLogRender(); rPlayoffsBracket();
  se('admin-session-id', S.liveSession?.blobId || '—');
  const twOpen = S.season.currentMD > 1 && S.season.currentMD % S.season.tradeEvery === 1;
  se('admin-trade-window-status', twOpen ? '🟢 Open' : '🔒 Closed');
  if (twOpen) id('admin-trade-window-status')?.classList.add('open');
}

function rTeamCodes() {
  const el = id('admin-codes-list'); if (!el) return;
  el.innerHTML = S.teams.map(t => {
    const code = S.codes[t.id] || '????';
    return `<div class="code-row">
      <span class="code-pip" style="background:${t.color}"></span>
      <span class="code-team-name">${esc(t.short||t.name)}</span>
      <code class="code-pill">${code}</code>
      <button class="btn-icon" title="Copy" onclick="navigator.clipboard.writeText('${code}').then(()=>toast('Code copied!','success'))">📋</button>
    </div>`;
  }).join('') || '<div class="list-empty">No teams.</div>';
}

function generateAllCodes() {
  S.teams.forEach(t => { S.codes[t.id] = rCode(4); });
  save(); rTeamCodes(); toast('All codes regenerated!','success');
}

function rTradeDeskSelects() {
  const tA = id('trade-team-a'), tB = id('trade-team-b');
  if (!tA || !tB) return;
  const opts = '<option value="">— Select —</option>' +
    S.teams.map(t => `<option value="${t.id}">${esc(t.short||t.name)}</option>`).join('');
  tA.innerHTML = opts; tB.innerHTML = opts;
  tA.onchange = () => fillTradePlayers(tA.value, 'trade-player-a');
  tB.onchange = () => fillTradePlayers(tB.value, 'trade-player-b');
}

function fillTradePlayers(tid, selectId) {
  const sel = id(selectId); if (!sel) return;
  if (!tid) { sel.innerHTML = '<option value="">— Select player —</option>'; return; }
  const players = S.players.filter(p => p.teamId === tid && !p.injured && !p.suspended)
    .sort((a,b) => (b.bat+b.bowl+b.field)-(a.bat+a.bowl+a.field));
  sel.innerHTML = '<option value="">— Select player —</option>' +
    players.map(p => `<option value="${p.id}">${esc(p.name)} (${p.role})</option>`).join('');
}

function executeTrade() {
  const twOpen = S.season.currentMD > 1 && S.season.currentMD % S.season.tradeEvery === 1;
  if (!twOpen) { toast('Trade window is closed.','warn'); return; }
  const tAid = id('trade-team-a')?.value, tBid = id('trade-team-b')?.value;
  const pAid = id('trade-player-a')?.value, pBid = id('trade-player-b')?.value;
  if (!tAid||!tBid||!pAid||!pBid) { toast('Select both teams and players.','warn'); return; }
  if (tAid === tBid) { toast('Teams must be different.','warn'); return; }
  const pA = player(pAid), pB = player(pBid);
  const tA = team(tAid), tB = team(tBid);
  if (!pA||!pB||!tA||!tB) { toast('Invalid trade.','error'); return; }

  // Swap team assignments
  pA.teamId = tBid; pB.teamId = tAid;
  tA.players = tA.players.filter(p => p !== pAid); tA.players.push(pBid);
  tB.players = tB.players.filter(p => p !== pBid); tB.players.push(pAid);
  // Remove from XIs if present
  tA.xi = (tA.xi||[]).filter(p => p !== pAid);
  tB.xi = (tB.xi||[]).filter(p => p !== pBid);

  const log = {
    id: `tr_${Date.now()}`,
    md: S.season.currentMD,
    fromA:tAid, toA:pBid, fromB:tBid, toB:pAid,
    pA:pAid, pB:pBid, ts:Date.now(),
  };
  S.tradeLog.push(log);
  save(); rTradeLogRender(); rAdmin();
  toast(`Trade: ${esc(pA.name)} ⇄ ${esc(pB.name)}`, 'success');
}

function rTradeLogRender() {
  const el = id('trade-log'); if (!el) return;
  if (!S.tradeLog.length) { el.innerHTML = '<div class="list-empty">No trades this season.</div>'; return; }
  el.innerHTML = [...S.tradeLog].reverse().map(tr => {
    const pA=player(tr.pA), pB=player(tr.pB), tA=team(tr.fromA), tB=team(tr.fromB);
    return `<div class="trade-log-entry">
      <span class="trade-log-md">MD ${tr.md}</span>
      <span class="trade-log-detail">
        <strong>${pA?esc(pA.name):'?'}</strong>
        <span style="color:${tA?.color||'var(--text2)'}"> → ${tB?esc(tB.short||tB.name):'?'}</span>
      </span>
      <span style="color:var(--text3)">⇄</span>
      <span class="trade-log-detail">
        <strong>${pB?esc(pB.name):'?'}</strong>
        <span style="color:${tB?.color||'var(--text2)'}"> → ${tA?esc(tA.short||tA.name):'?'}</span>
      </span>
    </div>`;
  }).join('');
}

/* ── Playoffs ── */
function setupPlayoffs() {
  const s = standings();
  if (s.length < 4) { toast('Need 4+ teams for playoffs.','warn'); return; }
  S.playoffs = {
    q1:   {tA:s[0].id, tB:s[1].id, result:null},
    elim: {tA:s[2].id, tB:s[3].id, result:null},
    q2:   {tA:null,    tB:null,    result:null},
    final:{tA:null,    tB:null,    result:null},
    champion: null,
  };
  save();
}

function rPlayoffsBracket() {
  if (!S.playoffs) {
    id('admin-playoffs-status').textContent = S.season.status==='playoffs'?'Setting up':'League stage';
    id('playoffs-sim-actions')?.classList.add('hidden'); return;
  }
  const po = S.playoffs;
  const fmt = (tid) => { const t=team(tid); return t?`<span style="color:${t.color}">${esc(t.short||t.name)}</span>`:'TBD'; };
  const fmtRes = (res) => {
    if (!res) return '';
    const w=team(res.winId); return `<div style="font-size:10px;color:${w?.color||'var(--text2)'}">✓ ${esc(w?.name||'?')} won</div>`;
  };
  id('bracket-q1').innerHTML    = `${fmt(po.q1?.tA)} vs ${fmt(po.q1?.tB)}${fmtRes(po.q1?.result)}`;
  id('bracket-elim').innerHTML  = `${fmt(po.elim?.tA)} vs ${fmt(po.elim?.tB)}${fmtRes(po.elim?.result)}`;
  id('bracket-q2').innerHTML    = `${fmt(po.q2?.tA)||'Q1 Loser'} vs ${fmt(po.q2?.tB)||'Elim Winner'}${fmtRes(po.q2?.result)}`;
  id('bracket-final').innerHTML = `${fmt(po.final?.tA)||'Q1 Winner'} vs ${fmt(po.final?.tB)||'Q2 Winner'}${fmtRes(po.final?.result)}`;

  const next = nextPlayoffStage();
  id('admin-playoffs-status').textContent = po.champion ? '🏆 Champion crowned!' : (next ? `Next: ${next}` : 'Playoffs');
  const actEl = id('playoffs-sim-actions');
  if (actEl) actEl.classList.toggle('hidden', !next || !!po.champion);
}

function nextPlayoffStage() {
  const po = S.playoffs; if (!po) return null;
  if (!po.q1?.result || !po.elim?.result) return 'Q1 & Eliminator';
  if (!po.q2?.tA) {
    po.q2.tA = po.q1.result.winId === po.q1.tA ? po.q1.tB : po.q1.tA;
    po.q2.tB = po.elim.result.winId;
  }
  if (!po.q2?.result) return 'Qualifier 2';
  if (!po.final?.tA) {
    po.final.tA = po.q1.result.winId;
    po.final.tB = po.q2.result.winId;
  }
  if (!po.final?.result) return 'Final';
  return null;
}

function simulatePlayoffMatch() {
  const po = S.playoffs; if (!po) return;
  const sim = (slot, tAid, tBid, label) => {
    if (!tAid || !tBid) return;
    const tA=team(tAid), tB=team(tBid);
    const xiA=playingXI(tA), xiB=playingXI(tB);
    const venue=S.venues[Math.floor(Math.random()*S.venues.length)];
    const fakeFix={id:`po_${slot}`,tA:tAid,tB:tBid,venueId:venue.id,result:null};
    const result=simMatch(fakeFix);
    S.matches.push(result);
    applyResult(result);
    return result;
  };

  const stage = nextPlayoffStage();
  if (!stage) { toast('All playoff matches done!','info'); return; }

  if (!po.q1.result || !po.elim.result) {
    if (!po.q1.result) po.q1.result = sim('q1', po.q1.tA, po.q1.tB, 'Q1');
    if (!po.elim.result) po.elim.result = sim('elim', po.elim.tA, po.elim.tB, 'Eliminator');
    po.q2.tA = po.q1.result.winId===po.q1.tA ? po.q1.tB : po.q1.tA;
    po.q2.tB = po.elim.result.winId;
  } else if (!po.q2.result) {
    po.q2.result = sim('q2', po.q2.tA, po.q2.tB, 'Q2');
    po.final.tA = po.q1.result.winId;
    po.final.tB = po.q2.result.winId;
  } else if (!po.final.result) {
    po.final.result = sim('final', po.final.tA, po.final.tB, 'Final');
    po.champion = po.final.result.winId;
    save(); rPlayoffsBracket(); rSidebar();
    setTimeout(() => showChampionReveal(po.champion), 600);
    return;
  }
  save(); rPlayoffsBracket(); rSidebar();
  const win = team(nextPlayoffStage() ? (po.q1.result?.winId||po.elim.result?.winId) : po.final?.result?.winId);
  toast(`Playoffs updated! Next: ${nextPlayoffStage()||'Champion!'}`, 'success');
}

function changePassword() {
  const np = id('new-password')?.value?.trim();
  if (!np || np.length < 4) { toast('Password must be at least 4 chars.','warn'); return; }
  S.season.adminPassword = np;
  save(); toast('Password updated!','success');
  id('new-password').value = '';
}

function copySessionId() {
  navigator.clipboard.writeText(S.liveSession?.blobId||'').then(()=>toast('Session ID copied!','success'));
}

function toggleAutoPush(v) { if (S.liveSession) S.liveSession.autoPush = v; save(); }

function toggleProjectorView() {
  document.body.classList.toggle('projector-mode');
  toast(document.body.classList.contains('projector-mode') ? 'Projector mode ON' : 'Projector mode OFF','info');
}

function confirmReset() {
  id('modal-backdrop').classList.remove('hidden');
  id('modal-reset').classList.remove('hidden');
  id('reset-confirm-input').value = '';
}

function executeReset() {
  if (id('reset-confirm-input')?.value?.trim() !== 'RESET') { toast('Type RESET to confirm.','warn'); return; }
  S = freshState(); save();
  closeModal(); logout();
  toast('Season reset.','info');
}

/* ── Session sync (stub implementation) ── */
async function createSession() {
  const key = rCode(8).toLowerCase();
  S.liveSession = { blobId: key, autoPush: false };
  save(); se('admin-session-id', key);
  toast('Session created: ' + key,'success');
}

async function pushState() {
  if (!S.liveSession?.blobId) { toast('Create a session first.','warn'); return; }
  const payload = JSON.stringify(S);
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b`, {
      method:'POST',
      headers:{'Content-Type':'application/json','X-Bin-Name':S.liveSession.blobId,'X-Access-Key':'$2b$10$hidden'},
      body: payload,
    });
    if (res.ok) toast('State pushed!','success');
    else toast('Push failed (no bin configured).','warn');
  } catch(e) { toast('Push failed — check network.','error'); }
}

function startPoll() {
  if (!S.liveSession?.blobId) return;
  clearInterval(UI.pollTimer);
  UI.pollTimer = setInterval(fetchSession, 12000);
}

async function fetchSession() {
  if (!S.liveSession?.blobId) return;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${S.liveSession.blobId}/latest`, {
      headers:{'X-Access-Key':'$2b$10$hidden'},
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.record) {
      S = patch(data.record); save(); fullRefresh();
    }
  } catch(e) {}
}


/* ──────────────────── 18. MODALS & OVERLAYS ──────────────────── */

function closeModal(e) {
  if (e && e.target !== id('modal-backdrop')) return;
  id('modal-backdrop').classList.add('hidden');
  qa('.modal').forEach(m => m.classList.add('hidden'));
}

function openPlayerModal(pid) {
  const p = player(pid); if (!p) return;
  const t = team(p.teamId);
  id('modal-player-title').textContent = p.name;
  id('modal-player-role-badge').textContent = p.role;
  id('modal-player-role-badge').className   = `role-badge squad-player-role-badge ${p.role}`;
  id('modal-player-team').textContent       = t ? t.name : '—';
  id('modal-player-team').style.color       = t?.color || 'var(--text2)';
  id('modal-player-price').textContent      = p.price ? `₹${p.price}Cr` : `Base ₹${p.base}Cr`;

  const bars = [{l:'Batting',v:p.bat},{l:'Bowling',v:p.bowl},{l:'Fielding',v:p.field}];
  if (p.role === 'WK') bars.push({l:'Keeping',v:p.keep});
  id('modal-player-ratings').innerHTML = bars.map(b =>
    `<div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span>${b.l}</span><strong>${b.v}</strong>
      </div>
      <div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${b.v}%;background:var(--ipl1);border-radius:3px;transition:width .5s ease"></div>
      </div>
    </div>`
  ).join('');

  const injEl = id('modal-player-injury');
  if (p.injured) {
    injEl.classList.remove('hidden');
    id('modal-injury-mds').textContent = 'rest of season';
    injEl.style.color = 'var(--red)';
  } else if (p.suspended) {
    injEl.classList.remove('hidden');
    id('modal-injury-mds').textContent = p.injuredMDs;
    injEl.style.color = 'var(--orange)';
  } else injEl.classList.add('hidden');

  id('modal-backdrop').classList.remove('hidden');
  id('modal-player').classList.remove('hidden');
}

/* ── Toss Overlay ── */
function showTossOv(tA, tB, cb) {
  const ov = id('overlay-toss'); if (!ov) { if(cb) cb(); return; }
  id('toss-team-a').textContent = tA.name;
  id('toss-team-b').textContent = tB.name;
  id('toss-result').classList.add('hidden');
  const btn = id('btn-toss-continue');
  if (btn) btn.style.display = 'none';
  ov.classList.remove('hidden');

  const coin = id('toss-coin');
  coin?.classList.remove('flipping');
  void coin?.offsetWidth;
  coin?.classList.add('flipping');

  const winner = Math.random() < 0.5 ? tA : tB;
  const dec    = Math.random() < 0.5 ? 'bat' : 'field';

  setTimeout(() => {
    id('toss-winner-name').textContent = winner.name;
    id('toss-winner-name').style.color = winner.color;
    id('toss-decision').textContent    = `elects to ${dec} first`;
    id('toss-result').classList.remove('hidden');
    if (btn) { btn.style.display = ''; btn.onclick = () => { ov.classList.add('hidden'); if (cb) cb(); }; }
  }, 1800);
}

function closeToss() { id('overlay-toss')?.classList.add('hidden'); }

/* ── Milestone Overlay ── */
function showMilestoneOv(type, p, stat) {
  const cfg = {
    century:   {icon:'💯', title:'CENTURY!',   cls:'milestone-century'},
    fifty:     {icon:'⭐', title:'FIFTY!',      cls:'milestone-fifty'},
    fiveWkt:   {icon:'🎳', title:'5 WICKETS!', cls:'milestone-fivewkt'},
    century_:  {icon:'💯', title:'100 UP!',     cls:'milestone-century'},
  };
  const c = cfg[type] || cfg.fifty;
  const ov = id('overlay-milestone'); if (!ov) return;
  se('milestone-icon', c.icon);
  se('milestone-title', c.title);
  se('milestone-player', p.name);
  se('milestone-stat', String(stat||''));
  ov.className = `overlay overlay-milestone ${c.cls}`;
  ov.classList.remove('hidden');
  spawnConfetti(id('milestone-confetti'), 25);
  setTimeout(() => ov.classList.add('hidden'), 3500);
}

/* ── Super Over Overlay ── */
function showSuperOverOv(tA, tB) {
  const ov = id('overlay-super-over'); if (!ov) return;
  const a = id('so-team-a'), b = id('so-team-b');
  if (a) { a.querySelector('.so-team-name').textContent = tA?.name||'?'; a.style.borderColor = tA?.color||'var(--ipl2)'; }
  if (b) { b.querySelector('.so-team-name').textContent = tB?.name||'?'; b.style.borderColor = tB?.color||'var(--ipl2)'; }
  ov.classList.remove('hidden');
}

function startSuperOver() { id('overlay-super-over')?.classList.add('hidden'); }

/* ── Crisis Overlay ── */
function showCrisisOv(victim, victimTeam) {
  const ov = id('overlay-crisis'); if (!ov) return;
  se('crisis-player-name', victim.name);
  se('crisis-team-name', victimTeam ? (victimTeam.short||victimTeam.name) : '');
  spawnCrosses(id('crisis-crosses'));
  ov.classList.remove('hidden');
}

function dismissCrisis() { id('overlay-crisis')?.classList.add('hidden'); }

/* ── Champion Reveal — 7-stage sequence ── */
let _champStage = 0;

function showChampionReveal(winId) {
  const ov = id('overlay-champion'); if (!ov) return;
  const win = team(winId);
  _champStage = 0;
  qa('.champ-stage').forEach((s, i) => s.classList.toggle('active', i === 0));
  qa('.champ-stage').forEach(s => s.classList.remove('hidden'));
  ov.classList.remove('hidden');

  // Runner up
  const sorted = standings();
  const ruTeam = sorted.find(t => t.id !== winId) || sorted[1];
  if (ruTeam) {
    se('champ-runner-up-name', ruTeam.name);
    se('champ-runner-up-pts', `${ruTeam.points} pts`);
    id('champ-runner-up-name').style.color = ruTeam.color;
  }
  se('champ-winner-name', win?.name||'Champion!');
  if (id('champ-winner-name')) id('champ-winner-name').style.color = win?.color||'var(--gold)';
  id('btn-champ-dismiss').style.display = 'none';

  const advance = () => { _champStage++; runChampStage(); };
  const stages = [1200, 1800, 2200, 1800, 2800, 0];
  let total = 0;
  stages.forEach((delay, i) => {
    total += delay || 0;
    if (delay > 0) setTimeout(advance, total);
  });
  // Show dismiss button at end
  setTimeout(() => {
    id('btn-champ-dismiss').style.display = '';
    spawnConfetti(id('champ-confetti'), 60);
  }, total + 400);
}

function runChampStage() {
  qa('.champ-stage').forEach((s, i) => {
    s.classList.toggle('active', i === _champStage);
  });
}

function dismissChampion() {
  id('overlay-champion')?.classList.add('hidden');
  setTimeout(() => showAwardsCeremony(), 400);
}

/* ── Awards Ceremony ── */
const AWARDS = [
  {icon:'🏏', name:'Orange Cap', desc:'Most Runs',    stat: () => { const oc=orangeCap(); return oc ? `${oc.name} — ${oc.runs} runs` : 'No data'; }},
  {icon:'🎯', name:'Purple Cap', desc:'Most Wickets', stat: () => { const pc=purpleCap(); return pc ? `${pc.name} — ${pc.wkts} wickets` : 'No data'; }},
  {icon:'💥', name:'Six Machine', desc:'Most Sixes',
    stat: () => {
      const p = S.players.filter(x=>x.teamId).map(x=>({x,s:S.stats.bat[x.id]||{}})).sort((a,b)=>(b.s.sixes||0)-(a.s.sixes||0))[0];
      return p ? `${p.x.name} — ${p.s.sixes||0} sixes` : 'No data';
    }
  },
  {icon:'⭐', name:'Man of the Match', desc:'Most MoM Awards',
    stat: () => {
      const e = Object.entries(S.stats.mom||{}).sort((a,b)=>b[1]-a[1])[0];
      if (!e) return 'No data';
      const p=player(e[0]); return p ? `${p.name} — ${e[1]} awards` : 'No data';
    }
  },
  {icon:'🏆', name:'Champion', desc:'IPL MUN Season Champion',
    stat: () => { const w=team(S.playoffs?.champion); return w ? w.name : 'TBD'; }
  },
];

let _awardIdx = 0;

function showAwardsCeremony() {
  _awardIdx = 0;
  const ov = id('overlay-awards'); if (!ov) return;
  ov.classList.remove('hidden');
  rAwardProgress(); presentAward(0);
}

function presentAward(idx) {
  const aw = AWARDS[idx]; if (!aw) return;
  se('award-icon-display', aw.icon);
  se('award-name-display', aw.name + ' — ' + aw.desc);
  se('award-winner-display', aw.stat());
  id('btn-next-award').classList.toggle('hidden', idx >= AWARDS.length - 1);
  id('btn-close-awards').classList.toggle('hidden', idx < AWARDS.length - 1);
  spawnConfetti(id('award-confetti'), 18);
  rAwardProgress();
}

function nextAward() {
  _awardIdx = Math.min(_awardIdx + 1, AWARDS.length - 1);
  presentAward(_awardIdx);
}

function rAwardProgress() {
  id('awards-progress').innerHTML = AWARDS.map((_, i) =>
    `<span class="award-progress-dot${i===_awardIdx?' active':i<_awardIdx?' done':''}"></span>`
  ).join('');
}

function closeAwards() { id('overlay-awards')?.classList.add('hidden'); }

/* ──────────────────── 19. CONFETTI & EFFECTS ──────────────────── */
function spawnConfetti(container, count) {
  if (!container) return;
  container.innerHTML = '';
  const colors = ['var(--ipl1)','var(--ipl2)','var(--gold)','var(--green)','var(--blue)','#ec4899','#a855f7','#06b6d4'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${Math.random()*30}%;
      width:${4+Math.random()*7}px;
      height:${5+Math.random()*9}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()<0.5?'50%':'2px'};
      animation:confettiFall ${1.2+Math.random()*2}s ease-in forwards;
      animation-delay:${Math.random()*0.6}s;
      transform:rotate(${Math.random()*360}deg);
    `;
    container.appendChild(el);
  }
}

function spawnCrosses(container) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'crisis-cross';
    el.textContent = '✕';
    el.style.cssText = `
      position:absolute;
      left:${10+Math.random()*80}%;
      top:${10+Math.random()*80}%;
      font-size:${14+Math.random()*20}px;
      color:rgba(244,63,94,${0.4+Math.random()*0.5});
      animation:crossFade ${0.8+Math.random()*1.2}s ease-in-out forwards;
      animation-delay:${Math.random()*0.4}s;
    `;
    container.appendChild(el);
  }
}

/* ──────────────────── 20. UTILITY FUNCTIONS ──────────────────── */
const id    = (s) => document.getElementById(s);
const q     = (s) => document.querySelector(s);
const qa    = (s) => Array.from(document.querySelectorAll(s));
const se    = (i, v) => { const e=id(i); if (e) e.textContent=v; };
const esc   = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const team  = (id_) => S.teams.find(t => t.id === id_) || null;
const player= (id_) => S.players.find(p => p.id === id_) || null;
const ven   = (id_) => S.venues.find(v => v.id === id_) || null;

function standings() {
  return [...S.teams].sort((a,b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.nrr    !== a.nrr)    return b.nrr    - a.nrr;
    if (b.wins   !== a.wins)   return b.wins   - a.wins;
    return a.name.localeCompare(b.name);
  });
}

function orangeCap() {
  const rows = S.players.filter(p => p.teamId && (S.stats.bat[p.id]?.r||0) > 0)
    .map(p => ({...p, runs:S.stats.bat[p.id]?.r||0}))
    .sort((a,b) => b.runs-a.runs);
  return rows[0] || null;
}

function purpleCap() {
  const rows = S.players.filter(p => p.teamId && (S.stats.bowl[p.id]?.wkts||0) > 0)
    .map(p => ({...p, wkts:S.stats.bowl[p.id]?.wkts||0}))
    .sort((a,b) => b.wkts-a.wkts);
  return rows[0] || null;
}

function rCode(n) {
  return Array.from({length:n}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
}

function toast(msg, type='info', duration=3000) {
  const c = id('toast-container'); if (!c) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, duration);
}


/* ──────────────────── 21. BOOT ──────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Try to load state from URL first (share links), then localStorage
  const fromURL = loadFromURL();
  if (!fromURL) load();

  fillDelegateTeams();

  if (fromURL) {
    id('login-state-loaded')?.classList.remove('hidden');
    toast('Session loaded from share link.','info',4000);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal(e);
      qa('.overlay').forEach(ov => {
        if (!ov.classList.contains('hidden')) {
          // Don't close champion/awards overlays on escape
          if (!ov.id.includes('champion') && !ov.id.includes('awards')) {
            ov.classList.add('hidden');
          }
        }
      });
    }
    // Admin quick-nav with Alt+key
    if (ME.role === 'admin' && e.altKey) {
      const map = {'1':'setup','2':'auction','3':'matchday','4':'live','5':'strategy','6':'points','7':'scorecards','8':'stats','9':'reports','0':'admin'};
      if (map[e.key]) { e.preventDefault(); navTo(map[e.key]); }
    }
  });

  // Sidebar toggle for mobile
  const hamburger = q('.sidebar-toggle');
  if (hamburger && window.innerWidth < 640) {
    UI.sidebarOpen = false;
    id('sidebar')?.classList.add('collapsed');
  }

  // Trade desk selects: update player list when team changes
  document.addEventListener('change', e => {
    if (e.target.id === 'trade-team-a') fillTradePlayers(e.target.value, 'trade-player-a');
    if (e.target.id === 'trade-team-b') fillTradePlayers(e.target.value, 'trade-player-b');
  });
});