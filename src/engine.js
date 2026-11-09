/** 게임 규칙/상태 변경만 담당하는 모듈. DOM과 localStorage에 의존하지 않습니다. */
export const VERSION = 2;
export const WEEKS_PER_SEASON = 3;
export const RANK_THRESHOLDS = [0,400,800];
export const TIERS = [
  {id:'master',name:'마스터',color:'#b58aff',symbol:'✦',minLp:0,
    logo:'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-master.png'},
  {id:'grandmaster',name:'그랜드마스터',color:'#f77778',symbol:'✹',minLp:400,
    logo:'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-grandmaster.png'},
  {id:'challenger',name:'챌린저',color:'#76ceff',symbol:'♛',minLp:800,
    logo:'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-challenger.png'},
];
export const rankTierFromLp = lp => lp>=800?2:lp>=400?1:0;
export function rankProgress(lp) {
  const tier=rankTierFromLp(lp),low=RANK_THRESHOLDS[tier];
  const high=tier===TIERS.length-1?null:RANK_THRESHOLDS[tier+1];
  return {tier,low,high,percent:high===null?100:Math.max(0,Math.min(100,Math.round((lp-low)/(high-low)*100)))};
}
export const STATS = [
  {key:'lane',name:'라인전',icon:'⚔'},
  {key:'fight',name:'한타',icon:'✹'},
  {key:'map',name:'맵 리딩',icon:'◇'},
  {key:'mental',name:'멘탈',icon:'◈'},
  {key:'champ',name:'챔프폭',icon:'▣'},
];
export const POSITIONS = [
  {id:'top',name:'탑',pro:'Doran',icon:'⬡',asset:'role-top.webp',desc:'라인전과 멘탈에 강한 안정적인 캐리',weights:{lane:.30,fight:.15,map:.10,mental:.30,champ:.15}},
  {id:'jungle',name:'정글',pro:'Oner',icon:'❖',asset:'role-jungle.webp',desc:'시야와 오브젝트를 지휘하는 게임 메이커',weights:{lane:.10,fight:.25,map:.40,mental:.15,champ:.10}},
  {id:'mid',name:'미드',pro:'Faker',icon:'✦',asset:'role-mid.webp',desc:'라인전과 운영으로 게임의 흐름을 만드는 핵심',weights:{lane:.30,fight:.20,map:.25,mental:.10,champ:.15}},
  {id:'bot',name:'원딜',pro:'Peyz',icon:'➳',asset:'role-bot.webp',desc:'후반 한타를 지배하는 결정적인 딜러',weights:{lane:.20,fight:.35,map:.10,mental:.25,champ:.10}},
  {id:'support',name:'서폿',pro:'Keria',icon:'✚',asset:'role-support.webp',desc:'팀워크와 맵 리딩으로 판을 설계하는 조력자',weights:{lane:.05,fight:.25,map:.35,mental:.15,champ:.20}},
];
// 2026 LCK 실존 팀의 공식/위키미디어/리그피디아 로고 URL. 자산 소유권은 각 구단에 있습니다.
const commons = file => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;
const leaguepedia = file => `https://lol.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;
export const TEAMS = [
  {id:'t1',name:'T1',short:'T1',color:'#ff405f',logo:commons('T1 esports logo.svg')},
  {id:'geng',name:'Gen.G',short:'GEN',color:'#edc56c',logo:commons('Gen.G Logo.svg')},
  {id:'hle',name:'Hanwha Life Esports',short:'HLE',color:'#ff9e59',logo:commons('Hanwha Life Esports logo.svg')},
  {id:'dk',name:'Dplus KIA',short:'DK',color:'#acd7ff',logo:commons('DPlus KIA Logo.svg')},
  {id:'kt',name:'KT Rolster',short:'KT',color:'#ec646e',logo:leaguepedia('KT Rolsterlogo profile.png')},
  {id:'drx',name:'KIWOOM DRX',short:'DRX',color:'#91acd9',logo:leaguepedia('Kiwoom DRXlogo profile.png')},
  {id:'ns',name:'Nongshim RedForce',short:'NS',color:'#ef5c5d',logo:'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/b8/Nongshim_RedForcelogo_square.png/revision/latest?cb=20260114093156'},
  {id:'bnk',name:'BNK FEARX',short:'BFX',color:'#a8e9dd',logo:'https://static.wixstatic.com/media/b625f3_54c9266e5ccf45fd8b1fcb7647cfdb2a~mv2.png'},
  {id:'dn',name:'DN SOOPers',short:'DNS',color:'#8fcbff',logo:leaguepedia('DN SOOPerslogo profile.png')},
  {id:'bro',name:'HANJIN BRION',short:'BRO',color:'#b5e3ab',logo:leaguepedia('HANJIN BRIONlogo profile.png')},
];
export const STAGES = [
  {id:'student',name:'학생',next:'trainee',gateTier:0,gatePower:15},
  {id:'trainee',name:'연습생',next:'academy',gateTier:0,gatePower:22},
  {id:'academy',name:'2군',next:'pro',gateTier:1,gatePower:29},
  {id:'pro',name:'1군',next:null,gateTier:2,gatePower:100},
];
export const TRAININGS = [
  {id:'solo',name:'솔로랭크',icon:'⚔',desc:'라인전 +3~6 · 한타 +2~4 · 랭크 10판',className:'red',effects:{lane:2,fight:1,stamina:-15,condition:-5}},
  {id:'study',name:'영상 분석',icon:'▣',desc:'맵 리딩 +3~6 · 챔프폭 +2~4',className:'blue',effects:{map:2,champ:1,stamina:-8}},
  {id:'team',name:'팀 연습',icon:'♟',desc:'한타 +3~6 · 팀워크 +3',className:'purple',effects:{fight:2,teamwork:3,stamina:-15},requiresTeam:true},
  {id:'rest',name:'휴식',icon:'☾',desc:'체력 +30 · 컨디션 +15 · 멘탈 +1~2',className:'green',effects:{stamina:30,condition:15,mental:1}},
];
const CAP = 100;
const MIN = 0;
const clamp=(n,min=MIN,max=CAP)=>Math.min(max,Math.max(min,Math.round(n*10)/10));
const roll=(rng,min,max)=>Math.floor(rng()*(max-min+1))+min;
const copy=s=>structuredClone(s);
const playerKeys=['lane','fight','map','mental','champ'];
const statusKeys=['stamina','condition','teamwork','popularity'];
const POS_KEY = {adc:'bot',sup:'support'};
const $pos=id=>POSITIONS.find(x=>x.id===id)||POSITIONS[2];
const $team=id=>TEAMS.find(x=>x.id===id)||TEAMS[0];
export const positionInfo=id=>$pos(id);
export const teamInfo=id=>$team(id);
export const stageInfo=id=>STAGES.find(x=>x.id===id)||STAGES[0];
export const tierInfo=tier=>TIERS[tier]||TIERS[0];
export const seasonName=s=>s%2===1?'스프링':'서머';
export const scorePower=g=>playerKeys.reduce((sum,k)=>sum+g.stats[k]*$pos(g.player.position).weights[k],0);
export const winChance=(power,opponent,condition)=>Math.min(.85,Math.max(.15,.5+.004*(power-opponent)+.002*(condition-50)));
export const tierRatio=g=>rankProgress(g.rank.lp).percent;
export const averageStats=g=>playerKeys.reduce((s,k)=>s+g.stats[k],0)/5;
export const rankIndexFromName=id=>TIERS.findIndex(t=>t.id===id);
export function createGame(name,position='mid') {
  const clean=String(name||'무명의 신인').trim().slice(0,16)||'무명의 신인';
  const pos=$pos(POS_KEY[position]||position);
  const stats={lane:10,fight:10,map:10,mental:10,champ:10};
  const top=Object.keys(pos.weights).sort((a,b)=>pos.weights[b]-pos.weights[a]).slice(0,2);
  top.forEach(k=>stats[k]+=5);
  return {
    version:VERSION,scene:'main',player:{name:clean,position:pos.id,age:17,stage:'student'},
    stats,status:{stamina:100,condition:70,teamwork:0,popularity:0},
    rank:{tier:0,lp:0,highest:0},
    career:{season:1,week:1,totalTurns:0,team:null,contractRemaining:0,salary:0,totalSalary:0,
      matchWins:0,matchLosses:0,championships:0,rankWins:0,rankLosses:0,marketValue:45,
      teamHistory:[],scoreLog:[],slumpRecovered:0,injuryTurns:0,injuries:0,gateFailures:0,recoveryTurns:0,recoveryReason:null},
    pending:null,pendingEvent:null,pendingGate:null,offers:[],marketTarget:null,lastResult:null,ending:null,history:[],
    createdAt:new Date().toISOString(),
  };
}
function changeEffects(g,effects={}) {
  for(const [raw,v] of Object.entries(effects)) {
    const k=raw==='energy'?'stamina':raw==='pop'?'popularity':raw;
    if(playerKeys.includes(k)) {
      const mult=(g.player.age>=29?.4:g.player.age>=26?.7:1);
      const adj=(k==='lane'||k==='fight')&&v>0?v*mult:(g.player.age>=29 && (k==='map'||k==='mental') && v>0?v*.7:v);
      g.stats[k]=clamp(g.stats[k]+adj);
    } else if(statusKeys.includes(k)) {
      const mod=(k==='teamwork'&&g.player.position==='support'&&v>0)?2:1;
      g.status[k]=clamp(g.status[k]+v*mod);
    }
  }
}
function recentPerformance(g) {
  const log=g.career.scoreLog.slice(-12);
  if(!log.length) return 45;
  return 100*log.filter(Boolean).length/log.length;
}
export function marketValue(g) {
  const R=recentPerformance(g);
  const F=g.status.popularity;
  const G=Math.max(0,100-(g.player.age-17)*6);
  const D=g.player.age<26?0:(g.player.age-25)*7;
  return clamp(.5*R+.3*F+.2*G-D,0,100);
}
function syncValue(g) {g.career.marketValue=marketValue(g);}
export const isTrainingUnlocked=(g,id)=>{
  if((g.career.recoveryTurns>0||g.status.stamina<=0||g.status.condition<=0)&&id!=='rest')return false;
  if(g.career.injuryTurns>0&&!['rest','study'].includes(id))return false;
  return id!=='team'||g.player.stage!=='student';
};
function weightedRandom(events,rng) {
  const total=events.reduce((v,e)=>v+(e.weight||1),0);
  let target=rng()*total;
  for(const event of events) {target-=event.weight||1;if(target<0)return event;}
  return events.at(-1);
}
function eventEligible(g,e) {
  const c=e.condition||{};
  if(c.minAge!==undefined&&g.player.age<c.minAge)return false;
  if(c.maxAge!==undefined&&g.player.age>c.maxAge)return false;
  if(c.stage&&!c.stage.includes(g.player.stage))return false;
  if(c.position&& !c.position.includes(g.player.position))return false;
  if(c.condition_lte!==undefined&&g.status.condition>c.condition_lte)return false;
  if(c.stamina_lte!==undefined&&g.status.stamina>c.stamina_lte)return false;
  if(c.teamwork_lte!==undefined&&g.status.teamwork>c.teamwork_lte)return false;
  if(c.teamwork_gte!==undefined&&g.status.teamwork<c.teamwork_gte)return false;
  if(c.popularity_gte!==undefined&&g.status.popularity<c.popularity_gte)return false;
  if(c.rankMin!==undefined&&g.rank.tier<c.rankMin)return false;
  if(c.injured&&g.career.injuryTurns<=0)return false;
  return true;
}
export function meetsRequirements(g,requires={}) {
  return Object.entries(requires).every(([key,n])=>{
    const suffix=key.endsWith('_gte')?'_gte':key.endsWith('_lte')?'_lte':null;
    const k=key.replace(/_(gte|lte)$/,'');
    const value=g.stats[k]??g.status[k]??(k==='tier'?g.rank.tier:undefined);
    return value!==undefined && (suffix==='_gte'?value>=n:suffix==='_lte'?value<=n:value===n);
  });
}
function updateRank(g,amount) {
  // 마스터 이상은 누적 LP로 랭크를 계산하며 0 아래로는 내려가지 않습니다.
  g.rank.lp=Math.max(0,Math.round(g.rank.lp+amount));
  g.rank.tier=rankTierFromLp(g.rank.lp);
  g.rank.highest=Math.max(g.rank.highest,g.rank.tier);
}
function simulateSolo(g,rng) {
  const beforeTier=g.rank.tier,beforeLp=g.rank.lp;
  let wins=0,losses=0;
  for(let i=0;i<10;i++) {
    const opponent=13+g.rank.tier*10+g.rank.lp*.028;
    const win=rng()<winChance(scorePower(g),opponent,g.status.condition);
    if(win){wins++;g.career.rankWins++;updateRank(g,roll(rng,40,90));}
    else {losses++;g.career.rankLosses++;updateRank(g,-roll(rng,20,40));}
  }
  const promotion=g.rank.tier>beforeTier, demotion=g.rank.tier<beforeTier;
  if(wins>=7)changeEffects(g,{popularity:2});
  if(losses>=8)changeEffects(g,{condition:-4});
  return {wins,losses,beforeTier,beforeLp,afterTier:g.rank.tier,afterLp:g.rank.lp,promotion,demotion,
    lpDelta:g.rank.lp-beforeLp};
}
function simulateLeague(g,rng) {
  if(g.player.stage==='student')return null;
  const opponents=TEAMS.filter(t=>t.id!==g.career.team);
  const enemy=opponents[Math.floor(rng()*opponents.length)]||TEAMS[1];
  const stageIndex=STAGES.findIndex(s=>s.id===g.player.stage);
  const opponentPower=15+stageIndex*10+Math.min(14,(g.career.season-1)*.6);
  const teamBonus=g.status.teamwork*.13+g.stats.mental*.07;
  const prob=winChance(scorePower(g)+teamBonus,opponentPower,g.status.condition);
  const victory=rng()<prob;
  g.career.scoreLog.push(victory?1:0);
  if(g.career.scoreLog.length>20)g.career.scoreLog.shift();
  if(victory){g.career.matchWins++;changeEffects(g,{popularity:g.player.position==='mid'?4:3,teamwork:2,condition:-1});}
  else{g.career.matchLosses++;changeEffects(g,{popularity:-1,condition:-3,mental:-1});}
  const score=victory?(rng()<.5?'2 : 0':'2 : 1'):(rng()<.5?'0 : 2':'1 : 2');
  const mvp=victory&&rng()<.21;
  if(mvp)changeEffects(g,{popularity:3});
  return {victory,enemyId:enemy.id,score,mvp,prob:Math.round(prob*100)};
}
function injure(g,turns=2) {
  g.career.injuryTurns=Math.max(g.career.injuryTurns,turns);
  g.career.injuries++;
  changeEffects(g,{condition:-10});
}
/** 체력/컨디션 소진은 실제 경기 불참 + 다음 턴 강제 회복으로 연결됩니다. */
function markExhaustion(g) {
  const exhausted=g.status.stamina<=0 || g.status.condition<=0;
  if(!exhausted)return false;
  g.career.recoveryTurns=Math.max(g.career.recoveryTurns||0,1);
  if(g.status.stamina<=0){
    g.career.recoveryReason='체력 고갈 · 경기 불참 및 다음 주 강제 휴식';
    if(g.career.injuryTurns<2)injure(g,2);
  } else g.career.recoveryReason='컨디션 고갈 · 번아웃으로 경기 불참 및 다음 주 강제 휴식';
  return true;
}
/** 훈련 선택을 하면 이벤트가 뜨거나 경기 결과로 이동합니다. */
export function startTraining(state,trainingId,events=[],rng=Math.random) {
  if(state.scene!=='main')throw Error('현재는 훈련을 진행할 수 없습니다.');
  const tr=TRAININGS.find(t=>t.id===trainingId);
  if(!tr||!isTrainingUnlocked(state,trainingId))throw Error('현재 상태에서는 해당 훈련을 진행할 수 없습니다.');
  const g=copy(state);
  const forcedRecovery=g.career.recoveryTurns>0||g.status.stamina<=0||g.status.condition<=0;
  g.pending={trainingId,week:g.career.week,season:g.career.season,forcedRecovery,
    before:{stats:copy(g.stats),status:copy(g.status),rank:copy(g.rank)},eventName:null};
  const effects = {...tr.effects};

  if (trainingId === 'solo') {
      effects.lane = roll(rng, 3, 6);
      effects.fight = roll(rng, 2, 4);

  } else if (trainingId === 'study') {
      effects.map = roll(rng, 3, 6);
      effects.champ = roll(rng, 2, 4);

  } else if (trainingId === 'team') {
      effects.fight = roll(rng, 3, 6);

  } else if (trainingId === 'rest') {
      effects.mental = roll(rng, 1, 2);
  }

  changeEffects(g, effects);
  // 나이 보정과 스탯 상한을 적용한 실제 훈련 성장량.
  g.pending.trainingGains=Object.fromEntries(playerKeys.map(key=>[
    key,Math.round((g.stats[key]-g.pending.before.stats[key])*10)/10
  ]));
  if(forcedRecovery){
    // 0에서 정상 복귀할 수 있도록 일반 휴식보다 추가 회복을 제공.
    changeEffects(g,{stamina:10,condition:15});
    g.career.recoveryTurns=0;g.career.recoveryReason=null;
    concludeTraining(g,rng);return g;
  }
  if(g.status.stamina<30&&trainingId!=='rest')changeEffects(g,{condition:-6});
  if(markExhaustion(g)){concludeTraining(g,rng);return g;}
  const eligible=events.filter(e=>eventEligible(g,e));
  const forcedRisk=g.status.stamina<25?.32:0;
  if(eligible.length && rng()<Math.max(.45,forcedRisk)) {
    const e=weightedRandom(eligible,rng);
    g.pendingEvent=e.id;g.pending.eventName=e.title;g.scene='event';
  } else concludeTraining(g,rng);
  return g;
}
/** 이벤트/승격 테스트의 조건 미충족 선택지는 엔진에서도 막습니다. */
export function chooseEvent(state,events,choiceIndex,rng=Math.random) {
  if(state.scene!=='event'||!state.pendingEvent)throw Error('진행 중인 이벤트가 없습니다.');
  const e=events.find(x=>x.id===state.pendingEvent);
  if(!e)throw Error('이벤트 데이터가 없습니다.');
  const choice=e.choices[choiceIndex];
  if(!choice||!meetsRequirements(state,choice.requires))throw Error('선택 조건을 충족하지 못했습니다.');
  const g=copy(state);
  changeEffects(g,choice.effects);
  if(choice.risk?.injury && rng()<choice.risk.injury)injure(g,roll(rng,1,3));
  if(e.id==='event_slump_01'&&choiceIndex===0)g.career.slumpRecovered++;
  g.pending.eventChoice=choice.label;
  g.pendingEvent=null;
  concludeTraining(g,rng);
  return g;
}
function concludeTraining(g,rng) {
  const exhausted=markExhaustion(g);
  const skipMatches=exhausted || Boolean(g.pending.forcedRecovery);
  const reason=exhausted?g.career.recoveryReason:g.pending.forcedRecovery?'강제 회복 주간에는 경기 출전 없이 휴식합니다.':null;
  const rankResult=skipMatches?null:g.pending.trainingId==='solo'?simulateSolo(g,rng):null;
  const leagueResult=skipMatches?null:simulateLeague(g,rng);
  // 경기 종료 후 0에 도달한 경우 다음 턴 강제 휴식으로 연결.
  if(!skipMatches)markExhaustion(g);
  if(g.career.injuryTurns>0)g.career.injuryTurns=Math.max(0,g.career.injuryTurns-1);
  syncValue(g);
  g.lastResult={
    trainingId:g.pending.trainingId,season:g.career.season,week:g.career.week,
    rank:rankResult,league:leagueResult,trainingGains:g.pending.trainingGains||null,missedMatch:skipMatches,forcedRecovery:Boolean(g.pending.forcedRecovery),
    recoveryNote:reason,eventName:g.pending.eventName,eventChoice:g.pending.eventChoice,
    gains:{stats:Object.fromEntries(playerKeys.map(k=>[k,Math.round((g.stats[k]-g.pending.before.stats[k])*10)/10])),
      status:Object.fromEntries(statusKeys.map(k=>[k,Math.round((g.status[k]-g.pending.before.status[k])*10)/10]))},
    highlight:reason|| (leagueResult?(leagueResult.victory?'날카로운 판단과 침착한 운영으로 팀 승리에 기여했다.':'힘겨운 경기였다. 다음 주의 선택이 중요하다.')
      :rankResult?(rankResult.wins>=6?'솔로랭크에서 좋은 흐름을 만들어냈다.':'치열한 솔로랭크. 약점을 보완할 시간이 필요하다.')
      :'다음 경기를 위한 기반을 다진 한 주였다.')
  };
  g.history.push({season:g.career.season,week:g.career.week,training:g.pending.trainingId,
    rankWins:rankResult?.wins??null,leagueWin:leagueResult?.victory??null,event:g.pending.eventName||null,missedMatch:skipMatches});
  if(g.history.length>320)g.history.shift();
  g.pending=null;g.scene='result';
}
export function gateEligibility(g) {
  const stage=stageInfo(g.player.stage);
  return Boolean(stage.next&&g.rank.tier>=stage.gateTier&&averageStats(g)>=stage.gatePower);
}
function ageSeason(g) {
  if(g.player.age>=26){ const loss=g.player.age>=29?2:1;g.stats.lane=clamp(g.stats.lane-loss);g.stats.fight=clamp(g.stats.fight-loss); }
  if(g.career.season%2===0)g.player.age++;
}
function seasonAchievements(g,rng) {
  const recent=g.career.scoreLog.slice(-WEEKS_PER_SEASON);
  if(g.player.stage!=='student'&&recent.length>=WEEKS_PER_SEASON&&recent.filter(Boolean).length>=WEEKS_PER_SEASON-1 && rng()<.25) {
    g.career.championships++;
    changeEffects(g,{popularity:9,teamwork:4});
    g.career.seasonAward=true;
  } else g.career.seasonAward=false;
}
export function continueFromResult(state,rng=Math.random) {
  if(state.scene!=='result')throw Error('경기 결과 화면이 아닙니다.');
  const g=copy(state);
  g.career.totalTurns++;
  if(g.career.week<WEEKS_PER_SEASON){g.career.week++;g.scene='main';return g;}
  // 4주 종료: 시즌 결산, 연봉 정산, 노화, 다음 시즌
  seasonAchievements(g,rng);
  if(g.career.team&&g.career.contractRemaining>0) {
    g.career.totalSalary+=g.career.salary;
    g.career.contractRemaining--;
  }
  ageSeason(g);
  g.career.season++;g.career.week=1;
  changeEffects(g,{stamina:12,condition:8});
  syncValue(g);
  if(gateEligibility(g) && (g.player.stage==='student'||g.career.contractRemaining<=0)) {
    g.pendingGate={fromStage:g.player.stage,toStage:stageInfo(g.player.stage).next};
    g.scene='gate';return g;
  }
  if(g.player.stage!=='student' && g.career.contractRemaining<=0){return prepareMarket(g,g.player.stage,rng);}
  if(g.player.stage==='student' && g.career.marketValue<5) return retire(g,'시장가치가 바닥나 스카우트 제안을 더 이상 기대할 수 없게 되었다.');
  g.scene='main';return g;
}
export function chooseGate(state,option,rng=Math.random) {
  if(state.scene!=='gate'||!state.pendingGate)throw Error('진행 중인 승격 테스트가 없습니다.');
  const g=copy(state);const gate=g.pendingGate;
  if(option==='skip'){
    g.pendingGate=null;
    return gate.fromStage==='student'?(g.scene='main',g):prepareMarket(g,gate.fromStage,rng);
  }
  const p=scorePower(g);
  let prob=Math.min(.93,Math.max(.22,.46+(p-stageInfo(gate.fromStage).gatePower)*.023+(g.status.condition-50)*.004));
  if(option==='teamwork'){if(g.status.teamwork<20)throw Error('팀워크 20 이상이 필요합니다.');prob=Math.min(.95,Math.max(.22,prob+.12));}
  if(option==='focus')changeEffects(g,{stamina:-10,condition:-6});
  g.pendingGate=null;
  if(rng()<prob) {
    g.career.gateMessage=`${stageInfo(gate.toStage).name} 승격 테스트에 합격했습니다!`;
    return prepareMarket(g,gate.toStage,rng);
  }
  g.career.gateFailures++;
  g.career.gateMessage='테스트에 실패했습니다. 다음 기회를 노려보세요.';
  if(gate.fromStage==='student'){g.scene='main';return g;}
  return prepareMarket(g,gate.fromStage,rng);
}
function offersFor(g,target,rng) {
  const v=marketValue(g);
  const stageThreshold={trainee:8,academy:18,pro:32};
  if(g.player.stage!=='student' && v<(stageThreshold[target]||8))return [];
  const pool=[...TEAMS].sort(()=>rng()-.5); // 미관/목록 분산용, 재현성은 필요 없음
  const count=target==='pro'?Math.min(4,Math.max(1,Math.floor(v/19))):Math.min(4,Math.max(2,Math.floor(v/20)));
  const chosen=pool.slice(0,count);
  if(g.career.team && !chosen.find(t=>t.id===g.career.team)&&g.player.age<32&&v>30)chosen[0]=$team(g.career.team);
  const base={trainee:.45,academy:1.7,pro:5}[target]||1;
  return chosen.map((team,i)=>({
    id:`offer_${g.career.season}_${team.id}_${i}`,teamId:team.id,targetStage:target,
    seasons:roll(rng,1,3),salary:Math.round((base+v*base*(.018+rng()*.012)) *10)/10,
    flavor:[
      '미래의 에이스로 성장할 유망주를 찾고 있습니다.',
      '팀의 중심에서 다음 시즌을 이끌어 주세요.',
      '함께 더 높은 무대에 도전하고 싶습니다.',
      '탄탄한 운영과 팀워크를 높게 평가하고 있습니다.',
    ][i%4]
  }));
}
function prepareMarket(g,target,rng) {
  g.marketTarget=target;g.offers=offersFor(g,target,rng);
  g.career.contractRemaining=0;g.scene=g.offers.length?'market':'ending';
  if(!g.offers.length)return retire(g,'계약이 종료되었지만 새로운 영입 제안이 도착하지 않았다.');
  return g;
}
export function acceptOffer(state,offerId) {
  if(state.scene!=='market')throw Error('이적 시장 화면이 아닙니다.');
  const offer=state.offers.find(x=>x.id===offerId);
  if(!offer)throw Error('해당 제안이 없습니다.');
  const g=copy(state);
  g.player.stage=offer.targetStage;g.career.team=offer.teamId;
  g.career.contractRemaining=offer.seasons;g.career.salary=offer.salary;
  g.career.teamHistory.push({teamId:offer.teamId,stage:offer.targetStage,season:g.career.season,years:offer.seasons});
  g.offers=[];g.marketTarget=null;g.scene='main';g.career.gateMessage=`${$team(offer.teamId).name}에 입단했습니다!`;
  changeEffects(g,{popularity:3,teamwork:5,condition:5});syncValue(g);
  return g;
}
export function rejectOffer(state,offerId) {
  if(state.scene!=='market')throw Error('이적 시장 화면이 아닙니다.');
  const g=copy(state);g.offers=g.offers.filter(o=>o.id!==offerId);
  if(!g.offers.length)return retire(g,'모든 제안을 거절했고, 남은 계약이 없어 은퇴하게 되었다.');
  return g;
}
export function careerScore(g) {
  return Math.round(g.rank.highest*90 + g.career.championships*130 + g.career.matchWins*5 +
    g.career.totalTurns*1.2 + g.status.popularity*1.6 + g.career.totalSalary*2);
}
export function careerGrade(g) {
  const sc=careerScore(g);
  if(sc>=1200)return'GOAT';if(sc>=750)return'레전드';if(sc>=430)return'스타';if(sc>=160)return'준수';return'무명';
}
export function retire(state,reason) {
  const g=copy(state);
  g.scene='ending';g.offers=[];g.pendingGate=null;g.pendingEvent=null;
  g.ending={reason,score:careerScore(g),grade:careerGrade(g),path:g.status.popularity>=75?'방송인':g.stats.mental>=45?'감독':'코치',
    oneLiner:g.career.slumpRecovered>0?`슬럼프를 ${g.career.slumpRecovered}번 이겨내고 끝까지 도전을 멈추지 않은 선수.`:
      g.career.championships>0?'치열한 경기 끝에 우승의 기쁨을 맛본 선수.':'새로운 도전 앞에서 매번 자신만의 답을 찾은 선수.'};
  return g;
}
export function hallEntry(g) {
  return {
    id:`${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    date:new Date().toISOString(),name:g.player.name,position:g.player.position,age:g.player.age,
    grade:g.ending?.grade||careerGrade(g),score:g.ending?.score||careerScore(g),
    highest:g.rank.highest,version:VERSION,stage:g.player.stage,trophies:g.career.championships,team:g.career.team,
    salary:g.career.totalSalary,
  };
}
export function formatMoney(amount) {return `${Number(amount||0).toLocaleString('ko-KR',{maximumFractionDigits:1})}억 원`;}

