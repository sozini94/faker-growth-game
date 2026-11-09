/** 2026 LCK/MSI/Worlds 자격 구조를 3주 게임 턴으로 압축한 독립 시뮬레이션.
 * 실제 경기 일정, 완전한 더블엘리미네이션 대진표는 재현하지 않습니다.
 * 공식 규칙 참고: https://lolesports.com/en-US/news/msi-and-worlds-updates
 * https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/0/02/LCK_2026_Rulebook%282%29.pdf/revision/latest?cb=20260109135740
 */
export const PRO_PHASES=['lck','msi','worlds'];
export const PHASE_NAMES={lck:'LCK 정규 시즌 · Road to MSI',msi:'MSI 국제 대회',worlds:'Worlds 월드 챔피언십'};
export const FOREIGN_TEAMS=[
 {id:'blg',name:'Bilibili Gaming',region:'LPL',strength:77}, {id:'tes',name:'Top Esports',region:'LPL',strength:69},
 {id:'g2',name:'G2 Esports',region:'LEC',strength:73}, {id:'kc',name:'Karmine Corp',region:'LEC',strength:59},
 {id:'tl',name:'Team Liquid',region:'LCS',strength:62},{id:'fly',name:'FlyQuest',region:'LCS',strength:60},
 {id:'tsw',name:'Team Secret Whales',region:'LCP',strength:59},{id:'dcg',name:'Deep Cross Gaming',region:'LCP',strength:54},
 {id:'fur',name:'FURIA',region:'CBLOL',strength:52},
 {id:'jdg',name:'JD Gaming',region:'LPL',strength:66},{id:'fnc',name:'Fnatic',region:'LEC',strength:58},
 {id:'c9',name:'Cloud9',region:'LCS',strength:56},{id:'psg',name:'PSG Talon',region:'LCP',strength:55},
 {id:'loud',name:'LOUD',region:'CBLOL',strength:52},
 {id:'wbg',name:'Weibo Gaming',region:'LPL',strength:64},
 {id:'koi',name:'Movistar KOI',region:'LEC',strength:57},
 {id:'dig',name:'Dignitas',region:'LCS',strength:52},
 {id:'gam',name:'GAM Esports',region:'LCP',strength:57},
];
const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const order=['geng','hle','t1','dk','kt','bnk','ns','bro','drx','dn'];
const strength=(id,playerTeam,playerPower,condition=70)=>{
 const idx=order.indexOf(id);
 if(idx<0)return FOREIGN_TEAMS.find(x=>x.id===id)?.strength??58;
 const base=77-idx*3.9;
 return id===playerTeam?base+clamp((playerPower-20)*.8,-8,35)+clamp((condition-70)*.11,-8,5):base;
};
const series=(a,b,g,power,rng,bestOf=3)=>{
 const p=clamp(.5+(strength(a,g.career.team,power,g.status.condition)-strength(b,g.career.team,power,g.status.condition))*.012,.12,.88);
 let x=0,y=0;const need=Math.floor(bestOf/2)+1;
 while(x<need&&y<need){if(rng()<p)x++;else y++;}
 return {a,b,aWins:x,bWins:y,winner:x>y?a:b,loser:x>y?b:a,score:`${x}:${y}`};
};
function rounds(ids){
 // 10팀 단일 라운드로빈, 9라운드 × 5경기 = 총 45경기
 const a=[...ids],out=[];
 for(let round=0;round<a.length-1;round++){
  let m=[];for(let j=0;j<a.length/2;j++)m.push([a[j],a[a.length-1-j]]);
  out.push(m);a.splice(1,0,a.pop());
 }
 return out;
}
function standings(matches,ids){
 const rows=ids.map(teamId=>({teamId,wins:0,losses:0,games:0}));
 for(const m of matches){const w=rows.find(x=>x.teamId===m.winner),l=rows.find(x=>x.teamId===m.loser);if(!w||!l)continue;w.wins++;l.losses++;w.games++;l.games++;}
 return rows.sort((a,b)=>b.wins-a.wins||a.losses-b.losses||order.indexOf(a.teamId)-order.indexOf(b.teamId)).map((r,i)=>({...r,place:i+1}));
}
export function initProCircuit(g){return {
 year:1,phase:'lck',rounds:[],matches:[],standings:[],msiSeeds:[],worldsSeeds:[],
 qualifiedMSI:false,qualifiedWorlds:false,msiChampion:null,msiFinalist:null,
 worldsChampion:null,worldsStreak:0,worldsWins:0,lckTitles:0,msiTitles:0,
 history:[],currentReport:null,seasonResults:[],playoffs:[],
};}
export function ensureProCircuit(g){
 if(g.player.stage!=='pro')return null;
 if(!g.proCircuit)g.proCircuit=initProCircuit(g);
 if(!g.proCircuit.phase)g.proCircuit.phase='lck';
 return g.proCircuit;
}
export function runProWeek(g,rng,power,skip=false){
 const t=ensureProCircuit(g);if(!t)return null;
 const week=g.career.week;
 if(t.phase!=='lck')return {phase:t.phase,played:[],note:t.phase==='msi'?(t.qualifiedMSI?'MSI 본선 진출 준비 중':'MSI 진출 실패 · 국내 훈련 중'):(t.qualifiedWorlds?'Worlds 본선 진출 준비 중':'Worlds 진출 실패 · 국내 훈련 중')};
 if(!t.rounds.length)t.rounds=rounds(order);
 const played=[];
 for(const pairings of t.rounds.slice((week-1)*3,week*3)){
  for(const [a,b] of pairings){
   // 선수 결장은 해당 팀 승률에 페널티. 리그 전체 일정은 계속 진행.
   const basePower=skip&&g.career.team===a||skip&&g.career.team===b?Math.min(power,10):power;
   const m=series(a,b,g,basePower,rng,3);t.matches.push(m);
   if(a===g.career.team||b===g.career.team)played.push({...m,victory:m.winner===g.career.team,enemyId:a===g.career.team?b:a});
  }
 }
 t.standings=standings(t.matches,order);
 t.seasonResults.push({week,played:played.map(x=>({enemyId:x.enemyId,victory:x.victory,score:x.score}))});
 return {phase:'lck',played:skip?[]:played,note:skip?'선수 컨디션 문제로 본인 경기 불참 · 팀은 대체 선수로 일정을 치렀습니다.':null,standings:t.standings,place:t.standings.find(x=>x.teamId===g.career.team)?.place};
}
function roadToMSI(rows,g,rng,power){
 const ids=rows.slice(0,6).map(x=>x.teamId);
 const top=series(ids[0],ids[1],g,power,rng,5);
 const matches=[top];
 let contender=ids[5];
 for(const id of [ids[4],ids[3],ids[2],top.loser]){
  const m=series(contender,id,g,power,rng,5);matches.push(m);contender=m.winner;
 }
 return {seeds:[top.winner,contender],matches};
}
function msiField(t){return [...t.msiSeeds,...['blg','tes','g2','kc','tl','fly','tsw','dcg','fur']];}
function tournamentDoubleElim(ids,g,rng,power){
 // 간소화된 2패 탈락 BO5 브래킷: 우승팀은 두 번 패배하지 않음
 let active=ids.map(id=>({id,losses:0})),games=[];
 let guard=0;
 while(active.length>1&&guard++<75){
  active.sort((a,b)=>a.losses-b.losses||strength(b.id,g.career.team,power)-strength(a.id,g.career.team,power));
  let next=[];
  while(active.length>1){
   const a=active.shift(),b=active.shift();
   const result=series(a.id,b.id,g,power,rng,5);games.push(result);
   if(result.winner===a.id)b.losses++;else a.losses++;
   if(a.losses<2)next.push(a);if(b.losses<2)next.push(b);
  }
  if(active.length)next.push(active.shift());
  active=next;
 }
 const champion=active[0]?.id||ids[0];
 return {champion,runnerUp:games.at(-1)?.loser||null,matches:games};
}
function simulateSummerAndPlayoffs(t,g,rng,power){
 // 2026 실제 3~4R의 레전드/라이즈 상위/하위 5팀 그룹을 반영한 압축 모델
 const groups=[t.standings.slice(0,5).map(x=>x.teamId),t.standings.slice(5).map(x=>x.teamId)];
 const extras=[];
 for(const ids of groups){
  for(let repeat=0;repeat<2;repeat++)for(const [i,a] of ids.entries())for(const b of ids.slice(i+1))extras.push(series(a,b,g,power,rng,3));
 }
 const ranked=standings([...t.matches,...extras],order);
 const playoffs=ranked.slice(0,6).map(x=>x.teamId);
 // 플레이오프 상위 여섯 팀의 BO5 2패 탈락 결과에서 1~3위 결정
 const bracket=tournamentDoubleElim(playoffs,g,rng,power);
 const eliminated=[];
 for(const m of bracket.matches){const candidate=m.loser;if(!eliminated.includes(candidate))eliminated.push(candidate);}
 const finalists=[bracket.champion,bracket.runnerUp,...[...eliminated].reverse()].filter((id,i,a)=>a.indexOf(id)===i);
 const seeding=finalists.concat(playoffs.filter(id=>!finalists.includes(id)));
 return {ranked,playoffTeams:playoffs,seeds:seeding.slice(0,4),bracket};
}
const unique=x=>[...new Set(x)];
function buildWorldsField(t){
 // 2026 Worlds 배정: LCK/LPL/LEC/LCS/LCP 각 3 + CBLOL 2 + MSI 우승팀 1 + MSI 준우승 지역 1.
 const baseForeign=['blg','tes','jdg','g2','kc','fnc','tl','fly','c9','tsw','dcg','psg','fur','loud'];
 const field=unique([...t.worldsSeeds.slice(0,3),...baseForeign]);
 const regionOf=id=>order.includes(id)?'LCK':FOREIGN_TEAMS.find(x=>x.id===id)?.region;
 const nextForRegion=(region)=>{
  if(region==='LCK')return (t.playoffs||[]).find(id=>!field.includes(id))||order.find(id=>!field.includes(id));
  return FOREIGN_TEAMS.find(x=>x.region===region&&!field.includes(x.id))?.id;
 };
 const champion=t.msiChampion;
 if(champion){
  // 우승팀이 이미 자국 기본 시드에 있다면 해당 지역에 추가 출전권을 부여.
  const bonus=field.includes(champion)?nextForRegion(regionOf(champion)):champion;
  if(bonus&&!field.includes(bonus))field.push(bonus);
 }
 if(t.msiFinalist){
  const bonus=nextForRegion(regionOf(t.msiFinalist));
  if(bonus&&!field.includes(bonus))field.push(bonus);
 }
 while(field.length<19){
   const extra=[...order,...FOREIGN_TEAMS.map(x=>x.id)].find(id=>!field.includes(id));
   if(!extra)break;field.push(extra);
 }
 return field.slice(0,19);
}

