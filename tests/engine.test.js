import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 VERSION,TIERS,TEAMS,POSITIONS,TRAININGS,WEEKS_PER_SEASON,RANK_THRESHOLDS,
 createGame,winChance,startTraining,chooseEvent,meetsRequirements,
 continueFromResult,continueFromTournament,chooseGate,acceptOffer,rejectOffer,careerScore,marketValue,
 rankProgress,migrateGame,migrateHallEntry
} from '../src/engine.js';
const events=JSON.parse(readFileSync(new URL('../src/data/events.json',import.meta.url)));
const zero=()=>0;
const high=()=>.99;

test('다이아몬드 시작, 4개 티어와 3주 시즌',()=>{
 assert.equal(VERSION,4);
 assert.equal(WEEKS_PER_SEASON,3);
 assert.deepEqual(TIERS.map(t=>t.name),['다이아몬드','마스터','그랜드마스터','챌린저']);
 assert.deepEqual(RANK_THRESHOLDS,[0,100,500,900]);
 assert.equal(POSITIONS.length,5);
 assert.equal(TRAININGS.length,4);
 assert.ok(events.length>=20);
 assert.ok(TIERS.every(t=>t.logo.includes('ranked-emblem/emblem-')));
 assert.ok(TEAMS.every(t=>t.logo.startsWith('https://')));
});
test('초기 미드 스탯과 다이아몬드 0LP',()=>{
 const g=createGame('테스트','mid');
 assert.equal(g.stats.lane,15);assert.equal(g.stats.map,15);
 assert.equal(g.stats.fight,10);assert.equal(g.status.stamina,100);
 assert.equal(g.player.age,17);assert.equal(g.rank.lp,0);assert.equal(g.rank.tier,0);
});
test('다이아몬드/마스터/그랜드마스터/챌린저 진행도',()=>{
 assert.deepEqual(rankProgress(0),{tier:0,low:0,high:100,percent:0});
 assert.deepEqual(rankProgress(100),{tier:1,low:100,high:500,percent:0});
 assert.deepEqual(rankProgress(500),{tier:2,low:500,high:900,percent:0});
 assert.deepEqual(rankProgress(900),{tier:3,low:900,high:null,percent:100});
});
test('승률 공식 컨디션과 최솟값 15%, 최댓값 85%',()=>{
 assert.ok(Math.abs(winChance(20,15,70)-.56)<.000001);
 assert.equal(winChance(-1000,1000,0),.15);
 assert.equal(winChance(1000,-1000,100),.85);
});
test('솔로랭크 10판, 초기 180LP + 다음 주로 진행',()=>{
 let g=createGame('승리의 신인','mid');
 g=startTraining(g,'solo',[],zero);
 assert.equal(g.scene,'result');assert.equal(g.lastResult.rank.wins,10);
 assert.equal(g.rank.tier,1);assert.ok(g.rank.lp>=100);
 assert.equal(g.status.stamina,85);assert.equal(g.status.condition,65);
 g=continueFromResult(g,high);assert.equal(g.career.week,2);
});
test('LP 100/500/900 기준 승급 및 강등, 다이아 최저 0',()=>{
 let g=createGame('승급','top');g.player.stage='pro';g.career.team='t1';g.career.contractRemaining=3;
 g.rank.lp=490;g.rank.tier=1;g=startTraining(g,'solo',[],zero);
 assert.equal(g.rank.tier,2);assert.equal(g.lastResult.rank.promotion,true);
 g=continueFromResult(g,high);g=continueFromTournament(g,high);g.rank.lp=895;g.rank.tier=2;
 g=startTraining(g,'solo',[],zero);assert.equal(g.rank.tier,3);
 g=continueFromResult(g,high);g=continueFromTournament(g,high);g.rank.lp=1;g.rank.tier=0;
 g=startTraining(g,'solo',[],high);
 assert.equal(g.rank.tier,0);assert.equal(g.rank.lp,0);
});
test('영상 분석, 휴식, 팀 훈련 학생 잠금',()=>{
 let g=createGame('체력관리','support');
 assert.throws(()=>startTraining(g,'team',[],high),/훈련/);
 g=startTraining(g,'study',[],high);
 assert.equal(g.stats.map,21);assert.equal(g.stats.champ,14);assert.equal(g.status.stamina,92);
 g=continueFromResult(g,high);g=startTraining(g,'rest',[],high);
 assert.equal(g.status.stamina,100);assert.equal(g.status.condition,85);
});
test('이벤트 선택 조건 잠금과 적용',()=>{
 const event=events.find(x=>x.id==='event_slump_01');
 let g=createGame('슬럼프','mid');g.player.stage='academy';g.status.condition=20;
 g.pending={trainingId:'rest',season:1,week:1,before:{stats:{...g.stats},status:{...g.status},rank:{...g.rank}},eventName:event.title};
 g.scene='event';g.pendingEvent=event.id;
 assert.equal(meetsRequirements(g,event.choices[2].requires),false);
 assert.throws(()=>chooseEvent(g,events,2,high),/선택 조건/);
 g=chooseEvent(g,events,0,high);assert.equal(g.scene,'result');assert.equal(g.career.slumpRecovered,1);
});
test('체력 0: 즉시 경기 불참 + 다음 주 강제 회복 + 부상',()=>{
 let g=createGame('탈진','mid');g.player.stage='academy';g.career.team='t1';
 g.status.stamina=15;
 g=startTraining(g,'solo',[],high);
 assert.equal(g.scene,'result');assert.equal(g.status.stamina,0);
 assert.equal(g.lastResult.missedMatch,true);assert.equal(g.lastResult.rank,null);assert.equal(g.lastResult.league,null);
 assert.equal(g.career.recoveryTurns,1);assert.ok(g.career.injuryTurns>=1);
 g=continueFromResult(g,high);
 assert.throws(()=>startTraining(g,'solo',[],high),/훈련/);
 g=startTraining(g,'rest',[],high);
 assert.equal(g.lastResult.missedMatch,true);
 assert.equal(g.career.recoveryTurns,0);
 assert.equal(g.status.stamina,40);
 assert.equal(g.status.condition,79);
 assert.equal(g.career.injuryTurns,0);
});
test('컨디션 0: 번아웃으로 경기 불참하고 다음 턴 휴식만',()=>{
 let g=createGame('번아웃','mid');g.player.stage='academy';g.career.team='t1';
 g.status.condition=4;
 g=startTraining(g,'solo',[],high);
 assert.equal(g.status.condition,0);assert.equal(g.lastResult.missedMatch,true);
 assert.equal(g.career.recoveryTurns,1);
 g=continueFromResult(g,high);
 assert.throws(()=>startTraining(g,'study',[],high),/훈련/);
 g=startTraining(g,'rest',[],high);
 assert.equal(g.status.condition,30);assert.equal(g.career.recoveryTurns,0);
});
test('이벤트 결과가 체력 0으로 떨어져도 강제 휴식 처리',()=>{
 const ev={id:'injury_zero_test',title:'고갈',choices:[{label:'무리',effects:{stamina:-100}}]};
 let g=createGame('이벤트소진','top');g.player.stage='pro';g.career.team='t1';
 g.pending={trainingId:'solo',week:1,season:1,before:{stats:{...g.stats},status:{...g.status},rank:{...g.rank}}};
 g.scene='event';g.pendingEvent=ev.id;
 g=chooseEvent(g,[ev],0,high);
 assert.equal(g.lastResult.rank,null);assert.equal(g.lastResult.league?.played.length,0);assert.equal(g.career.recoveryTurns,1);
});
test('3주차 시즌 종료 후 승격 테스트 및 계약 제안',()=>{
 let g=createGame('이적의 별','mid');g.stats.lane=25;g.stats.map=25;g.career.week=3;
 g=startTraining(g,'study',[],high);g=continueFromResult(g,high);
 assert.equal(g.career.season,2);assert.equal(g.career.week,1);assert.equal(g.scene,'gate');
 g=chooseGate(g,'focus',zero);
 assert.equal(g.scene,'market');assert.ok(g.offers.length>0);
 const choice=g.offers[0];g=acceptOffer(g,choice.id);
 assert.equal(g.scene,'main');assert.equal(g.player.stage,'trainee');assert.ok(g.career.contractRemaining>=1);
});
test('계약 만료 후 제안이 없으면 은퇴',()=>{
 let g=createGame('노장','top');
 g.player.stage='pro';g.player.age=35;g.career.team='t1';g.career.contractRemaining=1;
 g.career.salary=12;g.career.week=3;
 g=startTraining(g,'rest',[],high);g=continueFromResult(g,high);
 assert.equal(g.scene,'tournament');assert.equal(g.proCircuit.phase,'lck');
});
test('이적 제안 거절 시 은퇴 처리',()=>{
 let g=createGame('거절','mid');g.player.stage='trainee';g.career.team='geng';g.marketTarget='trainee';
 g.scene='market';g.offers=[{id:'one',teamId:'t1',seasons:2,salary:2,targetStage:'trainee'}];
 g=rejectOffer(g,'one');assert.equal(g.scene,'ending');assert.ok(g.ending.reason.includes('거절'));
});
test('1.0 저장 데이터 및 명예의 전당 기록 이전',()=>{
 const old=createGame('기존','top');old.version=1;old.rank={tier:5,lp:65,highest:6};old.career.week=7;
 const migrated=migrateGame(old);
 assert.equal(migrated.version,4);assert.equal(migrated.rank.tier,2);assert.equal(migrated.rank.lp,565);
 assert.equal(migrated.rank.highest,3);assert.equal(migrated.career.week,3);
 assert.equal(old.rank.lp,65);
 assert.equal(migrateHallEntry({highest:6,version:1}).highest,3);
});
test('시장가치 계산과 커리어 점수',()=>{
 let g=createGame('선수','bot');const a=marketValue(g);g.player.age=32;
 assert.ok(marketValue(g)<a);assert.ok(careerScore(g)>=0);
});