/** 1.0 저장 파일을 2.0 규칙에 맞춰 변환합니다. 원본 객체는 변경하지 않습니다. */
export function migrateGame(raw) {
  if(!raw||!raw.player||!raw.career||!raw.rank)return null;
  if(raw.version===VERSION){
    if(raw.career.week<=WEEKS_PER_SEASON)return raw;
    const g=copy(raw);
    g.career.week=WEEKS_PER_SEASON;
    if(g.pending?.week>WEEKS_PER_SEASON)g.pending.week=WEEKS_PER_SEASON;
    if(g.lastResult?.week>WEEKS_PER_SEASON)g.lastResult.week=WEEKS_PER_SEASON;
    return g;
  }
  if(raw.version!==1)return null;
  const g=copy(raw);
  const oldToNew=n=>n>=6?2:n===5?1:0;
  const oldTier=Number(g.rank.tier)||0;
  const oldLp=Number(g.rank.lp)||0;
  g.rank.tier=oldToNew(oldTier);
  g.rank.lp=([0,400,800][g.rank.tier]||0)+(oldTier>=4?oldLp:0);
  g.rank.highest=oldToNew(Number(g.rank.highest)||0);
  g.career.week=Math.max(1,Math.min(WEEKS_PER_SEASON,Math.ceil(g.career.week/2)));
  g.career.recoveryTurns=0;g.career.recoveryReason=null;
  if(g.pending?.week)g.pending.week=g.career.week;
  if(g.lastResult?.week)g.lastResult.week=Math.max(1,Math.min(WEEKS_PER_SEASON,Math.ceil(g.lastResult.week/2)));
  if(g.lastResult?.rank){
    const r=g.lastResult.rank;
    r.beforeTier=oldToNew(Number(r.beforeTier)||0);
    r.afterTier=oldToNew(Number(r.afterTier)||0);
    r.beforeLp=([0,400,800][r.beforeTier]||0)+(oldTier>=4?Number(r.beforeLp)||0:0);
    r.afterLp=g.rank.lp;
  }
  g.version=VERSION;return g;
}
export const migrateHallEntry = entry => {
  if(!entry||typeof entry!=='object')return entry;
  if(entry.version===VERSION)return entry;
  return {...entry,highest:entry.highest>=6?2:entry.highest===5?1:0,version:VERSION};
};
