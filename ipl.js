/* ═══════════════════════════════════════════════════════════
   IPL MUN Season Manager v3.0  ·  ipl.js
   Complete rewrite — single source of truth, no overrides
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────────────────────
   1. DESIGN TOKENS & DEFAULTS
───────────────────────────────────────────────────────── */
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

const PITCH_LABELS = {bat:'🌟 Batting Paradise',spin:'🌀 Spin Friendly',pace:'💨 Pace Heaven',balanced:'⚖️ Balanced'};
const PITCH_MODS = {
  bat:     {six:1.18, four:1.18, wkt:0.88, spinBonus:0,    paceBonus:0},
  spin:    {six:0.92, four:0.92, wkt:1.05, spinBonus:0.08, paceBonus:0},
  pace:    {six:1.05, four:1.10, wkt:1.05, spinBonus:0,    paceBonus:0.07},
  balanced:{six:1.00, four:1.00, wkt:1.00, spinBonus:0,    paceBonus:0},
};
const ROLE_COLORS = {BAT:'#ff8c00',WK:'#f5c842',AR:'#10b981',PACE:'#3b82f6',SPIN:'#a855f7'};
const TEAM_COLORS = ['#ff6b1a','#3b82f6','#10b981','#a855f7','#f43f5e','#06b6d4','#f5c842','#14b8a6','#ec4899','#84cc16'];

/* ─────────────────────────────────────────────────────────
   2. STATE
───────────────────────────────────────────────────────── */
function freshState() {
  return {
    v: '3.1',
    season: {
      name:'IPL MUN Season 1', status:'setup',
      adminPassword:'chair2025', currentMD:0, totalMDs:14,
      tradeEvery:2, crisisMD:0, crisisFired:false,
    },
    cfg: {numTeams:8, budget:90},
    teams:   [],  // {id,name,short,color,venueId,budget,spent,players[],xi[],aggression:60,locked:false,points,wins,losses,ties,played,nrr,form[]}
    players: [],  // {id,name,role,bat,bowl,field,keep,base,price,teamId,injured,injuredMDs,suspended}
    venues:  VENUES.map(v=>({...v})),
    schedule:[],  // [{md, fixtures:[{id,tA,tB,venueId,result}]}]
    matches: [],  // completed match objects
    auction: {pool:[],unsold:[],log:[],lot:0,round:1,drawn:0,current:null},
    codes:   {},  // teamId → 4-char code
    tradeLog:[],
    playoffs:null,
    stats: {bat:{},bowl:{},field:{},mom:{},milestones:[]},
  };
}

let S   = freshState();             // global state
let ME  = {role:null,teamId:null};  // session (not persisted)
let UI  = {page:null,sidebarOpen:true,xiAdmin:{teamId:null,sel:[]}};

/* ─────────────────────────────────────────────────────────
   3. PERSISTENCE
───────────────────────────────────────────────────────── */
const SK = 'ipl_mun_v31';

function save() {
  try { localStorage.setItem(SK, JSON.stringify(S)); } catch(e) { toast('Storage full — export a backup.','warn'); }
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
  s.auction = { ...d.auction,  ...s.auction };
  s.stats   = { ...d.stats,    ...s.stats };
  s.cfg     = { ...d.cfg,      ...s.cfg };
  s.season  = { ...d.season,   ...s.season };
  s.teams   = (s.teams  ||[]).map(t=>({aggression:60,locked:false,xi:[],points:0,wins:0,losses:0,ties:0,played:0,nrr:0,form:[],players:[],spent:0,...t}));
  s.players = (s.players||[]).map(p=>({injured:false,injuredMDs:0,suspended:false,price:0,...p}));
  if (!s.codes)    s.codes    = {};
  if (!s.tradeLog) s.tradeLog = [];
  return s;
}

/* Export / Import */
function exportState() {
  const json = JSON.stringify(S);
  try {
    const c = LZString.compressToEncodedURIComponent(json);
    dl(`ipl_mun_${(S.season.name||'season').replace(/\s+/g,'_')}.ipl`, c, 'text/plain');
    toast('Exported!','success');
  } catch(e) { dl('ipl_mun.json', json, 'application/json'); }
}
function importState() { document.getElementById('import-file').click(); }
document.addEventListener('change', e => {
  if (e.target.id !== 'import-file') return;
  const f = e.target.files[0]; if(!f) return;
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
function dl(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content],{type}));
  a.download = name; a.click();
}

