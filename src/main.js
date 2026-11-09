const EVENTS = await fetch('/src/data/events.json').then(r=>{if(!r.ok)throw Error('이벤트 데이터를 불러오지 못했습니다.');return r.json();});
import {
  VERSION,TIERS,STATS,POSITIONS,TEAMS,STAGES,TRAININGS,WEEKS_PER_SEASON,rankProgress,migrateGame,migrateHallEntry,
  createGame,startTraining,chooseEvent,continueFromResult,chooseGate,
  acceptOffer,rejectOffer,stageInfo,positionInfo,teamInfo,tierInfo,
  seasonName,scorePower,averageStats,marketValue,meetsRequirements,
  isTrainingUnlocked,formatMoney,hallEntry
} from './engine.js';

const APP_KEY='faker_growth_v1';
const HALL_KEY='faker_growth_hall_v1';
const app=document.querySelector('#app');
// 로컬 에셋(선택 설치) → 원격 원본 → 텍스트 순서로 복구합니다.
window.brandFallback=function(image){
 if(image.dataset.attemptedRemote!=='1'){
   image.dataset.attemptedRemote='1';image.src=image.dataset.remote;return;
 }
 image.hidden=true;
 if(image.nextElementSibling)image.nextElementSibling.style.display='grid';
};
const storage={
  get(k,fall=null){try{const s=localStorage.getItem(k);return s?JSON.parse(s):fall;}catch{return fall;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{showToast('브라우저 저장 공간을 확인해 주세요.');}},
};
let game=migrateGame(storage.get(APP_KEY));
if(game && game.version!==VERSION)game=null;
let hall=storage.get(HALL_KEY,[]);
if(!Array.isArray(hall))hall=[];
hall=hall.map(migrateHallEntry);
if(game)storage.set(APP_KEY,game);
storage.set(HALL_KEY,hall);
let page='title';
let createPosition='mid';
let createName='';
let toastTimer=null;
let notice='';

const h=val=>String(val??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=name=>`/assets/${name}`;
const seasonLabel=g=>`${Math.ceil(g.career.season/2)}년차 ${seasonName(g.career.season)}`;
const teamLogo=(id,small=false)=>{const t=teamInfo(id);return `<span class="team-logo ${small?'mini':''}" style="--team:${t.color}" title="${h(t.name)}"><img src="/assets/branding/team-${t.id}.${['t1','geng','hle','dk'].includes(t.id)?'svg':'png'}" data-remote="${h(t.logo)}" alt="${h(t.name)} 팀 로고" loading="lazy" onerror="brandFallback(this)"/><span class="team-logo-fallback" aria-hidden="true">${h(t.short)}</span></span>`};
const classForTier=n=>`tier-${TIERS[n]?.id||'iron'}`;
const rangecolor=(n)=>n<28?'#f16a79':n<50?'#f3b75b':'#52e1c2';
const valueText=n=>Number.isInteger(n)?n:n.toFixed(1);
function bar(label,icon,val,color,extra=''){
  return `<div class="stat-row"><span class="stat-label"><span class="stat-icon">${icon}</span>${h(label)}</span><div class="meter"><div class="meter-fill" style="width:${Math.max(0,Math.min(100,val))}%;background:${color}"></div></div><b class="metric">${valueText(val)}${extra}</b></div>`;
}
function numDelta(n){return n>0?`<span class="delta pos">+${valueText(n)}</span>`:n<0?`<span class="delta neg">${valueText(n)}</span>`:`<span class="delta neutral">—</span>`}
function rankCrest(index,size=''){
 const tier=tierInfo(index);
 return `<span class="rank-crest ${classForTier(index)} ${size}" title="${tier.name}"><img src="/assets/branding/rank-${tier.id}.png" data-remote="${tier.logo}" alt="${tier.name} 랭크 엠블럼" loading="lazy" onerror="brandFallback(this)"/><span class="rank-crest-fallback" aria-hidden="true">${tier.symbol}</span></span>`;
}
function labelHeading(icon,text,right='') {return `<div class="section-heading"><span class="heading-title"><span class="section-icon">${icon}</span>${text}</span>${right?`<span class="heading-aside">${right}</span>`:''}</div>`;}
function section(content,klass='') {return `<section class="panel ${klass}">${content}</section>`;}
function stageSteps(g){let idx=STAGES.findIndex(x=>x.id===g.player.stage);return `<div class="stage-track">${STAGES.map((s,i)=>`<div class="stage-dot ${i<idx?'done':i===idx?'active':''}"><span>${i<idx?'✓':i+1}</span><small>${s.name}</small></div>`).join('')}</div>`;}
function save(){storage.set(APP_KEY,game);storage.set(HALL_KEY,hall)}
function archiveEnding(){
  if(game?.scene==='ending' && game.ending && !game.ending.archivedId){
    const entry=hallEntry(game);game.ending.archivedId=entry.id;
    hall=[entry,...hall].slice(0,50);save();
  }
}
function changeGame(fn){try{game=fn(game);archiveEnding();save();page='game';render();window.scrollTo({top:0,behavior:'instant'});}catch(e){console.error(e);showToast(e.message||'처리 중 문제가 생겼습니다.')}}
function showToast(message){
  notice=message;
  const old=document.querySelector('.toast');if(old)old.remove();
  const div=document.createElement('div');div.className='toast';div.textContent=message;document.body.append(div);
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{div.remove();notice=''},3200);
}
function shell(content,screen=''){
 return `<div class="ambient"><div class="glow-red"></div><div class="glow-blue"></div></div>
 <div class="game-shell ${screen}">
  <header class="site-header">
   <button data-action="home" class="logo-button" title="타이틀 화면으로" aria-label="타이틀 화면으로"><span class="brand-mark">◢</span><span class="brand">페이커 <em>키우기</em></span></button>
   <div class="header-side"><span class="saving"><i></i> 자동 저장</span><button data-action="help" class="icon-button" aria-label="게임 안내" title="게임 안내">?</button></div>
  </header>
  <main>${content}</main>
  <footer class="footer"><span>FAKER GROWTH SIM · FAN MADE PIXEL GAME</span><span>v2.0</span></footer>
 </div>`;
}
function titleScreen(){
 return `<div class="title-screen">
  <div class="title-art" style="background-image:linear-gradient(180deg,transparent 25%,rgba(8,15,34,.06) 55%,#071025 100%),url('${img('title-stage.webp')}')">
    <div class="title-kicker">PIXEL ESPORTS · CAREER SIMULATION</div>
    <h1>페이커 <span>키우기</span></h1>
    <p class="title-subtitle">연습생에서 전설이 되기까지, 당신의 선택이 역사를 만든다.</p>
  </div>
  <div class="title-actions">
    <button class="btn primary massive" data-action="new-game"><span>⚔</span> 새 게임 시작 <b>➜</b></button>
    <div class="button-pair"><button class="btn dark" data-action="continue-game" ${!game?'disabled':''}><span>▣</span> 이어하기</button><button class="btn dark" data-action="hall"><span>♛</span> 명예의 전당</button></div>
  </div>
  ${section(`${labelHeading('✦','당신의 커리어, 당신의 선택')}<p class="soft">17세 마스터 0LP에서 시작해 4주 시즌 동안 성장하세요. 연습생 → 2군 → 1군으로 승격하며 이적 시장과 은퇴까지 도전합니다.</p>${`<div class="mini-flow"><span>학생</span><b>›</b><span>연습생</span><b>›</b><span>2군</span><b>›</b><span>1군</span><b>›</b><span>은퇴</span></div>`}`,'intro-panel')}
  ${section(`${labelHeading('⚑','LCK 팀들','실제 구단 로고 · 가상 계약')}<div class="team-row">${TEAMS.slice(0,5).map(t=>`<div class="team-pill">${teamLogo(t.id,true)}<small>${h(t.name)}</small></div>`).join('')}</div>`,'team-showcase')}
  <p class="fine-print">본 작품은 비공식 팬메이드 프로토타입이며, 실제 선수와 구단의 보증·제휴를 의미하지 않습니다. 게임 수치는 모두 가상의 시뮬레이션입니다.</p>
 </div>`;
}
function createScreen(){
 const pos=positionInfo(createPosition);
 const bonus=Object.keys(pos.weights).sort((a,b)=>pos.weights[b]-pos.weights[a]).slice(0,2);
 return `<div class="page-body">
   <div class="wide-banner" style="background-image:linear-gradient(0deg,rgba(6,12,30,.8),transparent 80%),url('${img('arena.webp')}')"><div class="banner-overlay"><span class="eyebrow">NEW CAREER</span><h2>선수 생성</h2><p>전설의 첫 번째 페이지를 시작하세요.</p></div></div>
   ${section(`${labelHeading('✎','선수 닉네임')}<label class="sr-only" for="nickname">닉네임</label><input id="nickname" class="nickname-input" maxlength="16" placeholder="선수 닉네임 (최대 16자)" value="${h(createName)}" /><p class="hint">이름과 포지션은 게임 시작 후 변경할 수 없습니다.</p>`)}
   ${section(`${labelHeading('◇','포지션 선택','가로로 넘겨서 선택')}<div class="role-strip">${POSITIONS.map(p=>`<button class="role-card ${p.id===createPosition?'selected':''}" data-action="choose-position" data-id="${p.id}"><div class="role-symbol">${p.icon} ${p.name}</div><img src="${img(p.asset)}" alt="${h(p.pro)}를 참고한 픽셀 캐릭터" /><div class="role-name">${h(p.pro)}</div></button>`).join('')}</div>`)}
   ${section(`${labelHeading('✦',`${pos.name} (${pos.id.toUpperCase()})`,`선택된 포지션`)}<div class="selected-role"><img src="${img(pos.asset)}" alt="선택한 포지션 대표 캐릭터"/><div><b>${pos.icon} ${pos.name}</b><p>${h(pos.desc)}</p><div class="chip">초기 핵심 능력치 +5 × 2</div></div></div><div class="stat-list">${STATS.map(s=>bar(s.name,s.icon,bonus.includes(s.key)?15:10,bonus.includes(s.key)?'#ff5a78':'#92a2d4')).join('')}</div>`)}
   <div class="action-bar"><button class="btn dark" data-action="home">← 돌아가기</button><button class="btn primary" data-action="start-game">시작하기 ➜</button></div>
  </div>`;
}
function renderStatus(g){return section(`${labelHeading('♥','컨디션 / 성장 자원')}<div class="status-grid">${bar('체력','♥',g.status.stamina,rangecolor(g.status.stamina),' / 100')}${bar('컨디션','ϟ',g.status.condition,'#ffd16a',' / 100')}${bar('팀워크','♟',g.status.teamwork,'#83bafc',' / 100')}${bar('인기','♨',g.status.popularity,'#e6a0ee',' / 100')}</div>`,'status-panel');}
function renderMain(){
 const g=game,te=tierInfo(g.rank.tier),team=g.career.team?teamInfo(g.career.team):null,progress=rankProgress(g.rank.lp);
 return `<div class="page-body">
   <div class="status-strip"><div><small>나이</small><strong>${g.player.age}세</strong></div><div><small>시즌</small><strong>${seasonLabel(g)}</strong></div><div><small>진행</small><strong>${g.career.week} / ${WEEKS_PER_SEASON}주</strong></div><div><small>소속</small><strong>${team?h(team.short):stageInfo(g.player.stage).name}</strong></div></div>
   <div class="wide-banner main-banner" style="background-image:linear-gradient(90deg,rgba(6,11,29,.2),rgba(6,11,29,.06)),url('${img('arena.webp')}')"><div class="banner-bottom"><span class="chip">${stageInfo(g.player.stage).name}</span><b>${team?h(team.name):'프로의 무대를 향해'}</b></div></div>
   ${g.career.gateMessage?`<div class="notice"><span>✦</span>${h(g.career.gateMessage)}<button class="text-icon" data-action="dismiss-notice" aria-label="알림 닫기">×</button></div>`:''}
   <div class="profile-layout">
      ${section(`<div class="portrait-frame"><img src="${img(positionInfo(g.player.position).asset)}" alt="${positionInfo(g.player.position).name} 선수 프로필"/></div><div class="profile-name"><span>${h(g.player.name)}</span><small>${positionInfo(g.player.position).name} · ${stageInfo(g.player.stage).name}</small></div>`,'profile-panel')}
      ${section(`${labelHeading('▥','기본 능력치')}<div class="stat-list">${STATS.map(s=>bar(s.name,s.icon,g.stats[s.key],s.key==='lane'?'#fa6483':'#9ab0e3')).join('')}</div><div class="power-total">종합 전투력 <strong>${scorePower(g).toFixed(1)}</strong></div>`,'stats-panel')}
   </div>
   <div class="rank-layout">
     ${section(`${labelHeading('♛','솔로랭크')}<div class="rank-main">${rankCrest(g.rank.tier,'large')}<div><strong style="color:${te.color}">${te.name}</strong><span>${Math.round(g.rank.lp)} LP ${progress.high===null?'· 최고 티어':`/ 승급 ${progress.high} LP`}</span></div></div><div class="meter rank-meter"><div class="meter-fill" style="width:${progress.percent}%;background:${te.color}"></div></div>`,'rank-panel')}
     ${section(`${labelHeading('⚑','커리어 단계')}${stageSteps(g)}<div class="small-kpis"><span>시장가치 <b>${Math.round(g.career.marketValue)}</b></span><span>계약 <b>${g.career.contractRemaining?`${g.career.contractRemaining}시즌`:'없음'}</b></span></div>`,'career-panel')}
   </div>
   ${g.career.recoveryTurns>0?`<div class="recovery-warning" role="status">⚠ ${h(g.career.recoveryReason||'회복이 필요합니다.')} · 다음 주 휴식만 선택 가능</div>`:''}
  ${renderStatus(g)}
   ${section(`${labelHeading('✦','랭크 티어 진행도')}<div class="tiers-strip">${TIERS.map((t,i)=>`<div class="tier-step ${i===g.rank.tier?'current':''}"><div class="tiny-rank" style="--tier:${t.color}">${rankCrest(i,'small')}</div><small>${t.name}</small></div>`).join('')}</div>`,'tiers-panel')}
   ${section(`${labelHeading('⚔','훈련 / 성장 활동','매주 한 가지를 선택')}<div class="training-grid">${TRAININGS.map(t=>{
      const mustRest=g.career.recoveryTurns>0||g.status.stamina<=0||g.status.condition<=0;
      const locked=!isTrainingUnlocked(g,t.id);
      return `<button class="training-card ${t.className} ${locked?'locked':''}" data-action="train" data-id="${t.id}" ${locked?'disabled':''}><span class="training-icon">${t.icon}</span><span class="training-copy"><b>${t.name}</b><small>${locked?(mustRest?'체력·컨디션 고갈 → 강제 휴식':g.career.injuryTurns?'부상 중 사용 불가':'연습생 입단 후 해금'):mustRest&&t.id==='rest'?'필수 회복 · 체력 +40 / 컨디션 +30':t.desc}</small></span><span class="training-arrow">${locked?'▣':'➜'}</span></button>`;}).join('')}</div><p class="help-line">체력·컨디션이 0이면 경기에 불참하고 다음 주는 강제 휴식합니다. 체력 0은 부상도 동반합니다.</p>`,'training-panel')}
   <div class="turn-footer"><span>✦ ${seasonLabel(g)} · ${g.career.week}주차</span><span>진행률 ${Math.round(g.career.week/WEEKS_PER_SEASON*100)}%</span></div>
 </div>`;
}
function eventScreen(){
 const g=game,e=EVENTS.find(x=>x.id===g.pendingEvent);
 if(!e)return `<div class="page-body">${section(`<p>이벤트 데이터를 불러올 수 없습니다.</p><button data-action="home" class="btn dark">타이틀</button>`)}</div>`;
 const sceneAsset= ['slump','injury','health','mental'].includes(e.type)?'event-slump.webp':
  ['rival','tournament','final','scout'].includes(e.type)?'team-arena.webp':
  ['meta','analysis'].includes(e.type)?'arena.webp':'office.webp';
 return `<div class="page-body">
   <div class="event-header"><span>✷ RANDOM EVENT</span><span>${seasonLabel(g)} · ${g.career.week}주차</span></div>
   <div class="event-art" style="background-image:linear-gradient(180deg,transparent 40%,#0c152c 100%),url('${img(sceneAsset)}')"><span class="event-badge">${h(e.type.toUpperCase())}</span></div>
   ${section(`<div class="big-event-title">${h(e.title)}</div><p class="event-story">${h(e.text)}</p><div class="separator"></div><div class="choose-title">지금 어떤 선택을 할 것인가?</div>`,'story-panel')}
   <div class="choices">${e.choices.map((c,i)=>{
      const locked=!meetsRequirements(g,c.requires);
      return `<button data-action="event-choice" data-index="${i}" class="choice-card ${locked?'choice-locked':i===0?'choice-featured':''}" ${locked?'disabled':''}><span class="choice-num">0${i+1}</span><span class="choice-text"><b>${h(c.label)}</b><small>${h(c.desc||'')}</small><span class="effects-preview">${Object.entries(c.effects||{}).map(([key,val])=>`<span class="effect-pill ${val>=0?'up':'down'}">${h(effectName(key))} ${val>0?'+':''}${val}</span>`).join('')}</span></span><span class="choice-arrow">${locked?'🔒':'➜'}</span></button>`;
   }).join('')}</div>
 </div>`;
}
function effectName(key){return ({lane:'라인전',fight:'한타',map:'맵 리딩',mental:'멘탈',champ:'챔프폭',stamina:'체력',condition:'컨디션',teamwork:'팀워크',popularity:'인기'})[key]||key;}
function gateScreen(){
 const g=game,gate=g.pendingGate;if(!gate)return `<p>승격 데이터가 없습니다.</p>`;
 const target=stageInfo(gate.toStage),current=stageInfo(gate.fromStage);
 return `<div class="page-body">
   <div class="wide-banner" style="background-image:linear-gradient(180deg,transparent,#061024),url('${img('team-arena.webp')}')"><div class="banner-overlay"><span class="eyebrow">CAREER BREAKTHROUGH</span><h2>승격 테스트</h2><p>드디어 새로운 무대의 문이 열렸습니다.</p></div></div>
   ${section(`<div class="gate-promo"><span>${current.name}</span><b>➜</b><span>${target.name}</span></div><p class="soft center">${current.name}에서 ${target.name}(으)로 올라갈 절호의 기회!<br/>티어와 능력치는 조건을 충족했습니다. 마지막 테스트에서 실력을 증명하세요.</p><div class="gate-kpis"><span>현재 티어 <b>${tierInfo(g.rank.tier).name}</b></span><span>기본 능력치 평균 <b>${averageStats(g).toFixed(1)}</b></span><span>팀워크 <b>${Math.round(g.status.teamwork)}</b></span></div>`)}
   <div class="choices"><button class="choice-card choice-featured" data-action="gate" data-choice="focus"><span class="choice-num">01</span><span class="choice-text"><b>준비한 실력으로 테스트에 도전</b><small>체력 -10 / 컨디션 -6 · 테스트 진행</small></span><span>➜</span></button>
   <button class="choice-card" data-action="gate" data-choice="teamwork" ${g.status.teamwork<20?'disabled':''}><span class="choice-num">02</span><span class="choice-text"><b>팀워크를 보여준다</b><small>${g.status.teamwork<20?'🔒 팀워크 20 이상 필요':'테스트 합격 확률 상승'}</small></span><span>➜</span></button>
   <button class="choice-card muted" data-action="gate" data-choice="skip"><span class="choice-num">03</span><span class="choice-text"><b>이번 도전은 미룬다</b><small>현재 커리어 단계 유지 · 다음 시즌 재도전</small></span><span>➜</span></button></div>
 </div>`;
}
function resultScreen(){
 const g=game,r=g.lastResult,t=TRAININGS.find(t=>t.id===r?.trainingId);if(!r)return `<p>결과가 없습니다.</p>`;
 const league=r.league,rank=r.rank;
 return `<div class="page-body">
   <div class="wide-banner" style="background-image:linear-gradient(180deg,rgba(6,13,31,.1),#09142c),url('${img('team-arena.webp')}')"><div class="banner-overlay"><span class="eyebrow">WEEKLY REPORT</span><h2>경기 결과</h2><p>${seasonLabel(g)} · ${r.week}주차</p></div></div>
   ${section(`${labelHeading('✦','이번 주 활동')}<div class="weekly-activity"><span class="activity-symbol">${t?.icon||'✧'}</span><div><b>${t?.name||'훈련'}</b><small>${h(r.eventName?`발생 이벤트: ${r.eventName}`:'꾸준한 도전이 성장을 만듭니다.')}</small></div></div><p class="soft">${h(r.highlight)}</p><div class="gain-list">${[...Object.entries(r.gains.stats),...Object.entries(r.gains.status)].filter(([,v])=>v!==0).map(([key,val])=>`<span class="gain-chip">${effectName(key)} ${numDelta(val)}</span>`).join('')||'<span class="soft">능력치 변화 없음</span>'}</div>`)}
   ${r.missedMatch?section(`${labelHeading('⚠','경기 불참 · 회복 중')}<p class="warning-note">${h(r.recoveryNote||'체력 또는 컨디션 부족으로 이번 주 경기를 진행하지 못했습니다.')}</p><p class="soft">이번 주 솔로랭크와 팀 경기 결과가 기록되지 않습니다.</p>`,'result-panel'):''}
   ${rank?section(`${labelHeading('⚔','솔로랭크 결과')}<div class="rank-result-score"><div><small>10게임</small><strong><span class="win">${rank.wins}승</span> <span class="lose">${rank.losses}패</span></strong></div><div><small>획득 LP</small><strong class="${rank.lpDelta>=0?'win':'lose'}">${rank.lpDelta>0?'+':''}${Math.round(rank.lpDelta)}</strong></div></div><div class="rank-transition">${rankCrest(rank.beforeTier)}<span class="rank-arrow">➜</span>${rankCrest(rank.afterTier)}</div><div class="rank-names"><span>${tierInfo(rank.beforeTier).name}</span><b>${tierInfo(rank.afterTier).name} <small>총 ${Math.round(rank.afterLp)} LP</small></b></div>${rank.promotion?'<div class="positive-note">✦ 티어 승급! 새로운 단계에 도착했습니다.</div>':''}${rank.demotion?'<div class="warning-note">티어가 하락했습니다. 다음 주 다시 도전하세요.</div>':''}`,'result-panel'):
       section(`${labelHeading('▣','개인 훈련 결과')}<p class="soft">이번 주는 솔로랭크를 진행하지 않았습니다. 쌓인 능력치는 다음 경기에서 힘이 됩니다.</p>`)}
   ${league?section(`${labelHeading('♛','팀 리그 경기')}<div class="league-score"><div>${teamLogo(g.career.team)}<b>${h(teamInfo(g.career.team).name)}</b></div><div class="versus"><small>${stageInfo(g.player.stage).name} 리그</small><strong>${league.score}</strong><span class="${league.victory?'win':'lose'}">${league.victory?'VICTORY':'DEFEAT'}</span></div><div>${teamLogo(league.enemyId)}<b>${h(teamInfo(league.enemyId).name)}</b></div></div>${league.mvp?'<div class="positive-note">🏆 경기 MVP! 인기가 상승했습니다.</div>':''}<p class="result-log">${h(r.highlight)}</p>`,'league-panel'):
      section(`${labelHeading('♜','커리어 현황')}<p class="soft">학생 단계에서는 팀 리그 경기가 없습니다. 티어를 올리고 승격 테스트를 통과하면 프로 무대가 열립니다.</p>`)}
   <button class="btn primary full next-button" data-action="next-week">${r.week===WEEKS_PER_SEASON?'시즌 결산으로 →':'다음 주로 진행 →'}</button>
 </div>`;
}
function marketScreen(){
 const g=game,target=stageInfo(g.marketTarget);
 return `<div class="page-body">
  <div class="wide-banner" style="background-image:linear-gradient(180deg,transparent,#09142a),url('${img('office.webp')}')"><div class="banner-overlay"><span class="eyebrow">TRANSFER MARKET</span><h2>이적 시장</h2><p>${target.name} 무대에서 새로운 계약을 체결하세요.</p></div></div>
  ${g.career.gateMessage?`<div class="notice"><span>✦</span>${h(g.career.gateMessage)}</div>`:''}
  ${section(`${labelHeading('▥','선수 시장 정보')}<div class="market-metrics"><div><small>시장가치 지수</small><b>${Math.round(g.career.marketValue)}<em>/ 100</em></b></div><div><small>인기</small><b>${Math.round(g.status.popularity)}<em>/ 100</em></b></div><div><small>최근 경기 승률</small><b>${g.career.matchWins+g.career.matchLosses?Math.round(g.career.matchWins/(g.career.matchWins+g.career.matchLosses)*100):0}<em>%</em></b></div></div><p class="hint">표시된 연봉은 게임 밸런스를 위한 가상 금액입니다. 구단의 실제 계약 제안이 아닙니다.</p>`)}
  ${section(`${labelHeading('⚑','도착한 영입 제안',`${g.offers.length}건`)}<div class="offers">${g.offers.map((o,i)=>{
    const team=teamInfo(o.teamId);
    return `<article class="offer ${i===0?'offer-featured':''}"><div class="offer-top">${teamLogo(o.teamId)}<div><b>${h(team.name)}</b><small>${target.name} · ${h(o.flavor)}</small></div>${i===0?'<span class="offer-tag">NEW</span>':''}</div><div class="offer-info"><div><small>계약 기간</small><b>${o.seasons}시즌</b></div><div><small>시즌당 연봉</small><b>${formatMoney(o.salary)}</b></div></div><div class="offer-buttons"><button class="btn green" data-action="accept-offer" data-id="${h(o.id)}">✓ 계약 수락</button><button class="btn outline-danger" data-action="reject-offer" data-id="${h(o.id)}">× 거절</button></div></article>`;
  }).join('')}</div>`)}
  <p class="help-line">제안을 모두 거절하면 남은 계약이 없어 은퇴 처리됩니다. 신중하게 선택하세요.</p>
 </div>`;
}
function endingScreen(){
 const g=game,e=g.ending;
 if(!e)return '<p>엔딩 데이터가 없습니다.</p>';
 return `<div class="page-body ending-page">
   <div class="wide-banner ending-banner" style="background-image:linear-gradient(180deg,transparent,#09142a),url('${img('retirement-stage.webp')}')"><div class="banner-overlay"><span class="eyebrow">THE LAST LEGEND</span><h2>은퇴 결산</h2><p>한 선수의 여정이 끝났습니다.</p></div></div>
   ${section(`<div class="ending-hero"><img src="${img('retirement-player.webp')}" alt="은퇴 선수 픽셀 아트"/><div><span class="eyebrow">CAREER SUMMARY</span><h3>${h(g.player.name)}</h3><p>${positionInfo(g.player.position).name} · 은퇴 나이 ${g.player.age}세</p><div class="grade ${e.grade==='GOAT'?'gold-glow':''}">${h(e.grade)}</div><div class="career-score">커리어 점수 <b>${e.score.toLocaleString('ko-KR')}</b></div></div></div><p class="ending-reason">${h(e.reason)}</p>`,'ending-info')}
   ${section(`${labelHeading('♛','커리어 기록')}<div class="ending-stats"><div><small>최고 티어</small><strong>${rankCrest(g.rank.highest,'small')} ${tierInfo(g.rank.highest).name}</strong></div><div><small>리그 우승</small><strong>${g.career.championships}회</strong></div><div><small>팀 경기 승수</small><strong>${g.career.matchWins}승</strong></div><div><small>통산 연봉</small><strong>${formatMoney(g.career.totalSalary)}</strong></div><div><small>활동 기간</small><strong>${Math.ceil(g.career.totalTurns/(WEEKS_PER_SEASON*2))}년</strong></div><div><small>은퇴 후 진로</small><strong>${e.path}</strong></div></div>`)}
   ${section(`${labelHeading('⚑','소속 팀 이력')}<div class="career-journey">${g.career.teamHistory.length?g.career.teamHistory.map(item=>`<div class="journey-item">${teamLogo(item.teamId,true)}<b>${h(teamInfo(item.teamId).name)}</b><small>${stageInfo(item.stage).name} · ${item.season}시즌 합류</small></div>`).join(''):'<p class="soft">끝내 소속 팀을 찾지 못한 커리어.</p>'}</div>`)}
   <div class="quote">“${h(e.oneLiner)}”</div>
   <div class="hof-done">♛ 명예의 전당 기록 완료</div>
   <div class="action-bar"><button class="btn dark" data-action="hall">명예의 전당</button><button class="btn primary" data-action="new-game">새로운 커리어 ➜</button></div>
 </div>`;
}
function hallScreen(){
 const sorted=[...hall].sort((a,b)=>b.score-a.score);
 return `<div class="page-body">
  <div class="wide-banner" style="background-image:linear-gradient(180deg,transparent,#071022),url('${img('retirement-stage.webp')}')"><div class="banner-overlay"><span class="eyebrow">HALL OF FAME</span><h2>명예의 전당</h2><p>은퇴 선수들의 기록을 영원히 남깁니다.</p></div></div>
  ${section(`${labelHeading('♛','역대 커리어 TOP 50',`${sorted.length}명 등록`)}${sorted.length?`<div class="hall-list">${sorted.map((entry,i)=>`<div class="hall-entry"><span class="hall-rank">#${i+1}</span><div class="hall-details"><b>${h(entry.name)}</b><small>${positionInfo(entry.position).name} · ${entry.age}세 은퇴 · ${tierInfo(entry.highest).name}</small></div><div class="hall-grade"><strong>${h(entry.grade)}</strong><small>${Number(entry.score||0).toLocaleString('ko-KR')}점</small></div></div>`).join('')}</div>`:`<div class="empty-hall"><div>♛</div><b>아직 기록된 전설이 없습니다.</b><p>한 선수의 커리어를 마치면 이곳에 기록됩니다.</p></div>`}`,'hall-panel')}
  <div class="action-bar"><button class="btn dark" data-action="home">← 타이틀</button><button class="btn dark" data-action="export-saves">기록 내보내기</button><button class="btn dark" data-action="import-saves">기록 가져오기</button></div>
  <input id="import-input" type="file" accept="application/json,.json" hidden />
  <p class="fine-print">명예의 전당과 현재 게임은 이 브라우저의 localStorage에 저장됩니다. 브라우저 데이터 삭제 전 기록을 내보내세요.</p>
 </div>`;
}
function helpDialog(){return `<div class="dialog-backdrop" id="info-modal"><div class="dialog" role="dialog" aria-modal="true" aria-label="게임 안내"><div class="dialog-head"><h3>게임 방법</h3><button class="icon-button" data-action="close-help">×</button></div><div class="dialog-content"><p><b>목표</b> · 17세 학생으로 시작해 연습생 → 2군 → 1군을 거쳐 오랫동안 살아남으세요. 시장가치가 떨어져 다음 팀의 제안이 0건이면 은퇴합니다.</p><p><b>한 시즌</b> · 4주 / 매주 훈련 한 번 선택. 훈련 → 랜덤 이벤트 → 경기 결과로 진행합니다.</p><p><b>솔로랭크</b> · 훈련을 선택할 때마다 10게임이 처리됩니다. 승리 +18~22LP / 패배 -15~19LP. 마스터 0LP / 그랜드마스터 400LP / 챌린저 800LP 기준의 단독 게임용 간소화 규칙입니다.</p><p><b>회복</b> · 체력 30 미만이면 컨디션이 추가 감소합니다. 둘 중 하나가 0이면 경기 불참, 다음 주 강제 휴식(체력 +40 / 컨디션 +30). 체력 0은 부상도 발생합니다.</p><p><b>승격</b> · 일정 티어와 능력치를 달성하고 시즌 종료 시 승격 테스트에 합격해야 합니다.</p><p><b>저장</b> · 매 선택마다 현재 브라우저에 자동 저장됩니다. 명예의 전당에서 기록을 백업할 수 있습니다.</p><p class="soft">본 프로젝트는 기획서 기반 시연용 게임으로 실제 프로 선수의 경기 결과나 계약과 관계없습니다.</p></div><button class="btn primary full" data-action="close-help">확인</button></div></div>`;}
function render(){
 const current=page==='title'?'title':page==='create'?'create':page==='hall'?'hall':game?.scene;
 let content;
 if(current==='title')content=titleScreen();
 else if(current==='create')content=createScreen();
 else if(current==='hall')content=hallScreen();
 else if(current==='main')content=renderMain();
 else if(current==='event')content=eventScreen();
 else if(current==='gate')content=gateScreen();
 else if(current==='result')content=resultScreen();
 else if(current==='market')content=marketScreen();
 else if(current==='ending')content=endingScreen();
 else content=titleScreen();
 app.innerHTML=shell(content,current);
}
function routePage(next){page=next;render();window.scrollTo({top:0,behavior:'instant'});}
function confirmNew(){
 if(game?.scene && game.scene!=='ending')return window.confirm('진행 중인 게임을 종료하고 새 게임을 시작할까요? 현재 진행 기록은 덮어써집니다.');
 return true;
}
function exportSaves(){
 const obj={format:'faker-growth-save',version:VERSION,exportedAt:new Date().toISOString(),game,hall};
 const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='faker-growth-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
 showToast('저장 기록을 JSON으로 내보냈습니다.');
}
function normalizeImportedHall(list) {
 if(!Array.isArray(list))return null;
 return list.filter(e=>e&&typeof e.name==='string'&&typeof e.score==='number'&&e.position&&Number.isFinite(e.score)).slice(0,50);
}
app.addEventListener('input',e=>{if(e.target.id==='nickname')createName=e.target.value;});
app.addEventListener('change',async e=>{
 if(e.target.id!=='import-input')return;
 const file=e.target.files?.[0];if(!file)return;
 try{
   if(file.size>2_000_000)throw Error('2MB 이하의 저장 파일만 가져올 수 있습니다.');
   const data=JSON.parse(await file.text());if(data?.format!=='faker-growth-save'||![1,VERSION].includes(data.version))throw Error('지원하지 않는 저장 파일입니다.');
   const next=normalizeImportedHall(data.hall)?.map(migrateHallEntry);if(!next)throw Error('명예의 전당 데이터가 올바르지 않습니다.');
   const importedGame=data.game==null?null:migrateGame(data.game);
   if(data.game!=null&&!importedGame)throw Error('게임 저장 데이터가 올바르지 않습니다.');
   if(!window.confirm('기존 게임과 명예의 전당을 가져온 파일로 교체할까요?'))return;
   hall=next;game=importedGame;save();routePage('hall');showToast('기록을 가져왔습니다.');
 }catch(err){showToast(err.message||'파일을 읽을 수 없습니다.');}
});
app.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;
 const action=b.dataset.action;
 switch(action){
   case 'home':routePage('title');break;
   case 'hall':routePage('hall');break;
   case 'new-game':if(confirmNew()){createName='';createPosition='mid';routePage('create');}break;
   case 'continue-game':if(game){archiveEnding();routePage('game')}break;
   case 'choose-position':createPosition=b.dataset.id;render();document.querySelector('.role-card.selected')?.scrollIntoView({block:'nearest',inline:'nearest'});break;
   case 'start-game':{
     const name=createName.trim()||'무명의 신인';game=createGame(name,createPosition);save();routePage('game');break;
   }
   case 'train':changeGame(g=>startTraining(g,b.dataset.id,EVENTS));break;
   case 'event-choice':changeGame(g=>chooseEvent(g,EVENTS,Number(b.dataset.index)));break;
   case 'gate':changeGame(g=>chooseGate(g,b.dataset.choice));break;
   case 'next-week':changeGame(g=>continueFromResult(g));break;
   case 'accept-offer':changeGame(g=>acceptOffer(g,b.dataset.id));break;
   case 'reject-offer':if(window.confirm('이 제안을 거절할까요? 남은 제안이 없다면 은퇴합니다.'))changeGame(g=>rejectOffer(g,b.dataset.id));break;
   case 'dismiss-notice':game.career.gateMessage='';save();render();break;
   case 'export-saves':exportSaves();break;
   case 'import-saves':document.querySelector('#import-input')?.click();break;
   case 'help':app.insertAdjacentHTML('beforeend',helpDialog());break;
   case 'close-help':document.querySelector('#info-modal')?.remove();break;
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('#info-modal')?.remove();});
render();
