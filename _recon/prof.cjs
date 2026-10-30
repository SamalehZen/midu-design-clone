
const {PNG}=require('pngjs'); const fs=require('fs');
function prof(f){
  const p=PNG.sync.read(fs.readFileSync(f));
  const rows=[];
  for(let y=0;y<p.height;y+=50){ let s=0; for(let x=0;x<p.width;x+=4){ const i=(y*p.width+x)*4; s+=p.data[i]+p.data[i+1]+p.data[i+2]; } rows.push(Math.round(s/(p.width/4)/3)); }
  return {w:p.width,h:p.height,rows};
}
for(const y of [1800,2100]){
  const a=prof('/tmp/o_'+y+'.png'), b=prof('/tmp/l_'+y+'.png');
  console.log('--- y='+y+' ---');
  console.log('orig  ', a.w+'x'+a.h, a.rows.join(' '));
  console.log('local ', b.w+'x'+b.h, b.rows.join(' '));
}