/* Share link */
function generateShareLink() {
  const slim = JSON.parse(JSON.stringify(S));
  (slim.matches||[]).forEach(m=>{delete m.innings1?.ballLog;delete m.innings2?.ballLog;});
  const url = `${location.origin}${location.pathname}?s=${LZString.compressToEncodedURIComponent(JSON.stringify(slim))}`;
  const inp = document.getElementById('share-url-input');
  inp.value = url;
  document.getElementById('admin-share-url').classList.remove('hidden');
  document.getElementById('admin-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`;
  document.getElementById('admin-qr').classList.remove('hidden');
}
function copyShareUrl() {
  navigator.clipboard.writeText(document.getElementById('share-url-input').value)
    .then(()=>toast('Link copied!','success'));
}
function loadFromURL() {
  const p = new URLSearchParams(location.search).get('s');
  if (!p) return false;
  try { S = patch(JSON.parse(LZString.decompressFromEncodedURIComponent(p))); save(); return true; }
  catch(e) { return false; }
}

/* ─────────────────────────────────────────────────────────
   4. AUTH & SESSION
───────────────────────────────────────────────────────── */
function switchTab(tab) {
  ['admin','delegate'].forEach(t=>{
    q(`[data-tab="${t}"]`).classList.toggle('active',t===tab);
    q(`[data-tab="${t}"]`).setAttribute('aria-selected',t===tab);
    id(`login-panel-${t}`).classList.toggle('hidden',t!==tab);
  });
}
function loginAdmin() {
  const pwd = id('admin-password').value;
  const err = id('admin-login-error');
  if (pwd !== S.season.adminPassword) {
    err.textContent='Wrong password.'; err.classList.remove('hidden');
    id('admin-password').value=''; return;
  }
  ME = {role:'admin',teamId:null};
  err.classList.add('hidden');
  launch();
}
function loginDelegate() {
  const sess = id('delegate-session-id').value.trim();
  const tid  = id('delegate-team-select').value;
  const code = id('delegate-team-code').value.toUpperCase().trim();
  const err  = id('delegate-login-error');
  if (!tid)  { err.textContent='Select your team.'; err.classList.remove('hidden'); return; }
  if (!code) { err.textContent='Enter your team code.'; err.classList.remove('hidden'); return; }
  if (S.codes[tid] !== code) { err.textContent='Invalid code — ask the chair.'; err.classList.remove('hidden'); return; }
  const go = () => { ME={role:'delegate',teamId:tid}; err.classList.add('hidden'); launch(); };
  if (sess) fetchSession(sess, go); else go();
}
function fillDelegateTeams() {
  const sel = id('delegate-team-select');
  sel.innerHTML = '<option value="">— pick your team —</option>';
  S.teams.forEach(t=>{ const o=document.createElement('option'); o.value=t.id; o.textContent=t.name; sel.appendChild(o); });
}
function logout() {
  ME={role:null,teamId:null};
  clearInterval(UI.pollTimer);
  id('app').classList.add('hidden');
  id('screen-login').classList.add('active');
  id('admin-password').value='';
}
function launch() {
  id('screen-login').classList.remove('active');
  const app = id('app');
  app.classList.remove('hidden');
  app.setAttribute('data-role', ME.role);
  applyRole();
  fullRefresh();
  go(ME.role==='admin' ? (S.season.status==='setup'?'setup':'matchday') : 'live');
  if (ME.role==='delegate') startPoll();
}
function applyRole() {
  const admin = ME.role==='admin';
  qa('.admin-only').forEach(el=>el.classList.toggle('hidden',!admin));
  id('header-team-pill').classList.toggle('hidden',!ME.teamId);
  if (ME.teamId) {
    const t = team(ME.teamId);
    if (t) { id('header-team-name').textContent=t.name; id('header-team-color').style.background=t.color; }
  }
}

/* ─────────────────────────────────────────────────────────
   5. NAVIGATION
───────────────────────────────────────────────────────── */
function go(page) {
  qa('.page').forEach(p=>p.classList.remove('active'));
  qa('.nav-tab').forEach(t=>t.classList.remove('active'));
  const pEl = id(`page-${page}`), tEl = q(`[data-page="${page}"]`);
  if (pEl) pEl.classList.add('active');
  if (tEl) tEl.classList.add('active');
  UI.page = page;
  renderPage(page);
}
function renderPage(p) {
  const map = {
    setup:rSetup, auction:rAuction, matchday:rMatchday,
    live:rLive, strategy:rStrategy, points:rPoints,
    scorecards:rScorecards, stats:rStats, admin:rAdmin,
  };
  if (map[p]) map[p]();
}
function fullRefresh() {
  rSidebar(); rHeader(); fillDelegateTeams();
  if (UI.page) renderPage(UI.page);
}
function toggleSidebar() {
  UI.sidebarOpen = !UI.sidebarOpen;
  id('sidebar').classList.toggle('collapsed',!UI.sidebarOpen);
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
  if (!sorted.length) { el.innerHTML='<div class="sidebar-empty">Season not started</div>'; return; }
  const n = S.teams.length;
  el.innerHTML = sorted.map((t,i)=>{
    const pos=i+1, nrr=(t.nrr>=0?'+':'')+t.nrr.toFixed(3);
    const cls=['standings-row',pos<=4?'qualify':'',pos>n-2?'danger':'',t.id===ME.teamId?'own-team':''].filter(Boolean).join(' ');
    return `<div class="${cls}"><span class="sr-pos">${pos}</span><span class="sr-pip" style="background:${t.color}"></span><span class="sr-name">${esc(t.short||t.name)}</span><span class="sr-pts">${t.points}</span><span class="sr-nrr">${nrr}</span></div>`;
  }).join('');
  const oc=orangeCap(), pc=purpleCap();
  const caps=id('sidebar-caps');
  caps.innerHTML=(oc?`<div class="cap-mini"><span class="cap-mini-icon">🟠</span>${esc(oc.name)}</div>`:'')+
                 (pc?`<div class="cap-mini"><span class="cap-mini-icon">🟣</span>${esc(pc.name)}</div>`:'');
}

/* ─────────────────────────────────────────────────────────
   6. SETUP PAGE
───────────────────────────────────────────────────────── */
function rSetup() {
  id('cfg-season-name').value    = S.season.name;
  id('cfg-admin-password').value = S.season.adminPassword;
  id('cfg-auction-budget').value = S.cfg.budget;
  id('cfg-num-teams').value      = S.cfg.numTeams;
  rTeamBuilder(); rVenueList();
}
function rTeamBuilder() {
  const el = id('team-builder-list');
  if (!S.teams.length) { el.innerHTML='<div class="team-builder-empty">No teams — click "Add Team".</div>'; return; }
  el.innerHTML = S.teams.map((t,i)=>`
    <div class="team-builder-row">
      <input class="form-input" type="text" placeholder="Team name" value="${esc(t.name)}"
             oninput="S.teams[${i}].name=this.value">
      <input class="form-input" type="text" placeholder="Short (MI)" value="${esc(t.short||'')}" maxlength="4"
             oninput="S.teams[${i}].short=this.value">
      <select class="form-select" onchange="S.teams[${i}].venueId=this.value">
        <option value="">Home venue</option>
        ${S.venues.map(v=>`<option value="${v.id}" ${v.id===t.venueId?'selected':''}>${esc(v.name)}</option>`).join('')}
      </select>
      <input type="color" class="team-color-swatch" value="${t.color||'#ff6b1a'}"
             oninput="S.teams[${i}].color=this.value">
      <button class="btn btn-danger btn-sm" onclick="rmTeam(${i})">✕</button>
    </div>`).join('');
}
function addTeamRow() {
  S.teams.push({
    id:`t_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    name:`Team ${S.teams.length+1}`, short:'',
    color: TEAM_COLORS[S.teams.length % TEAM_COLORS.length],
    venueId:'', budget:S.cfg.budget, spent:0,
    players:[], xi:[], aggression:60, locked:false,
    points:0,wins:0,losses:0,ties:0,played:0,nrr:0,form:[],
  });
  rTeamBuilder();
}
function rmTeam(i) { S.teams.splice(i,1); rTeamBuilder(); }
function rVenueList() {
  id('venue-list').innerHTML = S.venues.map((v,i)=>`
    <div class="venue-row">
      <div class="venue-name">${esc(v.name)}, ${esc(v.city)}</div>
      <select class="form-select" onchange="S.venues[${i}].pitch=this.value;rVenueList()">
        ${['bat','spin','pace','balanced'].map(pt=>`<option value="${pt}" ${v.pitch===pt?'selected':''}>${pt[0].toUpperCase()+pt.slice(1)}</option>`).join('')}
      </select>
      <span class="pitch-badge ${v.pitch}">${PITCH_LABELS[v.pitch]||v.pitch}</span>
    </div>`).join('');
}
function switchImport(tab) {
  qa('.import-tab').forEach(t=>t.classList.toggle('active',t.dataset.import===tab));
  id('import-csv').classList.toggle('hidden',tab!=='csv');
  id('import-sheets').classList.toggle('hidden',tab!=='sheets');
}
function parsePlayerImport() {
  const raw = id('player-csv').value.trim();
  if (!raw) { toast('Paste CSV data first.','warn'); return; }
  const lines = raw.split('\n').map(l=>l.trim()).filter(Boolean);
  const hdr   = lines[0].toLowerCase().split(',').map(h=>h.trim());
  const gi    = k => hdr.indexOf(k);
  const parsed = lines.slice(1).map((ln,i)=>{
    const c = ln.split(',').map(x=>x.trim());
    return {
      id:`p_${Date.now()}_${i}`,
      name:    c[gi('name')]   || c[0]   || `Player ${i+1}`,
      role:   (c[gi('role')]   || 'BAT').toUpperCase(),
      bat:  parseInt(c[gi('bat')]   || c[gi('batting')]  || c[2]) || 50,
      bowl: parseInt(c[gi('bowl')]  || c[gi('bowling')]  || c[3]) || 30,
      field:parseInt(c[gi('field')] || c[gi('fielding')] || c[4]) || 60,
      keep: parseInt(c[gi('keep')]  || c[gi('keeping')]  || c[5]) || 0,
      base: parseFloat(c[gi('baseprice')] || c[gi('base price')] || c[6]) || 1.0,
      price:0, teamId:null, injured:false, injuredMDs:0, suspended:false,
    };
  }).filter(p=>p.name && p.name.trim());
  window._preview = parsed;
  const prev = id('import-preview');
  prev.classList.remove('hidden');
  prev.innerHTML = `<table class="sc-table" style="margin-top:10px">
    <thead><tr><th>Name</th><th>Role</th><th>Bat</th><th>Bowl</th><th>Field</th><th>Base ₹Cr</th></tr></thead>
    <tbody>${parsed.map(p=>`<tr><td>${esc(p.name)}</td><td><span class="squad-player-role-badge ${p.role}">${p.role}</span></td><td>${p.bat}</td><td>${p.bowl}</td><td>${p.field}</td><td>${p.base}</td></tr>`).join('')}</tbody>
  </table><p style="margin-top:8px;font-size:11px;color:var(--text2)">${parsed.length} players found.</p>`;
  toast(`${parsed.length} players parsed — confirm to lock.`,'info');
}
function confirmPlayerImport() {
  if (!window._preview) { toast('Preview first.','warn'); return; }
  S.players = window._preview;
  S.auction.pool = S.players.map(p=>p.id);
  window._preview = null;
  save(); toast(`${S.players.length} players imported!`,'success');
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
  // Reset budgets
  S.teams.forEach(t=>{ t.budget=S.cfg.budget; t.spent=0; });
  // Generate schedule
  genSchedule();
  // Init stats
  S.players.forEach(p=>{
    S.stats.bat[p.id]  = {r:0,b:0,fours:0,sixes:0,hs:0,fifties:0,hundreds:0,matches:0,outs:0};
    S.stats.bowl[p.id] = {wkts:0,runs:0,balls:0,maidens:0,matches:0,fiveW:0,best:'0/0'};
    S.stats.field[p.id]= {catches:0,stumpings:0,runOuts:0};
    S.stats.mom[p.id]  = 0;
  });
  // Team codes
  S.teams.forEach(t=>{ if(!S.codes[t.id]) S.codes[t.id]=rCode(4); });
  S.season.status    = 'auction';
  S.season.currentMD = 0;
  S.season.crisisMD  = Math.ceil(S.season.totalMDs * 0.75);
  save(); toast('Setup saved — proceed to Auction.','success');
  rHeader(); go('auction');
}

/* ─────────────────────────────────────────────────────────
   7. SCHEDULE GENERATION
───────────────────────────────────────────────────────── */
function genSchedule() {
  const ids  = S.teams.map(t=>t.id);
  const mds  = (ids.length - 1) * 2;
  S.season.totalMDs = mds;
  S.schedule = [];
  const rounds = rrPairs(ids);
  [...rounds, ...rounds.map(r=>r.map(([a,b])=>[b,a]))].forEach((round, idx)=>{
    const md = idx+1;
    S.schedule.push({ md, fixtures: round.map(([tA,tB])=>{
      const home = S.teams.find(t=>t.id===tA);
      const vid  = home?.venueId || S.venues[idx % S.venues.length]?.id;
      return {id:`f${md}_${tA}_${tB}`,tA,tB,venueId:vid,result:null};
    })});
  });
}
function rrPairs(ids) {
  const list = [...ids]; if(list.length%2!==0) list.push('BYE');
  const rounds = [];
  for (let r=0; r<list.length-1; r++) {
    const round = [];
    for (let i=0; i<list.length/2; i++) {
      const a=list[i], b=list[list.length-1-i];
      if(a!=='BYE'&&b!=='BYE') round.push([a,b]);
    }
    rounds.push(round);
    list.splice(1,0,list.pop());
  }
  return rounds;
}

/* ─────────────────────────────────────────────────────────
   8. AUCTION
───────────────────────────────────────────────────────── */
function rAuction() {
  // Build the page structure fresh if needed
  if (!id('auction-bidding-zone')) buildAuctionUI();
  rBudgets(); rPool(); rAuctionLog();
  upAuctionHeader();
  // Restore active bidding player if any
  if (S.auction.current) {
    const p = player(S.auction.current);
    if (p) showBid(p); else clearBid();
  } else clearBid();
  checkReauction();
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
          <span style="font-family:var(--fm);font-size:10px;color:var(--text3)">Lot <span id="a-lot-cur">0</span> / <span id="a-lot-tot">0</span></span>
        </div>
        <div class="card-body" style="text-align:center">
          <div id="a-idle" style="padding:24px 0;color:var(--text3)">
            <div style="font-size:40px;margin-bottom:8px">🎰</div>
            <div style="font-size:13px">Press Draw to reveal a player</div>
          </div>
          <div id="auction-stage-1" class="auction-stage hidden">
            <div class="auction-lot-card">
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
          <div style="margin-top:14px;display:flex;gap:8px;justify-content:center">
            <button class="btn btn-large btn-primary" id="btn-draw" onclick="drawLot()">🎰 Draw Next Lot</button>
          </div>
        </div>
      </div>

      <div id="auction-bidding-zone" class="card hidden" style="border-color:rgba(255,140,0,0.30)">
        <div class="card-header" style="background:rgba(255,107,26,0.05)">
          <h2 class="card-title">🏏 Now Bidding — <span id="bid-player-name" style="color:var(--ipl2)"></span></h2>
          <span id="bid-lot-badge" style="font-family:var(--fm);font-size:10px;color:var(--text3)"></span>
        </div>
        <div class="card-body">
          <div id="bid-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"></div>
          <div style="margin-bottom:12px">
            <label class="form-label">Final Price <span class="form-unit">₹ Cr</span></label>
            <input id="bid-price" class="form-input" type="number" step="0.25" min="0"
                   style="font-size:20px;font-weight:700;color:var(--gold);font-family:var(--fm);max-width:180px">
          </div>
          <div style="font-family:var(--fm);font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);font-weight:700;margin-bottom:8px">Select Team:</div>
          <div id="bid-teams" class="auction-team-assign-grid"></div>
          <div id="bid-err" class="login-error hidden" style="margin-top:10px"></div>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
            <button class="btn btn-large btn-primary" onclick="confirmBid()">✓ Confirm Assignment</button>
            <button class="btn btn-large btn-secondary" onclick="markUnsold()">✕ Mark Unsold</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📝 Log</h2>
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
        <div class="card-header"><h2 class="card-title">👤 Pool <span id="a-pool-count" class="card-badge">0</span></h2></div>
        <div id="a-pool" class="auction-pool-list"></div>
      </div>
      <div id="a-unsold-card" class="card hidden" style="border-color:rgba(244,63,94,0.20)">
        <div class="card-header"><h2 class="card-title" style="color:var(--red)">✕ Unsold <span id="a-unsold-count" class="card-badge" style="color:var(--red)">0</span></h2></div>
        <div id="a-unsold" class="auction-pool-list"></div>
      </div>
      <button class="btn btn-primary btn-block" onclick="finaliseAuction()" style="margin-top:6px">Finalise Auction →</button>
    </div>
  </div>`;
}

function upAuctionHeader() {
  const tot = S.auction.pool.length + S.auction.log.length + S.auction.unsold.length;
  se('a-round-pill',`Round ${S.auction.round}`);
  se('a-meta',`${S.auction.drawn} drawn · ${S.auction.unsold.length} unsold · ${S.auction.pool.length} left`);
  se('a-lot-cur', S.auction.lot);
  se('a-lot-tot', tot);
}

function rBudgets() {
  const el = id('a-budgets'); if(!el) return;
  el.innerHTML = S.teams.map(t=>{
    const pct = Math.min(100, t.budget / S.cfg.budget * 100);
    return `<div class="budget-row">
      <span class="budget-pip" style="background:${t.color}"></span>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <span class="budget-team-name">${esc(t.short||t.name)}</span>
          <span class="budget-amount" style="color:${pct<10?'var(--red)':pct<30?'var(--gold)':'var(--gold)'}">₹${t.budget.toFixed(1)}Cr</span>
        </div>
        <div class="budget-track" style="margin-top:4px">
          <div class="budget-fill ${pct<10?'danger':pct<30?'low':''}" style="width:${pct}%"></div>
        </div>
        <div style="font-family:var(--fm);font-size:9px;color:var(--text3);margin-top:2px">${t.players.length} signed</div>
      </div>
    </div>`;
  }).join('')||'<div class="list-empty">No teams.</div>';
}

function rPool() {
  const poolEl = id('a-pool'), countEl = id('a-pool-count');
  const unsoldEl = id('a-unsold'), unsoldCard = id('a-unsold-card'), unsoldCount = id('a-unsold-count');
  if (!poolEl) return;
  countEl.textContent = S.auction.pool.length;
  poolEl.innerHTML = S.auction.pool.map(pid=>{
    const p = player(pid); if(!p) return'';
    const active = pid === S.auction.current;
    return `<div class="pool-player-row" ${active?'style="background:var(--ipl-dim);border-left:2px solid var(--ipl2)"':''}>
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span style="flex:1">${esc(p.name)}${active?'<span style="color:var(--ipl2);font-size:9px;margin-left:4px">▶</span>':''}</span>
      <span style="font-family:var(--fm);font-size:10px;color:var(--text3)">₹${p.base}Cr</span>
    </div>`;
  }).join('')||'<div class="list-empty">Pool empty.</div>';
  if (unsoldCard) unsoldCard.classList.toggle('hidden', !S.auction.unsold.length);
  if (unsoldCount) unsoldCount.textContent = S.auction.unsold.length;
  if (unsoldEl) unsoldEl.innerHTML = S.auction.unsold.map(pid=>{
    const p=player(pid); if(!p)return'';
    return `<div class="pool-player-row" style="opacity:0.6"><span class="squad-player-role-badge ${p.role}">${p.role}</span><span style="flex:1">${esc(p.name)}</span><span style="font-family:var(--fm);font-size:10px;color:var(--text3)">₹${p.base}Cr</span></div>`;
  }).join('')||'<div class="list-empty">None.</div>';
}

function rAuctionLog() {
  const el = id('a-log'), cnt = id('a-log-count'); if(!el) return;
  cnt.textContent = S.auction.log.length;
  if (!S.auction.log.length) { el.innerHTML='<div class="list-empty">No assignments yet.</div>'; return; }
  el.innerHTML = [...S.auction.log].reverse().map(e=>{
    const p=player(e.pid),t=team(e.tid);
    return `<div class="auction-log-entry">
      <span class="log-player">${p?esc(p.name):'?'}</span>
      <span class="log-team" style="color:${t?.color||'var(--text2)'}">${t?esc(t.short||t.name):'—'}</span>
      <span class="log-price">₹${e.price}Cr</span>
      ${e.round>1?`<span style="font-family:var(--fm);font-size:9px;color:var(--text3)">R${e.round}</span>`:''}
    </div>`;
  }).join('');
}

function checkReauction() {
  const banner = id('reauction-banner'); if(!banner) return;
  const show = !S.auction.pool.length && S.auction.unsold.length && !S.auction.current;
  banner.classList.toggle('hidden',!show);
  if (show) { se('ra-from',S.auction.round); se('ra-count',S.auction.unsold.length); }
}

function drawLot() {
  if (S.auction.current) { showBidErr('Assign or mark unsold the current player first.'); return; }
  if (!S.auction.pool.length) { checkReauction(); toast('Pool empty — see re-auction banner.','warn'); return; }
  const idx = Math.floor(Math.random() * S.auction.pool.length);
  const pid  = S.auction.pool[idx];
  const p    = player(pid);
  if (!p) { S.auction.pool.splice(idx,1); save(); drawLot(); return; }
  S.auction.current = pid;
  S.auction.lot++;
  S.auction.drawn = (S.auction.drawn||0)+1;
  // Flip animation (cosmetic)
  const idle=id('a-idle'), stage=id('auction-stage-1'), inner=id('lot-inner');
  if(idle) idle.style.display='none';
  if(stage) stage.classList.remove('hidden');
  if(inner) { inner.classList.remove('flipped'); void inner.offsetWidth; fillReveal(p); setTimeout(()=>inner.classList.add('flipped'),120); }
  se('a-lot-num', S.auction.lot);
  // Show bid panel immediately
  showBid(p);
  upAuctionHeader(); rPool(); save();
}

function fillReveal(p) {
  se('ar-role',p.role);
  id('ar-role').className=`player-reveal-role squad-player-role-badge ${p.role}`;
  se('ar-name',p.name);
  se('ar-base',p.base);
  const bars=[{l:'BAT',v:p.bat,c:'var(--role-bat)'},{l:'BOWL',v:p.bowl,c:'var(--role-pace)'},{l:'FLD',v:p.field,c:'var(--green)'}];
  if(p.role==='WK') bars.push({l:'KEEP',v:p.keep,c:'var(--role-wk)'});
  id('ar-stats').innerHTML=bars.map(b=>`<div class="reveal-bar-row"><span class="reveal-bar-label">${b.l}</span><div class="reveal-bar-track"><div class="reveal-bar-fill" style="background:${b.c};width:0" data-v="${b.v}"></div></div><span class="reveal-bar-value">${b.v}</span></div>`).join('');
  setTimeout(()=>qa('.reveal-bar-fill').forEach(b=>b.style.width=b.dataset.v+'%'),850);
}

function showBid(p) {
  const zone = id('auction-bidding-zone'); if(!zone) return;
  zone.classList.remove('hidden');
  se('bid-player-name', p.name);
  se('bid-lot-badge', `LOT ${S.auction.lot}`);
  const chips=[{l:'BAT',v:p.bat},{l:'BOWL',v:p.bowl},{l:'FLD',v:p.field}];
  if(p.role==='WK') chips.push({l:'KEEP',v:p.keep});
  id('bid-chips').innerHTML=`<span class="squad-player-role-badge ${p.role}">${p.role}</span>`+chips.map(c=>`<span style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:3px 10px;font-family:var(--fm);font-size:10px;display:inline-flex;gap:5px;align-items:center"><span style="color:var(--text3)">${c.l}</span><strong>${c.v}</strong></span>`).join('');
  id('bid-price').value = p.base;
  id('bid-teams').innerHTML = S.teams.map(t=>`
    <button class="team-assign-btn" data-tid="${t.id}" onclick="selBidTeam(this,'${t.id}')">
      <span class="budget-pip" style="background:${t.color}"></span>
      <span style="flex:1;text-align:left">${esc(t.short||t.name)}</span>
      <span class="team-assign-budget">₹${t.budget.toFixed(1)}Cr</span>
    </button>`).join('');
  hideBidErr();
}

function clearBid() {
  const zone = id('auction-bidding-zone'); if(zone) zone.classList.add('hidden');
  S.auction.current = null;
  const stage=id('auction-stage-1'),inner=id('lot-inner'),idle=id('a-idle');
  if(stage) stage.classList.add('hidden');
  if(inner) inner.classList.remove('flipped');
  if(idle)  idle.style.display='';
}

function selBidTeam(btn, tid) {
  qa('#bid-teams .team-assign-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  hideBidErr();
}
function showBidErr(msg) { const e=id('bid-err'); if(e){e.textContent=msg;e.classList.remove('hidden');} }
function hideBidErr()    { const e=id('bid-err'); if(e) e.classList.add('hidden'); }

function confirmBid() {
  const pid = S.auction.current;
  if (!pid) { showBidErr('Draw a player first.'); return; }
  const p = player(pid);
  if (!p) { showBidErr('Player missing — redraw.'); S.auction.current=null; return; }
  const selBtn = q('#bid-teams .team-assign-btn.selected');
  if (!selBtn) { showBidErr('Select a team first.'); return; }
  const tid   = selBtn.dataset.tid;
  const t     = team(tid);
  if (!t) { showBidErr('Team not found.'); return; }
  const price = parseFloat(id('bid-price').value);
  if (isNaN(price) || price <= 0) { showBidErr('Enter a valid price.'); return; }
  if (price < p.base)  { showBidErr(`Price below base ₹${p.base}Cr.`); return; }
  if (price > t.budget){ showBidErr(`${t.name} only has ₹${t.budget.toFixed(2)}Cr.`); return; }
  // Execute
  p.teamId = tid; p.price = price;
  if (!t.players.includes(pid)) t.players.push(pid);
  t.budget = parseFloat((t.budget - price).toFixed(2));
  t.spent  = parseFloat(((t.spent||0) + price).toFixed(2));
  S.auction.pool = S.auction.pool.filter(id=>id!==pid);
  S.auction.log.push({pid, tid, price, lot:S.auction.lot, round:S.auction.round});
  S.auction.current = null;
  save(); clearBid(); rAuction();
  toast(`${p.name} → ${t.name} for ₹${price}Cr`,'success');
}

function markUnsold() {
  const pid = S.auction.current;
  if (!pid) { showBidErr('Draw a player first.'); return; }
  const p = player(pid)||{name:pid};
  S.auction.pool   = S.auction.pool.filter(id=>id!==pid);
  if (!S.auction.unsold.includes(pid)) S.auction.unsold.push(pid);
  S.auction.current = null;
  save(); clearBid(); rAuction();
  toast(`${p.name} marked unsold.`,'info');
}

function startReauction() {
  if (!S.auction.unsold.length) { toast('No unsold players.','warn'); return; }
  S.auction.round++;
  S.auction.drawn = 0;
  S.auction.pool   = [...S.auction.unsold];
  S.auction.unsold = [];
  S.auction.current = null;
  save(); rAuction();
  toast(`Re-auction Round ${S.auction.round} — ${S.auction.pool.length} players.`,'success');
}

function finaliseAuction() {
  const rem = S.auction.pool.length + S.auction.unsold.length;
  if (rem > 0 && !confirm(`${rem} players unassigned. Finalise anyway?`)) return;
  S.auction.current = null;
  S.season.status   = 'league';
  S.season.currentMD = 1;
  save(); toast('Auction finalised — Season begins!','success'); go('matchday');
}

/* ─────────────────────────────────────────────────────────
   9. SIMULATION ENGINE
───────────────────────────────────────────────────────── */
function playingXI(t) {
  // Start with set XI, filter out injured/suspended
  let xi = (t.xi||[]).filter(pid=>{ const p=player(pid); return p&&!p.injured&&!p.suspended; });
  // Fill any gaps from squad
  if (xi.length < 11) {
    const used = new Set(xi);
    const bench = S.players
      .filter(p=>p.teamId===t.id && !p.injured && !p.suspended && !used.has(p.id))
      .sort((a,b)=>(b.bat+b.bowl+b.field)-(a.bat+a.bowl+a.field));
    while (xi.length < 11 && bench.length) xi.push(bench.shift().id);
  }
  return xi.slice(0,11);
}

function simMatch(fix) {
  const tA=team(fix.tA), tB=team(fix.tB), venue=ven(fix.venueId);
  const xiA=playingXI(tA), xiB=playingXI(tB);
  const tossWin = Math.random()<0.5?tA:tB;
  const tossDec = Math.random()<0.5?'bat':'field';
  let bat1,fld1,batXI1,bowlXI1;
  if ((tossWin.id===tA.id&&tossDec==='bat')||(tossWin.id===tB.id&&tossDec==='field')) {
    bat1=tA;fld1=tB;batXI1=xiA;bowlXI1=xiB;
  } else {bat1=tB;fld1=tA;batXI1=xiB;bowlXI1=xiA;}
  const inn1 = simInnings(bat1, fld1, batXI1, bowlXI1, venue, null);
  const inn2 = simInnings(fld1, bat1, bowlXI1, batXI1, venue, inn1.runs+1);
  let winId, desc, so=false;
  if (inn2.runs >= inn1.runs+1) {
    winId=fld1.id; desc=`Won by ${10-inn2.wkts} wickets`;
  } else if (inn2.runs < inn1.runs) {
    winId=bat1.id; desc=`Won by ${inn1.runs-inn2.runs} runs`;
  } else {
    const soR=simSuperOver(bat1,fld1);
    winId=soR.win; desc='Won Super Over'; so=true;
  }
  const momId = pickMoM(inn1,inn2);
  if (S.stats.mom[momId]!==undefined) S.stats.mom[momId]++;
  return {id:fix.id, md:S.season.currentMD, tA:tA.id, tB:tB.id, venueId:fix.venueId,
          tossWin:tossWin.id, tossDec, inn1, inn2, winId,
          winName:team(winId).name, desc, so, ts:Date.now()};
}

function simInnings(batT, bowlT, batters, bowlers, venue, target) {
  const pm  = PITCH_MODS[venue?.pitch||'balanced'] || PITCH_MODS.balanced;
  const adB = ((batT.aggression||60) - 60) / 100;   // -0.4 to +0.4
  const adBow = ((bowlT.aggression||60) - 60) / 100;
  const homeBonus = batT.venueId===venue?.id ? 3 : 0;
  let runs=0, wkts=0, balls=0, ppR=0, ppW=0;
  const bPl={}, bwPl={}, fow=[], log=[];
  batters.forEach(pid=>bPl[pid]={r:0,b:0,fours:0,sixes:0,out:false,how:''});
  bowlers.forEach(pid=>bwPl[pid]={r:0,b:0,wkts:0,maidens:0});
  const bq=[...bowlers].sort((a,b)=>(player(b)?.bowl||50)-(player(a)?.bowl||50));
  let bRot=0, b1=batters[0]||null, b2=batters[1]||null, bIdx=2;
  for (let ov=0; ov<20; ov++) {
    const isPP=ov<6, bid=bq[bRot%bq.length]; bRot++;
    let ovR=0;
    for (let bl=0; bl<6; bl++) {
      if (wkts>=10||(target&&runs>=target)) break;
      balls++;
      const o = ball({isPP,pm,adB,adBow,homeBonus,
        batter:b1?player(b1):null, bowler:bid?player(bid):null,
        wkts, rn:target?target-runs:null, bl:120-balls});
      runs+=o.r; ovR+=o.r;
      if(!o.extra&&b1&&bPl[b1]){bPl[b1].b++;bPl[b1].r+=o.r;if(o.r===4)bPl[b1].fours++;if(o.r===6)bPl[b1].sixes++;}
      if(!o.extra&&bwPl[bid]){bwPl[bid].b++;bwPl[bid].r+=o.r;}
      if(isPP){ppR+=o.r;}
      if(o.w){
        wkts++;if(isPP)ppW++;
        if(b1&&bPl[b1]){bPl[b1].out=true;bPl[b1].how=o.how||'out';}
        if(bwPl[bid])bwPl[bid].wkts++;
        fow.push({w:wkts,r:runs,ov:ov+1,bl:bl+1});
        if(bIdx<batters.length) b1=batters[bIdx++];
      }
      if(o.r%2===1){const t=b1;b1=b2;b2=t;}
      log.push({ov,bl,r:o.r,w:!!o.w,wd:!!o.wd,nb:!!o.nb});
    }
    if(ovR===0&&bwPl[bid])bwPl[bid].maidens++;
    {const t=b1;b1=b2;b2=t;}
    if(target&&runs>=target) break;
  }
  const overs=parseFloat((Math.floor(balls/6)+(balls%6)*0.1).toFixed(1));
  return {tId:batT.id, runs, wkts, overs, log, fow, ppR, ppW, bPl, bwPl, extras:Math.floor(balls*0.04)};
}

function ball({isPP,pm,adB,adBow,homeBonus,batter,bowler,wkts,rn,bl}) {
  let p6=Math.max(0,0.07+adB*0.12), p4=Math.max(0,0.12+adB*0.10);
  let p2=0.08, p1=0.32, p0=0.30;
  let pW=Math.max(0.03, 0.10+adB*0.08+adBow*0.06), pWd=0.03, pNb=0.01;
  if(isPP){p6*=1.10;p4*=1.20;p1*=0.75;p0*=0.80;pW*=0.88;}
  p6*=pm.six; p4*=pm.four; pW*=pm.wkt;
  if(bowler?.role==='SPIN') pW+=pm.spinBonus;
  if(bowler?.role==='PACE') pW+=pm.paceBonus;
  if(batter){const r=(batter.bat+homeBonus)/100;p6*=0.75+r*0.50;p4*=0.75+r*0.50;pW*=1.25-r*0.50;}
  if(rn!==null&&bl>0){const rr=rn/(bl/6);if(rr>12){p6*=1.35;pW*=1.25;p0*=0.65;}else if(rr<5){p0*=1.30;p6*=0.75;}}
  if(wkts>=7){pW*=1.12;p6*=0.88;}
  const tot=p6+p4+p2+p1+p0+pW+pWd+pNb, rv=Math.random()*tot; let a=0;
  if((a+=p6)>rv)return{r:6};
  if((a+=p4)>rv)return{r:4};
  if((a+=p2)>rv)return{r:2};
  if((a+=p1)>rv)return{r:1};
  if((a+=p0)>rv)return{r:0};
  if((a+=pW)>rv)return{r:0,w:true,how:randDismissal()};
  if((a+=pWd)>rv)return{r:1,wd:true,extra:true};
  return{r:1,nb:true,extra:true};
}

function simSuperOver(tA,tB) {
  const so=()=>{let r=0,w=0,s=0;for(let i=0;i<6&&w<2;i++){const x=Math.random();if(x<0.12){r+=6;s++;}else if(x<0.26)r+=4;else if(x<0.36)w++;else if(x<0.56)r++;}return{r,s};};
  const a=so(),b=so();
  const win=a.r>b.r?tA.id:b.r>a.r?tB.id:a.s>=b.s?tA.id:tB.id;
  return{a,b,win};
}

function randDismissal(){return['bowled','caught','lbw','caught & bowled','run out','stumped'][Math.floor(Math.random()*6)];}

function pickMoM(inn1,inn2) {
  let best=null,mx=-1;
  const sc=pid=>{
    const b=inn1.bPl[pid]||inn2.bPl[pid]||{};
    const w=inn1.bwPl[pid]||inn2.bwPl[pid]||{};
    return (b.r||0)+(b.fours||0)*0.5+(b.sixes||0)+(w.wkts||0)*15-(w.r||0)*0.05;
  };
  new Set([...Object.keys(inn1.bPl||{}),...Object.keys(inn1.bwPl||{})]).forEach(pid=>{const s=sc(pid);if(s>mx){mx=s;best=pid;}});
  return best||Object.keys(inn1.bPl||{})[0];
}

function recalcNRR() {
  S.teams.forEach(t=>{t._rf=0;t._ro=0;t._ra=0;t._rao=0;});
  S.matches.forEach(m=>{
    const b=team(m.inn1.tId), bw=team(m.inn2.tId);
    if(b){b._rf+=m.inn1.runs;b._ro+=Math.max(m.inn1.overs,0.1);b._ra+=m.inn2.runs;b._rao+=Math.max(m.inn2.overs,0.1);}
    if(bw){bw._rf+=m.inn2.runs;bw._ro+=Math.max(m.inn2.overs,0.1);bw._ra+=m.inn1.runs;bw._rao+=Math.max(m.inn1.overs,0.1);}
  });
  S.teams.forEach(t=>{
    t.nrr=t._ro>0?parseFloat((t._rf/t._ro-t._ra/t._rao).toFixed(3)):0;
    delete t._rf;delete t._ro;delete t._ra;delete t._rao;
  });
}

function applyResult(result) {
  // Points
  const win=team(result.winId), losId=result.winId===result.tA?result.tB:result.tA, los=team(losId);
  if(win){win.points+=2;win.wins++;win.played++;win.form=[...(win.form||[]).slice(-4),'W'];}
  if(los){los.losses++;los.played++;los.form=[...(los.form||[]).slice(-4),'L'];}
  recalcNRR();
  // Stats
  const seen=new Set();
  [result.inn1,result.inn2].forEach(inn=>{
    Object.entries(inn.bPl||{}).forEach(([pid,s])=>{
      const bs=S.stats.bat[pid]; if(!bs) return;
      bs.matches++;bs.r+=s.r;bs.b+=s.b;bs.fours+=s.fours;bs.sixes+=s.sixes;
      if(s.r>bs.hs)bs.hs=s.r;
      if(s.r>=100)bs.hundreds++;else if(s.r>=50)bs.fifties++;
      if(s.out)bs.outs++;
      const mk=`${pid}_${s.r>=100?'c':'f'}_${result.id}`;
      if(s.r>=50&&!seen.has(mk)){seen.add(mk);S.stats.milestones.push({type:s.r>=100?'century':'fifty',pid,matchId:result.id,val:`${s.r}(${s.b})`,md:result.md});}
    });
    Object.entries(inn.bwPl||{}).forEach(([pid,s])=>{
      const bw=S.stats.bowl[pid]; if(!bw) return;
      bw.matches++;bw.wkts+=s.wkts;bw.runs+=s.r;
      bw.balls=(bw.balls||0)+s.b;
      bw.maidens+=s.maidens;
      const mk=`${pid}_5w_${result.id}`;
      if(s.wkts>=5&&!seen.has(mk)){seen.add(mk);bw.fiveW++;S.stats.milestones.push({type:'fiveWickets',pid,matchId:result.id,val:`${s.wkts}/${s.r}`,md:result.md});}
      const nb=parseInt(bw.best||'0'),nr=parseInt((bw.best||'0/99').split('/')[1]||'99');
      if(s.wkts>nb||(s.wkts===nb&&s.r<nr))bw.best=`${s.wkts}/${s.r}`;
    });
  });
}

/* ─────────────────────────────────────────────────────────
   10. MATCHDAY CONTROL (Admin)
───────────────────────────────────────────────────────── */
function curSched() { return S.schedule.find(s=>s.md===S.season.currentMD)||null; }

function rMatchday() {
  if (S.season.status==='playoffs') { rMatchdayPlayoffs(); return; }
  const md = S.season.currentMD;
  if(!md){id('matchday-badge').textContent='—';return;}
  id('matchday-badge').textContent=`MD ${md} / ${S.season.totalMDs}`;
  const sched=curSched();
  const allDone=sched?.fixtures.every(f=>f.result);
  const anyDone=sched?.fixtures.some(f=>f.result);
  const allLocked=S.teams.every(t=>t.locked);
  const allXI=S.teams.every(t=>t.xi&&t.xi.length===11);
  // Phase strip
  const phase = allDone?'results':anyDone?'simulate':allLocked&&allXI?'toss':allXI?'xi':'strategy';
  qa('.phase-step').forEach(el=>{
    const phases=['strategy','xi','toss','simulate','results'];
    const p=el.dataset.phase, ci=phases.indexOf(phase), pi=phases.indexOf(p);
    el.classList.toggle('active',p===phase);
    el.classList.toggle('done',pi<ci);
  });
  rMDVenues(); rMDStrategy(); rMDXI(); rMDInjuries(); rMDFixtures();
  id('matchday-postmd-card').classList.toggle('hidden',!allDone);
}

function rMatchdayPlayoffs() {
  id('matchday-badge').textContent='🏆 Playoffs';
  id('matchday-sim-card').innerHTML=`<div class="card-header"><h2 class="card-title">⚡ Playoffs</h2></div><div class="card-body"><p style="color:var(--text2);font-size:13px;margin-bottom:12px">Manage playoff matches from Admin → Playoffs Bracket.</p><button class="btn btn-primary" onclick="go('admin')">Go to Playoffs →</button></div>`;
}

function rMDVenues() {
  const sched=curSched(), el=id('matchday-venues-row'); if(!el) return;
  if(!sched){el.innerHTML='';return;}
  el.innerHTML=sched.fixtures.map(fix=>{
    const v=ven(fix.venueId),tA=team(fix.tA),tB=team(fix.tB),pt=v?.pitch||'balanced';
    return `<div class="venue-card pitch-${pt}">
      <div class="venue-card-venue">${v?esc(v.name):'TBD'}</div>
      <div class="venue-card-city">${v?esc(v.city):''}</div>
      <div class="venue-card-footer">
        <span class="venue-matchup">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</span>
        <span class="pitch-badge ${pt}">${PITCH_LABELS[pt]||pt}</span>
      </div>
    </div>`;
  }).join('');
}

function rMDStrategy() {
  const el=id('matchday-strategy-grid'); if(!el) return;
  el.innerHTML=S.teams.map(t=>{
    const pct=((t.aggression-20)/80*100).toFixed(1);
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
  const el=id('matchday-xi-grid'); if(!el) return;
  el.innerHTML=S.teams.map(t=>{
    const done=t.xi&&t.xi.length===11;
    return `<div class="xi-confirm-btn ${done?'confirmed':''}" onclick="openXIAdmin('${t.id}')">
      <span class="xi-team-name">${esc(t.short||t.name)}</span>
      <span class="xi-confirm-status">${done?`✓ XI Ready (${t.xi.length})`:'⏳ Not Set'}</span>
    </div>`;
  }).join('');
  const ready=S.teams.filter(t=>t.xi&&t.xi.length===11).length;
  id('matchday-xi-status').innerHTML=`<span>${ready}/${S.teams.length} teams ready</span>${ready===S.teams.length?'<span style="color:var(--green);margin-left:8px">✓ All set</span>':''}`;
}

function rMDInjuries() {
  const el=id('matchday-injury-list'); if(!el) return;
  const inj=S.players.filter(p=>p.injured||p.suspended);
  if(!inj.length){el.innerHTML='<div class="list-empty">No injuries.</div>';return;}
  el.innerHTML=inj.map(p=>{
    const t=team(p.teamId);
    return `<div class="injury-item"><span class="injury-icon">🤕</span><span class="injury-player-name">${esc(p.name)}</span><span class="injury-team" style="color:${t?.color||'var(--text2)'}">${t?esc(t.short||t.name):''}</span><span class="injury-duration">${p.injured?'Season crisis':'Out '+p.injuredMDs+' MD'}</span></div>`;
  }).join('');
}

function rMDFixtures() {
  const sched=curSched(), el=id('sim-fixtures-list'); if(!el) return;
  if(!sched){el.innerHTML='<div class="list-empty">No matchday scheduled.</div>';return;}
  el.innerHTML=sched.fixtures.map(fix=>{
    const tA=team(fix.tA),tB=team(fix.tB),done=!!fix.result;
    const win=done?team(fix.result.winId):null;
    return `<div class="sim-fixture-row">
      <span class="sim-fixture-matchup">
        <span style="color:${tA?.color||'var(--text)'}">${esc(tA?.short||tA?.name||'?')}</span>
        <span style="color:var(--text3)"> vs </span>
        <span style="color:${tB?.color||'var(--text)'}">${esc(tB?.short||tB?.name||'?')}</span>
      </span>
      ${done?`<span class="sim-fixture-status complete">✓ ${win?esc(win.short||win.name):'done'}</span>`
             :`<span class="sim-fixture-status pending">Pending</span>`}
      ${done?'':`<button class="btn btn-secondary btn-sm" onclick="simOne('${fix.id}')">Simulate</button>`}
    </div>`;
}

).join('');}

function lockAllStrategies() {
  S.teams.forEach(t=>t.locked=true);
  save(); rMDStrategy(); rStrategy();
  toast('All strategies locked. Ready to simulate!','success');
}

function simOne(fixId, onDone) {
  const sched=curSched(); if(!sched) return;
  const fix=sched.fixtures.find(f=>f.id===fixId);
  if(!fix||fix.result) { if(onDone)onDone(); return; }
  const result=simMatch(fix);
  fix.result=result; S.matches.push(result);
  applyResult(result); save();
  rMatchday(); rLive(); rSidebar();
  const win=team(result.winId);
  toast(`${win?.name||'?'} ${result.desc}${result.so?' (Super Over!)':''}`, 'success');
  if(result.so){const tA=team(result.tA),tB=team(result.tB);setTimeout(()=>showSuperOverOv(tA,tB),400);}
  checkMilestones(result);
  if(onDone) setTimeout(onDone,600);
}

function checkMilestones(result) {
  const recent=S.stats.milestones.filter(m=>m.matchId===result.id);
  const best=recent.find(m=>m.type==='century')||recent.find(m=>m.type==='fiveWickets')||recent.find(m=>m.type==='fifty');
  if(!best)return;
  const p=player(best.pid); if(!p) return;
  const tmap={century:'century',fifty:'fifty',fiveWickets:'fiveWkt'};
  setTimeout(()=>showMilestoneOv(tmap[best.type]||'fifty',p,best.val),1000);
}

function simulateAllMatches() {
  const sched=curSched(); if(!sched) return;
  const pending=sched.fixtures.filter(f=>!f.result);
  if(!pending.length){checkMDComplete();return;}
  // Toss for first match then simulate all
  const tA=team(pending[0].tA),tB=team(pending[0].tB);
  const run=()=>{pending.forEach(fix=>simOne(fix.id));checkMDComplete();};
  if(tA&&tB) showTossOv(tA,tB,run); else run();
}

function simulateNextMatch() {
  const sched=curSched(); if(!sched) return;
  const fix=sched.fixtures.find(f=>!f.result);
  if(!fix){checkMDComplete();return;}
  const tA=team(fix.tA),tB=team(fix.tB);
  if(tA&&tB) showTossOv(tA,tB,()=>simOne(fix.id)); else simOne(fix.id);
}

function checkMDComplete() {
  const sched=curSched(); if(!sched) return;
  if(sched.fixtures.every(f=>f.result)){
    id('matchday-postmd-card').classList.remove('hidden');
    toast('All matches done! Roll injuries then advance.','success');
  }
}

function rollInjuries() {
  const results=[];
  S.players.forEach(p=>{
    if(p.suspended){p.suspended=false;p.injuredMDs=0;}
    if(p.injuredMDs>0)p.injuredMDs--;
  });
  if(S.season.currentMD===S.season.crisisMD&&!S.season.crisisFired){
    fireSeasonCrisis(); S.season.crisisFired=true;
  }
  S.players.filter(p=>p.teamId&&!p.injured).forEach(p=>{
    if(Math.random()<0.06){p.suspended=true;p.injuredMDs=1;results.push(`🤕 ${p.name} — misses 1 MD`);}
  });
  id('injury-roll-results').innerHTML=results.length
    ?results.map(r=>`<div class="injury-item">${esc(r)}</div>`).join('')
    :'<p style="color:var(--text2);font-size:12px">No injuries this matchday. ✓</p>';
  save(); rMDInjuries();
  toast(`Injury rolls done. ${results.length} injured.`,results.length?'warn':'success');
}

function fireSeasonCrisis() {
  const top=standings()[0]; if(!top) return;
  const players=S.players.filter(p=>p.teamId===top.id&&!p.injured&&!p.suspended);
  if(!players.length) return;
  players.sort((a,b)=>(b.bat+b.bowl)-(a.bat+a.bowl));
  players[0].injured=true;
  showCrisisOv(players[0],top);
}

function advanceMatchday() {
  const next=S.season.currentMD+1;
  // Reset team strategy locks for next MD
  S.teams.forEach(t=>{t.locked=false;});
  if(next>S.season.totalMDs){
    S.season.status='playoffs'; setupPlayoffs();
    save(); id('matchday-postmd-card').classList.add('hidden');
    toast('League stage complete! Setting up playoffs…','success'); go('admin'); return;
  }
  S.season.currentMD=next;
  id('matchday-postmd-card').classList.add('hidden');
  const isTradeWindow=(next>1)&&(next%S.season.tradeEvery===1);
  if(isTradeWindow) toast(`MD ${next}: Trade window OPEN! See Admin → Trade Desk.`,'info',5000);
  if(S.liveSession?.autoPush) pushState();
  save(); rHeader(); rMatchday(); rSidebar();
  toast(`Matchday ${next} ready! Teams should set strategies.`,'success');
}

/* ─────────────────────────────────────────────────────────
   11. LIVE PAGE
───────────────────────────────────────────────────────── */
function rLive() {
  const sched=curSched();
  const liveEl=id('live-matches-grid'), idleEl=id('live-idle-state'), ownEl=id('live-own-match');
  id('live-md-label').textContent=S.season.currentMD?`Matchday ${S.season.currentMD}`:'';
  if(!sched||S.season.status==='setup'||S.season.status==='auction'){
    liveEl.innerHTML=''; idleEl.classList.remove('hidden'); ownEl.classList.add('hidden');
    const msg=id('live-idle-msg');
    if(msg) msg.textContent=S.season.status==='playoffs'?'Playoffs in progress — see Admin.':'Waiting for matchday to begin.';
    return;
  }
  idleEl.classList.add('hidden');
  liveEl.innerHTML=sched.fixtures.map(f=>lmc(f)).join('')||'<div class="list-empty">Waiting for simulation.</div>';
  id('nav-live-badge')?.classList.toggle('hidden',sched.fixtures.every(f=>f.result));
  if(ME.teamId){
    const own=sched.fixtures.find(f=>f.tA===ME.teamId||f.tB===ME.teamId);
    if(own){
      ownEl.classList.remove('hidden');
      id('live-own-match-card').innerHTML=lmc(own,true);
    } else ownEl.classList.add('hidden');
  } else ownEl.classList.add('hidden');
}

function lmc(fix,featured=false) {
  const tA=team(fix.tA),tB=team(fix.tB),r=fix.result;
  const cls=`live-match-card${featured?' featured':''}${r?' complete':''}`;
  if(!r)return `<div class="${cls}">
    <div class="lmc-header"><div class="lmc-teams" style="color:var(--text2)">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</div><span class="lmc-over" style="color:var(--text3)">Not started</span></div>
    <div class="lmc-body" style="color:var(--text3);font-size:12px;padding:16px">Awaiting simulation…</div></div>`;
  const i1=r.inn1,i2=r.inn2,bf=team(i1.tId),bs=team(i2.tId);
  const balls=(i2.log||[]).slice(-6).map(b=>{
    let c='d0',l='0';
    if(b.wd){c='dWd';l='Wd';}else if(b.nb){c='dNb';l='Nb';}
    else if(b.w){c='dW';l='W';}else if(b.r===6){c='d6';l='6';}
    else if(b.r===4){c='d4';l='4';}else if(b.r===2){c='d2';l='2';}
    else if(b.r===1){c='d1';l='1';}
    return `<div class="ball-dot ${c}">${l}</div>`;
  }).join('');
  const win=team(r.winId);
  return `<div class="${cls}">
    <div class="lmc-header">
      <div class="lmc-teams">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</div>
      <span class="lmc-over">${ovStr(i2.overs)} ov</span>
    </div>
    <div class="lmc-body">
      <div style="font-size:11px;color:var(--text2);margin-bottom:3px"><span style="color:${bf?.color||'var(--text)'}">${esc(bf?.short||bf?.name||'?')}</span>: ${i1.runs}/${i1.wkts} (${ovStr(i1.overs)})</div>
      <div class="lmc-score-row">
        <div class="lmc-score-batting"><span style="color:${bs?.color||'var(--text)'}">${i2.runs}</span>/<span class="wickets">${i2.wkts}</span></div>
        <div class="lmc-target">Chase ${i1.runs+1}</div>
      </div>
      <div class="lmc-ball-log"><span class="over-label">Last 6:</span>${balls||'<span style="color:var(--text3);font-size:11px">—</span>'}</div>
    </div>
    <div class="lmc-result" style="color:${win?.color||'var(--gold)'}">
      ${esc(win?.name||'?')} ${esc(r.desc)}${r.so?' <span style="color:var(--gold)">(SO)</span>':''}
    </div>
  </div>`;
}

function ovStr(o){const f=Math.floor(o),b=Math.round((o-f)*10);return`${f}.${b}`;}

/* ─────────────────────────────────────────────────────────
   12. STRATEGY PAGE — Delegate + Admin views
───────────────────────────────────────────────────────── */
function rStrategy() {
  const isDelegate=ME.role==='delegate';
  id('strategy-delegate-view').classList.toggle('hidden',!isDelegate);
  id('strategy-admin-view').classList.toggle('hidden',isDelegate);
  const locked=S.teams.some(t=>t.locked);
  id('strategy-lock-banner').classList.toggle('hidden',!locked||isDelegate);
  if(isDelegate) rStrategyDelegate(); else rStrategyAdmin();
}

function rStrategyDelegate() {
  const t=team(ME.teamId); if(!t){id('strategy-delegate-view').innerHTML='<p style="color:var(--red);padding:20px">Team not found — re-login.</p>';return;}
  const sched=curSched();
  const fix=sched?.fixtures.find(f=>f.tA===t.id||f.tB===t.id);
  const oppId=fix?(fix.tA===t.id?fix.tB:fix.tA):null;
  const opp=oppId?team(oppId):null;
  const v=fix?ven(fix.venueId):null;
  id('strategy-md-info').innerHTML=`
    <div class="md-info-item">Matchday: <strong>MD ${S.season.currentMD||'—'}</strong></div>
    <div class="md-info-item">vs: <strong style="color:${opp?.color||'var(--text)'}">${opp?esc(opp.name):'TBD'}</strong></div>
    <div class="md-info-item">Venue: <strong>${v?esc(v.name):'TBD'}</strong></div>
    <div class="md-info-item">Pitch: <span class="pitch-badge ${v?.pitch||'balanced'}">${PITCH_LABELS[v?.pitch||'balanced']}</span></div>
    ${t.locked?'<div class="md-info-item" style="color:var(--green)">🔒 Strategy locked</div>':''}`;
  rXISelector(t);
  const slider=id('aggression-slider');
  if(slider){slider.value=t.aggression;slider.disabled=t.locked;}
  id('aggression-value').textContent=t.aggression;
  updateAggDisplay(t.aggression);
  id('aggression-submitted')?.classList.toggle('hidden',!t.locked);
  id('xi-confirmed-state')?.classList.toggle('hidden',!(t.xi&&t.xi.length===11));
}

/* ── XI SELECTOR ── */
function rXISelector(t) {
  const squad=S.players.filter(p=>p.teamId===t.id)
    .sort((a,b)=>(b.bat+b.bowl)-(a.bat+a.bowl));
  id('xi-squad-list').innerHTML=squad.map(p=>{
    const sel=t.xi.includes(p.id),inj=p.injured||p.suspended;
    return `<div class="squad-player-card${sel?' selected':''}${inj?' injured':''}" data-pid="${p.id}" data-role="${p.role}" onclick="toggleXI('${p.id}','${t.id}')">
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span class="squad-player-name">${esc(p.name)}${inj?'<span class="squad-player-injury-tag">🤕</span>':''}</span>
      <span class="squad-player-ratings">🏏${p.bat} 🎯${p.bowl}</span>
    </div>`;
  }).join('');
  updateXISlots(t); updateXICount(t);
}

function toggleXI(pid,tid) {
  const t=team(tid); if(!t) return;
  const p=player(pid); if(p?.injured||p?.suspended) return;
  if(t.locked){toast('Strategy is locked for this matchday.','warn');return;}
  const idx=t.xi.indexOf(pid);
  if(idx!==-1) t.xi.splice(idx,1);
  else { if(t.xi.length>=11){toast('XI full — remove a player first.','warn');return;} t.xi.push(pid); }
  updateXISlots(t); updateXICount(t);
  qa('#xi-squad-list .squad-player-card').forEach(el=>{
    el.classList.toggle('selected',t.xi.includes(el.dataset.pid));
  });
}

function updateXISlots(t) {
  const el=id('xi-slots'); if(!el) return;
  el.innerHTML=Array.from({length:11},(_,i)=>{
    const pid=t.xi[i],p=pid?player(pid):null;
    return p
      ?`<div class="xi-slot filled" data-role="${p.role}" title="${esc(p.name)}"><span class="xi-slot-name">${esc(p.name.split(' ').map(n=>n[0]||'').join(''))}</span><button class="xi-slot-remove" onclick="event.stopPropagation();removeXI('${p.id}','${t.id}')">✕</button></div>`
      :`<div class="xi-slot"><span style="font-size:9px;color:var(--text3)">${i+1}</span></div>`;
  }).join('');
}

function removeXI(pid,tid){const t=team(tid);if(!t)return;t.xi=t.xi.filter(id=>id!==pid);rXISelector(t);}

function updateXICount(t) {
  const n=t.xi.length;
  const badge=id('xi-selected-count'),btn=id('btn-confirm-xi');
  if(badge)badge.textContent=n;
  const wrap=badge?.closest('.xi-count-badge'); if(wrap)wrap.classList.toggle('complete',n===11);
  if(btn)btn.disabled=n!==11;
  id('xi-confirmed-state')?.classList.add('hidden');
}

function filterSquad(role){
  qa('#xi-squad-list .squad-player-card').forEach(el=>el.classList.toggle('hidden-by-filter',role!=='all'&&el.dataset.role!==role));
  qa('#strategy-xi-card .filter-pill').forEach(p=>p.classList.toggle('active',p.dataset.filter===role));
}
function clearXI(){const t=team(ME.teamId);if(!t)return;t.xi=[];rXISelector(t);}
function autoPickXI(){const t=team(ME.teamId);if(!t)return;t.xi=playingXI(t);rXISelector(t);toast('Auto-picked best available XI!','success');}
function confirmXI(){
  const t=team(ME.teamId);if(!t||t.xi.length!==11)return;
  save(); id('xi-confirmed-state').classList.remove('hidden'); id('btn-confirm-xi').disabled=true;
  toast('Playing XI confirmed!','success');
}
function editXI(){id('xi-confirmed-state').classList.add('hidden');id('btn-confirm-xi').disabled=false;}

/* ── AGGRESSION ── */
function onAggressionChange(v){id('aggression-value').textContent=v;updateAggDisplay(parseInt(v));}
function updateAggDisplay(v) {
  const zones=[[20,39,'Cautious','var(--green)'],[40,59,'Calculated','var(--teal)'],[60,60,'Balanced','var(--text2)'],[61,79,'Attacking','var(--ipl2)'],[80,100,'Ultra','var(--red)']];
  const z=zones.find(([lo,hi])=>v>=lo&&v<=hi)||zones[2];
  const lbl=id('aggression-level-label'); if(lbl){lbl.textContent=z[2];lbl.style.color=z[3];}
  const hints={20:'Cautious — fewer wickets, lower ceiling.',40:'Calculated — controlled with moderate risk.',60:'Balanced — default play style.',61:'Attacking — more boundaries, more wicket risk.',80:'Ultra — sixes or bust. Maximum risk.'};
  const hint=id('aggression-effect-hint'); if(hint)hint.textContent=hints[z[0]]||hints[60];
  const d=(v-60)/100;
  const brk=id('aggression-breakdown');
  if(brk)brk.innerHTML=`<span class="effect-tag ${d>0?'up':d<0?'down':'neu'}">6s ${d>=0?'+':''}${(d*12).toFixed(0)}%</span><span class="effect-tag ${d>0?'up':d<0?'down':'neu'}">4s ${d>=0?'+':''}${(d*10).toFixed(0)}%</span><span class="effect-tag ${d>0?'down':'up'}">Wkts ${d>=0?'+':''}${(d*8).toFixed(0)}%</span>`;
}
function submitAggression() {
  const t=team(ME.teamId); if(!t) return;
  if(t.locked){toast('Strategy already locked.','warn');return;}
  t.aggression=parseInt(id('aggression-slider')?.value||60);
  t.locked=true; save();
  const slider=id('aggression-slider'); if(slider)slider.disabled=true;
  id('aggression-submitted')?.classList.remove('hidden');
  toast('Strategy locked in!','success');
}

/* ── ADMIN STRATEGY VIEW ── */
function rStrategyAdmin(){
  id('strategy-all-teams-grid').innerHTML=S.teams.map(t=>{
    const pct=((t.aggression-20)/80*100).toFixed(1), xiOk=t.xi&&t.xi.length===11;
    return `<div class="strategy-team-card">
      <div class="strategy-team-card-header">
        <span class="budget-pip" style="background:${t.color}"></span>
        <span class="strategy-team-card-name">${esc(t.short||t.name)}</span>
        <span class="strategy-status-badge ${t.locked?'locked':'pending'}">${t.locked?'🔒':'⏳'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:8px 0">
        <div class="strategy-slider-mini" style="flex:1"><div class="strategy-slider-thumb" style="left:${pct}%"></div></div>
        <span style="font-family:var(--fm);font-size:12px;color:var(--ipl2)">${t.aggression}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
        <span class="xi-status-mini ${xiOk?'ok':'pending'}">${xiOk?'✓ XI Set':'⏳ XI Pending'}</span>
        <button class="btn btn-secondary btn-sm" onclick="openXIAdmin('${t.id}')">Set XI</button>
      </div>
    </div>`;
  }).join('');
}

/* ── XI ADMIN MODAL ── */
function openXIAdmin(tid) {
  UI.xiAdmin={teamId:tid,sel:[...(team(tid)?.xi||[])]};
  const t=team(tid); if(!t) return;
  id('modal-xi-admin-team-name').textContent=t.name;
  rXIAdminSquad(t); upXIAdminCount();
  id('modal-backdrop').classList.remove('hidden');
  id('modal-xi-admin').classList.remove('hidden');
}
function rXIAdminSquad(t) {
  const squad=S.players.filter(p=>p.teamId===t.id).sort((a,b)=>(b.bat+b.bowl)-(a.bat+a.bowl));
  id('modal-xi-admin-squad').innerHTML=squad.map(p=>{
    const sel=UI.xiAdmin.sel.includes(p.id),inj=p.injured||p.suspended;
    return `<div class="squad-player-card${sel?' selected':''}${inj?' injured':''}" data-pid="${p.id}" data-role="${p.role}" onclick="toggleXIAdmin('${p.id}')">
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span class="squad-player-name">${esc(p.name)}${inj?'<span class="squad-player-injury-tag">🤕</span>':''}</span>
      <span class="squad-player-ratings">🏏${p.bat} 🎯${p.bowl}</span>
    </div>`;
  }).join('');
}
function toggleXIAdmin(pid){
  const p=player(pid);if(p?.injured||p?.suspended)return;
  const idx=UI.xiAdmin.sel.indexOf(pid);
  if(idx!==-1)UI.xiAdmin.sel.splice(idx,1);
  else{if(UI.xiAdmin.sel.length>=11){toast('XI full!','warn');return;}UI.xiAdmin.sel.push(pid);}
  qa('#modal-xi-admin-squad .squad-player-card').forEach(el=>el.classList.toggle('selected',UI.xiAdmin.sel.includes(el.dataset.pid)));
  upXIAdminCount();
}
function upXIAdminCount(){const n=UI.xiAdmin.sel.length;id('modal-xi-admin-count').textContent=n;id('btn-confirm-xi-admin').disabled=n!==11;}
function filterAdminSquad(role){
  qa('#modal-xi-admin-squad .squad-player-card').forEach(el=>el.classList.toggle('hidden-by-filter',role!=='all'&&el.dataset.role!==role));
  qa('#modal-xi-admin .filter-pill').forEach(p=>p.classList.toggle('active',p.dataset.filter===role));
}
function autoPickAdminXI(){const t=team(UI.xiAdmin.teamId);if(!t)return;UI.xiAdmin.sel=playingXI(t);rXIAdminSquad(t);upXIAdminCount();}
function clearAdminXI(){UI.xiAdmin.sel=[];const t=team(UI.xiAdmin.teamId);if(t)rXIAdminSquad(t);upXIAdminCount();}
function confirmXIAdmin(){
  const t=team(UI.xiAdmin.teamId);if(!t||UI.xiAdmin.sel.length!==11)return;
  t.xi=[...UI.xiAdmin.sel]; save(); closeXIAdminModal();
  rMDXI(); rStrategy(); toast(`XI set for ${t.name}!`,'success');
}
function closeXIAdminModal(){id('modal-backdrop').classList.add('hidden');id('modal-xi-admin').classList.add('hidden');UI.xiAdmin={teamId:null,sel:[]};}

/* ─────────────────────────────────────────────────────────
   13. POINTS TABLE
───────────────────────────────────────────────────────── */
function rPoints() {
  const sorted=standings();
  id('points-md-label').textContent=S.season.currentMD?`After MD ${S.season.currentMD}`:'Pre-season';
  const tbody=id('points-table-body');
  if(!sorted.length){tbody.innerHTML='<tr class="table-empty-row"><td colspan="9">Season not started.</td></tr>';rScheduleList();return;}
  const n=sorted.length;
  tbody.innerHTML=sorted.map((t,i)=>{
    const pos=i+1,q=pos<=4,d=pos>n-2,own=t.id===ME.teamId;
    const nrr=(t.nrr>=0?'+':'')+t.nrr.toFixed(3);
    const form=(t.form||[]).slice(-5);
    const dots=Array.from({length:5},(_,j)=>form[j]||'na').map(f=>`<div class="form-dot ${f==='W'?'W':f==='L'?'L':f==='T'?'T':'na'}"></div>`).join('');
    const row=[q?'qualify-zone':'',d?'danger-zone':'',own?'own-team':''].filter(Boolean).join(' ');
    return `<tr class="${row}">
      <td><span class="pt-pos">${pos}</span></td>
      <td><div class="pt-team-cell"><span class="pt-team-pip" style="background:${t.color}"></span><span class="pt-team-name">${esc(t.name)}</span>${own?'<span class="pt-team-code">◀</span>':''}</div></td>
      <td class="col-num">${t.played}</td>
      <td class="col-num">${t.wins}</td>
      <td class="col-num">${t.losses}</td>
      <td class="col-num">${t.ties||0}</td>
      <td class="col-num pt-pts" style="color:var(--ipl2)">${t.points}</td>
      <td class="col-nrr"><span class="pt-nrr ${t.nrr>=0?'positive':'negative'}">${nrr}</span></td>
      <td><div class="form-strip">${dots}</div></td>
    </tr>`;
  }).join('');
  rScheduleList();
}

function rScheduleList(){
  const el=id('schedule-list-view'); if(!el) return;
  if(!S.schedule.length){el.innerHTML='<div class="list-empty" style="padding:16px">Schedule not yet generated.</div>';return;}
  el.innerHTML=S.schedule.map(s=>{
    const cur=s.md===S.season.currentMD, tw=s.md>1&&s.md%S.season.tradeEvery===1;
    return `<div class="schedule-md-group" ${cur?'style="background:rgba(255,107,26,0.025)"':''}>
      <div class="schedule-md-label">MD ${s.md}${cur?' <span style="color:var(--ipl2)">● Now</span>':''}${tw?' <span style="color:var(--green);font-size:9px;margin-left:6px">TRADE WINDOW</span>':''}</div>
      ${s.fixtures.map(f=>{
        const tA=team(f.tA),tB=team(f.tB),v=ven(f.venueId);
        const res=f.result?`<span style="color:${team(f.result.winId)?.color||'var(--text2)'}">${esc(team(f.result.winId)?.short||'?')} won</span>`:'—';
        return `<div class="schedule-fixture"><span class="schedule-matchup">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</span><span class="schedule-venue">${v?esc(v.name):'TBD'}</span><span class="schedule-result">${res}</span></div>`;
      }).join('')}
    </div>`;
  }).join('');
}
function scheduleView(type){
  id('schedule-list-view').classList.toggle('hidden',type!=='list');
  id('schedule-gantt-view').classList.toggle('hidden',type!=='gantt');
  qa('.view-toggle').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase()===type));
}

/* ─────────────────────────────────────────────────────────
   14. SCORECARDS
───────────────────────────────────────────────────────── */
let _sc=null;
function rScorecards() {
  const tabs=id('scorecard-match-tabs');
  if(!S.matches.length){tabs.innerHTML='<div class="selector-empty">No completed matches yet.</div>';id('scorecard-content').classList.add('hidden');return;}
  const sorted=[...S.matches].sort((a,b)=>b.ts-a.ts);
  tabs.innerHTML=sorted.map((m,i)=>{
    const tA=team(m.tA),tB=team(m.tB),own=ME.teamId&&(m.tA===ME.teamId||m.tB===ME.teamId);
    return `<button class="sc-match-tab${own?' own-team':''}${i===0?' active':''}" onclick="showSC('${m.id}',this)">MD${m.md}: ${esc(tA?.short||'?')} v ${esc(tB?.short||'?')}</button>`;
  }).join('');
  showSC(sorted[0].id, tabs.firstElementChild);
}
function showSC(mid,btn){
  if(btn){qa('.sc-match-tab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');}
  _sc=S.matches.find(m=>m.id===mid); if(!_sc)return;
  id('scorecard-content').classList.remove('hidden');
  rSCHeader(_sc); id('sc-super-over-tab').classList.toggle('hidden',!_sc.so);
  switchInnings(1);
}
function rSCHeader(m){
  const tA=team(m.tA),tB=team(m.tB),v=ven(m.venueId),win=team(m.winId);
  id('sc-match-header').innerHTML=`
    <div class="sc-match-result"><span style="color:${win?.color||'var(--gold)'}">${esc(win?.name||'?')}</span> — ${esc(m.desc)}</div>
    <div class="sc-match-meta">
      <span>🎲 Toss: ${esc(team(m.tossWin)?.name||'?')} elected to ${m.tossDec}</span>
      <span>🏟 ${v?esc(v.name+', '+v.city):'—'}</span>
      <span>MD ${m.md}</span>
      ${m.so?'<span style="color:var(--gold)">⚡ Super Over</span>':''}
    </div>`;
}
function switchInnings(num){
  qa('.innings-tab').forEach(t=>t.classList.toggle('active',String(t.dataset.innings)===String(num)));
  if(!_sc) return;
  const inn=num===1?_sc.inn1:num===2?_sc.inn2:null; if(!inn) return;
  const bowlInn=num===1?_sc.inn2:_sc.inn1;
  rBatTable(inn); rBowlTable(inn,bowlInn); rFoW(inn); rPPSummary(inn); rMoM(_sc);
}
function rBatTable(inn){
  const t=team(inn.tId);
  id('sc-batting-team-name').textContent=t?.name||'';
  const rows=Object.entries(inn.bPl||{}).map(([pid,s])=>({p:player(pid),s})).filter(e=>e.p);
  id('sc-batting-body').innerHTML=rows.map(({p,s},i)=>{
    const sr=s.b>0?((s.r/s.b)*100).toFixed(1):'0.0',own=ME.teamId&&p.teamId===ME.teamId;
    return `<tr class="${i===0&&s.r>0?'top-score':''}${own?' own-player':''}">
      <td>${esc(p.name)}</td>
      <td class="sc-col-dismissal">${s.out?esc(s.how||'out'):'<em style="color:var(--green)">not out</em>'}</td>
      <td>${s.r}</td><td>${s.b}</td><td>${s.fours}</td><td>${s.sixes}</td><td>${sr}</td></tr>`;
  }).join('');
  id('sc-batting-extras').innerHTML=`<tr class="sc-total-row"><td colspan="2">Total</td><td>${inn.runs}</td><td colspan="2">${inn.wkts} wkts</td><td colspan="2">${ovStr(inn.overs)} ov</td></tr><tr><td colspan="7" style="font-size:11px;color:var(--text2)">Extras: ${inn.extras||0}</td></tr>`;
}
function rBowlTable(battingInn,bowlingInn){
  const t=team(bowlingInn.tId);
  id('sc-bowling-team-name').textContent=t?.name||'';
  const rows=Object.entries(battingInn.bwPl||{}).map(([pid,s])=>({p:player(pid),s})).filter(e=>e.p);
  id('sc-bowling-body').innerHTML=rows.map(({p,s},i)=>{
    const ov=`${Math.floor(s.b/6)}.${s.b%6}`,eco=s.b>0?((s.r/s.b)*6).toFixed(2):'0.00';
    return `<tr class="${i===0&&s.wkts>0?'top-wicket':''}"><td>${esc(p.name)}</td><td>${ov}</td><td>${s.maidens}</td><td>${s.r}</td><td>${s.wkts}</td><td>${eco}</td><td>0</td><td>0</td></tr>`;
  }).join('');
}
function rFoW(inn){id('sc-fow').innerHTML=(inn.fow||[]).map(f=>`<span class="sc-fow-item">${f.w}-${f.r} (${f.ov}.${f.bl})</span>`).join('')||'<span style="color:var(--text3);font-size:11px">No wickets fell.</span>';}
function rPPSummary(inn){id('sc-pp-summary').innerHTML=`<div class="sc-pp-stat">Runs: <strong>${inn.ppR||0}</strong></div><div class="sc-pp-stat">Wickets: <strong>${inn.ppW||0}</strong></div><div class="sc-pp-stat">Run Rate: <strong>${inn.ppR?((inn.ppR||0)/6).toFixed(2):'0.00'}</strong></div>`;}
function rMoM(m){
  const p=player(m.momPlayerId||m.mom);
  const bs=m.inn1.bPl[m.momPlayerId||m.mom]||m.inn2.bPl[m.momPlayerId||m.mom];
  const bw=m.inn1.bwPl[m.momPlayerId||m.mom]||m.inn2.bwPl[m.momPlayerId||m.mom];
  const stat=bs?`${bs.r} runs (${bs.b} balls)`:bw?`${bw.wkts}/${bw.r}`:'';
  id('sc-mom').innerHTML=`<div class="sc-mom-player"><span class="mom-icon">⭐</span><div><div class="mom-name">${p?esc(p.name):'—'}</div><div class="mom-perf">${esc(stat)}</div></div></div>`;
}
function downloadScorecard(){
  if(!_sc)return;
  const tA=team(_sc.tA),tB=team(_sc.tB);
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IPL MUN MD${_sc.md}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 10px;font-size:12px}th{background:#f5f5f5}</style></head><body>${id('scorecard-content').innerHTML}</body></html>`;
  dl(`md${_sc.md}_${tA?.short||'A'}_v_${tB?.short||'B'}.html`,html,'text/html');
  toast('Scorecard downloaded!','success');
}

/* ─────────────────────────────────────────────────────────
   15. STATS
───────────────────────────────────────────────────────── */
function rStats(){ rCaps(); switchStatTab('batting'); }
function rCaps(){
  const oc=orangeCap(),pc=purpleCap();
  id('orange-cap-holder').textContent=oc?oc.name:'—';
  id('orange-cap-stat').textContent=oc?`${oc.runs} runs`:'';
  id('purple-cap-holder').textContent=pc?pc.name:'—';
  id('purple-cap-stat').textContent=pc?`${pc.wkts} wickets`:'';
}
function switchStatTab(tab){
  qa('.stat-tab').forEach(t=>t.classList.toggle('active',t.dataset.stat===tab));
  qa('.stat-panel').forEach(p=>p.classList.toggle('active',p.id===`stats-${tab}-panel`));
  if(tab==='batting')rStatBat();
  if(tab==='bowling')rStatBowl();
  if(tab==='fielding')rStatField();
  if(tab==='sixes')rStatSixes();
  if(tab==='milestones')rMilestones();
}
function rStatBat(){
  const rows=S.players.filter(p=>p.teamId).map(p=>({p,s:S.stats.bat[p.id]||{}}))
    .filter(({s})=>s.matches>0).sort((a,b)=>(b.s.r||0)-(a.s.r||0));
  id('stat-batting-body').innerHTML=rows.map(({p,s},i)=>{
    const avg=s.outs>0?(s.r/s.outs).toFixed(1):s.r||0,sr=s.b>0?((s.r/s.b)*100).toFixed(1):'0.0';
    const t=team(p.teamId),own=p.teamId===ME.teamId;
    return `<tr class="${i===0?'stat-leader':''}${own?' own-player':''}">
      <td>${i+1}</td><td><span style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:${t?.color||'var(--text3)'}"></span>${esc(p.name)}</span></td>
      <td>${esc(t?.short||t?.name||'')}</td><td>${s.matches||0}</td>
      <td style="font-weight:700;color:var(--ipl2)">${s.r||0}</td>
      <td>${s.hs||0}</td><td>${avg}</td><td>${sr}</td><td>${s.fifties||0}</td><td>${s.hundreds||0}</td><td>${s.sixes||0}</td><td>${s.fours||0}</td>
    </tr>`;
  }).join('')||'<tr class="table-empty-row"><td colspan="12">No batting data yet.</td></tr>';
}
function rStatBowl(){
  const rows=S.players.filter(p=>p.teamId).map(p=>({p,s:S.stats.bowl[p.id]||{}}))
    .filter(({s})=>s.wkts>0||s.matches>0).sort((a,b)=>(b.s.wkts||0)-(a.s.wkts||0));
  const overs=s=>s.balls?parseFloat((Math.floor(s.balls/6)+(s.balls%6)*0.1).toFixed(1)):0;
  const eco=s=>s.balls>0?((s.runs/s.balls)*6).toFixed(2):'0.00';
  const avg=s=>s.wkts>0?(s.runs/s.wkts).toFixed(1):'—';
  id('stat-bowling-body').innerHTML=rows.map(({p,s},i)=>{
    const t=team(p.teamId),own=p.teamId===ME.teamId;
    return `<tr class="${i===0?'stat-leader':''}${own?' own-player':''}">
      <td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(t?.short||t?.name||'')}</td><td>${s.matches||0}</td>
      <td style="font-weight:700;color:var(--purple)">${s.wkts||0}</td>
      <td>${s.runs||0}</td><td>${overs(s)}</td><td>${avg(s)}</td><td>${eco(s)}</td><td>${esc(s.best||'0/0')}</td><td>${s.fiveW||0}</td>
    </tr>`;
  }).join('')||'<tr class="table-empty-row"><td colspan="11">No bowling data yet.</td></tr>';
}
function rStatField(){
  const rows=S.players.filter(p=>p.teamId).map(p=>({p,s:S.stats.field[p.id]||{}}))
    .filter(({s})=>(s.catches||0)+(s.stumpings||0)+(s.runOuts||0)>0)
    .sort((a,b)=>((b.s.catches||0)+(b.s.stumpings||0))-((a.s.catches||0)+(a.s.stumpings||0)));
  id('stat-fielding-body').innerHTML=rows.map(({p,s},i)=>`<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(team(p.teamId)?.short||'')}</td><td>${s.catches||0}</td><td>${s.stumpings||0}</td><td>${s.runOuts||0}</td></tr>`).join('')||'<tr class="table-empty-row"><td colspan="6">No fielding data yet.</td></tr>';
}
function rStatSixes(){
  const rows=S.players.filter(p=>p.teamId).map(p=>({p,s:S.stats.bat[p.id]||{}}))
    .filter(({s})=>(s.sixes||0)>0).sort((a,b)=>(b.s.sixes||0)-(a.s.sixes||0));
  id('stat-sixes-body').innerHTML=rows.map(({p,s},i)=>`<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(team(p.teamId)?.short||'')}</td><td style="font-weight:700;color:var(--gold)">${s.sixes||0}</td><td>${s.fours||0}</td></tr>`).join('')||'<tr class="table-empty-row"><td colspan="5">No sixes data yet.</td></tr>';
}
function rMilestones(){
  const list=S.stats.milestones||[];
  const icons={fastest100:'💯',fiveWickets:'🎳',century:'💯',fifty:'⭐'};
  id('milestones-list').innerHTML=list.length?[...list].reverse().map(m=>{const p=player(m.pid);return`<div class="milestone-entry"><span class="milestone-entry-icon">${icons[m.type]||'🌟'}</span><div class="milestone-entry-detail"><div class="milestone-entry-name">${p?esc(p.name):'?'} — ${esc(m.type)}</div><div class="milestone-entry-stat">${esc(String(m.val||''))}</div></div><span class="milestone-entry-md">MD ${m.md}</span></div>`;}).join(''):'<div class="list-empty">No milestones yet.</div>';
}
function exportStatsCsv(type){
  let rows=[];
  if(type==='batting'){
    rows=[['Name','Team','M','Runs','HS','Avg','SR','50s','100s','6s','4s']];
    S.players.filter(p=>p.teamId).forEach(p=>{const s=S.stats.bat[p.id]||{};const avg=s.outs>0?(s.r/s.outs).toFixed(1):'—';const sr=s.b>0?((s.r/s.b)*100).toFixed(1):'0.0';rows.push([p.name,team(p.teamId)?.name||'',s.matches||0,s.r||0,s.hs||0,avg,sr,s.fifties||0,s.hundreds||0,s.sixes||0,s.fours||0]);});
  } else {
    rows=[['Name','Team','M','Wkts','Runs','Overs','Avg','Econ','Best','5W']];
    S.players.filter(p=>p.teamId).forEach(p=>{const s=S.stats.bowl[p.id]||{};const ov=s.balls?parseFloat((Math.floor(s.balls/6)+(s.balls%6)*0.1).toFixed(1)):0;const avg=s.wkts>0?(s.runs/s.wkts).toFixed(1):'—';const eco=s.balls>0?((s.runs/s.balls)*6).toFixed(2):'0.00';rows.push([p.name,team(p.teamId)?.name||'',s.matches||0,s.wkts||0,s.runs||0,ov,avg,eco,s.best||'0/0',s.fiveW||0]);});
  }
  dl(`ipl_${type}_stats.csv`,rows.map(r=>r.join(',')).join('\n'),'text/csv');
}

/* ─────────────────────────────────────────────────────────
   16. ADMIN PAGE
───────────────────────────────────────────────────────── */
function rAdmin(){
  rTeamCodes(); rTradeDeskSelects(); rTradeLogRender(); rPlayoffsBracket();
  id('admin-session-id').textContent=S.liveSession?.blobId||'—';
  const autopush=id('admin-autopush'); if(autopush)autopush.checked=S.liveSession?.autoPush||false;
  const md=S.season.currentMD, isOpen=md>1&&md%S.season.tradeEvery===1;
  const badge=id('admin-trade-window-status');
  if(badge){badge.textContent=isOpen?'Open':'Closed';badge.style.color=isOpen?'var(--green)':'var(--text2)';}
}
function rTeamCodes(){
  id('admin-codes-list').innerHTML=S.teams.map(t=>{
    const code=S.codes[t.id]||'????';
    return `<div class="code-row">
      <div class="code-row-team"><span class="budget-pip" style="background:${t.color}"></span>${esc(t.name)}</div>
      <code class="code-pill">${code}</code>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${code}').then(()=>toast('${esc(t.short||t.name)}: ${code} copied!','success'))" title="Copy">📋</button>
      <button class="btn btn-secondary btn-sm" onclick="S.codes['${t.id}']=rCode(4);save();rTeamCodes();toast('Code regenerated.','success')">↺</button>
    </div>`;
  }).join('')||'<div class="list-empty">No teams yet.</div>';
}
function generateAllCodes(){S.teams.forEach(t=>S.codes[t.id]=rCode(4));save();rTeamCodes();toast('All codes regenerated!','success');}
function copyCode(code,name){navigator.clipboard.writeText(code).then(()=>toast(`${name}: ${code} copied!`,'success'));}

function rTradeDeskSelects(){
  ['trade-team-a','trade-team-b'].forEach(sid=>{
    const sel=id(sid); if(!sel)return;
    sel.innerHTML='<option value="">Select team…</option>'+S.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  });
  id('trade-team-a')?.addEventListener('change',e=>fillTradePlayers('trade-player-a',e.target.value));
  id('trade-team-b')?.addEventListener('change',e=>fillTradePlayers('trade-player-b',e.target.value));
}
function fillTradePlayers(selId,tid){
  const sel=id(selId),t=team(tid); if(!sel)return;
  sel.innerHTML='<option value="">Select player…</option>'+(t?S.players.filter(p=>p.teamId===tid).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join(''):'');
}
function executeTrade(){
  const tAid=id('trade-team-a')?.value,tBid=id('trade-team-b')?.value;
  const pAid=id('trade-player-a')?.value,pBid=id('trade-player-b')?.value;
  if(!tAid||!tBid||!pAid||!pBid){toast('Select both teams and players.','warn');return;}
  if(tAid===tBid){toast('Cannot trade within same team.','warn');return;}
  const pA=player(pAid),pB=player(pBid),tA=team(tAid),tB=team(tBid);
  pA.teamId=tBid;tA.players=tA.players.filter(i=>i!==pAid);tB.players.push(pAid);
  pB.teamId=tAid;tB.players=tB.players.filter(i=>i!==pBid);tA.players.push(pBid);
  S.tradeLog.push({md:S.season.currentMD,pAid,pBid,tAid,tBid,ts:Date.now()});
  save();rTradeDeskSelects();rTradeLogRender();toast(`Trade: ${pA.name} ⇄ ${pB.name}`,'success');
}
function rTradeLogRender(){
  const el=id('trade-log'); if(!el)return;
  const log=S.tradeLog||[];
  if(!log.length){el.innerHTML='<div class="list-empty">No trades this season.</div>';return;}
  el.innerHTML=[...log].reverse().map(e=>{
    const pA=player(e.pAid),pB=player(e.pBid),tA=team(e.tAid),tB=team(e.tBid);
    return `<div class="trade-log-entry"><span class="trade-log-md">MD${e.md}</span><span class="trade-log-detail">${esc(pA?.name||'?')} (${esc(tA?.short||'?')}) ⇄ ${esc(pB?.name||'?')} (${esc(tB?.short||'?')})</span></div>`;
  }).join('');
}

/* ── PLAYOFFS BRACKET ── */
function setupPlayoffs(){
  const top4=standings().slice(0,4);
  if(top4.length<4){toast('Need 4 teams for playoffs.','warn');return;}
  S.playoffs={
    q1:   {tA:top4[0].id,tB:top4[1].id,result:null,label:'Qualifier 1'},
    elim: {tA:top4[2].id,tB:top4[3].id,result:null,label:'Eliminator'},
    q2:   {tA:null,tB:null,result:null,label:'Qualifier 2'},
    final:{tA:null,tB:null,result:null,label:'Final'},
    stage:'q1',champion:null,
  };
  save();
}
function rPlayoffsBracket(){
  const statusEl=id('admin-playoffs-status'),actEl=id('playoffs-sim-actions');
  const isP=['playoffs','complete'].includes(S.season.status);
  if(statusEl){statusEl.textContent=isP?(S.season.status==='complete'?'Complete':'Active'):'League stage';statusEl.style.color=isP?(S.season.status==='complete'?'var(--gold)':'var(--green)'):'var(--text2)';}
  if(actEl)actEl.classList.toggle('hidden',!isP||S.season.status==='complete');
  const p=S.playoffs;
  const tN=id=>{ const t=team(id); return t?`<span style="color:${t.color}">${esc(t.short||t.name)}</span>`:'<em style="color:var(--text3)">TBD</em>'; };
  const fxL=fix=>{if(!fix?.tA)return'<em style="color:var(--text3)">TBD</em>';const r=fix.result;const w=r?` → ${tN(r.winId)}`:' ';return`${tN(fix.tA)} <span style="color:var(--text3)">vs</span> ${tN(fix.tB)}${w}`;};
  if(p){
    const q1El=id('bracket-q1'),eEl=id('bracket-elim'),q2El=id('bracket-q2'),fEl=id('bracket-final');
    if(q1El)q1El.innerHTML=fxL(p.q1);if(eEl)eEl.innerHTML=fxL(p.elim);if(q2El)q2El.innerHTML=fxL(p.q2);if(fEl)fEl.innerHTML=fxL(p.final);
  }
  const btn=actEl?.querySelector('button');
  if(btn&&p){const lbls={q1:'Simulate Qualifier 1',elim:'Simulate Eliminator',q2:'Simulate Qualifier 2',final:'⚡ Simulate Final',complete:'Season Complete'};btn.textContent=lbls[p.stage]||'Simulate';btn.disabled=p.stage==='complete';}
}
function simulatePlayoffMatch(){
  if(!S.playoffs){setupPlayoffs();}
  const p=S.playoffs,stg=p.stage,fix=p[stg];
  if(!fix||!fix.tA||!fix.tB){toast('Bracket not ready.','warn');return;}
  const synthetic={id:`playoff_${stg}`,tA:fix.tA,tB:fix.tB,venueId:S.venues[Math.floor(Math.random()*S.venues.length)]?.id,result:null};
  const result=simMatch(synthetic);
  fix.result=result; S.matches.push(result);
  applyResult(result);
  const win=team(result.winId),los=team(result.winId===fix.tA?fix.tB:fix.tA);
  if(stg==='q1'){
    p.stage='elim';
  } else if(stg==='elim'){
    const q1Los=p.q1.result?(p.q1.result.winId===p.q1.tA?p.q1.tB:p.q1.tA):null;
    p.q2.tA=q1Los; p.q2.tB=result.winId; p.stage='q2';
  } else if(stg==='q2'){
    p.final.tA=p.q1.result?.winId; p.final.tB=result.winId; p.stage='final';
  } else if(stg==='final'){
    p.champion=result.winId; p.stage='complete';
    S.season.status='complete';
    setTimeout(()=>{const s=standings();showChampionReveal(team(result.winId),s.find(t=>t.id!==result.winId)||s[1],s);},1200);
  }
  save();rPlayoffsBracket();rSidebar();
  toast(`${win.name} beat ${los?.name||'?'} — ${result.desc}`,'success');
}

function changePassword(){
  const v=id('new-password')?.value.trim(); if(!v){toast('Enter a new password.','warn');return;}
  S.season.adminPassword=v; save(); id('new-password').value=''; toast('Password updated!','success');
}
function copySessionId(){const bid=S.liveSession?.blobId;if(!bid){toast('No active session.','warn');return;}navigator.clipboard.writeText(bid).then(()=>toast('Session ID copied!','success'));}
function toggleAutoPush(val){if(!S.liveSession)S.liveSession={};S.liveSession.autoPush=val;save();}

async function createSession(){
  try{
    const res=await fetch('https://jsonblob.com/api/jsonBlob',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(S)});
    const loc=res.headers.get('Location'),bid=loc?loc.split('/').pop():null;
    if(!bid)throw new Error('No ID');
    if(!S.liveSession)S.liveSession={};
    S.liveSession.blobId=bid; save();
    id('admin-session-id').textContent=bid;
    toast('Session created: '+bid,'success');
  }catch(e){toast('Could not create session.','error');}
}
async function pushState(){
  const bid=S.liveSession?.blobId; if(!bid){toast('Create a session first.','warn');return;}
  try{await fetch(`https://jsonblob.com/api/jsonBlob/${bid}`,{method:'PUT',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(S)});toast('State pushed!','success');}
  catch(e){toast('Push failed.','error');}
}
async function fetchSession(sid,onDone){
  try{const res=await fetch(`https://jsonblob.com/api/jsonBlob/${sid}`,{headers:{'Accept':'application/json'}});S=patch(await res.json());save();if(onDone)onDone();}
  catch(e){toast('Could not load session.','error');}
}
function startPoll(){
  const bid=S.liveSession?.blobId; if(!bid)return;
  UI.pollTimer=setInterval(async()=>{
    if(!S.liveSession?.blobId)return;
    try{const res=await fetch(`https://jsonblob.com/api/jsonBlob/${S.liveSession.blobId}`,{headers:{'Accept':'application/json'}});S=patch(await res.json());save();if(UI.page==='live')rLive();if(UI.page==='points')rPoints();rSidebar();updSync('synced');}
    catch(_){updSync('error');}
  },8000);
}
function updSync(st){const el=id('header-sync');if(el){el.classList.remove('hidden');el.className=`sync-dot ${st}`;}}
function toggleProjectorView(){const b=document.body.classList.toggle('projector-mode');const hdr=id('main-header'),sb=id('sidebar'),mc=id('main-content');if(b){hdr.style.display='none';sb.classList.add('hidden');mc.style.padding='0';toast('Projector ON — press P to exit.','info',8000);}else{hdr.style.display='';sb.classList.remove('hidden');mc.style.padding='';}  }
function confirmReset(){id('modal-backdrop').classList.remove('hidden');id('modal-reset').classList.remove('hidden');}
function executeReset(){if(id('reset-confirm-input')?.value.trim()!=='RESET'){toast('Type RESET exactly.','warn');return;}closeModal();S=freshState();save();ME={role:null,teamId:null};id('app').classList.add('hidden');id('screen-login').classList.add('active');toast('Season reset.','info');}

/* ─────────────────────────────────────────────────────────
   17. MODALS & OVERLAYS
───────────────────────────────────────────────────────── */
function closeModal(e){
  if(e&&e.target!==id('modal-backdrop'))return;
  id('modal-backdrop').classList.add('hidden');
  qa('.modal').forEach(m=>m.classList.add('hidden'));
}
function openPlayerModal(pid){
  const p=player(pid); if(!p)return;
  const t=team(p.teamId);
  id('modal-player-title').textContent=p.name;
  id('modal-player-team').textContent=t?t.name:'Unassigned';
  id('modal-player-price').textContent=`₹${p.price||p.base} Cr`;
  const rb=id('modal-player-role-badge'); rb.textContent=p.role; rb.className=`role-badge ${p.role}`;
  const bars=[{l:'Batting',v:p.bat,c:'bat'},{l:'Bowling',v:p.bowl,c:'bowl'},{l:'Fielding',v:p.field,c:'field'}];
  if(p.role==='WK')bars.push({l:'Keeping',v:p.keep,c:'keep'});
  id('modal-player-ratings').innerHTML=bars.map(b=>`<div class="rating-row"><span class="rating-label">${b.l}</span><div class="rating-track"><div class="rating-fill ${b.c}" style="width:${b.v}%"></div></div><span class="rating-value">${b.v}</span></div>`).join('');
  const inj=id('modal-player-injury');
  inj.classList.toggle('hidden',!p.injured&&!p.suspended);
  id('modal-injury-mds').textContent=p.injured?'rest of season':p.injuredMDs||1;
  id('modal-backdrop').classList.remove('hidden');
  id('modal-player').classList.remove('hidden');
}

/* TOSS OVERLAY */
function showTossOv(tA,tB,onDone){
  id('toss-team-a').textContent=tA.name;
  id('toss-team-b').textContent=tB.name;
  id('toss-result').classList.add('hidden');
  id('btn-toss-continue').style.display='none';
  id('overlay-toss').classList.remove('hidden');
  const coin=id('toss-coin'); coin.classList.remove('flipping'); void coin.offsetWidth; coin.classList.add('flipping');
  const win=Math.random()<0.5?tA:tB, dec=Math.random()<0.5?'bat first':'field first';
  setTimeout(()=>{
    id('toss-winner-name').textContent=win.name;
    id('toss-winner-name').style.color=win.color||'var(--ipl2)';
    id('toss-decision').textContent=`elected to ${dec}`;
    id('toss-result').classList.remove('hidden');
    id('btn-toss-continue').style.display='inline-flex';
    window._tossCb=onDone;
  },1800);
}
function closeToss(){id('overlay-toss').classList.add('hidden');const cb=window._tossCb;window._tossCb=null;if(cb)cb();}

/* MILESTONE OVERLAY */
function showMilestoneOv(type,p,stat){
  const cfg={fifty:{icon:'⭐',title:'FIFTY!',color:'var(--ipl2)'},century:{icon:'💯',title:'CENTURY!',color:'var(--gold)'},fiveWkt:{icon:'🎳',title:'5-FER!',color:'var(--purple)'}}[type]||{icon:'🌟',title:'MILESTONE!',color:'var(--gold)'};
  id('milestone-icon').textContent=cfg.icon;
  id('milestone-title').textContent=cfg.title; id('milestone-title').style.color=cfg.color;
  id('milestone-player').textContent=p.name; id('milestone-stat').textContent=stat;
  spawnConfetti('milestone-confetti',30,['var(--gold)','var(--ipl2)','var(--green)','#fff']);
  const el=id('overlay-milestone'); el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),3500);
}

/* SUPER OVER OVERLAY */
function showSuperOverOv(tA,tB){
  q('#so-team-a .so-team-name').textContent=tA.name;
  q('#so-team-b .so-team-name').textContent=tB.name;
  id('overlay-super-over').classList.remove('hidden');
}
function startSuperOver(){id('overlay-super-over').classList.add('hidden');}

/* CRISIS OVERLAY */
function showCrisisOv(p,t){
  id('crisis-player-name').textContent=p.name;
  id('crisis-team-name').textContent=t.name;
  spawnCrosses('crisis-crosses',20);
  id('overlay-crisis').classList.remove('hidden');
}
function dismissCrisis(){id('overlay-crisis').classList.add('hidden');}

/* CHAMPION REVEAL */
function showChampionReveal(winner,runnerUp,finalStandings){
  const ov=id('overlay-champion'); ov.classList.remove('hidden');
  qa('.champ-stage').forEach(s=>{s.classList.remove('active');s.classList.add('hidden');});
  const delays=[0,1400,3000,5000,6200,9200];
  [0,1,2,3,4,5].forEach((s,i)=>setTimeout(()=>{
    qa('.champ-stage').forEach(el=>el.classList.remove('active'));
    const el=id(`champ-stage-${s}`); el.classList.remove('hidden'); el.classList.add('active');
    if(s===2){id('champ-runner-up-name').textContent=runnerUp?.name||'—';id('champ-runner-up-pts').textContent=`${runnerUp?.points||0} points`;}
    if(s===4){const wn=id('champ-winner-name');wn.textContent=winner.name;wn.style.color=winner.color||'var(--gold)';spawnConfetti('champ-confetti',80,[winner.color||'var(--gold)','var(--ipl2)','#fff','var(--green)']);}
    if(s===5){
      id('champ-final-standings').innerHTML=(finalStandings||[]).slice(0,4).map((t,i)=>`<div class="champ-final-row"><span style="font-family:var(--fm);color:var(--text3);width:16px">${i+1}</span><span class="sr-pip" style="background:${t.color}"></span><span style="flex:1;font-weight:600">${esc(t.name)}</span><span style="font-family:var(--fm);color:var(--ipl2)">${t.points}pts</span></div>`).join('');
      setTimeout(()=>id('btn-champ-dismiss').style.display='inline-flex',500);
    }
  },delays[i]));
}
function dismissChampion(){id('overlay-champion').classList.add('hidden');showAwardsCeremony();}

/* AWARDS CEREMONY */
let _aIdx=0;
const AWARDS=[
  {icon:'🟠',name:'Orange Cap — Most Runs',       fn:()=>{const o=orangeCap();return o?{name:o.name,stat:`${o.runs} runs`}:null;}},
  {icon:'🟣',name:'Purple Cap — Most Wickets',    fn:()=>{const p=purpleCap();return p?{name:p.name,stat:`${p.wkts} wickets`}:null;}},
  {icon:'💥',name:'Most Sixes',                   fn:()=>{let b=null,mx=-1;S.players.forEach(p=>{const s=S.stats.bat[p.id];if(s&&(s.sixes||0)>mx){mx=s.sixes;b={...p,sixes:s.sixes};}});return b?{name:b.name,stat:`${b.sixes} sixes`}:null;}},
  {icon:'⭐',name:'Man of Tournament',             fn:()=>{let b=null,mx=-1;S.players.forEach(p=>{const a=S.stats.mom[p.id]||0;if(a>mx){mx=a;b={...p,awards:a};}});return b?{name:b.name,stat:`${b.awards} MoM awards`}:null;}},
  {icon:'🏆',name:'Season Champion',              fn:()=>{const s=standings();return s.length?{name:s[0].name,stat:`${s[0].points} points`}:null;}},
];
function showAwardsCeremony(){
  _aIdx=0;id('overlay-awards').classList.remove('hidden');
  id('btn-next-award').classList.remove('hidden'); id('btn-close-awards').classList.add('hidden');
  showAwardStep(); rAwardProgress();
}
function nextAward(){_aIdx++;if(_aIdx>=AWARDS.length){id('btn-next-award').classList.add('hidden');id('btn-close-awards').classList.remove('hidden');return;}showAwardStep();rAwardProgress();}
function showAwardStep(){
  const a=AWARDS[_aIdx],r=a.fn();
  id('award-icon-display').textContent=a.icon; id('award-name-display').textContent=a.name;
  id('award-winner-display').textContent=r?r.name:'—'; id('award-stat-display').textContent=r?r.stat:'';
  spawnConfetti('award-confetti',20,['var(--gold)','var(--ipl2)','#fff']);
}
function rAwardProgress(){id('awards-progress').innerHTML=AWARDS.map((_,i)=>`<div class="award-progress-dot ${i<_aIdx?'done':i===_aIdx?'active':''}"></div>`).join('');}
function closeAwards(){id('overlay-awards').classList.add('hidden');}

/* CONFETTI */
function spawnConfetti(cid,n,colors){
  const el=id(cid);if(!el)return;el.innerHTML='';
  for(let i=0;i<n;i++){
    const d=document.createElement('div');
    d.className='confetti-piece';
    d.style.cssText=`--x:${(Math.random()-.5)*200}px;--dx:${(Math.random()-.5)*120}px;--rot:${Math.random()*720}deg;--dur:${1.2+Math.random()*.8}s;--delay:${Math.random()*.4}s;background:${colors[i%colors.length]};left:${10+Math.random()*80}%;top:10%`;
    el.appendChild(d);
  }
}
function spawnCrosses(cid,n){
  const el=id(cid);if(!el)return;el.innerHTML='';
  for(let i=0;i<n;i++){
    const d=document.createElement('div');
    d.className='crisis-cross-piece';d.textContent='✕';
    d.style.cssText=`--rot:${Math.random()*30-15}deg;--dur:${2+Math.random()}s;--delay:${Math.random()*1.5}s;left:${Math.random()*100}%`;
    el.appendChild(d);
  }
}

/* ─────────────────────────────────────────────────────────
   18. HELPERS & UTILITIES
───────────────────────────────────────────────────────── */
const id  = i  => document.getElementById(i);
const q   = s  => document.querySelector(s);
const qa  = s  => document.querySelectorAll(s);
const se  = (i,v) => { const el=id(i); if(el)el.textContent=v; };
const esc = s  => { if(typeof s!=='string')s=String(s||''); return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

const team   = tid => S.teams.find(t=>t.id===tid)||null;
const player = pid => S.players.find(p=>p.id===pid)||null;
const ven    = vid => S.venues.find(v=>v.id===vid)||null;

function standings(){
  return [...S.teams].sort((a,b)=>b.points!==a.points?b.points-a.points:(b.nrr||0)-(a.nrr||0));
}
function orangeCap(){
  let best=null,mx=-1;
  S.players.forEach(p=>{const s=S.stats.bat[p.id];if(s&&(s.r||0)>mx){mx=s.r;best={...p,runs:s.r};}});
  return best;
}
function purpleCap(){
  let best=null,mx=-1;
  S.players.forEach(p=>{const s=S.stats.bowl[p.id];if(s&&(s.wkts||0)>mx){mx=s.wkts;best={...p,wkts:s.wkts};}});
  return best;
}
function rCode(n){
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:n},()=>c[Math.floor(Math.random()*c.length)]).join('');
}

