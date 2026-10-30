
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT='/home/node/Ui/ui';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon','.mp4':'video/mp4','.lottie':'application/zip'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/') p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)){res.writeHead(403).end();return;}
  fs.readFile(f,(e,b)=>{
    if(e){ res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200,{'content-type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','cache-control':'no-store'});
    res.end(b);
  });
}).listen(8791,()=>console.log('serving',ROOT,'on 8791'));
