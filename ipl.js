/* ══════════════════════════════════════════════════════
   IPL MUN v3.0 · ipl.js  — Part 1: State + Auth + Nav
   ══════════════════════════════════════════════════════ */
'use strict';

/* ── DEFAULT STATE ───────────────────────────────────── */
const DEFAULT_STATE = {
  version:'3.0',
  season:{ name:'IPL MUN Season 1', status:'setup', currentMD:0, totalMDs:14,
           tradeWindowEvery:2, crisisMD:0, crisisFired:false, adminPassword:'chair2025' },
  config:{ numTeams:8, auctionBudget:90 },
  teams:[], players:[], venues:[], schedule:[], matches:[],
  auction:{ pool:[], log:[], currentLot:0 },
  liveSession:{ blobId:null, autoPush:false },
  teamCodes:{}, tradeLog:[],
  stats:{ batting:{}, bowling:{}, fielding:{}, momAwards:{}, milestones:[] },
};

const DEFAULT_VENUES = [
  { id:'wankhede',    name:'Wankhede Stadium',           city:'Mumbai',     pitchType:'bat' },
  { id:'chinnaswamy', name:'M. Chinnaswamy Stadium',     city:'Bengaluru',  pitchType:'bat' },
  { id:'eden',        name:'Eden Gardens',               city:'Kolkata',    pitchType:'bat' },
  { id:'chepauk',     name:'M.A. Chidambaram Stadium',   city:'Chennai',    pitchType:'spin' },
  { id:'rajiv',       name:'Rajiv Gandhi Intl.',         city:'Hyderabad',  pitchType:'spin' },
  { id:'sawai',       name:'Sawai Mansingh Stadium',     city:'Jaipur',     pitchType:'spin' },
  { id:'mohali',      name:'PCA Stadium',                city:'Mohali',     pitchType:'pace' },
  { id:'dharamsala',  name:'HPCA Stadium',               city:'Dharamsala', pitchType:'pace' },
  { id:'ekana',       name:'Ekana Cricket Stadium',      city:'Lucknow',    pitchType:'pace' },
  { id:'narendra',    name:'Narendra Modi Stadium',      city:'Ahmedabad',  pitchType:'balanced' },
  { id:'arun',        name:'Arun Jaitley Stadium',       city:'Delhi',      pitchType:'balanced' },
  { id:'barsapara',   name:'Barsapara Cricket Stadium',  city:'Guwahati',   pitchType:'balanced' },
];

let STATE   = JSON.parse(JSON.stringify(DEFAULT_STATE));
let SESSION = { role:null, teamId:null };
let UI      = { currentPage:null, sidebarCollapsed:false, xiAdminTeamId:null,
                xiAdminSelected:[], liveMatchInterval:null };

/* ── PERSISTENCE ─────────────────────────────────────── */
const STORAGE_KEY = 'ipl_mun_v3';

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); }
  catch(e){ showToast('Storage full — export a package.','warn'); }
}
function loadState() {
  try { const r=localStorage.getItem(STORAGE_KEY); if(r){STATE=migrateState(JSON.parse(r));return true;} }
  catch(e){}
  return false;
}
function migrateState(s) {
  s.version     = s.version     || '3.0';
  s.stats       = s.stats       || JSON.parse(JSON.stringify(DEFAULT_STATE.stats));
  s.liveSession = s.liveSession || {blobId:null,autoPush:false};
  s.teamCodes   = s.teamCodes   || {};
  s.tradeLog    = s.tradeLog    || [];
  s.auction     = s.auction     || {pool:[],log:[],currentLot:0};
  s.teams   = (s.teams  ||[]).map(t=>({aggression:60,aggressionLocked:false,xi:[],ties:0,...t}));
  s.players = (s.players||[]).map(p=>({injured:false,injuredMDs:0,suspended:false,...p}));
  return s;
}
function resetState() {
  STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
  STATE.venues = DEFAULT_VENUES.map(v=>({...v}));
  saveState();
}

function exportState() {
  const json = JSON.stringify(STATE);
  try {
    const comp = LZString.compressToEncodedURIComponent(json);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([comp],{type:'text/plain'}));
    a.download = `ipl_mun_${(STATE.season.name||'season').replace(/\s+/g,'_')}.ipl`;
    a.click();
    showToast('Season exported.','success');
  } catch(e) {
    const a=document.createElement('a');
    a.href='data:text/json,'+encodeURIComponent(json);
    a.download='ipl_mun_season.json'; a.click();
  }
}
function importState(){ document.getElementById('import-file').click(); }

document.addEventListener('change', e => {
  if (e.target.id !== 'import-file') return;
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      let d = ev.target.result;
      try { d = LZString.decompressFromEncodedURIComponent(d); } catch(_){}
      STATE = migrateState(JSON.parse(d));
      saveState(); showToast('Season imported!','success'); refreshAllUI();
    } catch(err){ showToast('Import failed.','error'); }
  };
  reader.readAsText(file);
});

function generateShareLink() {
  const comp = LZString.compressToEncodedURIComponent(JSON.stringify(trimStateForShare(STATE)));
  const url  = `${location.origin}${location.pathname}?s=${comp}`;
  document.getElementById('share-url-input').value = url;
  document.getElementById('admin-share-url').classList.remove('hidden');
  document.getElementById('admin-qr-img').src =
    `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`;
  document.getElementById('admin-qr').classList.remove('hidden');
}
function trimStateForShare(s) {
  const slim = JSON.parse(JSON.stringify(s));
  (slim.matches||[]).forEach(m=>{ delete m.innings1?.ballLog; delete m.innings2?.ballLog; });
  return slim;
}
function copyShareUrl() {
  navigator.clipboard.writeText(document.getElementById('share-url-input').value)
    .then(()=>showToast('Link copied!','success'));
}
function tryLoadFromURL() {
  const s = new URLSearchParams(location.search).get('s');
  if (!s) return false;
  try {
    STATE = migrateState(JSON.parse(LZString.decompressFromEncodedURIComponent(s)));
    saveState();
    document.getElementById('login-state-loaded').classList.remove('hidden');
    populateDelegateTeamSelect();
    return true;
  } catch(e){ return false; }
}

/* ── AUTH & LOGIN ────────────────────────────────────── */
function loginSwitchTab(tab) {
  ['admin','delegate'].forEach(t=>{
    const btn=document.querySelector(`[data-tab="${t}"]`);
    btn.classList.toggle('active',t===tab);
    btn.setAttribute('aria-selected',t===tab);
    document.getElementById(`login-panel-${t}`).classList.toggle('hidden',t!==tab);
  });
}
function loginAsAdmin() {
  const pwd=document.getElementById('admin-password').value;
  const err=document.getElementById('admin-login-error');
  if (pwd!==STATE.season.adminPassword) {
    err.textContent='Incorrect password.'; err.classList.remove('hidden');
    document.getElementById('admin-password').value=''; return;
  }
  SESSION={role:'admin',teamId:null}; err.classList.add('hidden'); launchApp();
}
function loginAsDelegate() {
  const sessionId=document.getElementById('delegate-session-id').value.trim();
  const teamId   =document.getElementById('delegate-team-select').value;
  const code     =document.getElementById('delegate-team-code').value.toUpperCase().trim();
  const err      =document.getElementById('delegate-login-error');
  if (!teamId){err.textContent='Select your team.'; err.classList.remove('hidden'); return;}
  if (!code)  {err.textContent='Enter your team code.'; err.classList.remove('hidden'); return;}
  if (STATE.teamCodes[teamId]!==code){err.textContent='Invalid team code.'; err.classList.remove('hidden'); return;}
  const proceed=()=>{ SESSION={role:'delegate',teamId}; err.classList.add('hidden'); launchApp(); };
  if (sessionId) fetchSessionState(sessionId, proceed); else proceed();
}
function populateDelegateTeamSelect() {
  const sel=document.getElementById('delegate-team-select');
  sel.innerHTML='<option value="">— Select team —</option>';
  STATE.teams.forEach(t=>{ const o=document.createElement('option'); o.value=t.id; o.textContent=t.name; sel.appendChild(o); });
}
function logout() {
  SESSION={role:null,teamId:null}; clearInterval(UI.liveMatchInterval);
  document.getElementById('app').classList.add('hidden');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('admin-password').value='';
}
function launchApp() {
  document.getElementById('screen-login').classList.remove('active');
  const app=document.getElementById('app');
  app.classList.remove('hidden');
  app.setAttribute('data-role',SESSION.role);
  app.setAttribute('data-team-id',SESSION.teamId||'');
  applyRoleVisibility(); refreshAllUI();
  navTo(SESSION.role==='admin'?(STATE.season.status==='setup'?'setup':'matchday'):'live');
  if (SESSION.role==='delegate') startDelegatePoll();
}
function applyRoleVisibility() {
  const isAdmin=SESSION.role==='admin';
  document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',!isAdmin));
  document.getElementById('header-team-pill').classList.toggle('hidden',!SESSION.teamId);
  if (SESSION.teamId) {
    const t=getTeam(SESSION.teamId);
    if (t) {
      document.getElementById('header-team-name').textContent=t.name;
      document.getElementById('header-team-color').style.background=t.color;
    }
  }
}

/* ── NAVIGATION ──────────────────────────────────────── */
function navTo(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  const pageEl=document.getElementById(`page-${page}`);
  const tabEl =document.querySelector(`[data-page="${page}"]`);
  if (pageEl) pageEl.classList.add('active');
  if (tabEl)  tabEl.classList.add('active');
  UI.currentPage=page; renderPage(page);
}
function renderPage(page) {
  const map={setup:renderSetup, auction:renderAuction, matchday:renderMatchday,
             live:renderLive, strategy:renderStrategy, points:renderPoints,
             scorecards:renderScorecards, stats:renderStats, admin:renderAdmin};
  if (map[page]) map[page]();
}
function refreshAllUI() {
  renderSidebar(); renderHeaderMD();
  if (UI.currentPage) renderPage(UI.currentPage);
  populateDelegateTeamSelect();
}

/* ── SIDEBAR ─────────────────────────────────────────── */
function renderSidebar() {
  const el=document.getElementById('sidebar-standings');
  const sorted=getSortedStandings();
  if (!sorted.length){el.innerHTML='<div class="sidebar-empty">Season not started</div>';return;}
  const n=STATE.teams.length;
  el.innerHTML=sorted.map((t,i)=>{
    const pos=i+1;
    const cls=['standings-row',pos<=4?'qualify':'',pos>n-2?'danger':'',t.id===SESSION.teamId?'own-team':''].filter(Boolean).join(' ');
    const nrrStr=t.nrr>=0?`+${t.nrr.toFixed(3)}`:t.nrr.toFixed(3);
    return `<div class="${cls}">
      <span class="sr-pos">${pos}</span>
      <span class="sr-pip" style="background:${t.color}"></span>
      <span class="sr-name">${escHtml(t.shortName||t.name)}</span>
      <span class="sr-pts">${t.points}</span>
      <span class="sr-nrr">${nrrStr}</span>
    </div>`;
  }).join('');
  const oc=getOrangeCap(), pc=getPurpleCap();
  const caps=document.getElementById('sidebar-caps');
  caps.innerHTML='';
  if(oc) caps.innerHTML+=`<div class="cap-mini"><span class="cap-mini-icon">🟠</span>${escHtml(oc.name)}</div>`;
  if(pc) caps.innerHTML+=`<div class="cap-mini"><span class="cap-mini-icon">🟣</span>${escHtml(pc.name)}</div>`;
}
function toggleSidebar() {
  UI.sidebarCollapsed=!UI.sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed',UI.sidebarCollapsed);
}
function renderHeaderMD() {
  document.getElementById('header-season-name').textContent=STATE.season.name;
  const ind=document.getElementById('header-md-indicator');
  if (STATE.season.currentMD>0) {
    ind.classList.remove('hidden');
    document.getElementById('header-md-num').textContent  =STATE.season.currentMD;
    document.getElementById('header-md-total').textContent=STATE.season.totalMDs;
  } else ind.classList.add('hidden');
}

/* ══════════════════════════════════════════════════════
   Part 2: Setup Page + Schedule Generation + Auction
   ══════════════════════════════════════════════════════ */

function renderSetup() {
  document.getElementById('cfg-season-name').value    = STATE.season.name;
  document.getElementById('cfg-admin-password').value = STATE.season.adminPassword;
  document.getElementById('cfg-auction-budget').value = STATE.config.auctionBudget;
  document.getElementById('cfg-num-teams').value      = STATE.config.numTeams;
  renderTeamBuilder(); renderVenueList();
}

