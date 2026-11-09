import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 TIERS,createGame,POSITIONS,TRAININGS,winChance,scorePower,startTraining,chooseEvent,
 meetsRequirements,continueFromResult,chooseGate,acceptOffer,rejectOffer,careerScore,marketValue
} from '../src/engine.js';
const events=JSON.parse(readFileSync(new URL('../src/data/events.json',import.meta.url)));
const zero=()=>0;
const high=()=>.99;

test('기획서의 티어 7종, 포지션 5종, 훈련 4종, 이벤트 20개 이상',()=>{
 assert.deepEqual(TIERS.map(t=>t.name),['아이언','브론즈','실버','골드','마스터','그랜드마스터','챌린저']);
 assert.equal(POSITIONS.length,5);assert.equal(TRAININGS.length,4);assert.ok(events.length>=20);
});
test('미드 포지션은 라인전과 맵 리딩이 +5, 시작 상태가 정확',()=>{
 const g=createGame('테스트','mid');
 assert.equal(g.stats.lane,15);assert.equal(g.stats.map,15);
 assert.equal(g.stats.fight,10);assert.equal(g.status.stamina,100);
 assert.equal(g.player.age,17);assert.equal(g.rank.lp,0);
});
test('승률 계산에 컨디션이 적용되고 상하한 15%~85% 유지',()=>{
 assert.ok(Math.abs(winChance(20,15,70)-.56)<.000001);
 assert.equal(winChance(-1000,1000,0),.15);
 assert.equal(winChance(1000,-1000,100),.85);
});
test('솔로랭크 훈련은 10판 처리와 티어 승급을 제공',()=>{
 let g=createGame('승리의 신인','mid');
 g=startTraining(g,'solo',[],zero);
 assert.equal(g.scene,'result');
 assert.equal(g.lastResult.rank.wins,10);
 assert.equal(g.lastResult.rank.losses,0);
 assert.equal(g.rank.tier,1);
 assert.equal(g.rank.lp,80);
 assert.equal(g.status.stamina,85);
 assert.equal(g.status.condition,65);
});
test('영상 분석과 휴식, 연습생 잠금 체크',()=>{
 let g=createGame('체력관리','support');
 assert.throws(()=>startTraining(g,'team',[],high),/잠긴 훈련/);
 g=startTraining(g,'study',[],high);
 assert.equal(g.stats.map,17); // 서포터 시작 맵 리딩 15
 assert.equal(g.stats.champ,11);
 assert.equal(g.status.stamina,92);
 g=continueFromResult(g,high);
 g=startTraining(g,'rest',[],high);
 assert.equal(g.status.stamina,100);
 assert.equal(g.status.condition,85);
});
test('이벤트 조건부 선택 잠금 및 실제 적용',()=>{
 const event=events.find(x=>x.id==='event_slump_01');
 let g=createGame('슬럼프','mid');
 g.player.stage='academy';g.status.condition=20;
 g.pending={trainingId:'rest',season:1,week:1,before:{stats:{...g.stats},status:{...g.status},rank:{...g.rank}},eventName:event.title};
 g.scene='event';g.pendingEvent=event.id;
 assert.equal(meetsRequirements(g,event.choices[2].requires),false);
 assert.throws(()=>chooseEvent(g,events,2,high),/선택 조건/);
 g=chooseEvent(g,events,0,high);
 assert.equal(g.scene,'result');assert.equal(g.career.slumpRecovered,1);
 assert.equal(g.pendingEvent,null);
});
test('8주차에는 시즌 결산과 승격 테스트, 제안 수락을 거침',()=>{
 let g=createGame('이적의 별','mid');
 g.rank.tier=1;g.stats.lane=25;g.stats.map=25;g.career.week=8;
 g=startTraining(g,'study',[],high);
 g=continueFromResult(g,high);
 assert.equal(g.career.season,2);
 assert.equal(g.career.week,1);
 assert.equal(g.scene,'gate');
 g=chooseGate(g,'focus',zero);
 assert.equal(g.scene,'market');assert.ok(g.offers.length>0);
 const choice=g.offers[0];g=acceptOffer(g,choice.id);
 assert.equal(g.scene,'main');assert.equal(g.player.stage,'trainee');assert.ok(g.career.contractRemaining>=1);
 assert.equal(g.career.team,choice.teamId);
});
test('프로 계약 만료 후 제안이 없으면 은퇴한다',()=>{
 let g=createGame('노장','top');
 g.player.stage='pro';g.player.age=35;g.career.team='t1';g.career.contractRemaining=1;
 g.career.salary=12;g.career.week=8;
 g=startTraining(g,'rest',[],high);
 assert.equal(g.scene,'result');
 g=continueFromResult(g,high);
 assert.equal(g.scene,'ending');
 assert.equal(g.offers.length,0);
 assert.ok(g.ending?.grade);
 assert.equal(g.career.totalSalary,12);
});
test('이적 제안을 모두 거절하면 은퇴',()=>{
 let g=createGame('거절','mid');g.player.stage='trainee';g.career.team='geng';g.marketTarget='trainee';
 g.scene='market';g.offers=[{id:'one',teamId:'t1',seasons:2,salary:2,targetStage:'trainee'}];
 g=rejectOffer(g,'one');assert.equal(g.scene,'ending');assert.ok(g.ending.reason.includes('거절'));
});
test('시장가치와 커리어 점수는 수치형 지표로 계산',()=>{
 let g=createGame('선수','bot');const a=marketValue(g);
 g.player.age=32;const b=marketValue(g);
 assert.ok(b<a);assert.ok(careerScore(g)>=0);
});
