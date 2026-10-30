
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom-live.json','utf8'));
const o=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
function top(n,label){ console.log(label+' tag='+n.tag+' class='+(n.attrs.class||'').slice(0,50)+' kids='+n.kids.length);
  n.kids.slice(0,8).forEach((c,i)=>console.log('   '+i+' '+(c.t!==undefined?'TEXT':c.tag+' class='+(c.attrs.class||'').slice(0,44)+' id='+(c.attrs.id||'')))); }
top(d.main,'LIVE #main');
console.log('LIVE tpl:', d.tpl? (d.tpl.tag+' kids='+d.tpl.kids.length):'MISSING');
// find the content container .framer-7DOFx
function find(n,pred,path,out){ if(n.t!==undefined)return; if(pred(n)) out.push({path,n}); let k=0; for(const c of n.kids){ if(c.t!==undefined)continue; find(c,pred,path+'.'+k,out); k++; } }
const w=[]; find(d.main,n=>(n.attrs.class||'').includes('framer-7DOFx'),'0',w);
console.log('content containers found:', w.length);
if(w.length) console.log('  path='+w[0].path+' class='+w[0].n.attrs.class+' kids='+w[0].n.kids.length);
if(w.length) w[0].n.kids.forEach((c,i)=>console.log('   '+i+' '+c.tag+' class='+(c.attrs.class||'').slice(0,46)+' name='+(c.attrs['data-framer-name']||'')));
// asset urls
const urls=new Set();
(function scan(n){ if(n.t!==undefined)return; for(const k of ['src','srcset','poster','href']) if(n.attrs[k]){ const v=n.attrs[k]; if(/^https?:/.test(v)) urls.add(v); }
  if(n.attrs.srcset) for(const p of n.attrs.srcset.split(',')) { const u=p.trim().split(/\s+/)[0]; if(u&&/^https?:/.test(u)) urls.add(u); }
  for(const c of n.kids) scan(c); })(d.main);
(function scan(n){ if(n.t!==undefined)return; if(n.attrs.src&&/^https?:/.test(n.attrs.src)) urls.add(n.attrs.src); for(const c of n.kids) scan(c); })(d.tpl||{kids:[]});
console.log('distinct external urls in live DOM:', urls.size);
const old=new Set(); (function scan(n){ if(n.t!==undefined)return; for(const k of ['src','srcset','poster','href']) if(n.attrs[k]&&/^https?:/.test(n.attrs[k])) old.add(n.attrs[k]); for(const c of n.kids) scan(c); })(o.main);
const missing=[...urls].filter(u=>!old.has(u));
console.log('urls NOT present in the old capture:', missing.length);
missing.slice(0,10).forEach(u=>console.log('   '+u.slice(0,110)));