function renderTeamBuilder() {
  const el=document.getElementById('team-builder-list');
  if (!STATE.teams.length){el.innerHTML='<div class="team-builder-empty">No teams yet — click "Add Team" to begin.</div>';return;}
  el.innerHTML=STATE.teams.map((t,i)=>`
    <div class="team-builder-row">
      <input class="form-input" type="text" placeholder="Team name" value="${escHtml(t.name)}"
             oninput="updateTeamField(${i},'name',this.value)">
      <input class="form-input" type="text" placeholder="Short (MI)" value="${escHtml(t.shortName||'')}" maxlength="4"
             oninput="updateTeamField(${i},'shortName',this.value)">
      <select class="form-select" onchange="updateTeamField(${i},'venueId',this.value)">
        <option value="">Home venue</option>
        ${STATE.venues.map(v=>`<option value="${v.id}" ${v.id===t.venueId?'selected':''}>${escHtml(v.name)}</option>`).join('')}
      </select>
      <input type="color" class="team-color-swatch" value="${t.color||'#ff6b1a'}"
             oninput="updateTeamField(${i},'color',this.value)">
      <button class="btn btn-danger btn-sm" onclick="removeTeam(${i})">✕</button>
    </div>`).join('');
}
function addTeamRow() {
  const colors=['#ff6b1a','#3b82f6','#10b981','#a855f7','#f43f5e','#06b6d4','#f5c842','#14b8a6'];
  STATE.teams.push({
    id:`team_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    name:`Team ${STATE.teams.length+1}`, shortName:'',
    color:colors[STATE.teams.length%colors.length],
    venueId:'', budget:STATE.config.auctionBudget, spent:0,
    players:[], xi:[], aggression:60, aggressionLocked:false,
    points:0, wins:0, losses:0, ties:0, played:0, nrr:0, form:[],
  });
  renderTeamBuilder();
}
function removeTeam(idx){ STATE.teams.splice(idx,1); renderTeamBuilder(); }
function updateTeamField(idx,field,val){ STATE.teams[idx][field]=val; }

function renderVenueList() {
  if (!STATE.venues.length) STATE.venues=DEFAULT_VENUES.map(v=>({...v}));
  document.getElementById('venue-list').innerHTML=STATE.venues.map((v,i)=>`
    <div class="venue-row">
      <div class="venue-name">${escHtml(v.name)}, ${escHtml(v.city)}</div>
      <select class="form-select" onchange="updateVenuePitch(${i},this.value)">
        ${['bat','spin','pace','balanced'].map(pt=>`<option value="${pt}" ${v.pitchType===pt?'selected':''}>${pt[0].toUpperCase()+pt.slice(1)}</option>`).join('')}
      </select>
      <span class="pitch-badge ${v.pitchType}">${pitchLabel(v.pitchType)}</span>
    </div>`).join('');
}
function updateVenuePitch(idx,val){ STATE.venues[idx].pitchType=val; renderVenueList(); }
function pitchLabel(pt){
  return {bat:'🌟 Batting Paradise',spin:'🌀 Spin Friendly',pace:'💨 Pace Heaven',balanced:'⚖️ Balanced'}[pt]||pt;
}
function switchImport(tab){
  document.querySelectorAll('.import-tab').forEach(t=>t.classList.toggle('active',t.dataset.import===tab));
  document.getElementById('import-csv').classList.toggle('hidden',tab!=='csv');
  document.getElementById('import-sheets').classList.toggle('hidden',tab!=='sheets');
}
function parsePlayerImport(){
  const raw=document.getElementById('player-csv').value.trim();
  if(!raw){showToast('Paste CSV data first.','warn');return;}
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);
  const header=lines[0].toLowerCase().split(',').map(h=>h.trim());
  const gi=k=>header.indexOf(k);
  const players=lines.slice(1).map((line,i)=>{
    const c=line.split(',').map(x=>x.trim());
    return {
      id:`player_${Date.now()}_${i}`,
      name:    c[gi('name')]   ||c[0]   ||`Player ${i+1}`,
      role:   (c[gi('role')]   ||'BAT').toUpperCase(),
      batting: parseInt(c[gi('bat')]   ||c[gi('batting')] ||c[2])||50,
      bowling: parseInt(c[gi('bowl')]  ||c[gi('bowling')] ||c[3])||30,
      fielding:parseInt(c[gi('field')] ||c[gi('fielding')]||c[4])||60,
      keeping: parseInt(c[gi('keep')]  ||c[gi('keeping')] ||c[5])||0,
      basePrice:parseFloat(c[gi('baseprice')]||c[gi('base price')]||c[6])||1.0,
      price:0, teamId:null, injured:false, injuredMDs:0, suspended:false,
    };
  });
  const prev=document.getElementById('import-preview');
  prev.classList.remove('hidden');
  prev.innerHTML=`<table class="sc-table" style="margin-top:10px">
    <thead><tr><th>Name</th><th>Role</th><th>Bat</th><th>Bowl</th><th>Field</th><th>Base ₹Cr</th></tr></thead>
    <tbody>${players.map(p=>`<tr><td>${escHtml(p.name)}</td><td><span class="squad-player-role-badge ${p.role}">${p.role}</span></td><td>${p.batting}</td><td>${p.bowling}</td><td>${p.fielding}</td><td>${p.basePrice}</td></tr>`).join('')}</tbody>
  </table><p style="margin-top:8px;font-size:11px;color:var(--text2)">${players.length} players found.</p>`;
  window._importPreview=players;
  showToast(`${players.length} players parsed. Confirm to lock.`,'info');
}
function confirmPlayerImport(){
  if(!window._importPreview){showToast('Preview first.','warn');return;}
  STATE.players=window._importPreview;
  STATE.auction.pool=STATE.players.map(p=>p.id);
  window._importPreview=null;
  saveState(); showToast(`${STATE.players.length} players imported!`,'success');
}
async function fetchSheets(){
  const url=document.getElementById('sheets-url').value.trim();
  const m=url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if(!m){showToast('Invalid Sheets URL.','error');return;}
  try{
    const res=await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`);
    document.getElementById('player-csv').value=await res.text();
    switchImport('csv'); parsePlayerImport();
  }catch(e){showToast("Couldn't fetch sheet — make sure it's public.",'error');}
}
function finaliseSetup(){
  STATE.season.name         =document.getElementById('cfg-season-name').value.trim()||'IPL MUN';
  STATE.season.adminPassword=document.getElementById('cfg-admin-password').value||STATE.season.adminPassword;
  STATE.config.auctionBudget=parseFloat(document.getElementById('cfg-auction-budget').value)||90;
  STATE.config.numTeams     =parseInt(document.getElementById('cfg-num-teams').value)||8;
  if(STATE.teams.length<2) {showToast('Add at least 2 teams.','warn');return;}
  if(!STATE.players.length) {showToast('Import players first.','warn');return;}
  STATE.teams.forEach(t=>{t.budget=STATE.config.auctionBudget;t.spent=0;});
  generateSchedule();
  STATE.players.forEach(p=>{
    STATE.stats.batting[p.id] ={runs:0,balls:0,fours:0,sixes:0,fifties:0,hundreds:0,matches:0,highScore:0,dismissals:0};
    STATE.stats.bowling[p.id] ={wickets:0,runs:0,overs:0,maidens:0,matches:0,fiveWickets:0,best:'0/0'};
    STATE.stats.fielding[p.id]={catches:0,stumpings:0,runOuts:0};
    STATE.stats.momAwards[p.id]=0;
  });
  STATE.teams.forEach(t=>{ if(!STATE.teamCodes[t.id]) STATE.teamCodes[t.id]=randomCode(4); });
  STATE.season.status='auction'; STATE.season.currentMD=0;
  STATE.season.crisisMD=Math.ceil(STATE.season.totalMDs*0.75);
  saveState(); showToast('Setup saved! Proceed to Auction.','success');
  renderHeaderMD(); navTo('auction');
}

/* ── SCHEDULE GENERATION ─────────────────────────────── */
function generateSchedule(){
  const ids=STATE.teams.map(t=>t.id);
  STATE.season.totalMDs=(ids.length-1)*2;
  STATE.schedule=[];
  const rounds=roundRobinPairs(ids);
  [...rounds, ...rounds.map(r=>r.map(([a,b])=>[b,a]))].forEach((round,mdIdx)=>{
    const md=mdIdx+1;
    STATE.schedule.push({md, fixtures:round.map(([tA,tB])=>{
      const homeTeam=STATE.teams.find(t=>t.id===tA);
      const venueId =homeTeam?.venueId||STATE.venues[mdIdx%STATE.venues.length]?.id;
      return {id:`fix_${md}_${tA}_${tB}`,teamA:tA,teamB:tB,venueId,result:null};
    })});
  });
}
function roundRobinPairs(ids){
  const list=[...ids]; if(list.length%2!==0) list.push('BYE');
  const rounds=[];
  for(let r=0;r<list.length-1;r++){
    const round=[];
    for(let i=0;i<list.length/2;i++){
      const a=list[i],b=list[list.length-1-i];
      if(a!=='BYE'&&b!=='BYE') round.push([a,b]);
    }
    rounds.push(round);
    list.splice(1,0,list.pop());
  }
  return rounds;
}

