
import { PNG } from 'pngjs';
import fs from 'node:fs';
const A=PNG.sync.read(fs.readFileSync(process.argv[2]));
const B=PNG.sync.read(fs.readFileSync(process.argv[3]));
const W=Math.min(A.width,B.width), H=Math.min(A.height,B.height);
const diffRow=new Uint8Array(H);
const grid=new Map();
const CELL=50;
let total=0,sum=0;
for(let y=0;y<H;y++){
  for(let x=0;x<W;x++){
    const i=(y*A.width+x)*4, j=(y*B.width+x)*4;
    const d=Math.abs(A.data[i]-B.data[j])+Math.abs(A.data[i+1]-B.data[j+1])+Math.abs(A.data[i+2]-B.data[j+2]);
    sum+=d;
    if(d>6){ diffRow[y]=1; total++; const k=Math.floor(y/CELL)+':'+Math.floor(x/CELL); grid.set(k,(grid.get(k)||0)+1); }
  }
}
console.log('size',W+'x'+H,'diff',total,(total/(W*H)*100).toFixed(4)+'%','MAE',(sum/(W*H*765)).toFixed(6));
// contiguous bands
const bands=[]; let s=-1;
for(let y=0;y<=H;y++){
  if(y<H&&diffRow[y]){ if(s<0)s=y; }
  else if(s>=0){ bands.push([s,y-1]); s=-1; }
}
console.log('bands:',bands.length);
for(const [a,b] of bands){
  if(b-a<2) continue;
  // bbox x for this band
  let x0=1e9,x1=-1, cnt=0, sa=0,sb=0;
  for(let y=a;y<=b;y++) for(let x=0;x<W;x++){
    const i=(y*A.width+x)*4, j=(y*B.width+x)*4;
    const d=Math.abs(A.data[i]-B.data[j])+Math.abs(A.data[i+1]-B.data[j+1])+Math.abs(A.data[i+2]-B.data[j+2]);
    if(d>6){ cnt++; if(x<x0)x0=x; if(x>x1)x1=x; sa+=A.data[i]+A.data[i+1]+A.data[i+2]; sb+=B.data[j]+B.data[j+1]+B.data[j+2]; }
  }
  const na=[Math.round(sa/cnt/3),Math.round(sb/cnt/3)];
  const ca=[A.data[((a)*A.width+Math.floor((x0+x1)/2))*4],A.data[((a)*A.width+Math.floor((x0+x1)/2))*4+1],A.data[((a)*A.width+Math.floor((x0+x1)/2))*4+2]];
  const cb=[B.data[((a)*B.width+Math.floor((x0+x1)/2))*4],B.data[((a)*B.width+Math.floor((x0+x1)/2))*4+1],B.data[((a)*B.width+Math.floor((x0+x1)/2))*4+2]];
  console.log('  y '+a+'-'+b+'  x '+x0+'-'+x1+'  n='+cnt+'  avgLum orig='+na[0]+' ours='+na[1]+'  midPixel orig='+ca+' ours='+cb);
}
