
import fs from 'node:fs';
const A=JSON.parse(fs.readFileSync('/tmp/lottie-animations_9e19e5f1-e00f-463f-8116-296b9c5dee84.json','utf8'));
const D='/home/node/Ui/ui/src/dynamic';
fs.mkdirSync(D,{recursive:true});

function bezToSvg(k){
  const v=k.v, i=k.i, o=k.o, n=v.length, closed=!!k.c;
  let d='M '+v[0][0].toFixed(3)+' '+v[0][1].toFixed(3);
  const segs = closed? n : n-1;
  for(let s=0;s<segs;s++){
    const a=s, b=(s+1)%n;
    const c1=[v[a][0]+o[a][0], v[a][1]+o[a][1]];
    const c2=[v[b][0]+i[b][0], v[b][1]+i[b][1]];
    d+=' C '+c1[0].toFixed(3)+' '+c1[1].toFixed(3)+', '+c2[0].toFixed(3)+' '+c2[1].toFixed(3)+', '+v[b][0].toFixed(3)+' '+v[b][1].toFixed(3);
  }
  if(closed) d+=' Z';
  return d;
}
const layers=A.layers.map(L=>{
  const g=L.shapes[0];
  const sh=g.it.find(x=>x.ty==='sh');
  const fl=g.it.find(x=>x.ty==='fl');
  const fill = fl && fl.c && fl.c.k ? fl.c.k : [1,1,1,1];
  const fillcolor='rgb('+fill.slice(0,3).map(c=>Math.round(c*255)).join(',')+')';
  const kf=L.ks.s.k.map(k=>({t:k.t, s:k.s, o:[k.o.x[0],k.o.y[0]], i:[k.i.x[0],k.i.y[0]]}));
  return {a:L.ks.a.k, p:L.ks.p.k, opacity:(L.ks.o&&L.ks.o.k!==undefined? L.ks.o.k:100)/100, d:bezToSvg(sh.ks.k), fill:fillcolor, kf};
});
const out='// Generated from the original dotLottie asset (lottie.host 94c91c9d.../nwdQJg5kon.lottie)\n'+
'// fr=30, ip=0, op=70, canvas 1000x1000. Regenerate: node _recon/gen-lottie.mjs\n'+
'export const LOTTIE = '+JSON.stringify({fr:A.fr, ip:A.ip, op:A.op, w:A.w, h:A.h, layers}, null, 1)+';\n';
fs.writeFileSync(D+'/sleep-icon-data.js', out);
const total=out.length;
console.log('sleep-icon-data.js bytes', total, 'layers', layers.length);
layers.forEach((l,i)=>console.log('  layer'+i, 'd='+l.d.length+'ch', 'fill='+l.fill, 'kf='+l.kf.length, 'p='+l.p.map(x=>x.toFixed(1)).join(','), 'a='+l.a.map(x=>x.toFixed(1)).join(',')));
