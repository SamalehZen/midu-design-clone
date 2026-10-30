
const fs=require('fs');
const S=JSON.parse(fs.readFileSync('/home/node/Ui/_recon/scrollmap-raw.json','utf8'));
function series(p){
  const out=[];
  for(const s of S){ const e=s.data[p]; if(!e) continue;
    const m=(e[2].match(/transform\s*:\s*([^;]+)/)||[])[1]||'none';
    const o=(e[2].match(/opacity\s*:\s*([^;]+)/)||[])[1]||'1';
    out.push({sc:s.actual, vy:e[1], t:m.trim(), o:o.trim()});
  }
  return out;
}
function speeds(ser){
  const segs=[]; let prev=null;
  for(const x of ser){ if(prev && x.sc!==prev.sc){ segs.push({from:prev.sc,to:x.sc, spd:+((x.vy-prev.vy)/(x.sc-prev.sc)).toFixed(4)}); } prev=x; }
  return segs;
}
for(const p of ['0.0.0.5.0.0','0.0.0.5.0.0.1.0']){
  const s=series(p);
  console.log('=== '+p+' ('+s.length+' samples) ===');
  console.log('scroll:   ', s.filter((_,i)=>i%10===0).map(x=>x.sc).join(' '));
  console.log('viewportY:', s.filter((_,i)=>i%10===0).map(x=>x.vy).join(' '));
  console.log('transform:', s.filter((_,i)=>i%10===0).map(x=>x.t.replace(/\s+/g,'')).join(' | '));
  const sg=speeds(s);
  const uniq=[]; for(const x of sg){ if(!uniq.length||uniq[uniq.length-1].spd!==x.spd) uniq.push(x); }
  console.log('speed changes:', uniq.map(u=>u.spd+'@'+u.from).join(' '));
  console.log('first/last:', JSON.stringify(s[0]), JSON.stringify(s[s.length-1]));
}
// discrete variants for the rest
function variants(p){
  const s=series(p); const runs=[]; let prev=null;
  for(const x of s){ const key=x.t+'|'+x.o; if(!prev||prev.key!==key){ runs.push({key,from:x.sc,to:x.sc}); } else runs[runs.length-1].to=x.sc; prev={key}; }
  return runs;
}
for(const p of ['0.0.0.6.2.0.0.0.0.0','0.0.0.6.3.0.0','0.0.0.7.2.1','0.0.0.7.2.0.0.0.0.0.0']){
  const r=variants(p); console.log('=== '+p+' ===');
  r.forEach(v=>console.log('   scroll '+v.from+'-'+v.to+'  '+v.key.replace(/\s+/g,'').slice(0,150)));
}
