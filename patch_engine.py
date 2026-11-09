from pathlib import Path
p=Path('/mnt/data/faker-worlds-v4/src/engine.js')
s=p.read_text()
s="import {initProCircuit,ensureProCircuit,runProWeek,finishProPhase,advanceProPhase,PRO_PHASES,PHASE_NAMES} from './tournaments.js';\n"+s
s=s.replace('export const VERSION = 2;','export const VERSION = 3;')
s=s.replace('    pending:null,pendingEvent:null,pendingGate:null,offers:[],marketTarget:null,marketMandatory:false,lastResult:null,ending:null,history:[],','    proCircuit:null,pending:null,pendingEvent:null,pendingGate:null,offers:[],marketTarget:null,marketMandatory:false,lastResult:null,ending:null,history:[],')
s=s.replace('function simulateLeague(g,rng) {\n  if(g.player.stage===\'student\')return null;', '''function simulateLeague(g,rng) {
  if(g.player.stage==='student')return null;
  if(g.player.stage==='pro'){
    const pro=runProWeek(g,rng,scorePower(g));
    const games=pro.played||[];
    for(const match of games){
      g.career.scoreLog.push(match.victory?1:0);
      if(match.victory){g.career.matchWins++;changeEffects(g,{popularity:2,teamwork:1,condition:-1});}
      else{g.career.matchLosses++;changeEffects(g,{popularity:-1,condition:-2});}
    }
    g.career.scoreLog=g.career.scoreLog.slice(-20);
    return {pro:true,...pro,enemyId:games.at(-1)?.enemyId||null,
      victory:games.length?games.filter(x=>x.victory).length>=Math.ceil(games.length/2):null,
      score:games.length?`${games.filter(x=>x.victory).length}승 ${games.filter(x=>!x.victory).length}패`:'국제 대회 준비',
      mvp:false};
  }''')
s=s.replace('  const leagueResult=skipMatches?null:simulateLeague(g,rng);', '''  const leagueResult=skipMatches?(g.player.stage==='pro'?runProWeek(g,rng,10,true):null):simulateLeague(g,rng);''')
start=s.index('export function continueFromResult(')
end=s.index('\nexport function chooseGate(',start)
s=s[:start]+'''export function continueFromResult(state,rng=Math.random) {
 if(state.scene!=='result')throw Error('경기 결과 화면이 아닙니다.');
 const g=copy(state);g.career.totalTurns++;
 const seasonEnd=g.career.week>=WEEKS_PER_SEASON;
 if(!seasonEnd){
  g.career.week++;
  if(g.player.stage!=='pro'){
   const proposals=scoutingOffers(g,()=>0.5);
   if(proposals.length)return openScouting(g,rng);
  }
  g.scene='main';return g;
 }
 if(g.player.stage==='pro'){
  // 각 3주 시즌이 끝날 때 LCK / MSI / Worlds의 결산 화면을 보여줍니다.
  const t=ensureProCircuit(g);
  const report=finishProPhase(g,rng,scorePower(g));
  if(t.phase==='msi'){
   if(report.standings?.length && report.standings[0].teamId===g.career.team){
    g.career.championships++;t.lckTitles++;
    changeEffects(g,{popularity:10,teamwork:5});
   }
  }
  if(report.won){changeEffects(g,{popularity:13,teamwork:5});}
  g.scene='tournament';return g;
 }
 seasonAchievements(g,rng);
 if(g.career.team&&g.career.contractRemaining>0){g.career.totalSalary+=g.career.salary;g.career.contractRemaining--;}
 ageSeason(g);g.career.season++;g.career.week=1;
 changeEffects(g,{stamina:12,condition:8});syncValue(g);
 const proposals=scoutingOffers(g,()=>0.5);
 if(proposals.length)return openScouting(g,rng);
 if(g.player.stage!=='student'&&g.career.contractRemaining<=0)
  return retire(g,'계약이 만료되었고 새로운 영입 제안이 도착하지 않았다.');
 g.scene='main';return g;
}
/** 대회 결과를 읽고 다음 3주 대회로 진행합니다. 연속 Worlds 4회 우승이면 특별 엔딩입니다. */
export function continueFromTournament(state,rng=Math.random) {
 if(state.scene!=='tournament'||state.player.stage!=='pro')throw Error('대회 결산 화면이 아닙니다.');
 const g=copy(state),t=ensureProCircuit(g);
 if(t.phase==='worlds'&&t.worldsStreak>=4)return retire(g,'Worlds 4년 연속 우승! 당신은 새로운 페이커가 되었습니다.');
 const yearEnded=t.phase==='worlds';
 advanceProPhase(g);
 if(yearEnded){
   // 프로 선수 계약은 1~3년(한 해: LCK/MSI/Worlds 3시즌) 단위로 감소.
   if(g.career.team&&g.career.contractRemaining>0){g.career.totalSalary+=g.career.salary;g.career.contractRemaining--;}
   if(g.player.age>=26){const loss=g.player.age>=29?2:1;g.stats.lane=clamp(g.stats.lane-loss);g.stats.fight=clamp(g.stats.fight-loss);}
   g.player.age++;
 }
 g.career.season++;g.career.week=1;
 changeEffects(g,{stamina:12,condition:8});syncValue(g);
 if(yearEnded&&g.career.contractRemaining<=0)return openScouting(g,rng,{renewal:true});
 g.scene='main';return g;
}
''' + s[end:]
s=s.replace('  g.player.stage=offer.targetStage;g.career.team=offer.teamId;', '''  const enteringPro=g.player.stage!=='pro'&&offer.targetStage==='pro';
  g.player.stage=offer.targetStage;g.career.team=offer.teamId;
  if(enteringPro)g.proCircuit=initProCircuit(g);''')
s=s.replace("  if(sc>=1200)return'GOAT';", "  if(g.proCircuit?.worldsStreak>=4)return'FAKER';\n  if(sc>=1200)return'GOAT';")
s=s.replace("  g.ending={reason,score:careerScore(g),grade:careerGrade(g),path:", "  g.ending={reason,score:careerScore(g),grade:careerGrade(g),worldsWins:g.proCircuit?.worldsWins||0,worldsStreak:g.proCircuit?.worldsStreak||0,path:")
s=s.replace('    salary:g.career.totalSalary,','    salary:g.career.totalSalary,worldsWins:g.proCircuit?.worldsWins||0,worldsStreak:g.proCircuit?.worldsStreak||0,')
# migrate current saves v2 to v3 and maintain old v1 conversion
s=s.replace('  if(raw.version!==1)return null;', '''  if(raw.version===2){
    const g=copy(raw);g.version=VERSION;
    if(g.player.stage==='pro')ensureProCircuit(g);
    if(g.career.week>WEEKS_PER_SEASON)g.career.week=WEEKS_PER_SEASON;
    return g;
  }
  if(raw.version!==1)return null;''')
s=s.replace('  g.version=VERSION;return g;','  g.version=VERSION; if(g.player.stage===\'pro\')ensureProCircuit(g);return g;')
s=s.replace("  if(entry.version===VERSION)return entry;\n  return {...entry,highest:entry.highest>=6?2:entry.highest===5?1:0,version:VERSION};", "  if(entry.version===VERSION)return entry;\n  if(entry.version===2)return {...entry,version:VERSION,worldsWins:entry.worldsWins||0};\n  return {...entry,highest:entry.highest>=6?2:entry.highest===5?1:0,version:VERSION};")
p.write_text(s)