/* TOAST */
function toast(msg,type='info',dur=3500){
  const c=id('toast-container');
  const t=document.createElement('div');
  const icons={success:'✓',error:'✕',warn:'⚠',info:'ℹ'};
  t.className=`toast toast-${type}`;
  t.innerHTML=`<span>${icons[type]||'ℹ'}</span><span>${esc(msg)}</span>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('toast-out');t.addEventListener('animationend',()=>t.remove());},dur);
}

/* Alias legacy function names still in HTML */
function loginAsAdmin()       { loginAdmin(); }
function loginAsDelegate()    { loginDelegate(); }
function loginSwitchTab(t)    { switchTab(t); }
function navTo(p)             { go(p); }
function lockAllStrategies()  {
  S.teams.forEach(t=>t.locked=true);
  save();rMDStrategy();rStrategy();toast('All strategies locked!','success');
}
function switchStatTab(t)     { switchStatTab_real(t); }
function switchStatTab_real(t){ switchStatTab=switchStatTab_real; /* prevent recursion */ qa('.stat-tab').forEach(b=>b.classList.toggle('active',b.dataset.stat===t));qa('.stat-panel').forEach(p=>p.classList.toggle('active',p.id===`stats-${t}-panel`));if(t==='batting')rStatBat();if(t==='bowling')rStatBowl();if(t==='fielding')rStatField();if(t==='sixes')rStatSixes();if(t==='milestones')rMilestones();}

/* ─────────────────────────────────────────────────────────
   19. BOOT
───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const fromURL = loadFromURL();
  if (!fromURL) load();
  fillDelegateTeams();
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      qa('.overlay:not(.hidden)').forEach(o=>{
        if(o.id!=='overlay-champion'&&o.id!=='overlay-awards') o.classList.add('hidden');
      });
    }
    if (e.key==='p'&&e.ctrlKey) { e.preventDefault(); toggleProjectorView(); }
  });
  console.log('%c IPL MUN v3.1 — Ready ','background:#ff6b1a;color:#fff;font-family:monospace;font-weight:bold;padding:4px 10px;border-radius:4px');
});

/* ── HTML alias fixes ── */
function confirmAssign() { confirmBid(); }  // HTML uses old name
function drawNextLot()   { drawLot(); }     // HTML uses old name
function skipLot()       { markUnsold(); }  // HTML uses old name

/* ── Fix duplicate lockAllStrategies — keep only one ── */
/* (second definition above is the canonical one) */

/* ── Fix switchStatTab recursion guard ── */
/* Override the broken alias with a clean version */
function switchStatTab(tab) {
  qa('.stat-tab').forEach(b=>b.classList.toggle('active',b.dataset.stat===tab));
  qa('.stat-panel').forEach(p=>p.classList.toggle('active',p.id===`stats-${tab}-panel`));
  if(tab==='batting')rStatBat();
  if(tab==='bowling')rStatBowl();
  if(tab==='fielding')rStatField();
  if(tab==='sixes')rStatSixes();
  if(tab==='milestones')rMilestones();
}

/* ═══════════════════════════════════════════════════════════
   IMPROVEMENT PATCH — 16 features + polish
   ═══════════════════════════════════════════════════════════ */

/* ── 1. ENHANCED SIMULATION: death overs + player form ─── */
function ball({isPP, pm, adB, adBow, homeBonus, batter, bowler, wkts, rn, bl, over}) {
  // Base probabilities
  let p6=Math.max(0,0.07+adB*0.12), p4=Math.max(0,0.12+adB*0.10);
  let p2=0.08, p1=0.32, p0=0.30;
  let pW=Math.max(0.03,0.10+adB*0.08+adBow*0.06), pWd=0.03, pNb=0.01;

  // Powerplay (overs 0-5)
  if(isPP){p6*=1.10;p4*=1.20;p1*=0.75;p0*=0.80;pW*=0.88;}

  // Middle overs (7-14) — consolidation
  else if(over>=6&&over<=13){p6*=0.85;p4*=0.95;p0*=1.10;}

  // Pre-death (15-16) — acceleration begins
  else if(over>=14&&over<=15){p6*=1.15;p4*=1.10;p0*=0.90;pW*=1.08;}

  // Death overs (17-20) — high risk, high reward
  else if(over>=16){p6*=1.35;p4*=1.20;p0*=0.65;pW*=1.15;p1*=0.75;}

  // Pitch mods
  p6*=pm.six; p4*=pm.four; pW*=pm.wkt;
  if(bowler?.role==='SPIN') pW+=pm.spinBonus;
  if(bowler?.role==='PACE') pW+=pm.paceBonus;

  // Batter quality
  if(batter){const r=(batter.bat+homeBonus)/100;p6*=0.75+r*0.50;p4*=0.75+r*0.50;pW*=1.25-r*0.50;}

  // Chase pressure
  if(rn!==null&&bl>0){
    const rr=rn/(bl/6);
    if(rr>15){p6*=1.50;p4*=1.25;pW*=1.30;p0*=0.50;} // desperate slog
    else if(rr>12){p6*=1.35;pW*=1.25;p0*=0.65;}
    else if(rr>9){p6*=1.15;p4*=1.10;p0*=0.80;}
    else if(rr<5){p0*=1.30;p6*=0.80;} // comfortable - rotate
  }

  // Wickets in hand pressure
  if(wkts>=8){pW*=1.20;p6*=0.80;}
  else if(wkts>=6){pW*=1.10;}

  const tot=p6+p4+p2+p1+p0+pW+pWd+pNb, rv=Math.random()*tot; let a=0;
  if((a+=p6)>rv)return{r:6};
  if((a+=p4)>rv)return{r:4};
  if((a+=p2)>rv)return{r:2};
  if((a+=p1)>rv)return{r:1};
  if((a+=p0)>rv)return{r:0};
  if((a+=pW)>rv)return{r:0,w:true,how:randDismissal()};
  if((a+=pWd)>rv)return{r:1,wd:true,extra:true};
  return{r:1,nb:true,extra:true};
}

// Also pass 'over' into simInnings ball calls
function simInnings(batT, bowlT, batters, bowlers, venue, target) {
  const pm=PITCH_MODS[venue?.pitch||'balanced']||PITCH_MODS.balanced;
  const adB=((batT.aggression||60)-60)/100;
  const adBow=((bowlT.aggression||60)-60)/100;
  const homeBonus=batT.venueId===venue?.id?3:0;
  let runs=0,wkts=0,balls=0,ppR=0,ppW=0;
  const bPl={},bwPl={},fow=[],log=[];
  batters.forEach(pid=>bPl[pid]={r:0,b:0,fours:0,sixes:0,out:false,how:''});
  bowlers.forEach(pid=>bwPl[pid]={r:0,b:0,wkts:0,maidens:0});
  const bq=[...bowlers].sort((a,b)=>(player(b)?.bowl||50)-(player(a)?.bowl||50));
  // Cap any bowler at 4 overs
  const bowlerOvers={};
  let bRot=0,b1=batters[0]||null,b2=batters[1]||null,bIdx=2;
  for(let ov=0;ov<20;ov++){
    const isPP=ov<6;
    // Find next bowler (max 4 overs each)
    let bowlerTries=0;
    while(bowlerTries<bq.length){
      const bid=bq[bRot%bq.length];
      if((bowlerOvers[bid]||0)<4){bowlerOvers[bid]=(bowlerOvers[bid]||0)+1;var bowlerId=bid;break;}
      bRot++;bowlerTries++;
    }
    if(!bowlerId&&bq.length) bowlerId=bq[bRot%bq.length]; // fallback
    bRot++;
    let ovR=0;
    for(let bl=0;bl<6;bl++){
      if(wkts>=10||(target&&runs>=target))break;
      balls++;
      const o=ball({isPP,pm,adB,adBow,homeBonus,over:ov,
        batter:b1?player(b1):null,bowler:bowlerId?player(bowlerId):null,
        wkts,rn:target?target-runs:null,bl:120-balls});
      runs+=o.r;ovR+=o.r;
      if(!o.extra&&b1&&bPl[b1]){bPl[b1].b++;bPl[b1].r+=o.r;if(o.r===4)bPl[b1].fours++;if(o.r===6)bPl[b1].sixes++;}
      if(!o.extra&&bwPl[bowlerId]){bwPl[bowlerId].b++;bwPl[bowlerId].r+=o.r;}
      if(isPP){ppR+=o.r;}
      if(o.w){
        wkts++;if(isPP)ppW++;
        if(b1&&bPl[b1]){bPl[b1].out=true;bPl[b1].how=o.how||'out';}
        if(bwPl[bowlerId])bwPl[bowlerId].wkts++;
        fow.push({w:wkts,r:runs,ov:ov+1,bl:bl+1});
        if(bIdx<batters.length)b1=batters[bIdx++];
      }
      if(o.r%2===1){const t=b1;b1=b2;b2=t;}
      log.push({ov,bl,r:o.r,w:!!o.w,wd:!!o.wd,nb:!!o.nb});
    }
    if(ovR===0&&bwPl[bowlerId])bwPl[bowlerId].maidens++;
    {const t=b1;b1=b2;b2=t;}
    if(target&&runs>=target)break;
  }
  const overs=parseFloat((Math.floor(balls/6)+(balls%6)*0.1).toFixed(1));
  // Extras breakdown
  const wides=log.filter(b=>b.wd).length,nballs=log.filter(b=>b.nb).length;
  const byes=Math.floor(Math.random()*3),lbyes=Math.floor(Math.random()*4);
  const extras=wides+nballs+byes+lbyes;
  return{tId:batT.id,runs:runs+byes+lbyes,wkts,overs,log,fow,ppR,ppW,bPl,bwPl,
         extras,extrasDetail:{wides,noBalls:nballs,byes,legByes:lbyes}};
}

/* ── 2. IMPROVED LIVE MATCH CARD ─────────────────────── */
function lmc(fix, featured=false) {
  const tA=team(fix.tA),tB=team(fix.tB),r=fix.result;
  const cls=`live-match-card${featured?' featured':''}${r?' complete':''}`;
  if(!r)return `<div class="${cls}"><div class="lmc-header"><div class="lmc-teams" style="color:var(--text2)">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</div><span class="lmc-over" style="color:var(--text3)">Not started</span></div><div class="lmc-body" style="color:var(--text3);font-size:12px;padding:16px">Awaiting simulation…</div></div>`;

  const i1=r.inn1,i2=r.inn2,bf=team(i1.tId),bs=team(i2.tId);

  // Top scorer each innings
  const topBat=(inn)=>{const entries=Object.entries(inn.bPl||{}).sort((a,b)=>b[1].r-a[1].r);if(!entries.length)return'—';const [pid,s]=entries[0];return`${esc(player(pid)?.name||'?')}: ${s.r}(${s.b})`;};
  const topBowl=(inn)=>{const entries=Object.entries(inn.bwPl||{}).filter(([,s])=>s.wkts>0).sort((a,b)=>b[1].wkts-a[1].wkts);if(!entries.length)return'—';const [pid,s]=entries[0];return`${esc(player(pid)?.name||'?')}: ${s.wkts}/${s.r}`;};

  // Required RR at start of chase
  const reqRR=(i1.runs+1)/20;
  const achRR=i2.overs>0?(i2.runs/i2.overs).toFixed(2):'0.00';
  const chaseWon=i2.runs>=i1.runs+1;

  // Last 6 balls
  const balls=(i2.log||[]).slice(-6).map(b=>{
    let c='d0',l='0';
    if(b.wd){c='dWd';l='Wd';}else if(b.nb){c='dNb';l='Nb';}
    else if(b.w){c='dW';l='W';}else if(b.r===6){c='d6';l='6';}
    else if(b.r===4){c='d4';l='4';}else if(b.r===2){c='d2';l='2';}
    else if(b.r===1){c='d1';l='1';}
    return`<div class="ball-dot ${c}">${l}</div>`;
  }).join('');

  // Powerplay summary
  const ppText=`PP: ${i1.ppR||0}/${i1.ppW||0} | ${i2.ppR||0}/${i2.ppW||0}`;
  const win=team(r.winId);

  return`<div class="${cls}">
    <div class="lmc-header">
      <div class="lmc-teams">${esc(tA?.short||tA?.name||'?')} vs ${esc(tB?.short||tB?.name||'?')}</div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
        <span class="lmc-over">${ovStr(i2.overs)} ov</span>
        <span style="font-family:var(--fm);font-size:8px;color:var(--text3)">${ppText}</span>
      </div>
    </div>
    <div class="lmc-body">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <div>
          <div style="font-size:11px;color:${bf?.color||'var(--text)'};font-weight:600">${esc(bf?.short||bf?.name||'?')}: ${i1.runs}/${i1.wkts}</div>
          <div style="font-size:10px;color:var(--text3)">${topBat(i1)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:${bs?.color||'var(--text)'};font-weight:600">${i2.runs}/${i2.wkts}</div>
          <div style="font-size:10px;color:var(--text3)">${topBat(i2)}</div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--text2);margin-bottom:5px">
        Target ${i1.runs+1} | Req RR ${reqRR.toFixed(2)} | Achieved ${achRR}
        ${chaseWon?'<span style="color:var(--green)"> ✓</span>':'<span style="color:var(--red)"> ✗</span>'}
      </div>
      <div style="font-size:10px;color:var(--text3);margin-bottom:5px">
        🏐 Best: ${topBowl(i1)} / ${topBowl(i2)}
      </div>
      <div class="lmc-ball-log"><span class="over-label">Last 6:</span>${balls||'<span style="color:var(--text3)">—</span>'}</div>
    </div>
    <div class="lmc-result" style="color:${win?.color||'var(--gold)'}">
      ${esc(win?.name||'?')} ${esc(r.desc)}${r.so?' <span style="color:var(--gold)">(SO)</span>':''}
    </div>
  </div>`;
}

/* ── 3. GANTT CHART RENDERER ─────────────────────────── */
function scheduleView(type) {
  id('schedule-list-view').classList.toggle('hidden',type!=='list');
  id('schedule-gantt-view').classList.toggle('hidden',type!=='gantt');
  qa('.view-toggle').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase()===type));
  if(type==='gantt') renderGantt();
}
function renderGantt() {
  const el=id('schedule-gantt-view'); if(!el) return;
  const mds=S.season.totalMDs||0;
  if(!mds){el.innerHTML='<div class="list-empty" style="padding:16px">Generate schedule in Setup first.</div>';return;}
  const colW=Math.max(28,Math.min(40, Math.floor((el.clientWidth-110)/mds)));
  const mdNums=Array.from({length:mds},(_,i)=>i+1);
  let html=`<div style="overflow-x:auto;padding:8px 0"><div style="display:grid;grid-template-columns:90px repeat(${mds},${colW}px);gap:2px;min-width:${90+mds*(colW+2)}px">`;
  // Header row
  html+=`<div style="font-family:var(--fm);font-size:9px;color:var(--text3);padding:2px 4px;display:flex;align-items:center">Team</div>`;
  mdNums.forEach(n=>{
    const isCur=n===S.season.currentMD;
    html+=`<div style="font-family:var(--fm);font-size:8px;color:${isCur?'var(--ipl2)':'var(--text3)'};text-align:center;font-weight:${isCur?700:400}">${n}</div>`;
  });
  // Team rows
  S.teams.forEach(t=>{
    html+=`<div style="display:contents">`;
    html+=`<div style="font-size:10px;font-weight:600;display:flex;align-items:center;gap:4px;padding:2px 4px;overflow:hidden"><span style="width:6px;height:6px;border-radius:50%;background:${t.color};flex-shrink:0"></span>${esc(t.short||t.name)}</div>`;
    mdNums.forEach(md=>{
      const s=S.schedule.find(x=>x.md===md);
      const f=s?.fixtures.find(x=>x.tA===t.id||x.tB===t.id);
      let bg='var(--bg3)',title='No fixture',border='';
      if(f){
        if(f.result){
          const won=f.result.winId===t.id;
          bg=won?'rgba(16,185,129,0.55)':'rgba(244,63,94,0.45)';
          const opp=team(f.result.winId===f.tA?f.tB:f.tA);
          title=won?`Won vs ${opp?.name||'?'}`:`Lost vs ${opp?.name||'?'}`;
        }else{
          bg='rgba(255,107,26,0.20)';
          const opp=team(f.tA===t.id?f.tB:f.tA);
          title=`vs ${opp?.name||'?'}`;
          border='border:1px solid rgba(255,107,26,0.35);';
        }
      }
      html+=`<div style="height:22px;background:${bg};border-radius:3px;${border}cursor:default" title="${title}"></div>`;
    });
    html+=`</div>`;
  });
  html+=`</div></div>`;
  // Legend
  html+=`<div style="display:flex;gap:14px;margin-top:8px;padding:0 8px;font-family:var(--fm);font-size:9px;color:var(--text3)">
    <span><span style="display:inline-block;width:10px;height:10px;background:rgba(16,185,129,0.55);border-radius:2px;margin-right:4px"></span>Won</span>
    <span><span style="display:inline-block;width:10px;height:10px;background:rgba(244,63,94,0.45);border-radius:2px;margin-right:4px"></span>Lost</span>
    <span><span style="display:inline-block;width:10px;height:10px;background:rgba(255,107,26,0.20);border:1px solid rgba(255,107,26,0.35);border-radius:2px;margin-right:4px"></span>Upcoming</span>
  </div>`;
  el.innerHTML=html;
}

/* ── 4. XI COMPOSITION VALIDATION ─────────────────────── */
function validateXI(xi) {
  const players=xi.map(pid=>player(pid)).filter(Boolean);
  const roles=players.reduce((acc,p)=>{acc[p.role]=(acc[p.role]||0)+1;return acc;},{});
  const warnings=[];
  if(!(roles.WK>=1)) warnings.push('No wicket-keeper in XI');
  const bowlers=(roles.PACE||0)+(roles.SPIN||0)+(roles.AR||0);
  if(bowlers<4)   warnings.push(`Only ${bowlers} bowlers — need at least 4`);
  if(!(roles.BAT>=3||(roles.BAT||0)+(roles.WK||0)+(roles.AR||0)>=4)) warnings.push('Very few batters in XI');
  return warnings;
}

function confirmXI() {
  const t=team(ME.teamId); if(!t||t.xi.length!==11)return;
  const warnings=validateXI(t.xi);
  if(warnings.length){
    const proceed=confirm(`XI Warning:\n• ${warnings.join('\n• ')}\n\nConfirm anyway?`);
    if(!proceed) return;
  }
  save();
  id('xi-confirmed-state').classList.remove('hidden');
  id('btn-confirm-xi').disabled=true;
  toast('Playing XI confirmed!','success');
}

function confirmXIAdmin() {
  const t=team(UI.xiAdmin.teamId); if(!t||UI.xiAdmin.sel.length!==11)return;
  const warnings=validateXI(UI.xiAdmin.sel);
  if(warnings.length) toast(`⚠ ${warnings[0]}`, 'warn');
  t.xi=[...UI.xiAdmin.sel]; save(); closeXIAdminModal();
  rMDXI(); rStrategy(); toast(`XI set for ${t.name}!`,'success');
}

/* ── 5. STATS PLAYER SEARCH ──────────────────────────── */
function filterStatTable(tableId, searchVal) {
  const val = searchVal.toLowerCase().trim();
  qa(`#${tableId} tbody tr`).forEach(row => {
    const name = row.cells[1]?.textContent.toLowerCase()||'';
    const team = row.cells[2]?.textContent.toLowerCase()||'';
    row.style.display = (!val || name.includes(val) || team.includes(val)) ? '' : 'none';
  });
}
function injectStatSearch() {
  if(id('stat-search-bar')) return;
  const container=q('.stat-tabs');
  if(!container) return;
  const bar=document.createElement('div');
  bar.id='stat-search-bar';
  bar.style.cssText='margin-top:10px;margin-bottom:4px';
  bar.innerHTML=`<input class="form-input" type="text" placeholder="🔍 Search player or team…" oninput="filterCurrentStats(this.value)" style="max-width:280px">`;
  container.insertAdjacentElement('afterend',bar);
}
let _currentStatTab='batting';
function switchStatTab(tab) {
  _currentStatTab=tab;
  qa('.stat-tab').forEach(b=>b.classList.toggle('active',b.dataset.stat===tab));
  qa('.stat-panel').forEach(p=>p.classList.toggle('active',p.id===`stats-${tab}-panel`));
  if(tab==='batting')   rStatBat();
  if(tab==='bowling')   rStatBowl();
  if(tab==='fielding')  rStatField();
  if(tab==='sixes')     rStatSixes();
  if(tab==='milestones')rMilestones();
  injectStatSearch();
}
function filterCurrentStats(val) {
  const tableMap={batting:'stat-batting-table',bowling:'stat-bowling-table',fielding:'stat-fielding-table',sixes:'stat-sixes-table'};
  const tid=tableMap[_currentStatTab]; if(tid) filterStatTable(tid,val);
}
function rStats() { rCaps(); switchStatTab('batting'); }