/* ── AUCTION PAGE ────────────────────────────────────── */
function renderAuction(){
  renderAuctionBudgets(); renderAuctionPool(); renderAuctionLog();
  document.getElementById('auction-lot-total').textContent  =STATE.auction.pool.length+STATE.auction.log.length;
  document.getElementById('auction-lot-current').textContent=STATE.auction.currentLot;
}
function renderAuctionBudgets(){
  document.getElementById('auction-budget-list').innerHTML=STATE.teams.map(t=>{
    const pct=t.budget/STATE.config.auctionBudget*100;
    return `<div class="budget-row">
      <span class="budget-pip" style="background:${t.color}"></span>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <span class="budget-team-name">${escHtml(t.shortName||t.name)}</span>
          <span class="budget-amount">₹${t.budget.toFixed(1)}Cr</span>
        </div>
        <div class="budget-track" style="margin-top:5px">
          <div class="budget-fill ${pct<10?'danger':pct<30?'low':''}" style="width:${pct}%"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}
function renderAuctionPool(){
  const pool=STATE.auction.pool;
  document.getElementById('auction-pool-count').textContent=pool.length;
  document.getElementById('auction-pool-list').innerHTML=pool.map(pid=>{
    const p=getPlayer(pid); if(!p)return'';
    return `<div class="pool-player-row">
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      ${escHtml(p.name)}
      <span style="margin-left:auto;font-family:var(--fm);font-size:10px;color:var(--text3)">₹${p.basePrice}Cr</span>
    </div>`;
  }).join('')||'<div class="list-empty">Pool empty.</div>';
}
function renderAuctionLog(){
  const el=document.getElementById('auction-log-list');
  if(!STATE.auction.log.length){el.innerHTML='<div class="list-empty">No players assigned yet.</div>';return;}
  el.innerHTML=[...STATE.auction.log].reverse().map(e=>{
    const p=getPlayer(e.playerId),t=getTeam(e.teamId);
    return `<div class="auction-log-entry">
      <span class="log-player">${p?escHtml(p.name):'?'}</span>
      <span class="log-team" style="color:${t?.color||'var(--text2)'}">${t?escHtml(t.shortName||t.name):'—'}</span>
      <span class="log-price">₹${e.price}Cr</span>
    </div>`;
  }).join('');
}
let _cdp=null; // currentDrawPlayer
function drawNextLot(){
  if(!STATE.auction.pool.length){showToast('Pool is empty!','warn');return;}
  const pid=STATE.auction.pool[Math.floor(Math.random()*STATE.auction.pool.length)];
  _cdp=getPlayer(pid);
  STATE.auction.currentLot++;
  document.getElementById('auction-lot-current').textContent=STATE.auction.currentLot;
  document.getElementById('auction-lot-num').textContent=STATE.auction.currentLot;
  const idle=document.querySelector('.auction-reveal-idle');
  const stage=document.getElementById('auction-stage-1');
  if(idle) idle.style.display='none';
  stage.classList.remove('hidden');
  const inner=stage.querySelector('.lot-card-inner');
  inner.classList.remove('flipped'); void inner.offsetWidth;
  fillPlayerReveal(_cdp);
  setTimeout(()=>{
    inner.classList.add('flipped');
    setTimeout(()=>{
      fillAuctionAssignGrid();
      document.getElementById('auction-assign-card').classList.remove('hidden');
      document.getElementById('auction-price-input').value=_cdp.basePrice;
    },700);
  },300);
}
function fillPlayerReveal(p){
  const rb=document.getElementById('reveal-role-badge');
  rb.textContent=p.role; rb.className=`player-reveal-role squad-player-role-badge ${p.role}`;
  document.getElementById('reveal-player-name').textContent=p.name;
  document.getElementById('reveal-base-price').textContent=p.basePrice;
  const bars=[{label:'BAT',val:p.batting,color:'var(--role-bat)'},{label:'BOWL',val:p.bowling,color:'var(--role-pace)'},{label:'FLD',val:p.fielding,color:'var(--green)'}];
  if(p.role==='WK') bars.push({label:'KEEP',val:p.keeping,color:'var(--role-wk)'});
  document.getElementById('reveal-player-stats').innerHTML=bars.map(s=>`
    <div class="reveal-bar-row">
      <span class="reveal-bar-label">${s.label}</span>
      <div class="reveal-bar-track"><div class="reveal-bar-fill" style="background:${s.color};width:0" data-val="${s.val}"></div></div>
      <span class="reveal-bar-value">${s.val}</span>
    </div>`).join('');
  setTimeout(()=>document.querySelectorAll('.reveal-bar-fill').forEach(b=>b.style.width=b.dataset.val+'%'),800);
}
function fillAuctionAssignGrid(){
  document.getElementById('auction-team-assign-grid').innerHTML=STATE.teams.map(t=>`
    <button class="team-assign-btn" data-team-id="${t.id}" onclick="selectAssignTeam('${t.id}')">
      <span class="budget-pip" style="background:${t.color}"></span>
      <span>${escHtml(t.shortName||t.name)}</span>
      <span class="team-assign-budget">₹${t.budget.toFixed(1)}Cr</span>
    </button>`).join('');
}
function selectAssignTeam(id){
  document.querySelectorAll('.team-assign-btn').forEach(b=>b.classList.toggle('selected',b.dataset.teamId===id));
}
function confirmAssign(){
  if(!_cdp){showToast('Draw a lot first.','warn');return;}
  const sel=document.querySelector('.team-assign-btn.selected');
  if(!sel){showToast('Select a team.','warn');return;}
  const teamId=sel.dataset.teamId;
  const price=parseFloat(document.getElementById('auction-price-input').value)||_cdp.basePrice;
  const team=getTeam(teamId);
  if(price>team.budget){showToast(`${team.name} only has ₹${team.budget.toFixed(1)}Cr!`,'error');return;}
  _cdp.teamId=teamId; _cdp.price=price;
  team.players.push(_cdp.id); team.budget-=price; team.spent+=price;
  STATE.auction.pool=STATE.auction.pool.filter(id=>id!==_cdp.id);
  STATE.auction.log.push({playerId:_cdp.id,teamId,price,lot:STATE.auction.currentLot});
  _cdp=null;
  document.getElementById('auction-assign-card').classList.add('hidden');
  const stage=document.getElementById('auction-stage-1');
  stage.querySelector('.lot-card-inner').classList.remove('flipped');
  stage.classList.add('hidden');
  const idle=document.querySelector('.auction-reveal-idle'); if(idle) idle.style.display='';
  saveState(); renderAuction(); showToast('Player assigned!','success');
}
function skipLot(){
  if(!_cdp){showToast('Draw a lot first.','warn');return;}
  const id=_cdp.id;
  STATE.auction.pool=STATE.auction.pool.filter(p=>p!==id);
  STATE.auction.pool.push(id);
  _cdp=null;
  document.getElementById('auction-assign-card').classList.add('hidden');
  const stage=document.getElementById('auction-stage-1');
  stage.querySelector('.lot-card-inner').classList.remove('flipped');
  stage.classList.add('hidden');
  const idle=document.querySelector('.auction-reveal-idle'); if(idle) idle.style.display='';
  renderAuction(); showToast('Lot skipped (unsold).','info');
}
function finaliseAuction(){
  if(STATE.auction.pool.length>0&&!confirm(`${STATE.auction.pool.length} players unassigned. Finalise anyway?`)) return;
  STATE.season.status='league'; STATE.season.currentMD=1;
  saveState(); showToast('Auction finalised! Season begins.','success'); navTo('matchday');
}

/* ══════════════════════════════════════════════════════
   Part 3: Matchday Page + Simulation Engine
   ══════════════════════════════════════════════════════ */

function renderMatchday(){
  const md=STATE.season.currentMD;
  document.getElementById('matchday-badge').textContent=`MD ${md} / ${STATE.season.totalMDs}`;
  document.getElementById('live-md-label').textContent=`Matchday ${md}`;
  document.getElementById('points-md-label').textContent=`After MD ${md-1}`;
  renderMatchdayVenues(); renderMatchdayStrategyGrid();
  renderMatchdayXIGrid(); renderMatchdayInjuries(); renderSimFixtures();
}
function getCurrentSchedule(){ return STATE.schedule.find(s=>s.md===STATE.season.currentMD)||null; }

function renderMatchdayVenues(){
  const sched=getCurrentSchedule();
  const el=document.getElementById('matchday-venues-row');
  if(!sched){el.innerHTML='';return;}
  el.innerHTML=sched.fixtures.map(fix=>{
    const v=getVenue(fix.venueId),tA=getTeam(fix.teamA),tB=getTeam(fix.teamB);
    const pt=v?.pitchType||'balanced';
    return `<div class="venue-card pitch-${pt}">
      <div class="venue-card-venue">${v?escHtml(v.name):'TBD'}</div>
      <div class="venue-card-city">${v?escHtml(v.city):''}</div>
      <div class="venue-card-footer">
        <span class="venue-matchup">${escHtml(tA?.shortName||tA?.name||'?')} vs ${escHtml(tB?.shortName||tB?.name||'?')}</span>
        <span class="pitch-badge ${pt}">${pitchLabel(pt)}</span>
      </div>
    </div>`;
  }).join('');
}
function renderMatchdayStrategyGrid(){
  document.getElementById('matchday-strategy-grid').innerHTML=STATE.teams.map(t=>{
    const pct=((t.aggression-20)/80*100).toFixed(1);
    return `<div class="strategy-team-row">
      <span class="strategy-team-pip" style="background:${t.color}"></span>
      <span class="strategy-team-name">${escHtml(t.shortName||t.name)}</span>
      <div class="strategy-slider-mini"><div class="strategy-slider-thumb" style="left:${pct}%"></div></div>
      <span class="strategy-agg-value">${t.aggression}</span>
      <span class="strategy-status-badge ${t.aggressionLocked?'locked':'pending'}">${t.aggressionLocked?'Locked':'Pending'}</span>
      <button class="btn btn-secondary btn-sm" onclick="openXIAdminModal('${t.id}')">Set XI</button>
    </div>`;
  }).join('');
}
function renderMatchdayXIGrid(){
  document.getElementById('matchday-xi-grid').innerHTML=STATE.teams.map(t=>{
    const done=t.xi&&t.xi.length===11;
    return `<div class="xi-confirm-btn ${done?'confirmed':''}" onclick="openXIAdminModal('${t.id}')">
      <span class="xi-team-name">${escHtml(t.shortName||t.name)}</span>
      <span class="xi-confirm-status">${done?'✓ XI Set ('+t.xi.length+')':'⏳ Pending'}</span>
    </div>`;
  }).join('');
  const ready=STATE.teams.filter(t=>t.xi&&t.xi.length===11).length;
  document.getElementById('matchday-xi-status').innerHTML=
    `<span>${ready}/${STATE.teams.length} teams ready</span>`+
    (ready===STATE.teams.length?'<span style="color:var(--green);margin-left:8px">✓ All set</span>':'');
}
function renderMatchdayInjuries(){
  const el=document.getElementById('matchday-injury-list');
  const injured=STATE.players.filter(p=>p.injured||p.suspended);
  if(!injured.length){el.innerHTML='<div class="list-empty">No injuries this matchday.</div>';return;}
  el.innerHTML=injured.map(p=>{
    const t=getTeam(p.teamId);
    return `<div class="injury-item">
      <span class="injury-icon">🤕</span>
      <span class="injury-player-name">${escHtml(p.name)}</span>
      <span class="injury-team" style="color:${t?.color||'var(--text2)'}">${t?escHtml(t.shortName||t.name):''}</span>
      <span class="injury-duration">${p.injured?'Season Crisis':'Out '+p.injuredMDs+' MD'}</span>
    </div>`;
  }).join('');
}
function renderSimFixtures(){
  const sched=getCurrentSchedule();
  const el=document.getElementById('sim-fixtures-list');
  if(!sched){el.innerHTML='<div class="list-empty">No matchday scheduled.</div>';return;}
  el.innerHTML=sched.fixtures.map(fix=>{
    const tA=getTeam(fix.teamA),tB=getTeam(fix.teamB);
    const done=!!fix.result;
    return `<div class="sim-fixture-row">
      <span class="sim-fixture-matchup">${escHtml(tA?.shortName||tA?.name||'?')} vs ${escHtml(tB?.shortName||tB?.name||'?')}</span>
      <span class="sim-fixture-status ${done?'complete':'pending'}">${done?'✓ Done':'Pending'}</span>
      ${done?'':`<button class="btn btn-secondary btn-sm" onclick="simulateSingleMatch('${fix.id}')">Simulate</button>`}
    </div>`;
  }).join('');
}
function lockAllStrategies(){
  STATE.teams.forEach(t=>t.aggressionLocked=true);
  saveState(); renderMatchdayStrategyGrid(); showToast('All strategies locked.','success');
}
function simulateSingleMatch(fixId){
  const sched=getCurrentSchedule();
  const fix=sched?.fixtures.find(f=>f.id===fixId);
  if(!fix||fix.result) return;
  const result=runMatchSimulation(fix);
  fix.result=result; STATE.matches.push(result);
  updatePointsFromResult(result); updateStatsFromMatch(result);
  saveState(); renderMatchday(); renderLive(); renderSidebar();
  showToast(`${result.winnerName} won!`,'success');
}
function simulateNextMatch(){
  const sched=getCurrentSchedule(); if(!sched) return;
  const fix=sched.fixtures.find(f=>!f.result);
  if(!fix){showToast('All matches done!','info');checkMatchdayComplete();return;}
  simulateSingleMatch(fix.id);
}
function simulateAllMatches(){
  const sched=getCurrentSchedule(); if(!sched) return;
  sched.fixtures.filter(f=>!f.result).forEach(fix=>simulateSingleMatch(fix.id));
  checkMatchdayComplete();
}
function checkMatchdayComplete(){
  const sched=getCurrentSchedule(); if(!sched) return;
  if(sched.fixtures.every(f=>f.result)){
    document.getElementById('matchday-postmd-card').classList.remove('hidden');
    showToast('All matches complete! Run injury rolls then advance.','success');
  }
}
function rollInjuries(){
  const results=[];
  STATE.players.forEach(p=>{
    if(p.suspended){p.suspended=false;p.injuredMDs=0;}
    if(p.injuredMDs>0) p.injuredMDs--;
  });
  if(STATE.season.currentMD===STATE.season.crisisMD&&!STATE.season.crisisFired){
    fireSeasonCrisis(); STATE.season.crisisFired=true;
  }
  STATE.players.filter(p=>p.teamId&&!p.injured).forEach(p=>{
    if(Math.random()<0.06){p.suspended=true;p.injuredMDs=1;results.push(`🤕 ${p.name} — misses 1 MD`);}
  });
  document.getElementById('injury-roll-results').innerHTML=results.length
    ? results.map(r=>`<div class="injury-item" style="margin-bottom:4px">${escHtml(r)}</div>`).join('')
    : '<p style="color:var(--text2);font-size:12px">No injuries this matchday.</p>';
  saveState(); renderMatchdayInjuries();
  showToast(`Injury rolls done. ${results.length} injured.`,results.length?'warn':'success');
}
function fireSeasonCrisis(){
  const sorted=getSortedStandings(); if(!sorted.length) return;
  const top=sorted[0];
  const players=STATE.players.filter(p=>p.teamId===top.id&&!p.injured&&!p.suspended);
  if(!players.length) return;
  players.sort((a,b)=>(b.batting+b.bowling)-(a.batting+a.bowling));
  players[0].injured=true;
  showCrisisOverlay(players[0], top);
}
function advanceMatchday(){
  STATE.season.currentMD++;
  if(STATE.season.currentMD>STATE.season.totalMDs){
    STATE.season.status='playoffs';
    showToast('League stage complete! Set up playoffs in Admin.','success');
    navTo('admin'); return;
  }
  document.getElementById('matchday-postmd-card').classList.add('hidden');
  if(STATE.liveSession.autoPush) pushState();
  saveState(); renderMatchday();
  showToast(`Matchday ${STATE.season.currentMD} ready!`,'success');
}

/* ── SIMULATION ENGINE ───────────────────────────────── */
function runMatchSimulation(fixture){
  const tA=getTeam(fixture.teamA), tB=getTeam(fixture.teamB);
  const venue=getVenue(fixture.venueId);
  const xiA=getPlayingXI(tA), xiB=getPlayingXI(tB);
  const tossWinner=Math.random()<0.5?tA:tB;
  const tossDec=Math.random()<0.5?'bat':'field';
  let bf,ff,bfXI,ffXI;
  if((tossWinner.id===tA.id&&tossDec==='bat')||(tossWinner.id===tB.id&&tossDec==='field')){
    bf=tA;ff=tB;bfXI=xiA;ffXI=xiB;
  } else {bf=tB;ff=tA;bfXI=xiB;ffXI=xiA;}
  const inn1=simulateInnings(bf,ff,bfXI,ffXI,venue,null);
  const inn2=simulateInnings(ff,bf,ffXI,bfXI,venue,inn1.total+1);
  let winnerId,winDesc,margin,superOver=false;
  if(inn2.total>=inn1.total+1){
    winnerId=ff.id; margin=`${10-inn2.wickets} wickets`; winDesc=`Won by ${margin}`;
  } else if(inn2.total<inn1.total){
    winnerId=bf.id; margin=`${inn1.total-inn2.total} runs`; winDesc=`Won by ${margin}`;
  } else {
    const so=simulateSuperOver(bf,ff);
    winnerId=so.winnerId; winDesc='Won Super Over'; margin='Super Over'; superOver=true;
  }
  const momId=pickMoM(inn1,inn2);
  if(STATE.stats.momAwards[momId]!==undefined) STATE.stats.momAwards[momId]++;
  return {
    id:fixture.id, md:STATE.season.currentMD,
    teamA:tA.id, teamB:tB.id, venueId:fixture.venueId,
    tossWinner:tossWinner.id, tossDec, innings1:inn1, innings2:inn2,
    winnerId, winnerName:getTeam(winnerId).name, winDesc, margin,
    momPlayerId:momId, superOver, timestamp:Date.now(),
  };
}

function simulateInnings(battingTeam,bowlingTeam,batters,bowlers,venue,target){
  const pm=getPitchMods(venue?.pitchType||'balanced');
  const adB=(battingTeam.aggression||60-60)/100;
  const adBow=(bowlingTeam.aggression||60-60)/100;
  const homeBonus=battingTeam.venueId===venue?.id?3:0;
  let runs=0,wickets=0,balls=0,ppRuns=0,ppWickets=0;
  const pStats={},bStats={},fow=[],ballLog=[];
  batters.forEach(pid=>pStats[pid]={runs:0,balls:0,fours:0,sixes:0,out:false,dismissal:''});
  bowlers.forEach(pid=>bStats[pid]={runs:0,balls:0,wickets:0,maidens:0});
  const bq=[...bowlers].sort((a,b)=>(getPlayer(b)?.bowling||50)-(getPlayer(a)?.bowling||50));
  let bRot=0,bat1=batters[0]||null,bat2=batters[1]||null,bIdx=2;
  for(let over=0;over<20;over++){
    const isPP=over<6;
    const bowlerId=bq[bRot%bq.length]; bRot++;
    let overRuns=0;
    for(let ball=0;ball<6;ball++){
      if(wickets>=10||(target&&runs>=target)) break;
      balls++;
      const o=simulateBall({isPP,pm,adB,adBow,homeBonus,
        batter:bat1?getPlayer(bat1):null,
        bowler:bowlerId?getPlayer(bowlerId):null,
        wickets, runsNeeded:target?target-runs:null, ballsLeft:120-balls});
      runs+=o.runs; overRuns+=o.runs;
      if(!o.extra&&bat1&&pStats[bat1]){
        pStats[bat1].balls++; pStats[bat1].runs+=o.runs;
        if(o.runs===4)pStats[bat1].fours++;
        if(o.runs===6)pStats[bat1].sixes++;
      }
      if(!o.extra&&bStats[bowlerId]){bStats[bowlerId].balls++;bStats[bowlerId].runs+=o.runs;}
      if(isPP){ppRuns+=o.runs;}
      if(o.wicket){
        wickets++; if(isPP)ppWickets++;
        if(bat1&&pStats[bat1]){pStats[bat1].out=true;pStats[bat1].dismissal=o.dismissal||'out';}
        if(bStats[bowlerId])bStats[bowlerId].wickets++;
        fow.push({wicket:wickets,runs,over:over+1,ball:ball+1});
        if(bIdx<batters.length){bat1=batters[bIdx++];}
      }
      if(o.runs%2===1){const tmp=bat1;bat1=bat2;bat2=tmp;}
      ballLog.push({over,ball,runs:o.runs,wicket:!!o.wicket,wide:!!o.wide,noBall:!!o.noBall});
    }
    if(overRuns===0&&bStats[bowlerId])bStats[bowlerId].maidens++;
    {const tmp=bat1;bat1=bat2;bat2=tmp;}
    if(target&&runs>=target) break;
  }
  const overs=parseFloat((Math.floor(balls/6)+(balls%6)*0.1).toFixed(1));
  return {teamId:battingTeam.id,total:runs,wickets,overs,ballLog,fow,ppRuns,ppWickets,
          playerStats:pStats,bowlerStats:bStats,extras:Math.floor(balls*0.04)};
}

function simulateBall({isPP,pm,adB,adBow,homeBonus,batter,bowler,wickets,runsNeeded,ballsLeft}){
  let p6=0.07+adB*0.12, p4=0.12+adB*0.10, p2=0.08, p1=0.32, p0=0.30;
  let pW=0.10+adB*0.08+adBow*0.06, pWd=0.03, pNb=0.01;
  if(isPP){p6*=1.10;p4*=1.20;p1*=0.75;p0*=0.80;pW*=0.90;}
  p6*=pm.sixMult; p4*=pm.fourMult; pW*=pm.wicketMult;
  if(bowler?.role==='SPIN'&&pm.spinBowler)pW+=0.08;
  if(bowler?.role==='PACE'&&pm.paceBowler)pW+=0.07;
  if(batter){const r=(batter.batting+homeBonus)/100;p6*=0.8+r*0.4;p4*=0.8+r*0.4;pW*=1.2-r*0.4;}
  if(runsNeeded!==null&&ballsLeft>0){
    const rr=runsNeeded/(ballsLeft/6);
    if(rr>12){p6*=1.30;pW*=1.20;p0*=0.70;}else if(rr<6){p0*=1.30;p6*=0.80;}
  }
  if(wickets>=7){pW*=1.15;p6*=0.90;}
  p6=Math.max(0,p6);p4=Math.max(0,p4);pW=Math.max(0,pW);
  const tot=p6+p4+p2+p1+p0+pW+pWd+pNb;
  const r=Math.random()*tot; let a=0;
  if((a+=p6)>r)return{runs:6,wicket:false};
  if((a+=p4)>r)return{runs:4,wicket:false};
  if((a+=p2)>r)return{runs:2,wicket:false};
  if((a+=p1)>r)return{runs:1,wicket:false};
  if((a+=p0)>r)return{runs:0,wicket:false};
  if((a+=pW)>r)return{runs:0,wicket:true,dismissal:randomDismissal()};
  if((a+=pWd)>r)return{runs:1,wicket:false,wide:true,extra:true};
  return{runs:1,wicket:false,noBall:true,extra:true};
}

function simulateSuperOver(tA,tB){
  const so=()=>{let r=0,w=0,s=0;for(let i=0;i<6&&w<2;i++){const x=Math.random();if(x<0.12){r+=6;s++;}else if(x<0.25)r+=4;else if(x<0.35)w++;else if(x<0.55)r++;}return{runs:r,sixes:s};};
  const soA=so(),soB=so();
  const wid=soA.runs>soB.runs?tA.id:soB.runs>soA.runs?tB.id:soA.sixes>=soB.sixes?tA.id:tB.id;
  return{soA,soB,winnerId:wid};
}

function getPitchMods(pt){
  return ({
    bat:     {sixMult:1.18,fourMult:1.18,wicketMult:0.88,spinBowler:false,paceBowler:false},
    spin:    {sixMult:0.92,fourMult:0.92,wicketMult:1.05,spinBowler:true, paceBowler:false},
    pace:    {sixMult:1.05,fourMult:1.10,wicketMult:1.05,spinBowler:false,paceBowler:true},
    balanced:{sixMult:1.00,fourMult:1.00,wicketMult:1.00,spinBowler:false,paceBowler:false},
  }[pt])||{sixMult:1,fourMult:1,wicketMult:1,spinBowler:false,paceBowler:false};
}
function randomDismissal(){
  return ['bowled','caught','lbw','caught & bowled','run out','stumped'][Math.floor(Math.random()*6)];
}
function getPlayingXI(team){
  if(team.xi&&team.xi.length===11) return team.xi;
  return STATE.players
    .filter(p=>p.teamId===team.id&&!p.injured&&!p.suspended)
    .sort((a,b)=>(b.batting+b.bowling+b.fielding)-(a.batting+a.bowling+a.fielding))
    .slice(0,11).map(p=>p.id);
}
function pickMoM(inn1,inn2){
  let best=null,max=-1;
  const score=pid=>{
    const bs=inn1.playerStats[pid]||inn2.playerStats[pid]||{};
    const bw=inn1.bowlerStats[pid] ||inn2.bowlerStats[pid] ||{};
    return (bs.runs||0)+(bs.fours||0)*0.5+(bs.sixes||0)+(bw.wickets||0)*15-(bw.runs||0)*0.05;
  };
  const pids=new Set([...Object.keys(inn1.playerStats||{}),...Object.keys(inn1.bowlerStats||{})]);
  pids.forEach(pid=>{const s=score(pid);if(s>max){max=s;best=pid;}});
  return best||Object.keys(inn1.playerStats||{})[0];
}

/* ── POINTS & STATS UPDATE ───────────────────────────── */
function updatePointsFromResult(result){
  const winner=getTeam(result.winnerId);
  const loser =getTeam(result.winnerId===result.teamA?result.teamB:result.teamA);
  if(!winner||!loser) return;
  winner.points+=2; winner.wins++;   winner.played++;
  loser.played++;   loser.losses++;
  winner.form=[...(winner.form||[]).slice(-4),'W'];
  loser.form =[...(loser.form ||[]).slice(-4),'L'];
  updateNRR(result);
}
function updateNRR(result){
  const i1=result.innings1,i2=result.innings2;
  const tA=getTeam(result.teamA),tB=getTeam(result.teamB);
  const scoreA=i1.teamId===result.teamA?i1.total:i2.total;
  const scoreB=i1.teamId===result.teamA?i2.total:i1.total;
  const oversA=Math.max(i1.teamId===result.teamA?i1.overs:i2.overs,0.1);
  const oversB=Math.max(i1.teamId===result.teamA?i2.overs:i1.overs,0.1);
  if(tA) tA.nrr=parseFloat(((tA.nrr||0)+(scoreA/oversA-scoreB/oversB)).toFixed(3));
  if(tB) tB.nrr=parseFloat(((tB.nrr||0)+(scoreB/oversB-scoreA/oversA)).toFixed(3));
}
function updateStatsFromMatch(result){
  [result.innings1,result.innings2].forEach(inn=>{
    Object.entries(inn.playerStats||{}).forEach(([pid,s])=>{
      const bs=STATE.stats.batting[pid]; if(!bs) return;
      bs.matches++; bs.runs+=s.runs; bs.balls+=s.balls; bs.fours+=s.fours; bs.sixes+=s.sixes;
      if(s.runs>bs.highScore) bs.highScore=s.runs;
      if(s.runs>=100)bs.hundreds++;else if(s.runs>=50)bs.fifties++;
      if(s.out)bs.dismissals++;
      if(s.runs>=50&&s.balls>0) STATE.stats.milestones.push({type:s.runs>=100?'century':'fifty',playerId:pid,matchId:result.id,value:`${s.runs}(${s.balls})`,md:result.md});
    });
    Object.entries(inn.bowlerStats||{}).forEach(([pid,s])=>{
      const bw=STATE.stats.bowling[pid]; if(!bw) return;
      bw.matches++; bw.wickets+=s.wickets; bw.runs+=s.runs;
      bw.overs=parseFloat((bw.overs+(s.balls/6)).toFixed(1)); bw.maidens+=s.maidens;
      if(s.wickets>=5){bw.fiveWickets++;STATE.stats.milestones.push({type:'fiveWickets',playerId:pid,matchId:result.id,value:`${s.wickets}/${s.runs}`,md:result.md});}
      const nb=parseInt(bw.best||'0'),nr=parseInt((bw.best||'0/99').split('/')[1]);
      if(s.wickets>nb||(s.wickets===nb&&s.runs<nr)) bw.best=`${s.wickets}/${s.runs}`;
    });
  });
}

/* ══════════════════════════════════════════════════════
   Part 4: Live Page + Strategy Page + XI Admin Modal
   ══════════════════════════════════════════════════════ */

/* ── LIVE PAGE ───────────────────────────────────────── */
function renderLive(){
  const sched=getCurrentSchedule();
  const liveEl=document.getElementById('live-matches-grid');
  const idleEl=document.getElementById('live-idle-state');
  const ownEl =document.getElementById('live-own-match');
  if(!sched){liveEl.innerHTML='';idleEl.classList.remove('hidden');ownEl.classList.add('hidden');return;}
  idleEl.classList.add('hidden');
  liveEl.innerHTML=sched.fixtures.map(f=>buildLMC(f)).join('')||'<div class="list-empty">Waiting for simulation.</div>';
  document.getElementById('nav-live-badge').classList.toggle('hidden',!sched.fixtures.some(f=>!f.result));
  if(SESSION.teamId){
    const own=sched.fixtures.find(f=>f.teamA===SESSION.teamId||f.teamB===SESSION.teamId);
    if(own){ownEl.classList.remove('hidden');document.getElementById('live-own-match-card').innerHTML=buildLMC(own,true);}
    else ownEl.classList.add('hidden');
  } else ownEl.classList.add('hidden');
  document.getElementById('live-md-label').textContent=`Matchday ${STATE.season.currentMD}`;
}
function buildLMC(fix,featured=false){
  const tA=getTeam(fix.teamA),tB=getTeam(fix.teamB);
  const r=fix.result;
  const cls=`live-match-card${featured?' featured':''}${r?' complete':''}`;
  if(!r) return `<div class="${cls}">
    <div class="lmc-header"><div class="lmc-teams" style="color:var(--text2)">${escHtml(tA?.shortName||tA?.name||'?')} vs ${escHtml(tB?.shortName||tB?.name||'?')}</div><span class="lmc-over" style="color:var(--text3)">Not started</span></div>
    <div class="lmc-body" style="color:var(--text3);font-size:12px;padding:16px">Waiting for simulation…</div></div>`;
  const i1=r.innings1,i2=r.innings2,bf=getTeam(i1.teamId);
  const recent=(i2.ballLog||[]).slice(-6).map(b=>{
    let c='d0',l='0';
    if(b.wide){c='dWd';l='Wd';}else if(b.noBall){c='dNb';l='Nb';}
    else if(b.wicket){c='dW';l='W';}else if(b.runs===6){c='d6';l='6';}
    else if(b.runs===4){c='d4';l='4';}else if(b.runs===2){c='d2';l='2';}
    else if(b.runs===1){c='d1';l='1';}
    return `<div class="ball-dot ${c}">${l}</div>`;
  }).join('');
  const win=getTeam(r.winnerId);
  return `<div class="${cls}">
    <div class="lmc-header">
      <div class="lmc-teams">${escHtml(tA?.shortName||tA?.name||'?')} vs ${escHtml(tB?.shortName||tB?.name||'?')}</div>
      <span class="lmc-over">${overStr(i2.overs)} ov</span>
    </div>
    <div class="lmc-body">
      <div style="font-size:12px;color:var(--text2);margin-bottom:4px">${escHtml(bf?.shortName||bf?.name||'?')}: ${i1.total}/${i1.wickets}</div>
      <div class="lmc-score-row">
        <div class="lmc-score-batting">${i2.total}/<span class="wickets">${i2.wickets}</span></div>
        <div class="lmc-target">Target: ${i1.total+1}</div>
      </div>
      <div class="lmc-ball-log"><span class="over-label">Last 6:</span>${recent||'<span style="color:var(--text3);font-size:11px">—</span>'}</div>
    </div>
    <div class="lmc-result" style="color:${win?.color||'var(--gold)'}">
      ${escHtml(win?.name||'?')} ${escHtml(r.winDesc)}${r.superOver?' <span style="color:var(--gold)">(SO)</span>':''}
    </div>
  </div>`;
}
function overStr(overs){const f=Math.floor(overs),b=Math.round((overs-f)*10);return`${f}.${b}`;}

/* ── STRATEGY PAGE ───────────────────────────────────── */
function renderStrategy(){
  const isDelegate=SESSION.role==='delegate';
  document.getElementById('strategy-delegate-view').classList.toggle('hidden',!isDelegate);
  document.getElementById('strategy-admin-view').classList.toggle('hidden', isDelegate);
  const locked=STATE.teams.some(t=>t.aggressionLocked);
  document.getElementById('strategy-lock-banner').classList.toggle('hidden',!locked);
  if(isDelegate) renderDelegateStrategy(); else renderAdminStrategyGrid();
}
function renderDelegateStrategy(){
  const team=getTeam(SESSION.teamId); if(!team) return;
  const sched=getCurrentSchedule();
  const fix=sched?.fixtures.find(f=>f.teamA===team.id||f.teamB===team.id);
  const oppId=fix?(fix.teamA===team.id?fix.teamB:fix.teamA):null;
  const opp=oppId?getTeam(oppId):null;
  const venue=fix?getVenue(fix.venueId):null;
  document.getElementById('strategy-md-info').innerHTML=`
    <div class="md-info-item">Matchday: <strong>MD ${STATE.season.currentMD}</strong></div>
    <div class="md-info-item">vs: <strong style="color:${opp?.color||'var(--text)'}">${opp?escHtml(opp.name):'TBD'}</strong></div>
    <div class="md-info-item">Venue: <strong>${venue?escHtml(venue.name):'TBD'}</strong></div>
    <div class="md-info-item">Pitch: <span class="pitch-badge ${venue?.pitchType||'balanced'}">${pitchLabel(venue?.pitchType||'balanced')}</span></div>`;
  renderXISelector(team);
  const slider=document.getElementById('aggression-slider');
  slider.value=team.aggression; slider.disabled=!!team.aggressionLocked;
  document.getElementById('aggression-value').textContent=team.aggression;
  updateAggressionDisplay(team.aggression);
  document.getElementById('aggression-submitted').classList.toggle('hidden',!team.aggressionLocked);
  document.getElementById('xi-confirmed-state').classList.toggle('hidden',team.xi.length!==11);
}

/* ── XI SELECTOR (delegate) ──────────────────────────── */
function renderXISelector(team){
  const squad=STATE.players.filter(p=>p.teamId===team.id)
    .sort((a,b)=>(b.batting+b.bowling)-(a.batting+a.bowling));
  document.getElementById('xi-squad-list').innerHTML=squad.map(p=>{
    const sel=team.xi.includes(p.id), inj=p.injured||p.suspended;
    return `<div class="squad-player-card${sel?' selected':''}${inj?' injured':''}"
               data-player-id="${p.id}" data-role="${p.role}"
               onclick="toggleXIPlayer('${p.id}','${team.id}')">
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span class="squad-player-name">${escHtml(p.name)}${inj?'<span class="squad-player-injury-tag">🤕</span>':''}</span>
      <span class="squad-player-ratings">🏏${p.batting} 🎯${p.bowling}</span>
    </div>`;
  }).join('');
  updateXISlots(team); updateXICount(team);
}
function toggleXIPlayer(playerId,teamId){
  const team=getTeam(teamId); if(!team) return;
  const p=getPlayer(playerId); if(p?.injured||p?.suspended) return;
  const idx=team.xi.indexOf(playerId);
  if(idx!==-1) team.xi.splice(idx,1);
  else{ if(team.xi.length>=11){showToast('XI full — remove a player first.','warn');return;} team.xi.push(playerId); }
  updateXISlots(team); updateXICount(team);
  document.querySelectorAll('#xi-squad-list .squad-player-card').forEach(el=>{
    el.classList.toggle('selected',team.xi.includes(el.dataset.playerId));
  });
}
function updateXISlots(team){
  const el=document.getElementById('xi-slots'); if(!el) return;
  el.innerHTML=Array.from({length:11},(_,i)=>{
    const pid=team.xi[i],p=pid?getPlayer(pid):null;
    if(p) return `<div class="xi-slot filled" data-role="${p.role}" title="${escHtml(p.name)}">
      <span class="xi-slot-name">${escHtml(p.name.split(' ').map(n=>n[0]||'').join(''))}</span>
      <button class="xi-slot-remove" onclick="event.stopPropagation();removeXISlot('${p.id}','${team.id}')">✕</button>
    </div>`;
    return `<div class="xi-slot"><span style="font-size:9px;color:var(--text3)">${i+1}</span></div>`;
  }).join('');
}
function removeXISlot(pid,teamId){
  const team=getTeam(teamId); if(!team) return;
  team.xi=team.xi.filter(id=>id!==pid);
  renderXISelector(team);
}
function updateXICount(team){
  const n=team.xi.length;
  const badge=document.getElementById('xi-selected-count');
  const btn  =document.getElementById('btn-confirm-xi');
  if(badge) badge.textContent=n;
  const wrap=badge?.closest('.xi-count-badge');
  if(wrap) wrap.classList.toggle('complete',n===11);
  if(btn)  btn.disabled=n!==11;
  document.getElementById('xi-confirmed-state')?.classList.add('hidden');
}
function filterSquad(role){
  document.querySelectorAll('#xi-squad-list .squad-player-card').forEach(el=>{
    el.classList.toggle('hidden-by-filter',role!=='all'&&el.dataset.role!==role);
  });
  document.querySelectorAll('#strategy-xi-card .filter-pill').forEach(p=>{
    p.classList.toggle('active',p.dataset.filter===role);
  });
}
function clearXI(){ const t=getTeam(SESSION.teamId); if(!t)return; t.xi=[]; renderXISelector(t); }
function autoPickXI(){ const t=getTeam(SESSION.teamId); if(!t)return; t.xi=getPlayingXI(t); renderXISelector(t); showToast('Auto-picked best XI!','success'); }
function confirmXI(){
  const t=getTeam(SESSION.teamId); if(!t||t.xi.length!==11)return;
  saveState();
  document.getElementById('xi-confirmed-state').classList.remove('hidden');
  document.getElementById('btn-confirm-xi').disabled=true;
  showToast('Playing XI confirmed!','success');
}
function editXI(){
  document.getElementById('xi-confirmed-state').classList.add('hidden');
  document.getElementById('btn-confirm-xi').disabled=false;
}

/* ── AGGRESSION SLIDER ───────────────────────────────── */
function onAggressionChange(val){
  document.getElementById('aggression-value').textContent=val;
  updateAggressionDisplay(parseInt(val));
}
function updateAggressionDisplay(val){
  const zones=[[20,39,'Cautious','var(--green)'],[40,59,'Calculated','var(--teal)'],
               [60,60,'Balanced','var(--text2)'],[61,79,'Attacking','var(--ipl2)'],[80,100,'Ultra','var(--red)']];
  const z=zones.find(([lo,hi])=>val>=lo&&val<=hi)||zones[2];
  const lbl=document.getElementById('aggression-level-label');
  if(lbl){lbl.textContent=z[2];lbl.style.color=z[3];}
  const hints={20:'Cautious batting — steady singles, lower ceiling.',40:'Calculated — controlled aggression, moderate risk.',60:'Balanced play — equal attack and control.',61:'Attacking — more boundaries, slightly more wicket risk.',80:'Ultra-aggressive — sixes or bust. High risk, high reward.'};
  const hintEl=document.getElementById('aggression-effect-hint');
  if(hintEl) hintEl.textContent=hints[z[0]]||hints[60];
  const d=(val-60)/100;
  const brk=document.getElementById('aggression-breakdown');
  if(brk) brk.innerHTML=`
    <span class="effect-tag ${d>0?'up':d<0?'down':'neu'}">6s ${d>=0?'+':''}${(d*12).toFixed(0)}%</span>
    <span class="effect-tag ${d>0?'up':d<0?'down':'neu'}">4s ${d>=0?'+':''}${(d*10).toFixed(0)}%</span>
    <span class="effect-tag ${d>0?'down':'up'}">Wkts ${d>=0?'+':''}${(d*8).toFixed(0)}%</span>
    <span class="effect-tag ${d<0?'up':'down'}">Dots ${d<=0?'+':''}${(-d*10).toFixed(0)}%</span>`;
}
function submitAggression(){
  const t=getTeam(SESSION.teamId); if(!t)return;
  if(t.aggressionLocked){showToast('Strategy locked for this matchday.','warn');return;}
  t.aggression=parseInt(document.getElementById('aggression-slider').value);
  saveState();
  document.getElementById('aggression-submitted').classList.remove('hidden');
  showToast('Aggression submitted!','success');
}

/* ── ADMIN STRATEGY GRID ─────────────────────────────── */
function renderAdminStrategyGrid(){
  document.getElementById('strategy-all-teams-grid').innerHTML=STATE.teams.map(t=>{
    const pct=((t.aggression-20)/80*100).toFixed(1);
    const xiOk=t.xi&&t.xi.length===11;
    return `<div class="strategy-team-card" style="border-color:${t.color}20">
      <div class="strategy-team-card-header">
        <span class="budget-pip" style="background:${t.color}"></span>
        <span class="strategy-team-card-name">${escHtml(t.shortName||t.name)}</span>
        <span class="strategy-status-badge ${t.aggressionLocked?'locked':'pending'}">${t.aggressionLocked?'🔒':'⏳'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div class="strategy-slider-mini" style="flex:1"><div class="strategy-slider-thumb" style="left:${pct}%"></div></div>
        <span style="font-family:var(--fm);font-size:12px;color:var(--ipl2)">${t.aggression}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
        <span class="xi-status-mini ${xiOk?'ok':'pending'}">${xiOk?'✓ XI Set':'⏳ XI Pending'}</span>
        <button class="btn btn-secondary btn-sm" onclick="openXIAdminModal('${t.id}')">Set XI</button>
      </div>
    </div>`;
  }).join('');
}

/* ── XI ADMIN MODAL ──────────────────────────────────── */
function openXIAdminModal(teamId){
  UI.xiAdminTeamId=teamId;
  const team=getTeam(teamId); if(!team) return;
  UI.xiAdminSelected=[...(team.xi||[])];
  document.getElementById('modal-xi-admin-team-name').textContent=team.name;
  renderXIAdminSquad(team); updateXIAdminCount();
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('modal-xi-admin').classList.remove('hidden');
}
function renderXIAdminSquad(team){
  const squad=STATE.players.filter(p=>p.teamId===team.id)
    .sort((a,b)=>(b.batting+b.bowling)-(a.batting+a.bowling));
  document.getElementById('modal-xi-admin-squad').innerHTML=squad.map(p=>{
    const sel=UI.xiAdminSelected.includes(p.id),inj=p.injured||p.suspended;
    return `<div class="squad-player-card${sel?' selected':''}${inj?' injured':''}"
               data-player-id="${p.id}" data-role="${p.role}" onclick="toggleXIAdmin('${p.id}')">
      <span class="squad-player-role-badge ${p.role}">${p.role}</span>
      <span class="squad-player-name">${escHtml(p.name)}${inj?'<span class="squad-player-injury-tag">🤕</span>':''}</span>
      <span class="squad-player-ratings">🏏${p.batting} 🎯${p.bowling}</span>
    </div>`;
  }).join('');
}
function toggleXIAdmin(pid){
  const p=getPlayer(pid); if(p?.injured||p?.suspended) return;
  const idx=UI.xiAdminSelected.indexOf(pid);
  if(idx!==-1) UI.xiAdminSelected.splice(idx,1);
  else{ if(UI.xiAdminSelected.length>=11){showToast('XI full!','warn');return;} UI.xiAdminSelected.push(pid); }
  document.querySelectorAll('#modal-xi-admin-squad .squad-player-card').forEach(el=>{
    el.classList.toggle('selected',UI.xiAdminSelected.includes(el.dataset.playerId));
  });
  updateXIAdminCount();
}
function updateXIAdminCount(){
  const n=UI.xiAdminSelected.length;
  document.getElementById('modal-xi-admin-count').textContent=n;
  document.getElementById('btn-confirm-xi-admin').disabled=n!==11;
}
function filterAdminSquad(role){
  document.querySelectorAll('#modal-xi-admin-squad .squad-player-card').forEach(el=>{
    el.classList.toggle('hidden-by-filter',role!=='all'&&el.dataset.role!==role);
  });
  document.querySelectorAll('#modal-xi-admin .filter-pill').forEach(p=>{
    p.classList.toggle('active',p.dataset.filter===role);
  });
}
function autoPickAdminXI(){ const t=getTeam(UI.xiAdminTeamId); if(!t)return; UI.xiAdminSelected=getPlayingXI(t); renderXIAdminSquad(t); updateXIAdminCount(); }
function clearAdminXI(){ UI.xiAdminSelected=[]; const t=getTeam(UI.xiAdminTeamId); if(t)renderXIAdminSquad(t); updateXIAdminCount(); }
function confirmXIAdmin(){
  const t=getTeam(UI.xiAdminTeamId); if(!t||UI.xiAdminSelected.length!==11)return;
  t.xi=[...UI.xiAdminSelected];
  saveState(); closeXIAdminModal();
  renderMatchdayXIGrid(); renderStrategy();
  showToast(`XI set for ${t.name}!`,'success');
}
function closeXIAdminModal(){
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.getElementById('modal-xi-admin').classList.add('hidden');
  UI.xiAdminTeamId=null; UI.xiAdminSelected=[];
}

/* ══════════════════════════════════════════════════════
   Part 5: Points Table + Scorecards + Stats Pages
   ══════════════════════════════════════════════════════ */

/* ── POINTS TABLE ────────────────────────────────────── */
function renderPoints(){
  const tbody=document.getElementById('points-table-body');
  const sorted=getSortedStandings();
  if(!sorted.length){tbody.innerHTML='<tr class="table-empty-row"><td colspan="9">Season not started.</td></tr>';renderScheduleList();return;}
  const n=sorted.length;
  tbody.innerHTML=sorted.map((t,i)=>{
    const pos=i+1,qualify=pos<=4,danger=pos>n-2,own=t.id===SESSION.teamId;
    const nrrStr=t.nrr>=0?`+${t.nrr.toFixed(3)}`:t.nrr.toFixed(3);
    const nrrPos=t.nrr>=0;
    const rowCls=[qualify?'qualify-zone':'',danger?'danger-zone':'',own?'own-team':''].filter(Boolean).join(' ');
    const form=(t.form||[]).slice(-5);
    const dots=Array.from({length:5},(_,j)=>form[j]||'na').map(f=>`<div class="form-dot ${f==='W'?'W':f==='L'?'L':f==='T'?'T':'na'}"></div>`).join('');
    return `<tr class="${rowCls}">
      <td><span class="pt-pos">${pos}</span></td>
      <td><div class="pt-team-cell"><span class="pt-team-pip" style="background:${t.color}"></span><span class="pt-team-name">${escHtml(t.name)}</span></div></td>
      <td class="col-num">${t.played}</td>
      <td class="col-num">${t.wins}</td>
      <td class="col-num">${t.losses}</td>
      <td class="col-num">${t.ties||0}</td>
      <td class="col-num pt-pts" style="color:var(--ipl2)">${t.points}</td>
      <td class="col-nrr"><span class="pt-nrr ${nrrPos?'positive':'negative'}">${nrrStr}</span></td>
      <td><div class="form-strip">${dots}</div></td>
    </tr>`;
  }).join('');
  renderScheduleList();
}
function renderScheduleList(){
  const el=document.getElementById('schedule-list-view');
  if(!STATE.schedule.length){el.innerHTML='<div class="list-empty" style="padding:16px">Schedule not generated yet.</div>';return;}
  el.innerHTML=STATE.schedule.map(s=>{
    const cur=s.md===STATE.season.currentMD;
    const tw=s.md>1&&s.md%STATE.season.tradeWindowEvery===1;
    return `<div class="schedule-md-group" ${cur?'style="background:rgba(255,107,26,0.025)"':''}>
      <div class="schedule-md-label">MD ${s.md}${cur?' <span style="color:var(--ipl2)">● Now</span>':''}${tw?' <span style="color:var(--green);font-size:9px;margin-left:6px">TRADE WINDOW</span>':''}</div>
      ${s.fixtures.map(f=>{
        const tA=getTeam(f.teamA),tB=getTeam(f.teamB),v=getVenue(f.venueId);
        const res=f.result?`<span style="color:${getTeam(f.result.winnerId)?.color||'var(--text2)'}">${escHtml(getTeam(f.result.winnerId)?.shortName||'?')} won</span>`:'—';
        return `<div class="schedule-fixture">
          <span class="schedule-matchup">${escHtml(tA?.shortName||tA?.name||'?')} vs ${escHtml(tB?.shortName||tB?.name||'?')}</span>
          <span class="schedule-venue">${v?escHtml(v.name):'TBD'}</span>
          <span class="schedule-result">${res}</span>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}
function scheduleView(type){
  document.getElementById('schedule-list-view').classList.toggle('hidden',type!=='list');
  document.getElementById('schedule-gantt-view').classList.toggle('hidden',type!=='gantt');
  document.querySelectorAll('.view-toggle').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase()===type));
  if(type==='gantt') renderGantt();
}
function renderGantt(){
  const el=document.getElementById('schedule-gantt-view');
  const mds=STATE.season.totalMDs;
  el.innerHTML=`<div style="overflow-x:auto;padding:8px 0">
    <div style="display:grid;grid-template-columns:90px repeat(${mds},32px);gap:2px;min-width:${90+mds*34}px">
      <div style="font-family:var(--fm);font-size:9px;color:var(--text3);padding:2px 4px">Team</div>
      ${Array.from({length:mds},(_,i)=>`<div style="font-family:var(--fm);font-size:8px;color:var(--text3);text-align:center">${i+1}</div>`).join('')}
      ${STATE.teams.map(t=>`
        <div style="display:contents">
          <div style="font-size:10px;font-weight:600;display:flex;align-items:center;gap:4px;padding:2px 4px">
            <span style="width:6px;height:6px;border-radius:50%;background:${t.color};flex-shrink:0"></span>${escHtml(t.shortName||t.name)}
          </div>
          ${Array.from({length:mds},(_,i)=>{
            const s=STATE.schedule[i];
            const f=s?.fixtures.find(fx=>fx.teamA===t.id||fx.teamB===t.id);
            if(!f)return`<div style="height:22px;background:var(--bg3);border-radius:3px"></div>`;
            const won=f.result?.winnerId===t.id;
            const clr=f.result?(won?'var(--green)':'var(--red)'):'rgba(255,107,26,0.25)';
            return`<div style="height:22px;background:${clr};border-radius:3px;opacity:0.8" title="${f.result?f.result.winDesc:'Upcoming'}"></div>`;
          }).join('')}
        </div>`).join('')}
    </div>
  </div>`;
}

/* ── SCORECARDS ──────────────────────────────────────── */
function renderScorecards(){
  const tabs=document.getElementById('scorecard-match-tabs');
  if(!STATE.matches.length){
    tabs.innerHTML='<div class="selector-empty">No completed matches yet.</div>';
    document.getElementById('scorecard-content').classList.add('hidden');
    return;
  }
  tabs.innerHTML=STATE.matches.map((m,i)=>{
    const tA=getTeam(m.teamA),tB=getTeam(m.teamB);
    const own=SESSION.teamId&&(m.teamA===SESSION.teamId||m.teamB===SESSION.teamId);
    return `<button class="sc-match-tab${own?' own-team':''}${i===0?' active':''}" onclick="showScorecard('${m.id}',this)">
      MD${m.md}: ${escHtml(tA?.shortName||'?')} v ${escHtml(tB?.shortName||'?')}
    </button>`;
  }).join('');
  showScorecard(STATE.matches[0].id, tabs.firstElementChild);
}
function showScorecard(matchId, tabEl){
  if(tabEl){document.querySelectorAll('.sc-match-tab').forEach(t=>t.classList.remove('active'));tabEl.classList.add('active');}
  const m=STATE.matches.find(x=>x.id===matchId); if(!m) return;
  window._sc=m;
  document.getElementById('scorecard-content').classList.remove('hidden');
  renderScorecardHeader(m);
  document.getElementById('sc-super-over-tab').classList.toggle('hidden',!m.superOver);
  switchInnings(1);
}
function renderScorecardHeader(m){
  const tA=getTeam(m.teamA),tB=getTeam(m.teamB),v=getVenue(m.venueId),win=getTeam(m.winnerId);
  document.getElementById('sc-match-header').innerHTML=`
    <div class="sc-match-result"><span style="color:${win?.color||'var(--gold)'}">${escHtml(win?.name||'?')}</span> — ${escHtml(m.winDesc)}</div>
    <div class="sc-match-meta">
      <span>🎲 Toss: ${escHtml(getTeam(m.tossWinner)?.name||'?')} elected to ${m.tossDec}</span>
      <span>🏟 ${v?escHtml(v.name+', '+v.city):'—'}</span>
      <span>MD ${m.md}</span>
      ${m.superOver?'<span style="color:var(--gold)">⚡ Super Over</span>':''}
    </div>`;
}
function switchInnings(num){
  document.querySelectorAll('.innings-tab').forEach(t=>t.classList.toggle('active',String(t.dataset.innings)===String(num)));
  const m=window._sc; if(!m) return;
  const inn=num===1?m.innings1:num===2?m.innings2:null; if(!inn) return;
  const bowlInn=num===1?m.innings2:m.innings1;
  renderBattingTable(inn); renderBowlingTable(inn,bowlInn);
  renderFoW(inn); renderPPSummary(inn); renderMoM(m);
}
function renderBattingTable(inn){
  const team=getTeam(inn.teamId);
  document.getElementById('sc-batting-team-name').textContent=team?.name||'';
  const rows=Object.entries(inn.playerStats||{}).map(([pid,s])=>({p:getPlayer(pid),s})).filter(e=>e.p);
  document.getElementById('sc-batting-body').innerHTML=rows.map(({p,s},i)=>{
    const sr=s.balls>0?((s.runs/s.balls)*100).toFixed(1):'0.0';
    const own=SESSION.teamId&&p.teamId===SESSION.teamId;
    return `<tr class="${i===0&&s.runs>0?'top-score':''}${own?' own-player':''}">
      <td>${escHtml(p.name)}</td>
      <td class="sc-col-dismissal">${s.out?escHtml(s.dismissal||'out'):'<em style="color:var(--green)">not out</em>'}</td>
      <td>${s.runs}</td><td>${s.balls}</td><td>${s.fours}</td><td>${s.sixes}</td><td>${sr}</td>
    </tr>`;
  }).join('');
  document.getElementById('sc-batting-extras').innerHTML=`
    <tr class="sc-total-row"><td colspan="2">Total</td><td>${inn.total}</td><td colspan="2">${inn.wickets} wkts</td><td colspan="2">${overStr(inn.overs)} ov</td></tr>
    <tr><td colspan="7" style="font-size:11px;color:var(--text2)">Extras: ${inn.extras||0}</td></tr>`;
}
function renderBowlingTable(battingInn, bowlingInn){
  const team=getTeam(bowlingInn.teamId);
  document.getElementById('sc-bowling-team-name').textContent=team?.name||'';
  const rows=Object.entries(battingInn.bowlerStats||{}).map(([pid,s])=>({p:getPlayer(pid),s})).filter(e=>e.p);
  document.getElementById('sc-bowling-body').innerHTML=rows.map(({p,s},i)=>{
    const ov=`${Math.floor(s.balls/6)}.${s.balls%6}`;
    const eco=s.balls>0?((s.runs/s.balls)*6).toFixed(2):'0.00';
    return `<tr class="${i===0&&s.wickets>0?'top-wicket':''}">
      <td>${escHtml(p.name)}</td><td>${ov}</td><td>${s.maidens}</td>
      <td>${s.runs}</td><td>${s.wickets}</td><td>${eco}</td><td>0</td><td>0</td>
    </tr>`;
  }).join('');
}
function renderFoW(inn){
  document.getElementById('sc-fow').innerHTML=
    (inn.fow||[]).map(f=>`<span class="sc-fow-item">${f.wicket}-${f.runs} (${f.over}.${f.ball})</span>`).join('')
    ||'<span style="color:var(--text3);font-size:11px">No wickets fell.</span>';
}
function renderPPSummary(inn){
  document.getElementById('sc-pp-summary').innerHTML=`
    <div class="sc-pp-stat">Runs: <strong>${inn.ppRuns||0}</strong></div>
    <div class="sc-pp-stat">Wickets: <strong>${inn.ppWickets||0}</strong></div>
    <div class="sc-pp-stat">Run Rate: <strong>${inn.ppRuns?((inn.ppRuns||0)/6).toFixed(2):'0.00'}</strong></div>`;
}
function renderMoM(m){
  const p=getPlayer(m.momPlayerId);
  const bs=m.innings1.playerStats[m.momPlayerId]||m.innings2.playerStats[m.momPlayerId];
  const bw=m.innings1.bowlerStats[m.momPlayerId] ||m.innings2.bowlerStats[m.momPlayerId];
  const stat=bs?`${bs.runs} runs (${bs.balls} balls)`:bw?`${bw.wickets}/${bw.runs}`:'';
  document.getElementById('sc-mom').innerHTML=`<div class="sc-mom-player">
    <span class="mom-icon">⭐</span>
    <div><div class="mom-name">${p?escHtml(p.name):'—'}</div><div class="mom-perf">${escHtml(stat)}</div></div>
  </div>`;
}
function downloadScorecard(){
  const m=window._sc; if(!m) return;
  const tA=getTeam(m.teamA),tB=getTeam(m.teamB);
  const fn=`scorecard_md${m.md}_${tA?.shortName||'A'}_v_${tB?.shortName||'B'}.html`;
  const content=document.getElementById('scorecard-content').innerHTML;
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IPL MUN Scorecard MD${m.md}</title>
    <style>body{font-family:sans-serif;padding:20px;color:#000;background:#fff}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 10px;font-size:12px}th{background:#f5f5f5;font-weight:bold}.sc-match-result{font-size:18px;font-weight:bold;margin-bottom:8px}.sc-match-meta{font-size:12px;color:#666;margin-bottom:16px}</style>
  </head><body><h2>IPL MUN — MD${m.md}</h2>${content}</body></html>`;
  const a=document.createElement('a');
  a.href='data:text/html,'+encodeURIComponent(html); a.download=fn; a.click();
  showToast('Scorecard downloaded!','success');
}

/* ── STATS PAGE ──────────────────────────────────────── */
function renderStats(){ renderCaps(); switchStatTab('batting'); }
function renderCaps(){
  const oc=getOrangeCap(),pc=getPurpleCap();
  document.getElementById('orange-cap-holder').textContent=oc?oc.name:'—';
  document.getElementById('orange-cap-stat').textContent  =oc?`${oc.runs} runs`:'';
  document.getElementById('purple-cap-holder').textContent=pc?pc.name:'—';
  document.getElementById('purple-cap-stat').textContent  =pc?`${pc.wickets} wickets`:'';
}
function switchStatTab(tab){
  document.querySelectorAll('.stat-tab').forEach(t=>t.classList.toggle('active',t.dataset.stat===tab));
  document.querySelectorAll('.stat-panel').forEach(p=>p.classList.toggle('active',p.id===`stats-${tab}-panel`));
  if(tab==='batting')   renderBattingStats();
  if(tab==='bowling')   renderBowlingStats();
  if(tab==='fielding')  renderFieldingStats();
  if(tab==='sixes')     renderSixesStats();
  if(tab==='milestones')renderMilestones();
}
function renderBattingStats(){
  const rows=STATE.players.filter(p=>p.teamId).map(p=>({p,s:STATE.stats.batting[p.id]||{}}))
    .filter(({s})=>(s.matches||0)>0).sort((a,b)=>(b.s.runs||0)-(a.s.runs||0));
  document.getElementById('stat-batting-body').innerHTML=rows.map(({p,s},i)=>{
    const avg=s.dismissals>0?(s.runs/s.dismissals).toFixed(1):s.runs||0;
    const sr=s.balls>0?((s.runs/s.balls)*100).toFixed(1):'0.0';
    const t=getTeam(p.teamId),own=p.teamId===SESSION.teamId;
    return `<tr class="${i===0?'stat-leader':''}${own?' own-player':''}">
      <td>${i+1}</td>
      <td><span style="display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:${t?.color||'var(--text3)'}"></span>${escHtml(p.name)}</span></td>
      <td>${escHtml(t?.shortName||t?.name||'')}</td>
      <td>${s.matches||0}</td>
      <td style="font-weight:700;color:var(--ipl2)">${s.runs||0}</td>
      <td>${s.highScore||0}</td><td>${avg}</td><td>${sr}</td>
      <td>${s.fifties||0}</td><td>${s.hundreds||0}</td><td>${s.sixes||0}</td><td>${s.fours||0}</td>
    </tr>`;
  }).join('')||'<tr class="table-empty-row"><td colspan="12">No batting data yet.</td></tr>';
}
function renderBowlingStats(){
  const rows=STATE.players.filter(p=>p.teamId).map(p=>({p,s:STATE.stats.bowling[p.id]||{}}))
    .filter(({s})=>(s.wickets||0)>0).sort((a,b)=>(b.s.wickets||0)-(a.s.wickets||0));
  document.getElementById('stat-bowling-body').innerHTML=rows.map(({p,s},i)=>{
    const avg=s.wickets>0?(s.runs/s.wickets).toFixed(1):'—';
    const eco=s.overs>0?(s.runs/s.overs).toFixed(2):'0.00';
    const t=getTeam(p.teamId),own=p.teamId===SESSION.teamId;
    return `<tr class="${i===0?'stat-leader':''}${own?' own-player':''}">
      <td>${i+1}</td><td>${escHtml(p.name)}</td>
      <td>${escHtml(t?.shortName||t?.name||'')}</td>
      <td>${s.matches||0}</td>
      <td style="font-weight:700;color:var(--purple)">${s.wickets||0}</td>
      <td>${s.runs||0}</td><td>${(s.overs||0).toFixed(1)}</td>
      <td>${avg}</td><td>${eco}</td><td>${escHtml(s.best||'0/0')}</td><td>${s.fiveWickets||0}</td>
    </tr>`;
  }).join('')||'<tr class="table-empty-row"><td colspan="11">No bowling data yet.</td></tr>';
}
function renderFieldingStats(){
  const rows=STATE.players.filter(p=>p.teamId).map(p=>({p,s:STATE.stats.fielding[p.id]||{}}))
    .filter(({s})=>(s.catches||0)+(s.stumpings||0)+(s.runOuts||0)>0)
    .sort((a,b)=>((b.s.catches||0)+(b.s.stumpings||0))-((a.s.catches||0)+(a.s.stumpings||0)));
  document.getElementById('stat-fielding-body').innerHTML=rows.map(({p,s},i)=>`
    <tr><td>${i+1}</td><td>${escHtml(p.name)}</td>
    <td>${escHtml(getTeam(p.teamId)?.shortName||'')}</td>
    <td>${s.catches||0}</td><td>${s.stumpings||0}</td><td>${s.runOuts||0}</td></tr>`
  ).join('')||'<tr class="table-empty-row"><td colspan="6">No fielding data yet.</td></tr>';
}
function renderSixesStats(){
  const rows=STATE.players.filter(p=>p.teamId).map(p=>({p,s:STATE.stats.batting[p.id]||{}}))
    .filter(({s})=>(s.sixes||0)>0).sort((a,b)=>(b.s.sixes||0)-(a.s.sixes||0));
  document.getElementById('stat-sixes-body').innerHTML=rows.map(({p,s},i)=>`
    <tr><td>${i+1}</td><td>${escHtml(p.name)}</td>
    <td>${escHtml(getTeam(p.teamId)?.shortName||'')}</td>
    <td style="font-weight:700;color:var(--gold)">${s.sixes||0}</td><td>${s.fours||0}</td></tr>`
  ).join('')||'<tr class="table-empty-row"><td colspan="5">No sixes data yet.</td></tr>';
}
function renderMilestones(){
  const list=STATE.stats.milestones||[];
  const icons={fastest100:'💯',fiveWickets:'🎳',century:'💯',fifty:'⭐'};
  document.getElementById('milestones-list').innerHTML=list.length
    ? [...list].reverse().map(m=>{
        const p=getPlayer(m.playerId);
        return `<div class="milestone-entry">
          <span class="milestone-entry-icon">${icons[m.type]||'🌟'}</span>
          <div class="milestone-entry-detail">
            <div class="milestone-entry-name">${p?escHtml(p.name):'?'} — ${escHtml(m.type)}</div>
            <div class="milestone-entry-stat">${escHtml(String(m.value||''))}</div>
          </div>
          <span class="milestone-entry-md">MD ${m.md}</span>
        </div>`;
      }).join('')
    : '<div class="list-empty">No milestones yet.</div>';
}
function exportStatsCsv(type){
  let rows=[];
  if(type==='batting'){
    rows=[['Name','Team','M','Runs','HS','Avg','SR','50s','100s','6s','4s']];
    STATE.players.filter(p=>p.teamId).forEach(p=>{
      const s=STATE.stats.batting[p.id]||{};
      const avg=s.dismissals>0?(s.runs/s.dismissals).toFixed(1):'—';
      const sr=s.balls>0?((s.runs/s.balls)*100).toFixed(1):'0.0';
      rows.push([p.name,getTeam(p.teamId)?.name||'',s.matches||0,s.runs||0,s.highScore||0,avg,sr,s.fifties||0,s.hundreds||0,s.sixes||0,s.fours||0]);
    });
  } else {
    rows=[['Name','Team','M','Wkts','Runs','Overs','Avg','Econ','Best','5W']];
    STATE.players.filter(p=>p.teamId).forEach(p=>{
      const s=STATE.stats.bowling[p.id]||{};
      const avg=s.wickets>0?(s.runs/s.wickets).toFixed(1):'—';
      const eco=s.overs>0?(s.runs/s.overs).toFixed(2):'0.00';
      rows.push([p.name,getTeam(p.teamId)?.name||'',s.matches||0,s.wickets||0,s.runs||0,(s.overs||0).toFixed(1),avg,eco,s.best||'0/0',s.fiveWickets||0]);
    });
  }
  const a=document.createElement('a');
  a.href='data:text/csv,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));
  a.download=`ipl_mun_${type}_stats.csv`; a.click();
}

/* ══════════════════════════════════════════════════════
   Part 6: Admin Page + Live Session + Trade Desk
   ══════════════════════════════════════════════════════ */

function renderAdmin(){
  renderTeamCodes(); renderTradeDesk(); renderTradeLog(); renderPlayoffsBracket();
  document.getElementById('admin-session-id').textContent=STATE.liveSession.blobId||'—';
  document.getElementById('admin-autopush').checked=STATE.liveSession.autoPush;
  const md=STATE.season.currentMD;
  const isOpen=md>1&&md%STATE.season.tradeWindowEvery===1;
  const badge=document.getElementById('admin-trade-window-status');
  badge.textContent=isOpen?'Open':'Closed';
  badge.style.color=isOpen?'var(--green)':'var(--text2)';
}
function renderTeamCodes(){
  document.getElementById('admin-codes-list').innerHTML=STATE.teams.map(t=>{
    const code=STATE.teamCodes[t.id]||'????';
    return `<div class="code-row">
      <div class="code-row-team"><span class="budget-pip" style="background:${t.color}"></span>${escHtml(t.name)}</div>
      <code class="code-pill">${code}</code>
      <button class="copy-btn" onclick="copyCode('${code}','${escHtml(t.name)}')" title="Copy">📋</button>
      <button class="btn btn-secondary btn-sm" onclick="regenCode('${t.id}')">↺</button>
    </div>`;
  }).join('')||'<div class="list-empty">No teams yet.</div>';
}
function copyCode(code,name){
  navigator.clipboard.writeText(code).then(()=>showToast(`${name}: ${code} copied!`,'success'));
}
function regenCode(teamId){
  STATE.teamCodes[teamId]=randomCode(4); saveState(); renderTeamCodes();
  showToast('Code regenerated.','success');
}
function generateAllCodes(){
  STATE.teams.forEach(t=>STATE.teamCodes[t.id]=randomCode(4));
  saveState(); renderTeamCodes(); showToast('All codes regenerated!','success');
}

function renderTradeDesk(){
  ['trade-team-a','trade-team-b'].forEach(id=>{
    const sel=document.getElementById(id);
    sel.innerHTML='<option value="">Select team…</option>'+
      STATE.teams.map(t=>`<option value="${t.id}">${escHtml(t.name)}</option>`).join('');
  });
  document.getElementById('trade-team-a').onchange=e=>refreshTradePlayers('trade-player-a',e.target.value);
  document.getElementById('trade-team-b').onchange=e=>refreshTradePlayers('trade-player-b',e.target.value);
}
function refreshTradePlayers(selId,teamId){
  const sel=document.getElementById(selId),t=getTeam(teamId);
  sel.innerHTML='<option value="">Select player…</option>'+
    (t?STATE.players.filter(p=>p.teamId===teamId).map(p=>`<option value="${p.id}">${escHtml(p.name)}</option>`).join(''):'');
}
function executeTrade(){
  const tAId=document.getElementById('trade-team-a').value;
  const tBId=document.getElementById('trade-team-b').value;
  const pAId=document.getElementById('trade-player-a').value;
  const pBId=document.getElementById('trade-player-b').value;
  if(!tAId||!tBId||!pAId||!pBId){showToast('Select both teams and players.','warn');return;}
  if(tAId===tBId){showToast('Cannot trade within the same team.','warn');return;}
  const pA=getPlayer(pAId),pB=getPlayer(pBId),tA=getTeam(tAId),tB=getTeam(tBId);
  pA.teamId=tBId; tA.players=tA.players.filter(i=>i!==pAId); tB.players.push(pAId);
  pB.teamId=tAId; tB.players=tB.players.filter(i=>i!==pBId); tA.players.push(pBId);
  STATE.tradeLog.push({md:STATE.season.currentMD,pAId,pBId,tAId,tBId,ts:Date.now()});
  saveState(); renderTradeDesk(); renderTradeLog();
  showToast(`Trade: ${pA.name} ⇄ ${pB.name}`,'success');
}
function renderTradeLog(){
  const el=document.getElementById('trade-log');
  const log=STATE.tradeLog||[];
  if(!log.length){el.innerHTML='<div class="list-empty">No trades this season.</div>';return;}
  el.innerHTML=[...log].reverse().map(e=>{
    const pA=getPlayer(e.pAId),pB=getPlayer(e.pBId),tA=getTeam(e.tAId),tB=getTeam(e.tBId);
    return `<div class="trade-log-entry">
      <span class="trade-log-md">MD${e.md}</span>
      <span class="trade-log-detail">${escHtml(pA?.name||'?')} (${escHtml(tA?.shortName||'?')}) ⇄ ${escHtml(pB?.name||'?')} (${escHtml(tB?.shortName||'?')})</span>
    </div>`;
  }).join('');
}
function renderPlayoffsBracket(){
  const status=document.getElementById('admin-playoffs-status');
  const isPlayoffs=['playoffs','complete'].includes(STATE.season.status);
  status.textContent=isPlayoffs?'Active':'League stage';
  status.style.color=isPlayoffs?'var(--gold)':'var(--text2)';
  if(!isPlayoffs) return;
  const s=getSortedStandings();
  document.getElementById('bracket-q1').innerHTML   =`<span style="color:${s[0]?.color}">${s[0]?.shortName||'1st'}</span> vs <span style="color:${s[1]?.color}">${s[1]?.shortName||'2nd'}</span>`;
  document.getElementById('bracket-elim').innerHTML =`<span style="color:${s[2]?.color}">${s[2]?.shortName||'3rd'}</span> vs <span style="color:${s[3]?.color}">${s[3]?.shortName||'4th'}</span>`;
  document.getElementById('playoffs-sim-actions').classList.remove('hidden');
}
function simulatePlayoffMatch(){ showToast('Playoff simulation ready — sim via Matchday tab.','info'); }

function changePassword(){
  const val=document.getElementById('new-password').value.trim();
  if(!val){showToast('Enter a new password.','warn');return;}
  STATE.season.adminPassword=val; saveState();
  document.getElementById('new-password').value='';
  showToast('Password updated!','success');
}
function copySessionId(){
  const id=STATE.liveSession.blobId;
  if(!id){showToast('No active session.','warn');return;}
  navigator.clipboard.writeText(id).then(()=>showToast('Session ID copied!','success'));
}
function toggleAutoPush(val){ STATE.liveSession.autoPush=val; saveState(); }

async function createSession(){
  try{
    const res=await fetch('https://jsonblob.com/api/jsonBlob',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(trimStateForShare(STATE)),
    });
    const loc=res.headers.get('Location');
    const id=loc?loc.split('/').pop():null;
    if(!id) throw new Error('No ID');
    STATE.liveSession.blobId=id; saveState();
    document.getElementById('admin-session-id').textContent=id;
    showToast('Session created: '+id,'success');
  }catch(e){ showToast('Could not create session.','error'); }
}
async function pushState(){
  const id=STATE.liveSession.blobId;
  if(!id){showToast('Create a session first.','warn');return;}
  try{
    await fetch(`https://jsonblob.com/api/jsonBlob/${id}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(trimStateForShare(STATE)),
    });
    showToast('State pushed!','success');
  }catch(e){ showToast('Push failed.','error'); }
}
async function fetchSessionState(sessionId, onSuccess){
  try{
    const res=await fetch(`https://jsonblob.com/api/jsonBlob/${sessionId}`,{headers:{'Accept':'application/json'}});
    STATE=migrateState(await res.json());
    saveState(); if(onSuccess) onSuccess();
  }catch(e){ showToast('Could not load session.','error'); }
}
function startDelegatePoll(){
  if(!STATE.liveSession.blobId) return;
  UI.liveMatchInterval=setInterval(async()=>{
    if(!STATE.liveSession.blobId) return;
    try{
      const res=await fetch(`https://jsonblob.com/api/jsonBlob/${STATE.liveSession.blobId}`,{headers:{'Accept':'application/json'}});
      STATE=migrateState(await res.json());
      saveState();
      if(UI.currentPage==='live') renderLive();
      if(UI.currentPage==='points') renderPoints();
      renderSidebar();
      updateSyncDot('synced');
    }catch(_){ updateSyncDot('error'); }
  },8000);
}
function updateSyncDot(status){
  const el=document.getElementById('header-sync');
  el.classList.remove('hidden'); el.className=`sync-dot ${status}`;
}
function toggleProjectorView(){ showToast('Projector view: open this page on a second screen in fullscreen.','info'); }

function confirmReset(){
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('modal-reset').classList.remove('hidden');
}
function executeReset(){
  const val=document.getElementById('reset-confirm-input').value.trim();
  if(val!=='RESET'){showToast('Type RESET exactly.','warn');return;}
  closeModal(); resetState();
  SESSION={role:null,teamId:null};
  document.getElementById('app').classList.add('hidden');
  document.getElementById('screen-login').classList.add('active');
  showToast('Season reset.','info');
}

/* ══════════════════════════════════════════════════════
   Part 7: Modals + Overlays + Confetti + Helpers + Boot
   ══════════════════════════════════════════════════════ */

/* ── MODALS ──────────────────────────────────────────── */
function closeModal(event){
  if(event&&event.target!==document.getElementById('modal-backdrop')) return;
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
}
function openPlayerModal(playerId){
  const p=getPlayer(playerId); if(!p) return;
  const t=getTeam(p.teamId);
  document.getElementById('modal-player-title').textContent=p.name;
  document.getElementById('modal-player-team').textContent =t?t.name:'Unassigned';
  document.getElementById('modal-player-price').textContent=`₹${p.price||p.basePrice} Cr`;
  const rb=document.getElementById('modal-player-role-badge');
  rb.textContent=p.role; rb.className=`role-badge ${p.role}`;
  const bars=[{label:'Batting',val:p.batting,cls:'bat'},{label:'Bowling',val:p.bowling,cls:'bowl'},{label:'Fielding',val:p.fielding,cls:'field'}];
  if(p.role==='WK') bars.push({label:'Keeping',val:p.keeping,cls:'keep'});
  document.getElementById('modal-player-ratings').innerHTML=bars.map(b=>`
    <div class="rating-row">
      <span class="rating-label">${b.label}</span>
      <div class="rating-track"><div class="rating-fill ${b.cls}" style="width:${b.val}%"></div></div>
      <span class="rating-value">${b.val}</span>
    </div>`).join('');
  const injEl=document.getElementById('modal-player-injury');
  injEl.classList.toggle('hidden',!p.injured&&!p.suspended);
  document.getElementById('modal-injury-mds').textContent=p.injured?'rest of season':p.injuredMDs||1;
  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('modal-player').classList.remove('hidden');
}

/* ── TOSS OVERLAY ────────────────────────────────────── */
function showTossOverlay(teamA, teamB, onDone){
  document.getElementById('toss-team-a').textContent=teamA.name;
  document.getElementById('toss-team-b').textContent=teamB.name;
  document.getElementById('toss-result').classList.add('hidden');
  document.getElementById('btn-toss-continue').style.display='none';
  document.getElementById('overlay-toss').classList.remove('hidden');
  const coin=document.getElementById('toss-coin');
  coin.classList.remove('flipping'); void coin.offsetWidth; coin.classList.add('flipping');
  const winner=Math.random()<0.5?teamA:teamB;
  const dec=Math.random()<0.5?'bat first':'field first';
  setTimeout(()=>{
    document.getElementById('toss-winner-name').textContent=winner.name;
    document.getElementById('toss-decision').textContent=`elected to ${dec}`;
    document.getElementById('toss-result').classList.remove('hidden');
    document.getElementById('btn-toss-continue').style.display='inline-flex';
    window._tossCb=onDone;
  },1800);
}
function closeToss(){
  document.getElementById('overlay-toss').classList.add('hidden');
  if(window._tossCb) window._tossCb();
}

/* ── MILESTONE OVERLAY ───────────────────────────────── */
function showMilestone(type, player, stat){
  const cfg={fifty:{icon:'⭐',title:'FIFTY!',color:'var(--ipl2)'},century:{icon:'💯',title:'CENTURY!',color:'var(--gold)'},fiveWkt:{icon:'🎳',title:'5-FER!',color:'var(--purple)'}}[type]||{icon:'🌟',title:'MILESTONE!',color:'var(--gold)'};
  document.getElementById('milestone-icon').textContent=cfg.icon;
  document.getElementById('milestone-title').textContent=cfg.title;
  document.getElementById('milestone-title').style.color=cfg.color;
  document.getElementById('milestone-player').textContent=player.name;
  document.getElementById('milestone-stat').textContent=stat;
  spawnConfetti('milestone-confetti',30,['var(--gold)','var(--ipl2)','var(--green)','#fff']);
  const el=document.getElementById('overlay-milestone');
  el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),3500);
}

/* ── SUPER OVER OVERLAY ──────────────────────────────── */
function showSuperOverOverlay(tA,tB){
  document.querySelector('#so-team-a .so-team-name').textContent=tA.name;
  document.querySelector('#so-team-b .so-team-name').textContent=tB.name;
  document.getElementById('overlay-super-over').classList.remove('hidden');
}
function startSuperOver(){ document.getElementById('overlay-super-over').classList.add('hidden'); }

/* ── CRISIS OVERLAY ──────────────────────────────────── */
function showCrisisOverlay(player, team){
  document.getElementById('crisis-player-name').textContent=player.name;
  document.getElementById('crisis-team-name').textContent=team.name;
  spawnCrosses('crisis-crosses',20);
  document.getElementById('overlay-crisis').classList.remove('hidden');
}
function dismissCrisis(){ document.getElementById('overlay-crisis').classList.add('hidden'); }

/* ── CHAMPION REVEAL (7-stage) ───────────────────────── */
function showChampionReveal(winner, runnerUp, finalStandings){
  const ov=document.getElementById('overlay-champion');
  ov.classList.remove('hidden');
  document.querySelectorAll('.champ-stage').forEach(s=>{s.classList.remove('active');s.classList.add('hidden');});
  const delays=[0,1400,3000,5000,6200,9000];
  [0,1,2,3,4,5].forEach((s,i)=>setTimeout(()=>{
    document.querySelectorAll('.champ-stage').forEach(el=>el.classList.remove('active'));
    const el=document.getElementById(`champ-stage-${s}`);
    el.classList.remove('hidden'); el.classList.add('active');
    if(s===2){
      document.getElementById('champ-runner-up-name').textContent=runnerUp.name;
      document.getElementById('champ-runner-up-pts').textContent=`${runnerUp.points} points`;
    }
    if(s===4){
      const wn=document.getElementById('champ-winner-name');
      wn.textContent=winner.name; wn.style.color=winner.color||'var(--gold)';
      spawnConfetti('champ-confetti',80,[winner.color||'var(--gold)','var(--ipl2)','#fff','var(--green)']);
    }
    if(s===5){
      renderChampFinalStandings(finalStandings);
      setTimeout(()=>document.getElementById('btn-champ-dismiss').style.display='inline-flex',500);
    }
  },delays[i]));
}
function renderChampFinalStandings(standings){
  document.getElementById('champ-final-standings').innerHTML=
    (standings||[]).slice(0,4).map((t,i)=>`
      <div class="champ-final-row" style="animation-delay:${i*0.1}s">
        <span style="font-family:var(--fm);color:var(--text3);width:16px">${i+1}</span>
        <span class="sr-pip" style="background:${t.color}"></span>
        <span style="flex:1;font-weight:600">${escHtml(t.name)}</span>
        <span style="font-family:var(--fm);color:var(--ipl2)">${t.points}pts</span>
      </div>`).join('');
}
function dismissChampion(){
  document.getElementById('overlay-champion').classList.add('hidden');
  showAwardsCeremony();
}

/* ── AWARDS CEREMONY ─────────────────────────────────── */
let _awardIdx=0;
const AWARDS=[
  {icon:'🟠',name:'Orange Cap — Most Runs',   fn:()=>{const o=getOrangeCap();return o?{name:o.name,stat:`${o.runs} runs`}:null;}},
  {icon:'🟣',name:'Purple Cap — Most Wickets', fn:()=>{const p=getPurpleCap();return p?{name:p.name,stat:`${p.wickets} wickets`}:null;}},
  {icon:'💥',name:'Most Sixes',               fn:()=>{const p=getMostSixes();return p?{name:p.name,stat:`${p.sixes} sixes`}:null;}},
  {icon:'🎯',name:'Best Economy',             fn:()=>{const p=getBestEconomy();return p?{name:p.name,stat:`${p.eco} economy`}:null;}},
  {icon:'⭐',name:'Man of Tournament',        fn:()=>{const p=getMoT();return p?{name:p.name,stat:`${p.awards} MoM awards`}:null;}},
  {icon:'🏆',name:'Season Champion',          fn:()=>{const s=getSortedStandings();return s.length?{name:s[0].name,stat:`${s[0].points} points`}:null;}},
];
function showAwardsCeremony(){
  _awardIdx=0;
  document.getElementById('overlay-awards').classList.remove('hidden');
  showAwardStep(); renderAwardProgress();
}
function nextAward(){
  _awardIdx++;
  if(_awardIdx>=AWARDS.length){
    document.getElementById('btn-next-award').classList.add('hidden');
    document.getElementById('btn-close-awards').classList.remove('hidden');
    return;
  }
  showAwardStep(); renderAwardProgress();
}
function showAwardStep(){
  const a=AWARDS[_awardIdx], r=a.fn();
  document.getElementById('award-icon-display').textContent=a.icon;
  document.getElementById('award-name-display').textContent=a.name;
  document.getElementById('award-winner-display').textContent=r?r.name:'—';
  document.getElementById('award-stat-display').textContent  =r?r.stat:'';
  spawnConfetti('award-confetti',20,['var(--gold)','var(--ipl2)','#fff']);
}
function renderAwardProgress(){
  document.getElementById('awards-progress').innerHTML=AWARDS.map((_,i)=>
    `<div class="award-progress-dot ${i<_awardIdx?'done':i===_awardIdx?'active':''}"></div>`).join('');
}
function closeAwards(){ document.getElementById('overlay-awards').classList.add('hidden'); }

/* ── CONFETTI + CRISIS CROSSES ───────────────────────── */
function spawnConfetti(containerId,count,colors){
  const el=document.getElementById(containerId); if(!el) return;
  el.innerHTML='';
  for(let i=0;i<count;i++){
    const d=document.createElement('div');
    d.className='confetti-piece';
    d.style.setProperty('--x',  `${(Math.random()-.5)*200}px`);
    d.style.setProperty('--dx', `${(Math.random()-.5)*120}px`);
    d.style.setProperty('--rot',`${Math.random()*720}deg`);
    d.style.setProperty('--dur',`${1.2+Math.random()*.8}s`);
    d.style.setProperty('--delay',`${Math.random()*.4}s`);
    d.style.background=colors[Math.floor(Math.random()*colors.length)];
    d.style.left=`${10+Math.random()*80}%`; d.style.top='10%';
    el.appendChild(d);
  }
}
function spawnCrosses(containerId,count){
  const el=document.getElementById(containerId); if(!el) return;
  el.innerHTML='';
  for(let i=0;i<count;i++){
    const d=document.createElement('div');
    d.className='crisis-cross-piece'; d.textContent='✕';
    d.style.setProperty('--rot',  `${Math.random()*30-15}deg`);
    d.style.setProperty('--dur',  `${2+Math.random()}s`);
    d.style.setProperty('--delay',`${Math.random()*1.5}s`);
    d.style.left=`${Math.random()*100}%`;
    el.appendChild(d);
  }
}

/* ── HELPERS ─────────────────────────────────────────── */
function getTeam(id)  { return STATE.teams.find(t=>t.id===id)||null; }
function getPlayer(id){ return STATE.players.find(p=>p.id===id)||null; }
function getVenue(id) { return STATE.venues.find(v=>v.id===id)||null; }
function getSortedStandings(){
  return [...STATE.teams].sort((a,b)=>b.points!==a.points?b.points-a.points:(b.nrr||0)-(a.nrr||0));
}
function getOrangeCap(){
  let best=null,max=-1;
  STATE.players.forEach(p=>{const s=STATE.stats.batting[p.id];if(s&&s.runs>max){max=s.runs;best={...p,runs:s.runs};}});
  return best;
}
function getPurpleCap(){
  let best=null,max=-1;
  STATE.players.forEach(p=>{const s=STATE.stats.bowling[p.id];if(s&&s.wickets>max){max=s.wickets;best={...p,wickets:s.wickets};}});
  return best;
}
function getMostSixes(){
  let best=null,max=-1;
  STATE.players.forEach(p=>{const s=STATE.stats.batting[p.id];if(s&&s.sixes>max){max=s.sixes;best={...p,sixes:s.sixes};}});
  return best;
}
function getBestEconomy(){
  let best=null,min=99;
  STATE.players.forEach(p=>{
    const s=STATE.stats.bowling[p.id];
    if(s&&s.overs>=10){const e=s.runs/s.overs;if(e<min){min=e;best={...p,eco:e.toFixed(2)};}}
  });
  return best;
}
function getMoT(){
  let best=null,max=-1;
  STATE.players.forEach(p=>{const a=STATE.stats.momAwards[p.id]||0;if(a>max){max=a;best={...p,awards:a};}});
  return best;
}
function randomCode(len){
  const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:len},()=>ch[Math.floor(Math.random()*ch.length)]).join('');
}
function escHtml(str){
  if(typeof str!=='string') str=String(str||'');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function showToast(msg,type='info',dur=3500){
  const c=document.getElementById('toast-container');
  const t=document.createElement('div');
  const icons={success:'✓',error:'✕',warn:'⚠',info:'ℹ'};
  t.className=`toast toast-${type}`;
  t.innerHTML=`<span>${icons[type]||'ℹ'}</span><span>${escHtml(msg)}</span>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('toast-out');t.addEventListener('animationend',()=>t.remove());},dur);
}

/* ── BOOT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const fromURL=tryLoadFromURL();
  if(!fromURL) loadState();
  if(!STATE.venues.length) STATE.venues=DEFAULT_VENUES.map(v=>({...v}));
  populateDelegateTeamSelect();
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      closeModal();
      document.querySelectorAll('.overlay:not(.hidden)').forEach(o=>{
        if(o.id!=='overlay-champion'&&o.id!=='overlay-awards') o.classList.add('hidden');
      });
    }
  });
  console.log('%c IPL MUN v3.0 loaded ','background:#ff6b1a;color:#fff;font-family:monospace;font-weight:bold;padding:4px 10px;border-radius:4px;font-size:13px');
});