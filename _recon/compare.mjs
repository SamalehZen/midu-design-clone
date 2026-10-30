
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:180000});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(4000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1500); return page;
}
const O=await prep('https://midu.design/');
const L=await prep('https://component.hypeer.cloud/ui/');
const YS=[0,1800,3600,5400,7200,9900];
const CW=300, CH=225, GAP=8, PAD=28, LEFT=92;
const cols=3;
const W=LEFT+cols*CW+(cols-1)*GAP+PAD;
const H=PAD+YS.length*(CH+GAP+18)+PAD+22;
const out=new PNG({width:W,height:H});
out.data.fill(18);
const fill=(x0,y0,x1,y1,r,g,bl)=>{ for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++){ const i=(y*W+x)*4; out.data[i]=r; out.data[i+1]=g; out.data[i+2]=bl; out.data[i+3]=255; } };
// tiny 5x7 font for labels
const FONT={'0':'11111 10001 10001 10001 11111','1':'00100 01100 00100 00100 01110','2':'11111 00001 11111 10000 11111','3':'11111 00001 11111 00001 11111','4':'10001 10001 11111 00001 00001','5':'11111 10000 11111 00001 11111','6':'11111 10000 11111 10001 11111','7':'11111 00001 00010 00100 00100','8':'11111 10001 11111 10001 11111','9':'11111 10001 11111 00001 11111','Y':'10001 10001 00100 00100 00100','=':'00000 11111 00000 11111 00000','O':'01110 10001 10001 10001 01110','L':'10000 10000 10000 10000 11111','C':'01111 10000 10000 10000 01111','D':'11110 10001 10001 10001 11110','I':'11111 00100 00100 00100 11111','F':'11111 10000 11110 10000 10000',' ':'00000 00000 00000 00000 00000','%':'11001 11010 00100 01011 10011'};
function text(s,x,y,r,g,bl){ let cx=x; for(const ch of s.toUpperCase()){ const g5=FONT[ch]||FONT[' ']; const rows=g5.split(' '); for(let ry=0;ry<rows.length;ry++) for(let rx=0;rx<rows[ry].length;rx++) if(rows[ry][rx]==='1'){ const px=cx+rx, py=y+ry; if(px>=0&&px<W&&py>=0&&py<H){ const i=(py*W+px)*4; out.data[i]=r; out.data[i+1]=g; out.data[i+2]=bl; out.data[i+3]=255; } } cx+=6; } }
const CELL=[];
for(const S of YS){
  let shotA,shotB;
  for(const [p,which] of [[O,'a'],[L,'b']]){
    for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),S); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-S)<=1) break; }
    if(which==='a'){ await p.waitForTimeout(500); shotA=PNG.sync.read(await p.screenshot()); } else { await p.waitForTimeout(200); shotB=PNG.sync.read(await p.screenshot()); }
  }
  CELL.push([S,shotA,shotB]);
}
const diff=new PNG({width:1200,height:900});
for(const [S,a,c] of CELL){
  for(let i=0;i<a.data.length;i+=4){ const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]); const v=Math.min(255,d*4); diff.data[i]=v; diff.data[i+1]=v; diff.data[i+2]=v; diff.data[i+3]=255; }
}
const rowsY=[];
for(let k=0;k<CELL.length;k++){
  const y0=PAD+k*(CH+GAP+18);
  rowsY.push([CELL[k][0],y0]);
}
rowsY.forEach(([S,y0])=>{
  const srcs=[CELL.find(c=>c[0]===S)[1],CELL.find(c=>c[0]===S)[2],diff];
  for(let ci=0;ci<3;ci++){
    const x0=LEFT+ci*(CW+GAP);
    const sp=srcs[ci];
    if(ci<2){ for(let y=0;y<CH;y++) for(let x=0;x<CW;x++){ const sx=Math.floor(x*1200/CW), sy=Math.floor(y*900/CH); const si=(sy*1200+sx)*4; const di=((y0+y)*W+(x0+x))*4; out.data[di]=sp.data[si]; out.data[di+1]=sp.data[si+1]; out.data[di+2]=sp.data[si+2]; out.data[di+3]=255; } }
    else { for(let i=0;i<CELL[0][1].data.length;i+=4){ const a=CELL.find(c=>c[0]===S)[1], c2=CELL.find(c=>c[0]===S)[2]; const d=Math.abs(a.data[i]-c2.data[i])+Math.abs(a.data[i+1]-c2.data[i+1])+Math.abs(a.data[i+2]-c2.data[i+2]); const v=Math.min(255,d*4); sp.data[i]=v; sp.data[i+1]=v; sp.data[i+2]=v; sp.data[i+3]=255; }
      for(let y=0;y<CH;y++) for(let x=0;x<CW;x++){ const sx=Math.floor(x*1200/CW), sy=Math.floor(y*900/CH); const si=(sy*1200+sx)*4; const di=((y0+y)*W+(x0+x))*4; out.data[di]=sp.data[si]; out.data[di+1]=sp.data[si+1]; out.data[di+2]=sp.data[si+2]; out.data[di+3]=255; } }
  }
  text('Y='+S, 12, y0+CH/2-4, 200,200,200);
});
text('ORIGINAL', LEFT+70, 8, 120,200,120);
text('CLONE', LEFT+CW+GAP+110, 8, 120,180,255);
text('DIFF X4', LEFT+2*(CW+GAP)+100, 8, 255,140,140);
text('MIDU.DESIGN VS COMPONENT.HYPEER.CLOUD/UI', LEFT, H-16, 160,160,160);
fs.writeFileSync('/home/node/Ui/_recon/compare-prod.png', PNG.sync.write(out));
console.log('written', W+'x'+H);
await b.close();
