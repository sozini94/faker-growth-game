import fs from 'node:fs';
const file='src/main.js';
const cssFile='src/styles.css';
if(!fs.existsSync(file)||!fs.existsSync(cssFile))throw Error('프로젝트 루트에서 실행하세요 (src/main.js 필요).');
let s=fs.readFileSync(file,'utf8');
if(!s.includes("case 'new-game':"))throw Error('새 게임 핸들러를 찾지 못했습니다. 파일을 변경하지 않았습니다.');
if(!s.includes('function beginNewGame()')){
 const orig="function confirmNew(){\n if(game?.scene && game.scene!=='ending')return window.confirm('진행 중인 게임을 종료하고 새 게임을 시작할까요? 현재 진행 기록은 덮어써집니다.');\n return true;\n}";
 const next=`function beginNewGame(){
  createName=''; createPosition='mid';
  document.getElementById('new-game-modal')?.remove();
  routePage('create');
}
function confirmNew(){
  if(!game?.scene || game.scene==='ending'){ beginNewGame(); return; }
  if(document.getElementById('new-game-modal'))return;
  app.insertAdjacentHTML('beforeend', \`<div class="dialog-backdrop" id="new-game-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="new-game-title"><div class="dialog-head"><h3 id="new-game-title">새 게임 시작</h3></div><p class="soft">진행 중인 게임을 종료하고 새 게임을 시작할까요? 새 선수를 생성하기 전까지 기록은 유지됩니다.</p><div class="action-bar"><button type="button" class="btn dark" data-action="cancel-new-game">취소</button><button type="button" class="btn primary" data-action="confirm-new-game">새 게임 시작</button></div></div></div>\`);
}`;
 if(!s.includes(orig))throw Error('예상한 v8 확인창 코드가 없어 안전하게 중단합니다.');
 s=s.replace(orig,next);
 const c="case 'new-game':if(confirmNew()){createName='';createPosition='mid';routePage('create');}break;";
 if(!s.includes(c))throw Error('예상한 v8 클릭 코드가 없어 안전하게 중단합니다.');
 s=s.replace(c,"case 'new-game':confirmNew();break;\n   case 'confirm-new-game':beginNewGame();break;\n   case 'cancel-new-game':document.getElementById('new-game-modal')?.remove();break;");
}
if(!s.includes('Mobile new-game touchend fallback v2')){
 const marker="document.addEventListener('keydown',e=>";
 if(!s.includes(marker))throw Error('이벤트 바인딩 위치를 찾지 못했습니다.');
 const addition=`// Mobile new-game touchend fallback v2
let mobileNewGameTouch=null;
document.addEventListener('touchstart',e=>{
 const b=e.target.closest?.('[data-action="new-game"]');
 mobileNewGameTouch=b&&e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;
},{capture:true,passive:true});
document.addEventListener('touchend',e=>{
 const b=e.target.closest?.('[data-action="new-game"]');
 if(!b||!mobileNewGameTouch||e.changedTouches.length!==1)return;
 const t=e.changedTouches[0];const tap=Math.hypot(t.clientX-mobileNewGameTouch.x,t.clientY-mobileNewGameTouch.y)<18;
 mobileNewGameTouch=null;if(!tap)return;
 e.preventDefault();e.stopPropagation();
 try{confirmNew();}catch(error){console.error('Mobile new game error',error);showToast('새 게임 오류: '+(error?.message||'알 수 없는 오류'));}
},{capture:true,passive:false});
`;
 s=s.replace(marker,addition+marker);
}
const cssMark='/* Mobile new-game touchend fallback v2 */';
let css=fs.readFileSync(cssFile,'utf8');
if(!css.includes(cssMark))css+='\n'+cssMark+'\n.title-actions{z-index:10}\n.title-actions [data-action="new-game"]{position:relative;z-index:11;touch-action:manipulation;-webkit-tap-highlight-color:transparent}\n#new-game-modal{z-index:80}\n';
fs.writeFileSync(file,s);fs.writeFileSync(cssFile,css);
console.log('모바일 새 게임 버튼 보강 완료');