/* ── 6. SCORECARD EXTRAS BREAKDOWN ──────────────────────── */
function rBatTable(inn) {
  const t=team(inn.tId);
  id('sc-batting-team-name').textContent=t?.name||'';
  const rows=Object.entries(inn.bPl||{}).map(([pid,s])=>({p:player(pid),s})).filter(e=>e.p);
  id('sc-batting-body').innerHTML=rows.map(({p,s},i)=>{
    const sr=s.b>0?((s.r/s.b)*100).toFixed(1):'0.0',own=ME.teamId&&p.teamId===ME.teamId;
    const milestone=s.r>=100?'💯':s.r>=50?'⭐':'';
    return `<tr class="${i===0&&s.r>0?'top-score':''}${own?' own-player':''}">
      <td>${esc(p.name)} ${milestone}</td>
      <td class="sc-col-dismissal">${s.out?esc(s.how||'out'):'<em style="color:var(--green)">not out</em>'}</td>
      <td style="font-weight:${s.r>=50?700:400}">${s.r}</td><td>${s.b}</td><td>${s.fours}</td><td>${s.sixes}</td><td>${sr}</td></tr>`;
  }).join('');
  // Extras with breakdown
  const ed=inn.extrasDetail||{};
  const extraParts=[];
  if(ed.wides)  extraParts.push(`W ${ed.wides}`);
  if(ed.noBalls)extraParts.push(`NB ${ed.noBalls}`);
  if(ed.byes)   extraParts.push(`B ${ed.byes}`);
  if(ed.legByes)extraParts.push(`LB ${ed.legByes}`);
  id('sc-batting-extras').innerHTML=`
    <tr class="sc-total-row"><td colspan="2">Total</td><td>${inn.runs}</td><td colspan="2">${inn.wkts} wkts</td><td colspan="2">${ovStr(inn.overs)} ov</td></tr>
    <tr><td colspan="7" style="font-size:11px;color:var(--text2)">Extras: ${inn.extras||0}${extraParts.length?` (${extraParts.join(', ')})`:''}</td></tr>`;
}

