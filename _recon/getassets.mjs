
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RECON='/home/node/Ui/_recon';
const ASSETS='/home/node/Ui/ui/assets';
fs.mkdirSync(ASSETS,{recursive:true});

const dom=JSON.parse(fs.readFileSync(RECON+'/dom.json','utf8'));
const css=fs.readFileSync(RECON+'/css-all.css','utf8');

const urls=new Map(); // url -> local name
function add(u){
  if(!u) return;
  u=u.trim();
  if(!u || u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('#')) return;
  if(!/^https?:\/\//.test(u)) return;
  urls.set(u, null);
}
// walk DOM
function walk(n){
  if(n.t!==undefined) return;
  const a=n.attrs||{};
  for(const k of ['src','poster','href','srcset','data-src']){
    const v=a[k]; if(!v) continue;
    if(k==='srcset'){ v.split(',').forEach(p=>{ const t=p.trim().split(/\s+/)[0]; add(t); }); }
    else add(v);
  }
  for(const k in a){ if(/style$/.test(k)||k==='style'){ const m=a[k].match(/url\((['"]?)([^)'"]+)\1\)/g)||[]; m.forEach(x=>{ const mm=x.match(/url\((['"]?)([^)'"]+)\1\)/); if(mm) add(mm[2]); }); } }
  (n.kids||[]).forEach(k=>{ if(k.t===undefined) walk(k); });
}
walk(dom.main);
if(dom.tpl) walk(dom.tpl);
// walk CSS url()
for(const m of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) add(m[2]);

// preload links too
console.log('unique urls', urls.size);

function localName(u){
  const p=new URL(u);
  let base=path.basename(p.pathname) || 'index';
  base=base.replace(/[^A-Za-z0-9._-]/g,'_');
  if(!/\.[A-Za-z0-9]{2,5}$/.test(base)) base+='.bin';
  const h=crypto.createHash('sha1').update(u).digest('hex').slice(0,6);
  return h+'-'+base;
}
const list=[...urls.keys()];
let i=0;
const results=[];
const CONC=8;
async function worker(){
  while(i<list.length){
    const u=list[i++];
    const name=localName(u);
    const dest=path.join(ASSETS,name);
    try{
      if(!fs.existsSync(dest)){
        const r=await fetch(u,{redirect:'follow'});
        if(!r.ok) throw new Error('HTTP '+r.status);
        const buf=Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(dest,buf);
      }
      const st=fs.statSync(dest);
      // sanity: svg served with text
      results.push({url:u,name,bytes:st.size});
    }catch(e){ results.push({url:u,name,error:String(e.message||e)}); }
  }
}
await Promise.all(Array.from({length:CONC},worker));
fs.writeFileSync(RECON+'/asset-map.json',JSON.stringify(results,null,1));
const bad=results.filter(r=>r.error);
console.log('downloaded',results.length-bad.length,'failed',bad.length);
bad.slice(0,10).forEach(b=>console.log('FAIL',b.url.slice(0,90),b.error));
const total=results.reduce((a,r)=>a+(r.bytes||0),0);
console.log('total bytes',total);
