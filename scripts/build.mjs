import {cp,copyFile,mkdir,rm,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
await rm(out,{force:true,recursive:true});
await mkdir(out,{recursive:true});
await copyFile(path.join(root,'index.html'),path.join(out,'index.html'));
await cp(path.join(root,'src'),path.join(out,'src'),{recursive:true});
await cp(path.join(root,'public'),out,{recursive:true,force:true});
for(const required of ['index.html','src/main.js','src/engine.js','src/styles.css','src/data/events.json','assets/player.webp']) {
 await stat(path.join(out,required));
}
console.log('정적 배포 빌드 완료:',out);
