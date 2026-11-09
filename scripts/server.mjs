import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..',process.argv[2]||'.');
const port=Number(process.env.PORT||5173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url||'/',`http://localhost:${port}`).pathname;
  const relative=decodeURIComponent(pathname).replace(/^\/+/, '')||'index.html';
  let file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)&&file!==root)throw Object.assign(Error('Invalid path'),{status:403});
  const fileInfo=await stat(file);
  if(fileInfo.isDirectory())file=path.join(file,'index.html');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(body);
 }catch(err){res.writeHead(err.status||404,{'Content-Type':'text/plain; charset=utf-8'});res.end(err.status===403?'Forbidden':'Not found');}
});
server.listen(port,'0.0.0.0',()=>console.log(`게임 실행: http://localhost:${port}`));
