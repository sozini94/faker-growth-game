/** 2026 LCK/MSI/Worlds 자격 구조를 1주/대회 턴으로 압축한 독립 시뮬레이션.
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
// 국제대회에 참가하는 해외 구단의 로고 메타데이터.
// 원본 이미지는 Leaguepedia의 팀 로고 프로필 파일을 참조합니다.
// 링크가 차단/변경되면 게임에서 팀 약칭을 표시합니다.
const logoFile = filename => `https://lol.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;
const logoNames={
 blg:['BLG','Bilibili Gaminglogo profile.png','#e59dff'],
 tes:['TES','Top Esportslogo profile.png','#e0c778'],
 g2:['G2','G2 Esportslogo profile.png','#e7e9ed'],
 kc:['KC','Karmine Corplogo profile.png','#63baff'],
 tl:['TL','Team Liquidlogo profile.png','#7bbdff'],
 fly:['FLY','FlyQuestlogo profile.png','#86d791'],
 tsw:['TSW','Team Secret Whaleslogo profile.png','#9dd9fe'],
 dcg:['DCG','Deep Cross Gaminglogo profile.png','#c29bff'],
 fur:['FUR','FURIAlogo profile.png','#f1f1e8'],
 jdg:['JDG','JD Gaminglogo profile.png','#e6e6e6'],
 fnc:['FNC','Fnaticlogo profile.png','#ffb06b'],
 c9:['C9','Cloud9logo profile.png','#91caff'],
 psg:['PSG','PSG Talonlogo profile.png','#b7c7ed'],
 loud:['LOUD','LOUDlogo profile.png','#a9e78b'],
 wbg:['WBG','Weibo Gaminglogo profile.png','#ed8791'],
 koi:['KOI','Movistar KOIlogo profile.png','#e4a7e9'],
 dig:['DIG','Dignitaslogo profile.png','#e6cf7c'],
 gam:['GAM','GAM Esportslogo profile.png','#e8bc6f'],
};
export const INTERNATIONAL_TEAM_BRANDING=Object.fromEntries(FOREIGN_TEAMS.map(t=>{
 const [short,file,color]=logoNames[t.id];
 return [t.id,{...t,short,color,logo:logoFile(file),logoFile:file}];
}));
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
 // LCK 정규시즌 45경기를 1주에 시뮬레이션합니다.
 // 이전 버전 저장 데이터에 이미 치른 경기가 있으면 남은 라운드만 처리합니다.
 const completedRounds=Math.floor(t.matches.length/5);
 for(const pairings of t.rounds.slice(completedRounds)){
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
/** 상위 6팀 BO5 플레이오프. 매 경기의 패자가 실제로 탈락하는 순서로 1~6위를 확정합니다.
 * 정규시즌 상위 두 팀은 2라운드 직행, 하위 네 팀은 1라운드부터 진행합니다.
 * 게임용 압축 대진이며 2026년 실제 플레이인/레전드·라이즈 편성은 생략합니다.
 */
