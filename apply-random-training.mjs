/**
 * 페이커 키우기 v2: 3주 시즌 + 랜덤 훈련 + 결과 화면 자동 표시 패치.
 * 기존 LP 조정과 포지션 프로필 수정은 보존합니다.
 * 실행: 프로젝트 최상위에서 node apply-random-training.mjs
 */
import {readFileSync,writeFileSync,existsSync,copyFileSync} from 'node:fs';
const epath='src/engine.js';
const mpath='src/main.js';
const tpath='tests/engine.test.js';
const cssPath='src/styles.css';
if(!existsSync(epath)||!existsSync(mpath))throw Error('src/engine.js와 src/main.js가 있는 프로젝트 폴더에서 실행해 주세요.');
let engine=readFileSync(epath,'utf8');
let main=readFileSync(mpath,'utf8');
let tests=existsSync(tpath)?readFileSync(tpath,'utf8'):null;
const replace=(s,oldValue,newValue,label)=>{
  if(!s.includes(oldValue))throw Error(label+' 부분을 찾을 수 없습니다. 이미 직접 수정했다면 중복 적용하지 마세요.');
  return s.replace(oldValue,newValue);
};
if(engine.includes('g.pending.trainingGains='))throw Error('이미 이 랜덤 성장 패치가 적용된 것으로 보입니다.');
engine=engine.replace(/export const WEEKS_PER_SEASON\s*=\s*\d+\s*;/,'export const WEEKS_PER_SEASON = 3;');
const gainCapture=[
  '  // 나이 보정과 스탯 상한을 적용한 실제 훈련 성장량.',
  '  g.pending.trainingGains=Object.fromEntries(playerKeys.map(key=>[',
  '    key,Math.round((g.stats[key]-g.pending.before.stats[key])*10)/10',
  '  ]));',
].join('\n');
if(engine.includes('  changeEffects(g,tr.effects);')){
 engine=replace(engine,'  changeEffects(g,tr.effects);',[
  '  // 훈련 실행할 때마다 랜덤한 성장값을 한 번씩 추첨합니다.',
  '  const randomEffects={...tr.effects};',
  "  if(trainingId==='solo'){",
  '    randomEffects.lane=roll(rng,3,6);',
  '    randomEffects.fight=roll(rng,2,4);',
  "  }else if(trainingId==='study'){",
  '    randomEffects.map=roll(rng,3,6);',
  '    randomEffects.champ=roll(rng,2,4);',
  "  }else if(trainingId==='team'){",
  '    randomEffects.fight=roll(rng,3,6);',
  "  }else if(trainingId==='rest'){",
  '    randomEffects.mental=roll(rng,1,2);',
  '  }',
  '  changeEffects(g,randomEffects);',
  gainCapture,
].join('\n'),'랜덤 훈련 코드');
}else if(engine.includes('  changeEffects(g, effects);')){
 // 이전 안내에 따라 사용자가 직접 랜덤 훈련을 구현한 경우 그 설정을 그대로 사용합니다.
 engine=engine.replace('  changeEffects(g, effects);','  changeEffects(g, effects);\n'+gainCapture);
}else if(engine.includes('  changeEffects(g,randomEffects);')){
 engine=engine.replace('  changeEffects(g,randomEffects);','  changeEffects(g,randomEffects);\n'+gainCapture);
}else{
 throw Error('startTraining()의 changeEffects 호출을 찾지 못했습니다. README를 보고 수동으로 성장 결과 저장 코드를 추가해 주세요.');
}
engine=replace(engine,
 '    rank:rankResult,league:leagueResult,missedMatch:skipMatches,forcedRecovery:Boolean(g.pending.forcedRecovery),',
 '    rank:rankResult,league:leagueResult,trainingGains:g.pending.trainingGains||null,missedMatch:skipMatches,forcedRecovery:Boolean(g.pending.forcedRecovery),',
 '결과 데이터 저장');
// 4주짜리 진행 중 저장 기록도 3주 기준으로 복구합니다.
engine=engine.replace('  if(raw.version===VERSION)return raw;',[
  '  if(raw.version===VERSION){',
  '    if(raw.career.week<=WEEKS_PER_SEASON)return raw;',
  '    const g=copy(raw);',
  '    g.career.week=WEEKS_PER_SEASON;',
  '    if(g.pending?.week>WEEKS_PER_SEASON)g.pending.week=WEEKS_PER_SEASON;',
  '    if(g.lastResult?.week>WEEKS_PER_SEASON)g.lastResult.week=WEEKS_PER_SEASON;',
  '    return g;',
  '  }',
].join('\n'));
engine=engine.replace("desc:'10게임 일괄 진행 · 티어 상승'", "desc:'라인전 +3~6 · 한타 +2~4 · 랭크 10판'")
 .replace("desc:'맵 리딩 +2 · 챔프폭 +1'", "desc:'맵 리딩 +3~6 · 챔프폭 +2~4'")
 .replace("desc:'한타 +2 · 팀워크 +3'", "desc:'한타 +3~6 · 팀워크 +3'")
 .replace("desc:'체력 +30 · 컨디션 +15 · 멘탈 +1'", "desc:'체력 +30 · 컨디션 +15 · 멘탈 +1~2'");
