/** 게임 밸런스 테스트: 여러 판을 실제 게임 엔진으로 자동 플레이합니다. */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createGame,startTraining,chooseEvent,continueFromResult,chooseGate,acceptOffer,meetsRequirements,POSITIONS,careerScore} from '../src/engine.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const events=JSON.parse(readFileSync(path.join(root,'src/data/events.json'),'utf8'));
const count=Math.min(2000,Math.max(1,Number(process.argv[2]||100)));
let seed=20261109;
const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const record=[];
const failed=[];
for(let i=0;i<count;i++){
 let g=createGame(`sim${i}`,POSITIONS[i%POSITIONS.length].id);
 let n=0;
 try{
  while(g.scene!=='ending'&&n<1200){
   if(g.scene==='main'){
     let action=g.status.stamina<51?'rest':(rng()<.64?'solo':(rng()<.61?'study':'team'));
     if(g.player.stage==='student'&&action==='team')action='study';
     if(g.career.injuryTurns>0&&action==='solo')action='rest';
     g=startTraining(g,action,events,rng);
   } else if(g.scene==='event'){
     const ev=events.find(e=>e.id===g.pendingEvent);
     const options=ev.choices.map((_,i)=>i).filter(i=>meetsRequirements(g,ev.choices[i].requires));
     g=chooseEvent(g,events,options[Math.floor(rng()*options.length)],rng);
   } else if(g.scene==='result')g=continueFromResult(g,rng);
   else if(g.scene==='gate')g=chooseGate(g,rng()<.12?'skip':'focus',rng);
   else if(g.scene==='market')g=acceptOffer(g,g.offers[0].id);
   else throw Error(`알 수 없는 화면 ${g.scene}`);
   n++;
  }
  if(g.scene!=='ending')failed.push({position:g.player.position,step:n,scene:g.scene});
  else record.push({position:g.player.position,age:g.player.age,rank:g.rank.highest,stage:g.player.stage,score:careerScore(g),turns:g.career.totalTurns});
 }catch(e){failed.push({position:g.player.position,error:e.message});}
}
const mean=arr=>arr.length?(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2):'N/A';
console.log(`총 ${count}판 / 은퇴까지 완료 ${record.length}판 / 비정상 종료 ${failed.length}판`);
console.log(`은퇴 나이 평균 ${mean(record.map(r=>r.age))}세, 최소 ${Math.min(...record.map(r=>r.age))}, 최대 ${Math.max(...record.map(r=>r.age))}`);
for(const pos of POSITIONS){
 const d=record.filter(r=>r.position===pos.id);
 console.log(`${pos.name.padEnd(3)} | 완료 ${String(d.length).padStart(3)} | 은퇴 평균 ${mean(d.map(r=>r.age))}세 | 최고 티어 평균 ${mean(d.map(r=>r.rank))} | 커리어 점수 평균 ${mean(d.map(r=>r.score))}`);
}
if(failed.length){console.error('비정상 종료 샘플',failed.slice(0,5));process.exitCode=1;}
