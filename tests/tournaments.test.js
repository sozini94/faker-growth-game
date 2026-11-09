import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,startTraining,continueFromResult,continueFromTournament,migrateGame,careerGrade} from '../src/engine.js';
import {initProCircuit,runProWeek,finishProPhase,advanceProPhase,PHASE_NAMES,simulateLckPlayoffs} from '../src/tournaments.js';
const random=(()=>{let seed=712367;return()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};})();
function pro(name='프로',team='t1'){
 const g=createGame(name,'mid');g.player.stage='pro';g.career.team=team;g.career.contractRemaining=10;g.proCircuit=initProCircuit(g);return g;
}
function playSeason(g){
 for(let k=0;k<3;k++){
  g=startTraining(g,'study',[],random);
  assert.equal(g.scene,'result');
  g=continueFromResult(g,random);
  if(k<2)assert.equal(g.scene,'main');
 }
 assert.equal(g.scene,'tournament');return g;
}
test('2026년 대회 순서: LCK → MSI → Worlds, 한 대회는 3주',()=>{
 let g=pro();assert.deepEqual(Object.keys(PHASE_NAMES),['lck','msi','worlds']);
 for(const phase of ['lck','msi','worlds']){
  assert.equal(g.proCircuit.phase,phase);
  g=playSeason(g);
  assert.equal(g.proCircuit.currentReport.phase,phase);
  g=continueFromTournament(g,random);
 }
 assert.equal(g.proCircuit.year,2);assert.equal(g.proCircuit.phase,'lck');assert.equal(g.player.age,18);
});
test('LCK 10팀 단일라운드 45경기, 각 팀 9경기, 1~10위',()=>{
 let g=pro();g.career.week=1;
 for(let week=1;week<=3;week++){
  g.career.week=week;const weekResult=runProWeek(g,random,40);
  assert.equal(weekResult.played.length,3);
 }
 assert.equal(g.proCircuit.matches.length,45);
 assert.equal(g.proCircuit.standings.length,10);
 assert.deepEqual(g.proCircuit.standings.map(x=>x.place),[1,2,3,4,5,6,7,8,9,10]);
 assert.ok(g.proCircuit.standings.every(x=>x.games===9));
 const r=finishProPhase(g,random,40);
 assert.equal(r.road.length,5);
 assert.equal(r.qualifiers.length,2);
 assert.notEqual(r.qualifiers[0],r.qualifiers[1]);
});
test('MSI 본선 11팀, 탈락 팀은 진출로 표시되지 않음',()=>{
 let g=pro('하위팀','dn');
 for(let w=1;w<=3;w++){g.career.week=w;runProWeek(g,random,20);}
 const lck=finishProPhase(g,random,20);
 assert.equal(lck.qualified,lck.qualifiers.includes('dn'));
 advanceProPhase(g);
 const msi=finishProPhase(g,random,20);
 assert.equal(msi.qualified,lck.qualifiers.includes('dn'));
 assert.equal(msi.worldsSeeds.includes('dn'),msi.qualifiedWorlds);
});
test('Worlds 출전 팀 19개와 8강·4강·결승 7개의 토너먼트 결과',()=>{
 let g=pro();for(let w=1;w<=3;w++){g.career.week=w;runProWeek(g,random,60);}
 finishProPhase(g,random,60);advanceProPhase(g);finishProPhase(g,random,60);advanceProPhase(g);
 const r=finishProPhase(g,random,60);
 assert.equal(r.participants.length,19);assert.equal(new Set(r.participants).size,19);
 assert.equal(r.knockout.length,7);
 assert.equal(r.streak, r.won?1:0);
});
test('Worlds 연속 우승 4년이면 페이커 특별 엔딩; 3년은 종료되지 않음',()=>{
 let g=pro();g.scene='tournament';g.proCircuit.phase='worlds';
 g.proCircuit.worldsStreak=3;g.proCircuit.worldsWins=3;
 let next=continueFromTournament(g,random);
 assert.equal(next.scene,'main');assert.equal(next.proCircuit.year,2);
 g.proCircuit.worldsStreak=4;g.proCircuit.worldsWins=4;
 next=continueFromTournament(g,random);
 assert.equal(next.scene,'ending');assert.equal(next.ending.grade,'FAKER');
 assert.equal(careerGrade(next),'FAKER');
 assert.match(next.ending.reason,/4년 연속/);
});
test('기존 v2 저장 데이터가 1군 대회 커리어로 이행됨',()=>{
 let old=pro();old.version=2;delete old.proCircuit;
 const converted=migrateGame(old);
 assert.equal(converted.version,3);assert.equal(converted.proCircuit.phase,'lck');
});

test('LCK 플레이오프 10경기는 실제 대진 승패와 1~6위가 일치한다',()=>{
 const rows=['dk','t1','hle','kt','geng','bnk'].map((teamId,i)=>({teamId,place:i+1}));
 const g=pro('선수','dk');
 const result=simulateLckPlayoffs(rows,g,random,45);
 assert.equal(result.bracket.length,10);
 assert.deepEqual(result.playoffTeams,rows.map(x=>x.teamId));
 assert.equal(new Set(result.placement).size,6);
 assert.equal(result.champion,result.bracket.at(-1).winner);
 assert.equal(result.runnerUp,result.bracket.at(-1).loser);
 assert.equal(result.third,result.bracket.at(-2).loser);
 assert.equal(result.fourth,result.bracket.find(x=>x.stage==='패자조 3라운드').loser);
 assert.deepEqual(result.placement.slice(0,3),[result.champion,result.runnerUp,result.third]);
});
test('MSI 4팀 플레이인과 8팀 본선 기록, LCK 플레이오프 시드가 보고서에 남는다',()=>{
 const g=pro();
 for(let w=1;w<=3;w++){g.career.week=w;runProWeek(g,random,55);}
 finishProPhase(g,random,55);advanceProPhase(g);
 const r=finishProPhase(g,random,55);
 assert.equal(r.msiField.length,11);
 assert.equal(r.msiPlayIn.length,6);
 assert.equal(r.msiBracket.length>0,true);
 assert.equal(r.lckPlayoffs.length,10);
 assert.equal(r.lckPlacement.length,6);
 assert.equal(r.lckChampion,r.lckPlayoffs.at(-1).winner);
 assert.deepEqual(r.worldsSeeds.slice(0,3),r.lckPlacement.slice(0,3));
});
test('Worlds 진출 명단은 19팀이고 LCK 1~3번 시드를 유지한다',()=>{
 const g=pro();for(let w=1;w<=3;w++){g.career.week=w;runProWeek(g,random,52);}
 finishProPhase(g,random,52);advanceProPhase(g);
 const r=finishProPhase(g,random,52);advanceProPhase(g);
 const worlds=finishProPhase(g,random,52);
 assert.equal(worlds.participants.length,19);
 assert.equal(new Set(worlds.participants).size,19);
 assert.ok(r.worldsSeeds.slice(0,3).every(x=>worlds.participants.includes(x)));
});