/* ── 7. IMPROVED SIMULATE ALL (staggered with feedback) ── */
function simulateAllMatches() {
  const sched=curSched(); if(!sched) return;
  const pending=sched.fixtures.filter(f=>!f.result);
  if(!pending.length){checkMDComplete();return;}
  // Validate: warn if any team has < 11 in XI
  const notReady=S.teams.filter(t=>!t.xi||t.xi.length<11);
  if(notReady.length){
    const names=notReady.map(t=>t.short||t.name).join(', ');
    if(!confirm(`XI not set for: ${names}. Auto-pick will be used. Continue?`)) return;
  }
  const tA=team(pending[0].tA),tB=team(pending[0].tB);
  const run=()=>runStaggered(pending,0);
  if(tA&&tB) showTossOv(tA,tB,run); else run();
}

function runStaggered(fixtures, idx) {
  if(idx>=fixtures.length){checkMDComplete();return;}
  const fix=fixtures[idx];
  simOne(fix.id,()=>setTimeout(()=>runStaggered(fixtures,idx+1),idx<fixtures.length-1?800:0));
}

/* ── 8. POINTS TABLE: NRR VISUAL BAR ────────────────────── */
function rPoints() {
  const sorted=standings();
  id('points-md-label').textContent=S.season.currentMD?`After MD ${S.season.currentMD}`:'Pre-season';
  const tbody=id('points-table-body');
  if(!sorted.length){tbody.innerHTML='<tr class="table-empty-row"><td colspan="9">Season not started.</td></tr>';rScheduleList();return;}
  const n=sorted.length;
  const maxNRR=Math.max(...sorted.map(t=>Math.abs(t.nrr||0)),1);
  tbody.innerHTML=sorted.map((t,i)=>{
    const pos=i+1,q=pos<=4,d=pos>n-2,own=t.id===ME.teamId;
    const nrr=t.nrr||0, nrrStr=(nrr>=0?'+':'')+nrr.toFixed(3);
    const nrrPct=Math.min(100,(Math.abs(nrr)/maxNRR)*100);
    const form=(t.form||[]).slice(-5);
    const dots=Array.from({length:5},(_,j)=>form[j]||'na').map(f=>`<div class="form-dot ${f==='W'?'W':f==='L'?'L':f==='T'?'T':'na'}"></div>`).join('');
    const row=[q?'qualify-zone':'',d?'danger-zone':'',own?'own-team':''].filter(Boolean).join(' ');
    return `<tr class="${row}">
      <td><span class="pt-pos">${pos}</span></td>
      <td><div class="pt-team-cell"><span class="pt-team-pip" style="background:${t.color}"></span><span class="pt-team-name">${esc(t.name)}</span>${own?'<span class="pt-team-code">◀ you</span>':''}</div></td>
      <td class="col-num">${t.played}</td>
      <td class="col-num">${t.wins}</td>
      <td class="col-num">${t.losses}</td>
      <td class="col-num">${t.ties||0}</td>
      <td class="col-num pt-pts" style="color:var(--ipl2);font-weight:700">${t.points}</td>
      <td class="col-nrr">
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
          <span class="pt-nrr ${nrr>=0?'positive':'negative'}" title="Net Run Rate">${nrrStr}</span>
          <div style="width:40px;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${nrrPct}%;background:${nrr>=0?'var(--green)':'var(--red)'};border-radius:2px"></div>
          </div>
        </div>
      </td>
      <td><div class="form-strip">${dots}</div></td>
    </tr>`;
  }).join('');
  rScheduleList();
}