function simulateWorlds(t,g,rng,power){
 const field=buildWorldsField(t);
 // 4팀 플레이인 BO5 (승자 1팀), 16팀 스위스, 8팀 토너먼트 간소화
 const top=field.slice(0,15),low=field.slice(15);
 let pi=low;
 while(pi.length>1){const next=[];for(let i=0;i<pi.length;i+=2){if(i+1>=pi.length){next.push(pi[i]);continue;}next.push(series(pi[i],pi[i+1],g,power,rng,5).winner);}pi=next;}
 const swiss=unique([...top,...pi]);
 // 스위스: 3승 진출 / 3패 탈락, 동일 전적끼리 매칭 (가상 압축 스위스)
 const records=swiss.map(id=>({id,wins:0,losses:0}));let roundsLog=[];
 for(let round=0;round<5;round++){
  const active=records.filter(x=>x.wins<3&&x.losses<3).sort((a,b)=>b.wins-a.wins||a.losses-b.losses);
  let pairs=[];
  while(active.length>1){const a=active.shift(),b=active.shift();const m=series(a.id,b.id,g,power,rng,3);records.find(x=>x.id===m.winner).wins++;records.find(x=>x.id===m.loser).losses++;pairs.push(m);}
  if(active.length){const a=active.shift();a.wins++;}
  roundsLog.push(pairs);
 }
 const qualifiers=records.sort((a,b)=>b.wins-a.wins||a.losses-b.losses).slice(0,8).map(x=>x.id);
 let stage=qualifiers,knockout=[];
 while(stage.length>1){let next=[];for(let i=0;i<stage.length;i+=2){const m=series(stage[i],stage[i+1],g,power,rng,5);knockout.push(m);next.push(m.winner);}stage=next;}
 return {champion:stage[0],finalist:knockout.at(-1)?.loser,swiss:records,knockout,field};
}
export function finishProPhase(g,rng,power){
 const t=ensureProCircuit(g);if(!t)throw Error('1군 선수만 대회에 참가할 수 있습니다.');
 let report={phase:t.phase,year:t.year,title:PHASE_NAMES[t.phase],details:[],standings:[],qualified:false,won:false};
 if(t.phase==='lck'){
  const road=roadToMSI(t.standings,g,rng,power);
  t.msiSeeds=road.seeds;t.qualifiedMSI=t.msiSeeds.includes(g.career.team);
  report={...report,standings:t.standings,road:road.matches,qualifiers:t.msiSeeds,qualified:t.qualifiedMSI,details:[`Road to MSI: ${t.msiSeeds.join(' / ')}`]};
 }else if(t.phase==='msi'){
  const result=tournamentDoubleElim(msiField(t),g,rng,power);
  t.msiChampion=result.champion;t.msiFinalist=result.runnerUp;
  if(result.champion===g.career.team){t.msiTitles++;report.won=true;}
  const domestic=simulateSummerAndPlayoffs(t,g,rng,power);
  t.playoffs=domestic.seeds;t.finalStandings=domestic.ranked;
  // Worlds LCK 기본 3팀. MSI 우승팀 자동출전은 자국 플레이오프 진출 시에만 유지.
  let seeds=domestic.seeds.slice(0,3);
  // LCK 기본 3장 + MSI 우승팀의 플레이오프 자격 + 준우승 지역 추가 시드.
  const msiLckWinner=t.msiChampion&&order.includes(t.msiChampion)?t.msiChampion:null;
  const additional=()=>domestic.seeds.find(x=>!seeds.includes(x));
  if(msiLckWinner&&domestic.playoffTeams.includes(msiLckWinner)){
   const id=seeds.includes(msiLckWinner)?additional():msiLckWinner;
   if(id)seeds=unique([...seeds,id]);
  }
  if(t.msiFinalist&&order.includes(t.msiFinalist)){
   const id=additional();if(id)seeds=unique([...seeds,id]);
  }
  t.worldsSeeds=seeds.slice(0,5);t.qualifiedWorlds=t.worldsSeeds.includes(g.career.team);
  report={...report,qualified:t.qualifiedMSI,won:report.won,msiChampion:result.champion,msiRunner:result.runnerUp,
   bracket:result.matches,standings:domestic.ranked,lckChampion:domestic.bracket.champion,worldsSeeds:t.worldsSeeds,qualifiedWorlds:t.qualifiedWorlds,
   details:[`MSI 우승: ${result.champion}`,`LCK 플레이오프: ${domestic.seeds.slice(0,3).join(' / ')}`,`Worlds 출전권: ${t.worldsSeeds.join(' / ')}`]};
 }else{
  const result=simulateWorlds(t,g,rng,power);
  const won=t.qualifiedWorlds&&result.champion===g.career.team;
  t.worldsChampion=result.champion;
  t.worldsWins+=(won?1:0);
  t.worldsStreak=won?t.worldsStreak+1:0;
  report={...report,qualified:t.qualifiedWorlds,won,champion:result.champion,finalist:result.finalist,
    swiss:result.swiss,knockout:result.knockout,participants:result.field,
    streak:t.worldsStreak,details:[`월드 챔피언: ${result.champion}`,won?`연속 우승 ${t.worldsStreak}년`:'올해 Worlds 연속 우승 기록 종료']};
 }
 t.currentReport=report;
 t.history.push({year:t.year,phase:t.phase,qualified:report.qualified,won:report.won,champion:report.champion||report.msiChampion||null,
  place:t.standings.find(x=>x.teamId===g.career.team)?.place||null});
 return report;
}
export function advanceProPhase(g){
 const t=ensureProCircuit(g);
 const i=PRO_PHASES.indexOf(t.phase);
 if(i===2){t.year++;t.phase='lck';t.rounds=[];t.matches=[];t.standings=[];t.seasonResults=[];t.msiSeeds=[];t.worldsSeeds=[];t.qualifiedMSI=false;t.qualifiedWorlds=false;t.msiChampion=null;t.msiFinalist=null;t.finalStandings=null;}
 else t.phase=PRO_PHASES[i+1];
 t.currentReport=null;
 return t;
}
