/** LCK 2026 season standings scouting patch, non-destructive to custom LP and training rules. */
import {readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
const ep='src/engine.js',mp='src/main.js';
if(!existsSync(ep)||!existsSync(mp))throw Error('package.json, src/engine.js, src/main.js가 있는 폴더에서 실행하세요.');
let e=readFileSync(ep,'utf8'), m=readFileSync(mp,'utf8');
if(e.includes('export const LCK_2026_STANDINGS')){console.log('이미 LCK 스카우트 패치가 적용되어 있습니다.');process.exit(0);}
const replace=(oldValue,newValue,label)=>{if(!e.includes(oldValue))throw Error(`${label} 위치를 찾지 못했습니다. 프로젝트 버전을 확인하세요.`);e=e.replace(oldValue,newValue);};
function replaceFunction(name,newCode){
 const match=new RegExp(`(?:export )?function ${name}\\(`).exec(e);
 if(!match)throw Error(`${name}()을 찾지 못했습니다.`);
 const from=match.index,open=e.indexOf('{',match.index+match[0].length);
 let i=open,depth=0,quote=null,escape=false,template=false;
 for(;i<e.length;i++){
  const c=e[i];if(quote){if(escape)escape=false;else if(c==='\\\\')escape=true;else if(c===quote)quote=null;continue;}
  if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='{')depth++;if(c==='}'&&--depth===0&&c==='}') {i++;break;}
 }
 if(depth!==0)throw Error(`${name}() 범위를 추출하지 못했습니다.`);
 e=e.slice(0,from)+newCode+e.slice(i);
}
const scoutFunctions=`
// 2026 LCK Season 최종 순위: Gen.G, HLE, T1, DK, KT, BFX, NS, BRO, DRX, DN.
// 근거: leaguelab.cc 2026 LCK 정규/플레이오프 및 trixcity.lol 2026 final standings.
// 순위 스냅샷으로, 구단의 실제 영입 의사와는 무관합니다.
export const LCK_2026_STANDINGS=[
  {teamId:'geng',place:1},{teamId:'hle',place:2},{teamId:'t1',place:3},
  {teamId:'dk',place:4},{teamId:'kt',place:5},{teamId:'bnk',place:6},
  {teamId:'ns',place:7},{teamId:'bro',place:8},{teamId:'drx',place:9},{teamId:'dn',place:10},
];
const STAGE_ORDER={student:0,trainee:1,academy:2,pro:3};
/** 순위는 구단 수준, LP/능력치는 선수 수준을 결정하는 게임 규칙입니다. */
export function scoutingOffers(g,rng=Math.random,{renewal=false}={}) {
  const lp=g.rank.lp,power=averageStats(g),v=marketValue(g);
  const current=STAGE_ORDER[g.player.stage]??0;
  const offers=[];
  const eligible=(stage)=>renewal?stage==='pro':STAGE_ORDER[stage]>current;
  const add=(teamId,stage)=>{
    if(!eligible(stage)||offers.some(o=>o.teamId===teamId))return;
    const teamPlace=LCK_2026_STANDINGS.find(t=>t.teamId===teamId)?.place||10;
    const base=stage==='pro'?12:stage==='academy'?3:1;
    const salary=Math.round((base+(11-teamPlace)*base*.13+v*base*.012)*10)/10;
    offers.push({id:'offer_'+g.career.season+'_'+g.career.week+'_'+teamId+'_'+stage,
      teamId,targetStage:stage,place:teamPlace,seasons:roll(rng,1,3),salary,
      flavor:stage==='pro'?'1군 주전 경쟁 기회를 제안합니다.':stage==='academy'?'2군 핵심 전력으로 성장할 선수를 찾습니다.':'연습생 육성 프로젝트에 합류해 주세요.'});
  };
  // 챌린저 800LP에 도달하면 상위 세 팀에서 1군 입단 테스트 제안이 확정됩니다.
  if(lp>=800){['geng','hle','t1'].forEach(id=>add(id,'pro'));}
  // 상위권 그랜드마스터는 중상위 팀에서 1군, 그 밖에는 2군 제안.
  if(lp>=650 && power>=23){['dk','kt'].forEach(id=>add(id,'pro'));}
  if(lp>=400){['bnk','ns','bro'].forEach(id=>add(id,'academy'));}
  if(lp>=250 && power>=18){['drx','dn'].forEach(id=>add(id,'academy'));}
  // 마스터 구간에서는 연습생이 기본이지만, 능력치가 높으면 2군까지 도전합니다.
  if(lp>=100 || power>=18){['drx','dn','bro'].forEach(id=>add(id,'trainee'));}
  if(renewal){
    // 1군 계약 만료 시 기존 성적/시장가치까지 반영합니다.
    if(v>=25){['dk','kt','bnk','ns','bro','drx','dn'].forEach(id=>add(id,'pro'));}
    if(v>=15&&g.career.team)add(g.career.team,'pro');
  }
  return offers.sort((a,b)=>a.place-b.place).slice(0,8);
}
function openScouting(g,rng,{renewal=false}={}){
  const proposals=scoutingOffers(g,rng,{renewal});
  if(!proposals.length){
    if(renewal)return retire(g,'계약이 종료되었지만 새로운 1군 영입 제안이 도착하지 않았다.');
    g.scene='main';return g;
  }
  const highest=proposals.reduce((best,o)=>STAGE_ORDER[o.targetStage]>STAGE_ORDER[best]?o.targetStage:best,proposals[0].targetStage);
  g.pendingGate={fromStage:g.player.stage,toStage:highest,offers:proposals,renewal};
  g.scene='gate';return g;
}
`;
replace("export const STAGES = [",scoutFunctions+"\nexport const STAGES = [",'스카우팅 로직 삽입');
e=e.replace(/export const WEEKS_PER_SEASON\s*=\s*\d+\s*;/,'export const WEEKS_PER_SEASON = 3;');
// Fix most-common team availability (no contracts until offer accepted).
replaceFunction('gateEligibility',`export function gateEligibility(g) {
 return scoutingOffers(g,()=>0.5).length>0;
}`);
replaceFunction('continueFromResult',`export function continueFromResult(state,rng=Math.random) {
 if(state.scene!=='result')throw Error('경기 결과 화면이 아닙니다.');
 const g=copy(state);g.career.totalTurns++;
 const seasonEnd=g.career.week>=WEEKS_PER_SEASON;
 if(!seasonEnd){g.career.week++;}
 else {
  seasonAchievements(g,rng);
  if(g.career.team&&g.career.contractRemaining>0){g.career.totalSalary+=g.career.salary;g.career.contractRemaining--;}
  ageSeason(g);g.career.season++;g.career.week=1;
  changeEffects(g,{stamina:12,condition:8});syncValue(g);
 }
 const renewal=g.player.stage==='pro'&&g.career.contractRemaining<=0;
 if(renewal)return openScouting(g,rng,{renewal:true});
 if(g.player.stage!=='pro'){
  const proposals=scoutingOffers(g,()=>0.5);
  if(proposals.length)return openScouting(g,rng);
  if(seasonEnd&&g.player.stage!=='student'&&g.career.contractRemaining<=0)
   return retire(g,'계약이 만료되었고 새로운 영입 제안이 도착하지 않았다.');
 }
 g.scene='main';return g;
}`);
replaceFunction('chooseGate',`export function chooseGate(state,option,rng=Math.random) {
 if(state.scene!=='gate'||!state.pendingGate)throw Error('진행 중인 입단 테스트가 없습니다.');
 const g=copy(state),gate=g.pendingGate;
 if(option==='skip'){
  g.pendingGate=null;
  if(gate.renewal)return retire(g,'계약 만료 후 입단 테스트를 포기했습니다.');
  g.scene='main';return g;
 }
 let prob=Math.min(.95,Math.max(.35,.65+(g.rank.lp/800)*.2+(averageStats(g)-20)*.005));
 if(option==='teamwork'){
  if(g.status.teamwork<20)throw Error('팀워크 20 이상이 필요합니다.');
  prob=Math.min(.98,prob+.1);
 }
 if(option==='focus')changeEffects(g,{stamina:-10,condition:-6});
 // 챌린저는 상위 세 팀의 1군 영입 테스트를 항상 통과하도록 합니다.
 const passed=g.rank.lp>=800||rng()<prob;
 g.pendingGate=null;
 if(passed){
  g.offers=gate.offers||scoutingOffers(g,rng,{renewal:Boolean(gate.renewal)});
  g.marketTarget=gate.toStage;g.marketMandatory=Boolean(gate.renewal);
  g.scene='market';g.career.gateMessage='테스트 합격! 현재 LP와 실력에 맞는 영입 제안이 도착했습니다.';
  return g;
 }
 g.career.gateFailures++;g.career.gateMessage='입단 테스트에서 탈락했습니다. 다음 주 또는 다음 시즌에 재도전하세요.';
 if(gate.renewal)return retire(g,'계약 만료 후 입단 테스트에 실패하여 소속팀을 찾지 못했습니다.');
 g.scene='main';return g;
}`);
replaceFunction('rejectOffer',`export function rejectOffer(state,offerId) {
 if(state.scene!=='market')throw Error('이적 시장 화면이 아닙니다.');
 const g=copy(state);g.offers=g.offers.filter(o=>o.id!==offerId);
 if(!g.offers.length){
  if(g.marketMandatory|| (g.player.stage!=='student'&&g.career.contractRemaining<=0))
   return retire(g,'모든 영입 제안을 거절했고, 계약이 없어 은퇴하게 되었다.');
  g.scene='main';g.marketTarget=null;g.marketMandatory=false;
  g.career.gateMessage='이번 영입 제안을 모두 거절했습니다. 기존 커리어를 계속합니다.';
 }
 return g;
}`);
replace("pending:null,pendingEvent:null,pendingGate:null,offers:[],marketTarget:null,lastResult:null", "pending:null,pendingEvent:null,pendingGate:null,offers:[],marketTarget:null,marketMandatory:false,lastResult:null",'초기 상태');
replace("g.offers=[];g.marketTarget=null;g.scene='main';", "g.offers=[];g.marketTarget=null;g.marketMandatory=false;g.scene='main';",'입단 수락 상태');
// Adding team order and mixed contract levels to the market page.
if(!m.includes('const g=game,target=stageInfo(g.marketTarget);'))throw Error('marketScreen()을 찾지 못했습니다.');
m=m.replace('const g=game,target=stageInfo(g.marketTarget);','const g=game,target=stageInfo(g.marketTarget);');
m=m.replace('${target.name} 무대에서 새로운 계약을 체결하세요.','현재 랭크와 능력치에 맞는 구단 제안을 선택하세요.');
m=m.replace('${target.name} · ${h(o.flavor)}','2026 LCK ${o.place||"-"}위 · ${stageInfo(o.targetStage).name} · ${h(o.flavor)}');
m=m.replace('VERSION,TIERS,STATS,POSITIONS,TEAMS,STAGES,TRAININGS,', 'VERSION,TIERS,STATS,POSITIONS,TEAMS,LCK_2026_STANDINGS,STAGES,TRAININGS,');
m=m.replace('TEAMS.slice(0,5).map(t=>', 'LCK_2026_STANDINGS.slice(0,5).map(r=>TEAMS.find(t=>t.id===r.teamId)).map(t=>');
m=m.replace("labelHeading('⚑','LCK 팀들','실제 구단 로고 · 가상 계약')", "labelHeading('⚑','2026 LCK 최종 상위 팀','실제 구단 로고 · 가상 계약')");
m=m.replace('4주 시즌 동안 성장하세요.', '3주 시즌 동안 성장하세요.');
m=m.replace('4주 / 매주 훈련 한 번 선택', '3주 / 매주 훈련 한 번 선택');
m=m.replace('제안을 모두 거절하면 남은 계약이 없어 은퇴 처리됩니다. 신중하게 선택하세요.', '${g.marketMandatory|| (g.player.stage!==\'student\'&&g.career.contractRemaining<=0)?\'모든 제안을 거절하면 계약 만료로 은퇴하게 됩니다.\':\'모든 제안을 거절해도 학생 또는 현재 소속팀으로 계속 진행합니다.\'}');
m=m.replace('티어와 능력치는 조건을 충족했습니다. 마지막 테스트에서 실력을 증명하세요.', '랭크와 능력치를 기준으로 영입 제안이 도착했습니다. 테스트 통과 후 1군·2군·연습생 제안 중 직접 선택하세요.');
m=m.replace('이번 도전은 미룬다</b><small>현재 커리어 단계 유지 · 다음 시즌 재도전', '이번 도전은 미룬다</b><small>현재 커리어 단계 유지 · 다음 주 또는 다음 시즌 재도전');
m=m.replace('일정 티어와 능력치를 달성하고 시즌 종료 시 승격 테스트에 합격해야 합니다.', '매주 또는 시즌 결산 후 LP와 능력치를 기준으로 구단 스카우트가 옵니다. 챌린저는 2026 LCK 상위 3개 팀 1군 테스트를 받을 수 있습니다.');
m=m.replace('연습생에서 전설이 되기까지','학생에서 1군까지, 실력으로 증명하기');
m=m.replace('연습생 → 2군 → 1군으로 승격하며','실력에 따라 연습생·2군·1군 제안을 받으며');
m=m.replace('목표</b> · 17세 학생으로 시작해 연습생 → 2군 → 1군을 거쳐', '목표</b> · 17세 학생으로 시작해 연습생·2군을 건너뛰고 1군에 직행할 수도 있으며');
// Preserve original project custom adjustments except the explicit scouting functions.
const tp='tests/engine.test.js';
if(existsSync(tp)){
 let tests=readFileSync(tp,'utf8');
 // 고LP가 되면 곧바로 스카우트 화면으로 넘어가므로 기존 LP 테스트의 선수는 계약 중 1군으로 만듭니다.
 tests=tests.replace("let g=createGame('승급','top');\n g.rank.lp=390;", "let g=createGame('승급','top');g.player.stage='pro';g.career.team='t1';g.career.contractRemaining=3;\n g.rank.lp=390;");
 tests=tests.replace("한 시즌 4주", "한 시즌 3주").replace("assert.equal(WEEKS_PER_SEASON,4)","assert.equal(WEEKS_PER_SEASON,3)")
  .replace("test('4주차 시즌 종료","test('3주차 시즌 종료").replaceAll('g.career.week=4;','g.career.week=3;')
  .replace('assert.equal(migrated.career.week,4)','assert.equal(migrated.career.week,3)');
 copyFileSync(tp,tp+'.before-scout.bak');writeFileSync(tp,tests);
}
copyFileSync(ep,ep+'.before-scout.bak');copyFileSync(mp,mp+'.before-scout.bak');
writeFileSync(ep,e);writeFileSync(mp,m);
const gp='.gitignore';if(existsSync(gp)){let gi=readFileSync(gp,'utf8');if(!gi.includes('*.before-scout.bak'))writeFileSync(gp,gi+'\n*.before-scout.bak\n');}
console.log('LCK 2026 순위 기반 영입 시스템 적용 완료. npm test / npm run build로 검증해 주세요.');