/* ── 9. DELEGATE POLL NOTIFICATION ──────────────────────── */
function startPoll() {
  const bid=S.liveSession?.blobId; if(!bid) return;
  let lastMatchCount=S.matches.length;
  UI.pollTimer=setInterval(async()=>{
    if(!S.liveSession?.blobId) return;
    try {
      const res=await fetch(`https://jsonblob.com/api/jsonBlob/${S.liveSession.blobId}`,{headers:{'Accept':'application/json'}});
      const fresh=patch(await res.json());
      const newMatches=fresh.matches.length-lastMatchCount;
      if(newMatches>0){
        toast(`📡 ${newMatches} new result${newMatches>1?'s':''} — MD ${fresh.season.currentMD}!`,'info',5000);
        lastMatchCount=fresh.matches.length;
        // Highlight live tab
        const liveTab=q('[data-page="live"]');
        if(liveTab){liveTab.style.background='var(--ipl-dim)';setTimeout(()=>liveTab.style.background='',3000);}
      }
      S=fresh; save();
      if(UI.page==='live')rLive();
      if(UI.page==='points')rPoints();
      if(UI.page==='strategy')rStrategy();
      rSidebar();
      updSync('synced');
    } catch(_){ updSync('error'); }
  },8000);
}

/* ── 10. ADMIN: TRADE WINDOW GATE ────────────────────────── */
function rTradeDeskSelects() {
  const isOpen=S.season.currentMD>1&&S.season.currentMD%S.season.tradeEvery===1;
  const form=id('admin-trade-form');
  if(form){
    const warning=id('trade-window-warning')||document.createElement('div');
    warning.id='trade-window-warning';
    if(!isOpen){
      warning.innerHTML=`<div style="background:var(--gold-dim);border:1px solid rgba(245,200,66,.25);border-radius:var(--r);padding:8px 12px;font-size:12px;color:var(--gold);margin-bottom:10px">⏳ Trade window closed. Opens every ${S.season.tradeEvery} matchdays (next at MD ${nextTradeWindow()}).</div>`;
      form.prepend(warning);
    } else {
      id('trade-window-warning')?.remove();
    }
  }
  ['trade-team-a','trade-team-b'].forEach(sid=>{
    const sel=id(sid); if(!sel)return;
    sel.innerHTML='<option value="">Select team…</option>'+S.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
  });
  id('trade-team-a')?.addEventListener('change',e=>fillTradePlayers('trade-player-a',e.target.value));
  id('trade-team-b')?.addEventListener('change',e=>fillTradePlayers('trade-player-b',e.target.value));
}
function nextTradeWindow() {
  const cur=S.season.currentMD||1;
  for(let md=cur+1;md<=S.season.totalMDs;md++){
    if(md>1&&md%S.season.tradeEvery===1) return md;
  }
  return 'N/A';
}