export function simulateLckPlayoffs(rows,g,rng,power){
 const ids=rows.slice(0,6).map(r=>r.teamId);
 if(ids.length!==6)throw Error('LCK 플레이오프는 6팀이 필요합니다.');
 const log=[];
 const play=(stage,a,b)=>{const m=series(a,b,g,power,rng,5);log.push({...m,stage});return m;};
 const r1a=play('1라운드 · 3위 vs 6위',ids[2],ids[5]);
 const r1b=play('1라운드 · 4위 vs 5위',ids[3],ids[4]);
 const r2a=play('승자조 2라운드 A',ids[0],r1b.winner);
 const r2b=play('승자조 2라운드 B',ids[1],r1a.winner);
 const lower1=play('패자조 1라운드',r1a.loser,r1b.loser);
 const lower2=play('패자조 2라운드',lower1.winner,r2a.loser);
 const lower3=play('패자조 3라운드',lower2.winner,r2b.loser);
 const upperFinal=play('승자조 결승',r2a.winner,r2b.winner);
 const lowerFinal=play('최종 결승 진출전',lower3.winner,upperFinal.loser);
 const grandFinal=play('LCK 결승',upperFinal.winner,lowerFinal.winner);
 const placement=[grandFinal.winner,grandFinal.loser,lowerFinal.loser,lower3.loser,lower2.loser,lower1.loser];
 if(new Set(placement).size!==6)throw Error('플레이오프 순위 계산 실패');
 return {champion:placement[0],runnerUp:placement[1],third:placement[2],fourth:placement[3],
   placement,bracket:log,playoffTeams:ids};
}
function simulateSummerAndPlayoffs(t,g,rng,power){
 const groups=[t.standings.slice(0,5).map(x=>x.teamId),t.standings.slice(5).map(x=>x.teamId)];
 const extras=[];
 for(const ids of groups)for(let repeat=0;repeat<2;repeat++)for(const [i,a] of ids.entries())for(const b of ids.slice(i+1))extras.push(series(a,b,g,power,rng,3));
 const ranked=standings([...t.matches,...extras],order);
 const playoffs=simulateLckPlayoffs(ranked,g,rng,power);
 return {ranked,playoffTeams:playoffs.playoffTeams,seeds:playoffs.placement.slice(0,4),bracket:playoffs};
}
function simulateMsi2026(t,g,rng,power){
 const field=msiField(t); // 2 LCK + 2 each LPL/LEC/LCS/LCP + 1 CBLOL = 11
 const direct=[...t.msiSeeds,'blg','g2','tl','tsw','tes'];
 const playIn=field.filter(id=>!direct.includes(id));
 if(new Set(field).size!==11||direct.length!==7||playIn.length!==4)throw Error('MSI 참가팀 구성 오류');
 const log=[];
 const match=(stage,a,b)=>{const m=series(a,b,g,power,rng,5);log.push({...m,stage});return m;};
 const a=match('플레이인 승자조 1',playIn[0],playIn[1]);
 const b=match('플레이인 승자조 2',playIn[2],playIn[3]);
 const upper=match('플레이인 승자조 결승',a.winner,b.winner);
 const lower=match('플레이인 패자조 1',a.loser,b.loser);
 const lowerFinal=match('플레이인 최종전',lower.winner,upper.loser);
 const piFinal=match('플레이인 진출 결정전',upper.winner,lowerFinal.winner);
 const bracketField=[...direct,piFinal.winner];
 const bracket=tournamentDoubleElim(bracketField,g,rng,power);
 return {champion:bracket.champion,runnerUp:bracket.runnerUp,field,playIn:log,
   bracket:bracket.matches.map((m,i)=>({...m,stage:`본선 BO5 ${i+1}`})),bracketField,playInWinner:piFinal.winner};
}
const unique=x=>[...new Set(x)];
export function buildWorldsField(t){
 // 기본 17팀(5개 지역 각 3팀 + CBLOL 2팀), MSI 성적에 따른 추가 2팀.
 const baseForeign=['blg','tes','jdg','g2','kc','fnc','tl','fly','c9','tsw','dcg','psg','fur','loud'];
 const field=unique([...t.worldsSeeds.slice(0,3),...baseForeign]);
 const regionOf=id=>order.includes(id)?'LCK':FOREIGN_TEAMS.find(x=>x.id===id)?.region;
 const nextForRegion=region=>{
  if(region==='LCK')return t.worldsSeeds.find(id=>!field.includes(id));
  return FOREIGN_TEAMS.find(x=>x.region===region&&!field.includes(x.id))?.id;
 };
 // 우승팀 지역과 차순위 지역에 각 1장을 배정합니다.
 // MSI 결승 양 팀이 같은 지역이면 게임용 차순위 지역 대용으로 LPL을 선택합니다.
 const winnerRegion=regionOf(t.msiChampion);
 let secondRegion=regionOf(t.msiFinalist);
 if(secondRegion===winnerRegion)secondRegion=winnerRegion==='LPL'?'LCK':'LPL';
 for(const region of [winnerRegion,secondRegion]){
  const bonus=nextForRegion(region);
  if(bonus&&!field.includes(bonus))field.push(bonus);
 }
 // 상위 지역 시드 데이터 미설정 시에만 19팀 맞춤 (에셋 데이터의 게임용 예외 처리).
 while(field.length<19){const id=[...t.worldsSeeds,...FOREIGN_TEAMS.map(x=>x.id)].find(x=>!field.includes(x));if(!id)break;field.push(id);}
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
  const result=simulateMsi2026(t,g,rng,power);
  t.msiChampion=result.champion;t.msiFinalist=result.runnerUp;
  if(result.champion===g.career.team){t.msiTitles++;report.won=true;}
  const domestic=simulateSummerAndPlayoffs(t,g,rng,power);
  t.playoffs=domestic.seeds;t.finalStandings=domestic.ranked;
  // LCK 플레이오프 1~3위 기본 시드. MSI 우승 LCK 팀이 PO 진출 시 최저 4번 시드.
  // MSI 준우승 지역이 LCK인 경우에도 지역 보너스 1장. 양쪽 모두 LCK라도 4장으로 제한.
  let seeds=domestic.seeds.slice(0,3);
  const msiWinnerInLck=t.msiChampion&&order.includes(t.msiChampion)&&domestic.playoffTeams.includes(t.msiChampion);
  const lckBonus=msiWinnerInLck||(t.msiFinalist&&order.includes(t.msiFinalist));
  if(lckBonus){
   const fourth=msiWinnerInLck&&!seeds.includes(t.msiChampion)?t.msiChampion:domestic.seeds[3];
   if(fourth&&!seeds.includes(fourth))seeds.push(fourth);
  }
  t.worldsSeeds=seeds.slice(0,5);t.qualifiedWorlds=t.worldsSeeds.includes(g.career.team);
  report={...report,qualified:t.qualifiedMSI,won:report.won,msiChampion:result.champion,msiRunner:result.runnerUp,
   bracket:result.bracket,msiPlayIn:result.playIn,msiBracket:result.bracket,msiField:result.field,
   msiPlayInWinner:result.playInWinner,msiDirect:result.bracketField.filter(x=>x!==result.playInWinner),
   standings:domestic.ranked,lckChampion:domestic.bracket.champion,
   lckPlayoffs:domestic.bracket.bracket,lckPlacement:domestic.bracket.placement,
   worldsSeeds:t.worldsSeeds,qualifiedWorlds:t.qualifiedWorlds,
   details:[`MSI 우승: ${result.champion}`,`LCK 플레이오프: ${domestic.seeds.slice(0,3).join(' / ')}`,`Worlds 출전권: ${t.worldsSeeds.join(' / ')}`]};
 }else{
  const result=simulateWorlds(t,g,rng,power);
  const won=t.qualifiedWorlds&&result.champion===g.career.team;
  t.worldsChampion=result.champion;
  t.worldsWins+=(won?1:0);
  t.worldsStreak=won?t.worldsStreak+1:0;
  report={...report,qualified:t.qualifiedWorlds,won,champion:result.champion,finalist:result.finalist,
    swiss:result.swiss,knockout:result.knockout,participants:result.field,
    streak:t.worldsStreak,totalWins:t.worldsWins,details:[`월드 챔피언: ${result.champion}`,`Worlds 통산 우승 ${t.worldsWins}회 / 6회`,won?`올해 Worlds 우승!`:'다음 대회에서 다시 도전']};
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
