
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';
const b=await chromium.launch({executablePath:'/home/node/chrome-run.sh',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
async function prep(url){
  const ctx=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await page.goto(url,{waitUntil:'load',timeout:120000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(3000);
  for(let y=0;y<=11143;y+=400){ await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500); return page;
}
const O=await prep('https://midu.design/'), L=await prep('http://127.0.0.1:8792/');
const Y=9900;
for(const p of [O,L]) for(let i=0;i<25;i++){ await p.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),Y); await p.waitForTimeout(100); if(Math.abs(await p.evaluate(()=>window.scrollY)-Y)<=1) break; }
await O.waitForTimeout(500); await L.waitForTimeout(500);
const a=PNG.sync.read(await O.screenshot()), c=PNG.sync.read(await L.screenshot());
const hist=new Array(16).fill(0); let sdR=0,sdG=0,sdB=0,n=0;
const blocks=new Map();
for(let y=0;y<a.height;y++) for(let x=0;x<a.width;x++){
  const i=(y*a.width+x)*4;
  const dr=a.data[i]-c.data[i], dg=a.data[i+1]-c.data[i+1], db=a.data[i+2]-c.data[i+2];
  const d=Math.abs(dr)+Math.abs(dg)+Math.abs(db);
  sdR+=dr; sdG+=dg; sdB+=db; n++;
  hist[Math.min(15,Math.floor(d/3))]++;
  if(d>6){ const k=Math.floor(y/50)+'_'+Math.floor(x/50); blocks.set(k,(blocks.get(k)||0)+1); }
}
console.log('mean signed delta R,G,B =', (sdR/n).toFixed(4), (sdG/n).toFixed(4), (sdB/n).toFixed(4));
console.log('diff histogram (bucket = |d|/3):', hist.map((v,i)=>i+':'+(100*v/n).toFixed(2)+'%').join(' '));
const bl=[...blocks.entries()].sort((x,z)=>z[1]-x[1]);
console.log('50x50 blocks with diffs: total='+blocks.size+' of '+(a.height/50*a.width/50));
console.log('top blocks (row_col -> count):', bl.slice(0,8).map(([k,v])=>k+'='+v).join(' '));
console.log('blocks with >50% pixels differing:', bl.filter(([,v])=>v>1250).length);
// row profile of diff counts
const rows=[]; for(let y=0;y<a.height;y++){ let cn=0; for(let x=0;x<a.width;x++){ const i=(y*a.width+x)*4; const d=Math.abs(a.data[i]-c.data[i])+Math.abs(a.data[i+1]-c.data[i+1])+Math.abs(a.data[i+2]-c.data[i+2]); if(d>6)cn++; } rows.push(cn); }
let s=''; for(let y=0;y<a.height;y+=45){ const seg=rows.slice(y,y+45); s+=(y+Y)+':'+Math.round(seg.reduce((p,q)=>p+q,0)/45)+' '; }
console.log('rows (avg diff px per row, bands of 45):', s);
await b.close();
