
const fs=require('fs');
const dom=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/dom.json','utf8'));
function at(path){ // path like '0.0.0.5' relative to #main, skipping style children
  const parts=path.split('.').map(Number);
  let n=dom.main;
  for(const p of parts.slice(1)){ let k=0,found=null; for(const c of n.kids){ if(c.t!==undefined) continue; if(k===p){found=c;break;} k++; } n=found; if(!n) return null; }
  return n;
}
function show(n,ind,out){ if(!n) {out.push('NULL');return;} if(n.t!==undefined){out.push(ind+JSON.stringify(n.t.slice(0,80)));return;}
  out.push(ind+'<'+n.tag+' '+(n.attrs.class||'')+' name='+(n.attrs['data-framer-name']||'')+' '+Object.entries(n.attrs).filter(([k])=>['src','autoplay','loop','speed','direction','background','width','height','style'].includes(k)).map(([k,v])=>k+'='+JSON.stringify(String(v).slice(0,120))).join(' ')+'>');
  (n.kids||[]).forEach(k=>show(k,ind+'  ',out)); }
const out=[];
console.log('=== svg-templates ===');
show(dom.tpl, '', out); console.log(out.join('\n').slice(0,1500));
const paths=process.argv.slice(2);
for(const p of paths){ const o=[]; console.log('\n=== '+p+' ==='); show(at(p),'',o); console.log(o.join('\n').slice(0,1800)); }
