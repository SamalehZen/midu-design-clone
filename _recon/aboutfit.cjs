
const fs=require('fs');
const R=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/scrolllink-raw.json','utf8'));
const P='0.0.0.6.3.0.0';
const pts=[];
for(const s of R.up){ const v=s.d[P]; if(v===undefined) continue;
  const m=/scale\(([\d.]+)\)/.exec(v); const t=/translateY\((-?[\d.]+)px\)/.exec(v);
  if(m&&t) pts.push({s:s.t, sc:+m[1], ty:+t[1]}); else if(v==='none') pts.push({s:s.t, sc:1, ty:0}); }
console.log('points:',pts.length);
console.log(pts.map(p=>p.s+':'+p.sc.toFixed(4)+'/'+p.ty.toFixed(2)).join(' '));
// linear fit of sc on s over the ramp
const ramp=pts.filter(p=>p.sc>0.9+1e-6 && p.sc<1-1e-6);
console.log('ramp points:',ramp.length);
let sx=0,sy=0,sxx=0,sxy=0; const n=ramp.length;
for(const p of ramp){ sx+=p.s; sy+=p.sc; sxx+=p.s*p.s; sxy+=p.s*p.sc; }
const slope=(n*sxy-sx*sy)/(n*sxx-sx*sx), inter=(sy-slope*sx)/n;
console.log('scale = '+slope.toExponential(6)+' * scroll + '+inter.toFixed(6));
const a0=(0.9-inter)/slope, a1=(1.0-inter)/slope;
console.log('=> ramp start scroll='+a0.toFixed(1)+'  end scroll='+a1.toFixed(1));
// ty fit
let sy2=0,sxy2=0; for(const p of ramp){ sy2+=p.ty; sxy2+=p.s*p.ty; }
const slope2=(n*sxy2-sx*sy2)/(n*sxx-sx*sx), inter2=(sy2-slope2*sx)/n;
console.log('ty = '+slope2.toExponential(6)+' * scroll + '+inter2.toFixed(4));
console.log('=> ty zero at scroll '+(-inter2/slope2).toFixed(1)+', ty=-80 at scroll '+((-80-inter2)/slope2).toFixed(1));
// residual check
let maxerr=0; for(const p of pts){ const t=Math.max(0,Math.min(1,(p.s-a0)/(a1-a0))); const sc=0.9+0.1*t; maxerr=Math.max(maxerr,Math.abs(sc-p.sc)); }
console.log('max scale error over all points:',maxerr.toExponential(3));
