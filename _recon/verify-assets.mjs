
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const map=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/asset-map-live.json','utf8'));
const md5=(buf)=>crypto.createHash('md5').update(buf).digest('hex');
let same=0, diff=0, missing=0;
const bad=[];
for(const a of map){
  const p='/home/node/Ui/ui/dist/assets/'+a.name;
  if(!fs.existsSync(p)){ missing++; bad.push('MISSING '+a.name); continue; }
  const local=fs.readFileSync(p);
  let remote;
  try { remote=execFileSync('curl',['-s','-L','--max-time','60',a.url],{maxBuffer:64*1024*1024}); } catch(e){ bad.push('FETCHFAIL '+a.name); continue; }
  if(md5(local)===md5(remote)) same++; else { diff++; bad.push('DIFF '+a.name+' local='+local.length+' remote='+remote.length+' url='+a.url.slice(0,110)); }
}
console.log('assets: same='+same+' diff='+diff+' missing='+missing+' total='+map.length);
bad.slice(0,25).forEach(b=>console.log('  '+b));
