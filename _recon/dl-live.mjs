
import fs from 'node:fs';
import crypto from 'node:crypto';
const R='/home/node/Ui/_recon';
const dom=JSON.parse(fs.readFileSync(R+'/dom-live.json','utf8'));
const map=JSON.parse(fs.readFileSync(R+'/asset-map.json','utf8'));
const have=new Map(map.filter(a=>!a.error).map(a=>[a.url,a.name]));
const urls=new Set();
const ABS='https://framerusercontent.com';
function scan(n){
  if(n.t!==undefined) return;
  for(const k of ['src','poster']){ const v=n.attrs[k]; if(v){ if(/^https?:/.test(v)) urls.add(v); else if(v.startsWith('/')) urls.add(ABS+v); } }
  if(n.attrs.srcset) for(const p of n.attrs.srcset.split(',')){ const u=p.trim().split(/\s+/)[0]; if(!u)continue; if(/^https?:/.test(u)) urls.add(u); else if(u.startsWith('/')) urls.add(ABS+u); }
  for(const c of n.kids) scan(c);
}
scan(dom.main); scan(dom.tpl);
const css=fs.readFileSync(R+'/css-all.css','utf8');
for(const m of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)){ let u=m[2]; if(/^https?:/.test(u)) urls.add(u); }
const all=[...urls];
console.log('total external urls referenced:', all.length, 'already local:', all.filter(u=>have.has(u)).length);
const todo=all.filter(u=>!have.has(u));
console.log('to download:', todo.length);
function nameFor(u){ const base=decodeURIComponent(new URL(u).pathname.split('/').pop()||'asset'); const h=crypto.createHash('sha1').update(u).digest('hex').slice(0,6); return h+'-'+base; }
const added=[];
let done=0, fail=0;
async function one(u){
  const name=nameFor(u);
  const dest='/home/node/Ui/ui/assets/'+name;
  try{
    if(!fs.existsSync(dest)){
      const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0'}});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const buf=Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest,buf);
    }
    added.push({url:u,name,bytes:fs.statSync(dest).size});
    done++;
  }catch(e){ fail++; added.push({url:u,name,error:String(e.message)}); }
}
const CH=8;
for(let i=0;i<todo.length;i+=CH) await Promise.all(todo.slice(i,i+CH).map(one));
console.log('downloaded:',done,'failed:',fail);
added.filter(a=>a.error).forEach(a=>console.log('  FAIL',a.url.slice(0,90),a.error));
fs.writeFileSync(R+'/asset-map-live.json', JSON.stringify([...map, ...added], null, 0));
console.log('asset-map-live.json entries:', map.length+added.length);
const total=fs.readdirSync('/home/node/Ui/ui/assets').length;
const bytes=fs.readdirSync('/home/node/Ui/ui/assets').reduce((s,f)=>s+fs.statSync('/home/node/Ui/ui/assets/'+f).size,0);
console.log('assets dir now:', total, 'files', (bytes/1024/1024).toFixed(2), 'MB');