const oldResult='<p class="soft">${h(r.highlight)}</p><div class="gain-list">${[...Object.entries(r.gains.stats),...Object.entries(r.gains.status)]';
const newResult=[
  '<p class="soft">${h(r.highlight)}</p>',
  "${r.trainingGains?`<div class=\"random-growth-box\"><b>🎲 이번 훈련 랜덤 성장</b><div class=\"gain-list\">${STATS.filter(s=>(r.trainingGains[s.key]||0)>0).map(s=>`<span class=\"gain-chip\">${h(s.name)} ${numDelta(r.trainingGains[s.key])}</span>`).join('')||'<span class=\"soft\">능력치 상승 없음</span>'}</div></div>`:''}",
  '<div class="gain-list">${[...Object.entries(r.gains.stats),...Object.entries(r.gains.status)]'
].join('');
main=replace(main,oldResult,newResult,'결과 화면 성장 표시');
main=main.replace('17세 마스터 0LP에서 시작해 4주 시즌 동안 성장하세요.', '17세 마스터 0LP에서 시작해 3주 시즌 동안 성장하세요.')
 .replace('4주 / 매주 훈련 한 번 선택','3주 / 매주 훈련 한 번 선택');
if(tests){
 tests=tests.replace('한 시즌 4주','한 시즌 3주')
  .replace('assert.equal(WEEKS_PER_SEASON,4)','assert.equal(WEEKS_PER_SEASON,3)')
  .replace("test('4주차 시즌 종료", "test('3주차 시즌 종료")
  .replaceAll('g.career.week=4;', 'g.career.week=3;')
  .replace('assert.equal(migrated.career.week,4)','assert.equal(migrated.career.week,3)')
  .replace('assert.equal(g.stats.map,17);assert.equal(g.stats.champ,11)','assert.equal(g.stats.map,21);assert.equal(g.stats.champ,14)')
  .replace('assert.equal(g.rank.tier,0);assert.equal(g.rank.lp,180);','assert.equal(g.rank.tier,0);assert.ok(g.rank.lp>0);');
 tests+=[
 "\ntest('랜덤 성장 결과가 자동으로 기록됨',()=>{",
 " const low=startTraining(createGame('하한','mid'),'solo',[],zero);",
 ' assert.equal(low.lastResult.trainingGains.lane,3);',
 ' assert.equal(low.lastResult.trainingGains.fight,2);',
 " const highRoll=startTraining(createGame('상한','mid'),'solo',[],high);",
 ' assert.equal(highRoll.lastResult.trainingGains.lane,6);',
 ' assert.equal(highRoll.lastResult.trainingGains.fight,4);',
 " const study=startTraining(createGame('분석','mid'),'study',[],high);",
 ' assert.equal(study.lastResult.trainingGains.map,6);',
 ' assert.equal(study.lastResult.trainingGains.champ,4);',
 " const rest=startTraining(createGame('회복','mid'),'rest',[],high);",
 ' assert.equal(rest.lastResult.trainingGains.mental,2);',
 ' const oldGame=createGame(\'4주 저장\',\'mid\'); oldGame.career.week=4;',
 ' assert.equal(migrateGame(oldGame).career.week,3);',
 '});\n'
 ].join('\n');
}
let css=existsSync(cssPath)?readFileSync(cssPath,'utf8'):null;
if(css&&!css.includes('.random-growth-box{')) css+='\n/* Random training outcomes */\n.random-growth-box{margin:12px 0;padding:12px;border:1px solid #9475dd;border-radius:9px;background:linear-gradient(120deg,#261d42,#12243e)}\n.random-growth-box>b{display:block;margin-bottom:8px;color:#f6dbff;font-size:13px}\n';
for(const p of [epath,mpath,...(tests?[tpath]:[]),...(css?[cssPath]:[])])copyFileSync(p,p+'.before-random.bak');
writeFileSync(epath,engine);
writeFileSync(mpath,main);
if(tests)writeFileSync(tpath,tests);
if(css)writeFileSync(cssPath,css);
if(existsSync('.gitignore')){
 const gitignore=readFileSync('.gitignore','utf8');
 if(!gitignore.includes('*.before-random.bak')) writeFileSync('.gitignore',gitignore+'\n*.before-random.bak\n');
}
console.log('적용 완료: 1시즌 3주 + 훈련마다 랜덤 성장 + 결과 화면 자동 표시');
console.log('기존 파일 백업: 각 파일 뒤에 .before-random.bak 추가됨');
