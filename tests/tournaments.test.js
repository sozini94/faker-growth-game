import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,startTraining,continueFromResult,continueFromTournament,migrateGame,careerGrade} from '../src/engine.js';
import {initProCircuit,runProWeek,finishProPhase,advanceProPhase,PHASE_NAMES,simulateLckPlayoffs} from '../src/tournaments.js';
const random=(()=>{let seed=712367;return()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};})();
function pro(name='프로',team='t1'){
 const g=createGame(name,'mid');g.player.stage='pro';g.career.team=team;g.career.contractRemaining=10;g.proCircuit=initProCircuit(g);return g;
}
function playSeason(g){
 g=startTraining(g,'study',[],random);
 assert.equal(g.scene,'result');
 g=continueFromResult(g,random);
 assert.equal(g.scene,'tournament');
 return g;
}
test('1군 1년: LCK 1주 → MSI 1주 → Worlds 1주',()=>{
 let g=pro();assert.deepEqual(Object.keys(PHASE_NAMES),['lck','msi','worlds']);
 for(const phase of ['lck','msi','worlds']){
  assert.equal(g.proCircuit.phase,phase);
  assert.equal(g.career.week,1);
  g=playSeason(g);
  assert.equal(g.proCircuit.currentReport.phase,phase);
  g=continueFromTournament(g,random);
 }
 assert.equal(g.proCircuit.year,2);assert.equal(g.proCircuit.phase,'lck');assert.equal(g.player.age,18);
 assert.equal(g.career.totalTurns,3);
});
test('LCK 10팀 단일라운드 45경기, 각 팀 9경기, 1~10위',()=>{
 let g=pro();g.career.week=1;
 const weekResult=runProWeek(g,random,40);
 assert.equal(weekResult.played.length,9);
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
 runProWeek(g,random,20);
 const lck=finishProPhase(g,random,20);
 assert.equal(lck.qualified,lck.qualifiers.includes('dn'));
 advanceProPhase(g);
 const msi=finishProPhase(g,random,20);
 assert.equal(msi.qualified,lck.qualifiers.includes('dn'));
 assert.equal(msi.worldsSeeds.includes('dn'),msi.qualifiedWorlds);
});
test('Worlds 출전 팀 19개와 8강·4강·결승 7개의 토너먼트 결과',()=>{
 let g=pro();runProWeek(g,random,60);
 finishProPhase(g,random,60);advanceProPhase(g);finishProPhase(g,random,60);advanceProPhase(g);
 const r=finishProPhase(g,random,60);
 assert.equal(r.participants.length,19);assert.equal(new Set(r.participants).size,19);
 assert.equal(r.knockout.length,7);
 assert.equal(r.streak, r.won?1:0);
});
test('Worlds 6회 통산 우승 시 FAKER 엔딩; 비연속 5회는 종료되지 않음',()=>{
 let g=pro();g.scene='tournament';g.proCircuit.phase='worlds';
 g.proCircuit.worldsStreak=1;g.proCircuit.worldsWins=5;
 let next=continueFromTournament(g,random);
 assert.equal(next.scene,'main');assert.equal(next.proCircuit.year,2);
 g.proCircuit.worldsStreak=1;g.proCircuit.worldsWins=6;
 next=continueFromTournament(g,random);
 assert.equal(next.scene,'ending');assert.equal(next.ending.grade,'FAKER');
 assert.equal(careerGrade(next),'FAKER');
 assert.match(next.ending.reason,/통산 6회/);
});
test('1군 이전은 3주 시즌 그대로 유지된다',()=>{
 let g=createGame('학생','mid');
 g=startTraining(g,'study',[],random);g=continueFromResult(g,random);
 assert.equal(g.career.week,2);assert.equal(g.scene,'main');
});
test('v6 프로 진행 중 저장파일을 1주차로 변환하고 LCK 남은 경기만 처리한다',()=>{
 let old=pro();old.career.week=3;old.proCircuit.rounds=[];
 old.career.week=1;runProWeek(old,random,40);
 old.proCircuit.matches=old.proCircuit.matches.slice(0,15);
 old.career.week=3;
 const migrated=migrateGame(old);
 assert.equal(migrated.career.week,1);
 const r=runProWeek(migrated,random,40);
 assert.equal(migrated.proCircuit.matches.length,45);
 assert.equal(r.standings.length,10);
});
test('기존 v2 저장 데이터가 1군 대회 커리어로 이행됨',()=>{
 let old=pro();old.version=2;delete old.proCircuit;
 const converted=migrateGame(old);
 assert.equal(converted.version,4);assert.equal(converted.proCircuit.phase,'lck');
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
 runProWeek(g,random,55);
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
