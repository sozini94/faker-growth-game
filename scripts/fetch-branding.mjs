/** 로고/랭크 이미지 로컬 저장. Node.js 20+, 빌드 자체에는 필요 없습니다. */
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {TEAMS,TIERS} from '../src/engine.js';
import {INTERNATIONAL_TEAM_BRANDING} from '../src/tournaments.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'public/assets/branding');
await mkdir(dir,{recursive:true});
const list=[
 ...TIERS.map(t=>({name:t.name,url:t.logo,file:`rank-${t.id}.png`})),
 ...TEAMS.map(t=>({name:t.name,url:t.logo,file:`team-${t.id}.${['t1','geng','hle','dk'].includes(t.id)?'svg':'png'}`})),
 ...Object.values(INTERNATIONAL_TEAM_BRANDING).map(t=>({name:t.name,url:t.logo,file:`team-${t.id}.png`})),
];
let succeeded=0;const failures=[];
for(const item of list){
 try{
   const response=await fetch(item.url,{headers:{'User-Agent':'FakerGrowthFanGame/2.0 (research asset download)'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const mime=response.headers.get('content-type')||'';
   const buffer=Buffer.from(await response.arrayBuffer());
   if(buffer.length<150||(!mime.includes('image/') && !buffer.toString('utf8',0,100).includes('<svg')))throw Error(`이미지가 아닌 응답: ${mime}`);
   await writeFile(path.join(dir,item.file),buffer);
   succeeded++;
   console.log(`✓ ${item.file} (${Math.ceil(buffer.length/1024)}KB)`);
 }catch(error){failures.push(item.name);console.warn(`! ${item.name}: ${error.message}`)}
}
console.log(`완료 ${succeeded}/${list.length}. 실패 시 게임에서는 원격 이미지 또는 팀 약칭으로 표시됩니다.`);
if(failures.length)console.log('실패한 이미지:',failures.join(', '));