/* ── 11. STRATEGY PAGE: RICH NEXT MATCH CARD ────────────── */
function rStrategyDelegate() {
  const t=team(ME.teamId);
  if(!t){id('strategy-delegate-view').innerHTML='<p style="color:var(--red);padding:20px">Team not found — re-login.</p>';return;}
  const sched=curSched();
  const fix=sched?.fixtures.find(f=>f.tA===t.id||f.tB===t.id);
  const oppId=fix?(fix.tA===t.id?fix.tB:fix.tA):null;
  const opp=oppId?team(oppId):null;
  const v=fix?ven(fix.venueId):null;
  id('strategy-md-info').innerHTML=`
    <div class="md-info-item">Matchday: <strong>MD ${S.season.currentMD||'—'}</strong></div>
    <div class="md-info-item">vs: <strong style="color:${opp?.color||'var(--text)'}">${opp?esc(opp.name):'TBD'}</strong></div>
    <div class="md-info-item">Venue: <strong>${v?esc(v.name):'TBD'}</strong></div>
    <div class="md-info-item">Pitch: <span class="pitch-badge ${v?.pitch||'balanced'}">${PITCH_LABELS[v?.pitch||'balanced']}</span></div>
    ${t.locked?'<div class="md-info-item" style="color:var(--green)">🔒 Strategy locked</div>':''}`;
  rXISelector(t);
  const slider=id('aggression-slider');
  if(slider){slider.value=t.aggression;slider.disabled=t.locked;}
  id('aggression-value').textContent=t.aggression;
  updateAggDisplay(t.aggression);
  id('aggression-submitted')?.classList.toggle('hidden',!t.locked);
  id('xi-confirmed-state')?.classList.toggle('hidden',!(t.xi&&t.xi.length===11));
  // Next match card
  rNextMatchCard(opp,v,sched,t);
}

