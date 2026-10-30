
const fs=require('fs');
const R=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/scrolllink-raw.json','utf8'));
const byT=new Map(); for(const s of R.down) byT.set(s.t,s.d);
const paths=Object.keys(R.up[0].d);
const res=[];
for(const p of paths){
  const series=[];
  for(const s of R.up){ if(s.d[p]!==undefined) series.push([s.t,s.d[p]]); }
  const uniq=new Set(series.map(x=>x[1]));
  if(uniq.size<3) continue;
  let same=0, tot=0;
  for(const s of R.up){ const d2=byT.get(s.t); if(!d2||d2[p]===undefined||s.d[p]===undefined) continue; tot++; if(d2[p]===s.d[p]) same++; }
  const ratio=tot? same/tot : 0;
  if(ratio>=0.9) res.push({p, uniq:uniq.size, ratio:+ratio.toFixed(3), series});
}
console.log('deterministic scroll-linked elements:',res.length);
res.sort((a,b)=>b.uniq-a.uniq);
res.slice(0,40).forEach(r=>{
  const tr=[...new Set(r.series.map(x=>x[1].split('|')[0]))];
  console.log('  '+r.p+' uniq='+r.uniq+' ratio='+r.ratio+' vals='+tr.slice(0,6).join(' , ').slice(0,150));
});
fs.writeFileSync('/home/node/Ui/_recon/scrollfn.json', JSON.stringify(res.map(r=>({p:r.p,uniq:r.uniq,series:r.series.filter((_,i)=>i%2===0)})),null,1));
// fit linear ranges for the top few
function fit(series, prop){
  const pts=series.map(([t,v])=>{
    const m=/matrix\(([-\d.]+),\s*0,\s*0,\s*([-\d.]+),\s*(-?[\d.]+),\s*(-?[\d.]+)\)/.exec(v);
    if(m) return {t, val: prop==='sx'?+m[1] : prop==='sy'?+m[2] : prop==='tx'?+m[3] : +m[4]};
    if(v==='none') return {t, val: prop==='sx'||prop==='sy'? 1 : 0};
    const t2=/translateY\((-?[\d.]+)px\)/.exec(v); if(t2&&prop==='ty') return {t, val:+t2[1]};
    return null;
  }).filter(Boolean);
  return pts;
}
for(const r of res.slice(0,3)){
  for(const prop of ['sx','ty']){
    const pts=fit(r.series,prop);
    if(pts.length<5) continue;
    const first=pts[0].val, last=pts[pts.length-1].val;
    if(Math.abs(first-last)<1e-6) continue;
    // find the linear ramp: the longest sub-sequence that is linear
    let a=null,b=null;
    const nz=pts.filter(p=>Math.abs(p.val-first)>1e-6 && Math.abs(p.val-last)>1e-6);
    if(nz.length>=2){ a=nz[0].t; b=nz[nz.length-1].t; }
    console.log('FIT '+r.p+' '+prop+': from='+first+' to='+last+' ramp=['+a+','+b+']');
  }
}
