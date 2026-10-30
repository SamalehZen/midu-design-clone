
const {PNG}=require('pngjs'); const fs=require('fs');
const A=PNG.sync.read(fs.readFileSync('/tmp/o_1800.png')), B=PNG.sync.read(fs.readFileSync('/tmp/l_1800.png'));
function score(dy){
  let s=0,n=0;
  for(let y=60;y<860;y++){ const yy=y+dy; if(yy<0||yy>=B.height) continue;
    for(let x=60;x<1140;x+=2){ const i=(y*A.width+x)*4, j=(yy*B.width+x)*4;
      s+=Math.abs(A.data[i]-B.data[j])+Math.abs(A.data[i+1]-B.data[j+1])+Math.abs(A.data[i+2]-B.data[j+2]); n++; } }
  return s/n;
}
const res=[];
for(let dy=-400;dy<=400;dy+=5) res.push([dy,+score(dy).toFixed(2)]);
res.sort((a,b)=>a[1]-b[1]);
console.log('best dy candidates (lower=better):');
res.slice(0,8).forEach(r=>console.log('  dy='+r[0]+' score='+r[1]));
console.log('dy=0 score=', score(0).toFixed(2));