function rNextMatchCard(opp,v,sched,myTeam) {
  const el=id('strategy-next-match-body'); if(!el) return;
  if(!opp){el.innerHTML='<p style="color:var(--text3);font-size:12px">No upcoming fixture.</p>';return;}
  // Opp recent form
  const form=(opp.form||[]).slice(-5).map(f=>`<div class="form-dot ${f==='W'?'W':f==='L'?'L':'na'}"></div>`).join('');
  // Opp key players
  const oppPlayers=S.players.filter(p=>p.teamId===opp.id&&!p.injured&&!p.suspended)
    .sort((a,b)=>(b.bat+b.bowl)-(a.bat+a.bowl)).slice(0,3);
  const oppKeys=oppPlayers.map(p=>`<span class="squad-player-role-badge ${p.role}" style="font-size:8px">${p.role}</span> ${esc(p.name)}`).join('<br>');
  // Pitch tips
  const tips={bat:'Favour batters — set a big total.',spin:'Spinners will take wickets — pick 2+ spinners.',pace:'Ball swings early — pacers rewarded.',balanced:'Pitch favours neither side.'};
  el.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="font-family:var(--fd);font-size:18px;font-weight:700">vs <span style="color:${opp.color}">${esc(opp.name)}</span></div>
      <div style="font-size:11px;color:var(--text2)">
        <strong>Standing:</strong> ${standings().findIndex(t=>t.id===opp.id)+1}th |
        <strong>Pts:</strong> ${opp.points} |
        <strong>NRR:</strong> ${(opp.nrr>=0?'+':'')+opp.nrr.toFixed(3)}
      </div>
      <div style="display:flex;gap:4px;align-items:center"><span style="font-size:10px;color:var(--text3);margin-right:4px">Form:</span>${form}</div>
      <div style="font-size:10px;color:var(--text2)"><strong>Key threats:</strong><br>${oppKeys||'—'}</div>
      <div class="pitch-badge ${v?.pitch||'balanced'}" style="display:inline-flex;width:fit-content">${PITCH_LABELS[v?.pitch||'balanced']}</div>
      <div style="font-size:11px;color:var(--text2);font-style:italic">${tips[v?.pitch||'balanced']}</div>
    </div>`;
}

/* ── 12. SETUP VALIDATION IMPROVEMENTS ──────────────────── */
function finaliseSetup() {
  S.season.name          = id('cfg-season-name').value.trim()||'IPL MUN';
  S.season.adminPassword = id('cfg-admin-password').value||S.season.adminPassword;
  S.cfg.budget           = parseFloat(id('cfg-auction-budget').value)||90;
  S.cfg.numTeams         = parseInt(id('cfg-num-teams').value)||8;

  // Validation
  if(S.teams.length<2){toast('Add at least 2 teams.','warn');return;}
  if(!S.players.length){toast('Import players first.','warn');return;}

  // Check for duplicate team names
  const names=S.teams.map(t=>t.name.toLowerCase().trim());
  const dupNames=names.filter((n,i)=>names.indexOf(n)!==i);
  if(dupNames.length){toast(`Duplicate team names: ${dupNames.join(', ')}. Please rename.`,'error');return;}

  // Check for players vs teams ratio
  if(S.players.length < S.teams.length * 11){
    if(!confirm(`Only ${S.players.length} players for ${S.teams.length} teams (need ${S.teams.length*11}). Continue?`)) return;
  }

  // Check WK count
  const wkCount=S.players.filter(p=>p.role==='WK').length;
  if(wkCount < S.teams.length){
    toast(`⚠ Only ${wkCount} WKs for ${S.teams.length} teams — some XIs may lack a keeper.`,'warn',5000);
  }

  // Set budgets
  S.teams.forEach(t=>{t.budget=S.cfg.budget;t.spent=0;});
  genSchedule();
  S.players.forEach(p=>{
    S.stats.bat[p.id]  ={r:0,b:0,fours:0,sixes:0,hs:0,fifties:0,hundreds:0,matches:0,outs:0};
    S.stats.bowl[p.id] ={wkts:0,runs:0,balls:0,maidens:0,matches:0,fiveW:0,best:'0/0'};
    S.stats.field[p.id]={catches:0,stumpings:0,runOuts:0};
    S.stats.mom[p.id]  =0;
  });
  S.teams.forEach(t=>{if(!S.codes[t.id])S.codes[t.id]=rCode(4);});
  S.season.status='auction'; S.season.currentMD=0;
  S.season.crisisMD=Math.ceil(S.season.totalMDs*0.75);
  save(); toast('Setup saved — proceed to Auction.','success');
  rHeader(); go('auction');
}

/* ── 13. ADMIN: SHARE LINK GENERATION ───────────────────── */
function generateShareLink() {
  const slim=JSON.parse(JSON.stringify(S));
  (slim.matches||[]).forEach(m=>{delete m.inn1?.log;delete m.inn2?.log;});
  const compressed=LZString.compressToEncodedURIComponent(JSON.stringify(slim));
  const url=`${location.origin}${location.pathname}?s=${compressed}`;
  const inp=id('share-url-input');
  if(inp) inp.value=url;
  id('admin-share-url')?.classList.remove('hidden');
  const qrImg=id('admin-qr-img'),qrBox=id('admin-qr');
  if(qrImg) qrImg.src=`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`;
  if(qrBox) qrBox.classList.remove('hidden');
  toast('Share link generated!','success');
}

/* ── 14. BETTER MATCHDAY SIMULATE WITH PHASE CHECK ───────── */
function checkAndSimulate() {
  const allXI=S.teams.every(t=>t.xi&&t.xi.length===11);
  if(!allXI){
    const notSet=S.teams.filter(t=>!t.xi||t.xi.length<11).map(t=>t.short||t.name).join(', ');
    if(!confirm(`XI not set for: ${notSet}\nAuto-pick will be used. Simulate?`)) return;
  }
  simulateAllMatches();
}

/* ── 15. DELEGATE: AUTO-NAVIGATE TO STRATEGY ON MD START ── */
function advanceMatchday() {
  const next=S.season.currentMD+1;
  S.teams.forEach(t=>{t.locked=false;});
  if(next>S.season.totalMDs){
    S.season.status='playoffs'; setupPlayoffs();
    save(); id('matchday-postmd-card')?.classList.add('hidden');
    toast('League complete! Playoffs set up in Admin.','success'); go('admin'); return;
  }
  S.season.currentMD=next;
  id('matchday-postmd-card')?.classList.add('hidden');
  const isTradeWindow=(next>1)&&(next%S.season.tradeEvery===1);
  if(isTradeWindow) toast(`MD ${next}: Trade window OPEN! Admin → Trade Desk.`,'info',5000);
  if(S.liveSession?.autoPush) pushState();
  save(); rHeader(); rMatchday(); rSidebar();
  toast(`MD ${next} ready! Delegates: set your strategy.`,'success');
  // If delegate is on this session (server push will handle), admin notifies them via push
  if(S.liveSession?.blobId && S.liveSession?.autoPush) pushState();
}

/* ── 16. KEYBOARD SHORTCUTS ─────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
    if(e.key==='Escape'){closeModal();qa('.overlay:not(.hidden)').forEach(o=>{if(o.id!=='overlay-champion'&&o.id!=='overlay-awards')o.classList.add('hidden');});}
    if(e.ctrlKey&&e.key==='p'){e.preventDefault();toggleProjectorView();}
    if(!e.ctrlKey&&!e.altKey&&ME.role==='admin'){
      const shortcuts={'1':'setup','2':'auction','3':'matchday','4':'live','5':'strategy','6':'points','7':'scorecards','8':'stats','9':'admin','0':'guide'};
      if(shortcuts[e.key]) go(shortcuts[e.key]);
    }
  });
});