test('랜덤 성장 결과가 자동으로 기록됨',()=>{
 const low=startTraining(createGame('하한','mid'),'solo',[],zero);
 assert.equal(low.lastResult.trainingGains.lane,3);
 assert.equal(low.lastResult.trainingGains.fight,2);
 const highRoll=startTraining(createGame('상한','mid'),'solo',[],high);
 assert.equal(highRoll.lastResult.trainingGains.lane,6);
 assert.equal(highRoll.lastResult.trainingGains.fight,4);
 const study=startTraining(createGame('분석','mid'),'study',[],high);
 assert.equal(study.lastResult.trainingGains.map,6);
 assert.equal(study.lastResult.trainingGains.champ,4);
 const rest=startTraining(createGame('회복','mid'),'rest',[],high);
 assert.equal(rest.lastResult.trainingGains.mental,2);
 const oldGame=createGame('4주 저장','mid'); oldGame.career.week=4;
 assert.equal(migrateGame(oldGame).career.week,3);
});

test('v7 마스터/그랜드마스터/챌린저 저장 기록은 v8에서도 티어와 LP 진행도를 보존',()=>{
 for(const [lp,expectedTier] of [[0,1],[399,1],[400,2],[800,3]]){
   const old=createGame('이전기록','mid');old.version=3;old.rank.lp=lp;old.rank.tier=lp>=800?2:lp>=400?1:0;old.rank.highest=old.rank.tier;
   const migrated=migrateGame(old);
   assert.equal(migrated.version,4);assert.equal(migrated.rank.lp,lp+100);assert.equal(migrated.rank.tier,expectedTier);
   assert.equal(migrated.rank.highest,expectedTier);assert.equal(old.rank.lp,lp);
 }
});
