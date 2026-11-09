import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LCK_2026_STANDINGS,createGame,scoutingOffers,startTraining,continueFromResult,chooseGate,acceptOffer,rejectOffer} from '../src/engine.js';
const zero=()=>0,high=()=>.99;
test('LCK 2026 최종 순위 상위권은 GEN, HLE, T1',()=>{
 assert.deepEqual(LCK_2026_STANDINGS.slice(0,3).map(t=>t.teamId),['geng','hle','t1']);
});
test('학생 챌린저 900LP라면 세 팀이 1군으로 직접 영입 제안',()=>{
 let g=createGame('챌린저 신인','mid');g.rank.lp=900;g.rank.tier=3;
 g=startTraining(g,'rest',[],high);g=continueFromResult(g,high);
 assert.equal(g.scene,'gate');assert.equal(g.pendingGate.toStage,'pro');
 g=chooseGate(g,'focus',high);assert.equal(g.scene,'market');
 assert.deepEqual(g.offers.slice(0,3).map(t=>t.teamId),['geng','hle','t1']);
 assert.ok(g.offers.slice(0,3).every(t=>t.targetStage==='pro'));
 const offer=g.offers.find(t=>t.teamId==='t1');g=acceptOffer(g,offer.id);
 assert.equal(g.player.stage,'pro');assert.equal(g.career.team,'t1');
});
test('다이아 0LP 제안 없음, 그랜드마스터는 2군 중심',()=>{
 const g=createGame('마스터','top');assert.equal(scoutingOffers(g,zero).length,0);
 g.rank.lp=500;g.rank.tier=2;
 assert.ok(scoutingOffers(g,zero).some(o=>o.targetStage==='academy'));
 assert.ok(scoutingOffers(g,zero).every(o=>o.targetStage!=='pro'));
});
test('학생은 영입 제안을 모두 거절해도 은퇴하지 않음',()=>{
 let g=createGame('제안 거절','top');g.rank.lp=900;g.rank.tier=3;
 g=startTraining(g,'rest',[],high);g=continueFromResult(g,high);g=chooseGate(g,'focus',high);
 for(const o of [...g.offers])g=rejectOffer(g,o.id);
 assert.equal(g.scene,'main');assert.equal(g.player.stage,'student');
});
test('3주차 결산에서도 영입 테스트가 시작됨',()=>{
 let g=createGame('시즌 결산','top');g.career.week=3;g.rank.lp=900;g.rank.tier=3;
 g=startTraining(g,'rest',[],high);g=continueFromResult(g,high);
 assert.equal(g.career.week,1);assert.equal(g.career.season,2);assert.equal(g.scene,'gate');
});
